import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

let io: Server | null = null;

export const initRealtime = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: (process.env.CORS_ORIGINS || "http://localhost:5173")
        .split(",")
        .map((origin) => origin.trim()),
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth?.userId;

    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  return io;
};

export const emitToUser = (userId: string, event: string, payload: unknown) => {
  io?.to(`user:${userId}`).emit(event, payload);
};
