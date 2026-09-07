import React from "react";

export default function Avatar({ name, color, size = 40, online }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div className="avatar-wrap" style={{ width: size, height: size }}>
      <div
        className="avatar"
        style={{
          width: size,
          height: size,
          background: color || "#6366f1",
          fontSize: size * 0.42,
        }}
      >
        {initial}
      </div>
      {online !== undefined && (
        <span className={`avatar-dot ${online ? "online" : "offline"}`} />
      )}
    </div>
  );
}
