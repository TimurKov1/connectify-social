import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../api.js";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(() => new Set());

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setSocket(null);
      setConnected(false);
      return;
    }

    const instance = io(API_URL, { auth: { token } });

    instance.on("connect", () => setConnected(true));
    instance.on("disconnect", () => setConnected(false));
    instance.on("presence", ({ userId, online }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (online) next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    setSocket(instance);

    return () => {
      instance.disconnect();
      setSocket(null);
    };
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket, connected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket должен использоваться внутри SocketProvider");
  return ctx;
}
