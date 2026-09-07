import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import Avatar from "./Avatar.jsx";

export default function Layout() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-dot" />
          Connectify
        </div>

        <nav className="nav-links">
          <NavLink
            to="/chats"
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            💬 Сообщения
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            🔍 Найти людей
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="me">
            <Avatar name={user?.displayName} color={user?.avatarColor} />
            <div className="me-info">
              <div className="me-name">{user?.displayName}</div>
              <div className={`me-status ${connected ? "online" : "offline"}`}>
                {connected ? "в сети" : "не в сети"}
              </div>
            </div>
          </div>
          <button className="btn-ghost" onClick={logout}>
            Выйти
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
