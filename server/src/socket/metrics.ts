import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export function initSocketIO(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Moderators join their session room for live updates
    socket.on('join-session', (sessionId: string) => {
      socket.join(`session:${sessionId}`);
      console.log(`📡 ${socket.id} joined session: ${sessionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Emit a metric event to all moderators watching a session.
 * Call this from routes after recording a metric event.
 */
export function emitSessionMetric(io: Server, sessionId: string, event: Record<string, unknown>): void {
  io.to(`session:${sessionId}`).emit('metric', event);
}
