import { Router } from "express";
import { requireAuth } from "../auth.js";
import {
  findUserById,
  getConversation,
  getConversationsForUser,
} from "../db.js";

const router = Router();

router.use(requireAuth);

router.get("/conversations", (req, res) => {
  res.json(getConversationsForUser(req.user.id));
});

router.get("/with/:userId", (req, res) => {
  const other = findUserById(req.params.userId);
  if (!other) return res.status(404).json({ error: "Пользователь не найден" });
  res.json(getConversation(req.user.id, req.params.userId));
});

export default router;
