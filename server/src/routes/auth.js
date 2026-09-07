import { Router } from "express";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { createUser, findUserByUsername, publicUser } from "../db.js";
import { signToken } from "../auth.js";

const router = Router();

const COLORS = [
  "#6366f1",
  "#ec4899",
  "#22c55e",
  "#f97316",
  "#06b6d4",
  "#a855f7",
  "#eab308",
  "#ef4444",
];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

router.post("/register", async (req, res) => {
  const { username, password, displayName } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Укажите имя пользователя и пароль" });
  }
  if (username.trim().length < 3) {
    return res
      .status(400)
      .json({ error: "Имя пользователя должно содержать минимум 3 символа" });
  }
  if (password.length < 4) {
    return res
      .status(400)
      .json({ error: "Пароль должен содержать минимум 4 символа" });
  }
  if (await findUserByUsername(username)) {
    return res.status(409).json({ error: "Такое имя пользователя уже занято" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: randomUUID(),
    username: username.trim(),
    displayName: (displayName || username).trim(),
    passwordHash,
    avatarColor: randomColor(),
    bio: "",
    createdAt: Date.now(),
  };
  await createUser(user);

  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Укажите имя пользователя и пароль" });
  }

  const user = await findUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: "Неверное имя пользователя или пароль" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Неверное имя пользователя или пароль" });
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

export default router;
