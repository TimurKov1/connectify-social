import { randomUUID } from "crypto";
import { verifyToken } from "./auth.js";
import { addMessage, conversationId, findUserById } from "./db.js";

const onlineUsers = new Map();

export function setupSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) throw new Error("no token");
      socket.user = verifyToken(token);
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    onlineUsers.set(userId, (onlineUsers.get(userId) || 0) + 1);
    socket.join(userId);
    io.emit("presence", { userId, online: true });

    socket.on("message:send", async ({ to, text }) => {
      const trimmed = (text || "").trim();
      if (!trimmed || !to) return;
      if (!(await findUserById(to))) return;

      const message = {
        id: randomUUID(),
        conversationId: conversationId(userId, to),
        from: userId,
        to,
        text: trimmed,
        createdAt: Date.now(),
      };
      await addMessage(message);

      io.to(to).emit("message:new", message);
      io.to(userId).emit("message:new", message);
    });

    socket.on("typing", ({ to, isTyping }) => {
      if (!to) return;
      io.to(to).emit("typing", { from: userId, isTyping: !!isTyping });
    });

    socket.on("disconnect", () => {
      const count = (onlineUsers.get(userId) || 1) - 1;
      if (count <= 0) {
        onlineUsers.delete(userId);
        io.emit("presence", { userId, online: false });
      } else {
        onlineUsers.set(userId, count);
      }
    });
  });
}

export function isOnline(userId) {
  return onlineUsers.has(userId);
}
