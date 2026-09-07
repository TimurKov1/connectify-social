import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Add a Postgres connection string (e.g. from Neon) to the environment."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      username_lower TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_color TEXT NOT NULL,
      bio TEXT NOT NULL DEFAULT '',
      created_at BIGINT NOT NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      "from" TEXT NOT NULL,
      "to" TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at BIGINT NOT NULL
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id)`
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_messages_parties ON messages ("from", "to")`
  );
}

function rowToUser(row) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    passwordHash: row.password_hash,
    avatarColor: row.avatar_color,
    bio: row.bio,
    createdAt: Number(row.created_at),
  };
}

function rowToMessage(row) {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    from: row.from,
    to: row.to,
    text: row.text,
    createdAt: Number(row.created_at),
  };
}

export async function findUserByUsername(username) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE username_lower = $1",
    [username.toLowerCase()]
  );
  return rows[0] ? rowToUser(rows[0]) : undefined;
}

export async function findUserById(id) {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0] ? rowToUser(rows[0]) : undefined;
}

export async function createUser(user) {
  await pool.query(
    `INSERT INTO users (id, username, username_lower, display_name, password_hash, avatar_color, bio, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      user.id,
      user.username,
      user.username.toLowerCase(),
      user.displayName,
      user.passwordHash,
      user.avatarColor,
      user.bio || "",
      user.createdAt,
    ]
  );
  return user;
}

export async function searchUsers(query, excludeId) {
  const like = `%${query.trim().toLowerCase()}%`;
  const { rows } = await pool.query(
    `SELECT * FROM users
     WHERE id != $1 AND (username_lower LIKE $2 OR LOWER(display_name) LIKE $2)
     ORDER BY username`,
    [excludeId, like]
  );
  return rows.map(rowToUser).map(publicUser);
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

export async function addMessage(message) {
  await pool.query(
    `INSERT INTO messages (id, conversation_id, "from", "to", text, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      message.id,
      message.conversationId,
      message.from,
      message.to,
      message.text,
      message.createdAt,
    ]
  );
  return message;
}

export async function getConversation(userA, userB) {
  const convId = conversationId(userA, userB);
  const { rows } = await pool.query(
    `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
    [convId]
  );
  return rows.map(rowToMessage);
}

export async function getConversationsForUser(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM messages WHERE "from" = $1 OR "to" = $1 ORDER BY created_at ASC`,
    [userId]
  );

  const lastByOther = new Map();
  for (const row of rows) {
    const m = rowToMessage(row);
    const otherId = m.from === userId ? m.to : m.from;
    lastByOther.set(otherId, m);
  }

  const results = [];
  for (const [otherId, lastMessage] of lastByOther.entries()) {
    const other = await findUserById(otherId);
    if (!other) continue;
    results.push({ user: publicUser(other), lastMessage });
  }
  return results.sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);
}
