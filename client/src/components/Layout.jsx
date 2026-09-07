import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import Avatar from "./Avatar.jsx";

export default function Layout() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <header className="mobile-topbar">
        <div className="brand">
          <span className="brand-dot" />
          Connectify
        </div>
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Меню"
        >
          <Avatar name={user?.displayName} color={user?.avatarColor} size={32} />
        </button>
      </header>

      {menuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
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
        </div>
      )}

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

      <nav className="mobile-tabbar">
        <NavLink
          to="/chats"
          className={({ isActive }) => `tab-link${isActive ? " active" : ""}`}
        >
          <span className="tab-icon">💬</span>
          Сообщения
        </NavLink>
        <NavLink
          to="/search"
          className={({ isActive }) => `tab-link${isActive ? " active" : ""}`}
        >
          <span className="tab-icon">🔍</span>
          Найти людей
        </NavLink>
      </nav>
    </div>
  );
}
