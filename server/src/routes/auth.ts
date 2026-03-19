import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../config/db.js';
import { COLLECTIONS } from '../config/collections.js';
import { signToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

/** POST /api/auth/register */
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const { handle, password, role = 'attendee' } = req.body;

    if (!handle || !password) {
      res.status(400).json({ error: 'Handle and password are required' });
      return;
    }

    const db = getDb();
    const existing = await db.collection(COLLECTIONS.USERS).findOne({ handle });
    if (existing) {
      res.status(409).json({ error: 'Handle already taken' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = {
      handle,
      password: hashedPassword,
      role: role === 'moderator' ? 'moderator' : 'attendee',
      createdAt: new Date(),
    };

    const result = await db.collection(COLLECTIONS.USERS).insertOne(user);
    const token = signToken({
      userId: result.insertedId.toString(),
      handle,
      role: user.role as 'moderator' | 'attendee',
    });

    // Create initial player progress
    await db.collection(COLLECTIONS.PLAYER_PROGRESS).insertOne({
      userId: result.insertedId.toString(),
      handle,
      xp: 0,
      rank: 'Script Kiddie',
      level: 1,
      achievements: [],
      completedMissions: [],
      totalScore: 0,
      chaosEventsSurvived: 0,
      hintsUsed: 0,
      hintXpPenalty: 0,
      avatarId: 'ghost',
      createdAt: new Date(),
    });

    res.status(201).json({ token, handle, role: user.role });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/** POST /api/auth/login */
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { handle, password } = req.body;

    if (!handle || !password) {
      res.status(400).json({ error: 'Handle and password are required' });
      return;
    }

    const db = getDb();
    const user = await db.collection(COLLECTIONS.USERS).findOne({ handle });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = signToken({
      userId: user._id.toString(),
      handle: user.handle,
      role: user.role as 'moderator' | 'attendee',
    });

    res.json({ token, handle: user.handle, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

/** POST /api/auth/join-session — PIN-based session join */
router.post('/join-session', authLimiter, async (req: Request, res: Response) => {
  try {
    const { pin, handle } = req.body;

    if (!pin || !handle) {
      res.status(400).json({ error: 'PIN and handle are required' });
      return;
    }

    const db = getDb();
    const session = await db.collection(COLLECTIONS.WORKSHOP_SESSIONS).findOne({
      pin,
      status: 'active',
    });

    if (!session) {
      res.status(404).json({ error: 'Invalid PIN or session not active' });
      return;
    }

    // Upsert user as attendee
    const userResult = await db.collection(COLLECTIONS.USERS).findOneAndUpdate(
      { handle },
      {
        $setOnInsert: {
          handle,
          password: '', // PIN-only users don't need passwords
          role: 'attendee',
          createdAt: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    const userId = userResult!._id.toString();

    // Add participant to session
    await db.collection(COLLECTIONS.WORKSHOP_SESSIONS).updateOne(
      { _id: session._id },
      { $addToSet: { participants: userId } }
    );

    const token = signToken({
      userId,
      handle,
      role: 'attendee',
      sessionId: session._id.toString(),
    });

    res.json({
      token,
      handle,
      role: 'attendee',
      sessionId: session._id.toString(),
      sessionName: session.name,
    });
  } catch (err) {
    console.error('Join session error:', err);
    res.status(500).json({ error: 'Failed to join session' });
  }
});

export default router;
