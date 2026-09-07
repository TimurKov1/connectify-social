import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import ConversationList from "../components/ConversationList.jsx";
import ChatWindow from "../components/ChatWindow.jsx";

export default function Chat() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    const { data } = await api.get("/messages/conversations");
    setConversations(data);
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setOtherUser(null);
      setMessages([]);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const [userRes, messagesRes] = await Promise.all([
          api.get(`/users/${userId}`),
          api.get(`/messages/with/${userId}`),
        ]);
        if (cancelled) return;
        setOtherUser(userRes.data);
        setMessages(messagesRes.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!socket) return;
    function handleNewMessage(message) {
      const relevantId =
        message.from === user.id ? message.to : message.from;
      if (relevantId === userId) {
        setMessages((prev) => [...prev, message]);
      }
      loadConversations();
    }
    socket.on("message:new", handleNewMessage);
    return () => socket.off("message:new", handleNewMessage);
  }, [socket, userId, user.id, loadConversations]);

  useEffect(() => {
    if (!socket) return;
    function handleSeen({ by, readAt, messageIds }) {
      if (by !== userId) return;
      const idSet = new Set(messageIds);
      setMessages((prev) =>
        prev.map((m) => (idSet.has(m.id) ? { ...m, readAt } : m))
      );
    }
    socket.on("message:seen", handleSeen);
    return () => socket.off("message:seen", handleSeen);
  }, [socket, userId]);

  useEffect(() => {
    if (!socket || !userId) return;
    socket.emit("message:read", { from: userId });
  }, [socket, userId, messages.length]);

  function handleSend(text) {
    if (!socket || !otherUser) return;
    socket.emit("message:send", { to: otherUser.id, text });
  }

  return (
    <div className={`chat-page ${userId ? "has-chat" : "no-chat"}`}>
      <ConversationList conversations={conversations} activeUser={otherUser} />

      {!userId ? (
        <div className="chat-empty">
          <p>Выберите переписку слева или найдите новых людей</p>
        </div>
      ) : loading ? (
        <div className="chat-empty">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/chats")}
            aria-label="Назад к списку чатов"
          >
            ←
          </button>
          <p className="muted">Загрузка...</p>
        </div>
      ) : otherUser ? (
        <ChatWindow
          otherUser={otherUser}
          messages={messages}
          onSend={handleSend}
        />
      ) : (
        <div className="chat-empty">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/chats")}
            aria-label="Назад к списку чатов"
          >
            ←
          </button>
          <p className="muted">Пользователь не найден</p>
        </div>
      )}
    </div>
  );
}
