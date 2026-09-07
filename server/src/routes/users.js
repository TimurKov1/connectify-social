import { Router } from "express";
import { requireAuth } from "../auth.js";
import { findUserById, publicUser, searchUsers } from "../db.js";

const router = Router();

router.use(requireAuth);

router.get("/me", async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });
  res.json(publicUser(user));
});

router.get("/search", async (req, res) => {
  const q = req.query.q || "";
  const results = await searchUsers(String(q), req.user.id);
  res.json(results);
});

router.get("/:id", async (req, res) => {
  const user = await findUserById(req.params.id);
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });
  res.json(publicUser(user));
});

export default router;
