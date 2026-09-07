import { Router } from "express";
import { deleteUsers, getUsers } from "../db.js";

const router = Router();

// Temporary one-time cleanup endpoint for test accounts created during
// deployment verification. Remove this file after use.
const CLEANUP_KEY = "f5b1791bb106dee6e78a2f76ab30a9ed6c9e25c887ba3d45";
const TEST_USERNAME_PATTERN = /^(alice|bob)_(prod|v2)_\d+$/i;

router.post("/cleanup-test-accounts", (req, res) => {
  if (req.headers["x-cleanup-key"] !== CLEANUP_KEY) {
    return res.status(403).json({ error: "forbidden" });
  }
  const toDelete = getUsers().filter((u) =>
    TEST_USERNAME_PATTERN.test(u.username)
  );
  const deleted = deleteUsers(toDelete.map((u) => u.id));
  res.json({ deleted: deleted.map((u) => u.username) });
});

export default router;
