import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import Avatar from "../components/Avatar.jsx";
import { useSocket } from "../context/SocketContext.jsx";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { onlineUsers } = useSocket();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get("/users/search", {
          params: { q: query },
          signal: controller.signal,
        });
        setResults(data);
      } catch {
        // запрос отменён или произошла ошибка сети — игнорируем
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="page">
      <h1>Найти людей</h1>
      <input
        className="search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск по имени или нику..."
        autoFocus
      />

      {loading ? (
        <p className="muted">Загрузка...</p>
      ) : results.length === 0 ? (
        <p className="muted">Никого не найдено</p>
      ) : (
        <div className="user-list">
          {results.map((u) => (
            <div className="user-row" key={u.id}>
              <Avatar
                name={u.displayName}
                color={u.avatarColor}
                online={onlineUsers.has(u.id)}
              />
              <div className="user-row-info">
                <div className="user-row-name">{u.displayName}</div>
                <div className="user-row-username">@{u.username}</div>
              </div>
              <button
                className="btn-secondary"
                onClick={() => navigate(`/chats/${u.id}`)}
              >
                Написать
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
