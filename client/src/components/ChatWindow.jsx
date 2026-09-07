import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatWindow({ otherUser, messages, onSend }) {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    function handleTyping({ from, isTyping }) {
      if (from === otherUser.id) setOtherTyping(isTyping);
    }
    socket.on("typing", handleTyping);
    return () => socket.off("typing", handleTyping);
  }, [socket, otherUser.id]);

  useEffect(() => {
    setOtherTyping(false);
  }, [otherUser.id]);

  function handleChange(e) {
    setText(e.target.value);
    if (!socket) return;
    socket.emit("typing", { to: otherUser.id, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { to: otherUser.id, isTyping: false });
    }, 1200);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    socket?.emit("typing", { to: otherUser.id, isTyping: false });
    clearTimeout(typingTimeoutRef.current);
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/chats")}
          aria-label="Назад к списку чатов"
        >
          ←
        </button>
        <Avatar
          name={otherUser.displayName}
          color={otherUser.avatarColor}
          online={onlineUsers.has(otherUser.id)}
        />
        <div>
          <div className="chat-header-name">{otherUser.displayName}</div>
          <div className="chat-header-status">
            {otherTyping
              ? "печатает..."
              : onlineUsers.has(otherUser.id)
              ? "в сети"
              : "не в сети"}
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="muted center">Начните переписку — напишите первое сообщение</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`bubble-row ${m.from === user.id ? "mine" : "theirs"}`}
          >
            <div className="bubble">
              <span>{m.text}</span>
              <span className="bubble-time">{formatTime(m.createdAt)}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-row" onSubmit={handleSubmit}>
        <input
          value={text}
          onChange={handleChange}
          placeholder="Напишите сообщение..."
          autoFocus
        />
        <button className="btn-primary" type="submit" disabled={!text.trim()}>
          Отправить
        </button>
      </form>
    </div>
  );
}
