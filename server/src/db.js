import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function loadDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    const initial = { users: [], messages: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return { users: [], messages: [] };
  }
}

const db = loadDb();
let saveTimer = null;

function persist() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  }, 50);
}

export function getUsers() {
  return db.users;
}

export function findUserByUsername(username) {
  const lower = username.toLowerCase();
  return db.users.find((u) => u.username.toLowerCase() === lower);
}

export function findUserById(id) {
  return db.users.find((u) => u.id === id);
}

export function createUser(user) {
  db.users.push(user);
  persist();
  return user;
}

export function deleteUsers(ids) {
  const idSet = new Set(ids);
  const deleted = db.users.filter((u) => idSet.has(u.id));
  db.users = db.users.filter((u) => !idSet.has(u.id));
  db.messages = db.messages.filter(
    (m) => !idSet.has(m.from) && !idSet.has(m.to)
  );
  persist();
  return deleted;
}

export function searchUsers(query, excludeId) {
  const lower = query.trim().toLowerCase();
  return db.users
    .filter((u) => u.id !== excludeId)
    .filter(
      (u) =>
        !lower ||
        u.username.toLowerCase().includes(lower) ||
        u.displayName.toLowerCase().includes(lower)
    )
    .map(publicUser);
}

export function publicUser(u) {
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    avatarColor: u.avatarColor,
    bio: u.bio || "",
  };
}

export function conversationId(userA, userB) {
  return [userA, userB].sort().join("_");
}

export function addMessage(message) {
  db.messages.push(message);
  persist();
  return message;
}

export function getConversation(userA, userB) {
  const convId = conversationId(userA, userB);
  return db.messages
    .filter((m) => m.conversationId === convId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function getConversationsForUser(userId) {
  const map = new Map();
  for (const m of db.messages) {
    if (m.from !== userId && m.to !== userId) continue;
    const otherId = m.from === userId ? m.to : m.from;
    const existing = map.get(otherId);
    if (!existing || existing.createdAt < m.createdAt) {
      map.set(otherId, m);
    }
  }
  return [...map.entries()]
    .map(([otherId, lastMessage]) => {
      const other = findUserById(otherId);
      if (!other) return null;
      return {
        user: publicUser(other),
        lastMessage,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);
}
