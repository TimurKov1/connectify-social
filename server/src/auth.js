import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function signToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Нет токена авторизации" });
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Недействительный токен" });
  }
}
