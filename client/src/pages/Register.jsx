import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(username, password, displayName);
      navigate("/chats");
    } catch (err) {
      setError(err.response?.data?.error || "Не удалось зарегистрироваться");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="brand center">
          <span className="brand-dot" />
          Connectify
        </div>
        <h1>Создать аккаунт</h1>
        <p className="muted">Присоединяйтесь и начните общаться</p>

        {error && <div className="alert">{error}</div>}

        <label>
          Имя пользователя
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ivan_petrov"
            autoFocus
            required
          />
        </label>

        <label>
          Отображаемое имя
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Иван Петров"
          />
        </label>

        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Минимум 4 символа"
            required
          />
        </label>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Создаём..." : "Зарегистрироваться"}
        </button>

        <p className="muted center">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  );
}
