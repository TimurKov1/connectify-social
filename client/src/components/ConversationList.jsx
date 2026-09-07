import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Avatar from "./Avatar.jsx";
import { useSocket } from "../context/SocketContext.jsx";

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function ConversationList({ conversations, activeUser }) {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { onlineUsers } = useSocket();

  return (
    <div className="conversation-list">
      <h2>Сообщения</h2>
      {conversations.length === 0 && (
        <p className="muted small">
          Пока нет переписок. Найдите пользователей во вкладке «Найти людей».
        </p>
      )}
      {conversations.map(({ user, lastMessage }) => (
        <button
          key={user.id}
          className={`conversation-item${user.id === userId ? " active" : ""}`}
          onClick={() => navigate(`/chats/${user.id}`)}
        >
          <Avatar
            name={user.displayName}
            color={user.avatarColor}
            online={onlineUsers.has(user.id)}
          />
          <div className="conversation-info">
            <div className="conversation-top">
              <span className="conversation-name">{user.displayName}</span>
              <span className="conversation-time">
                {formatTime(lastMessage.createdAt)}
              </span>
            </div>
            <div className="conversation-preview">{lastMessage.text}</div>
          </div>
        </button>
      ))}

      {activeUser && !conversations.some((c) => c.user.id === activeUser.id) && (
        <button className="conversation-item active">
          <Avatar
            name={activeUser.displayName}
            color={activeUser.avatarColor}
            online={onlineUsers.has(activeUser.id)}
          />
          <div className="conversation-info">
            <div className="conversation-top">
              <span className="conversation-name">{activeUser.displayName}</span>
            </div>
            <div className="conversation-preview muted">Новый диалог</div>
          </div>
        </button>
      )}
    </div>
  );
}
