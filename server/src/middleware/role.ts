import { Request, Response, NextFunction } from 'express';

export function requireModerator(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  if (req.user.role !== 'moderator') {
    res.status(403).json({ error: 'Moderator access required' });
    return;
  }
  next();
}

export function requireAttendee(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  if (req.user.role !== 'attendee') {
    res.status(403).json({ error: 'Attendee access required' });
    return;
  }
  next();
}
