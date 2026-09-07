import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/chats");
    } catch (err) {
      setError(err.response?.data?.error || "Не удалось войти");
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
        <h1>С возвращением</h1>
        <p className="muted">Войдите, чтобы продолжить общение</p>

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
          Пароль
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Входим..." : "Войти"}
        </button>

        <p className="muted center">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </form>
    </div>
  );
}
