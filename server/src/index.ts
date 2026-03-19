import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { connectDB } from './config/db.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { initSocketIO } from './socket/metrics.js';
import authRoutes from './routes/auth.js';
import playerRoutes from './routes/players.js';
import missionRoutes from './routes/missions.js';
import workshopRoutes from './routes/workshops.js';
import metricsRoutes from './routes/metrics.js';
import verifyRoutes from './routes/verify.js';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:8080' }));
app.use(express.json());
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/verify', verifyRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', db: process.env.MONGODB_DB_NAME });
});

// Socket.io
const io = initSocketIO(httpServer);

// Make io available to routes (attach to app)
app.set('io', io);

// Start
const PORT = parseInt(process.env.PORT || '3001', 10);

async function start() {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`🚀 MongoDB Mayhem server running on port ${PORT}`);
      console.log(`📦 Database: ${process.env.MONGODB_DB_NAME}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
