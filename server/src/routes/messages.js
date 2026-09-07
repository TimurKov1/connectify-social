import { Router } from "express";
import { requireAuth } from "../auth.js";
import {
  findUserById,
  getConversation,
  getConversationsForUser,
} from "../db.js";

const router = Router();

router.use(requireAuth);

router.get("/conversations", async (req, res) => {
  res.json(await getConversationsForUser(req.user.id));
});

router.get("/with/:userId", async (req, res) => {
  const other = await findUserById(req.params.userId);
  if (!other) return res.status(404).json({ error: "Пользователь не найден" });
  res.json(await getConversation(req.user.id, req.params.userId));
});

export default router;
