import pool from "../config/db.js";

// GET /users_data
export async function listUsersData(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT id, nickname, avatar
      FROM users_data
    `);
    res.json(rows);
  } catch (err) {
    console.error("listUsersData error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /users_data/:id
export async function getUserData(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT id, nickname, avatar 
       FROM users_data 
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User data not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("getUserData error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /users_data
export async function createOrUpdateUserData(req, res) {
  try {
    const { id, nickname, avatar } = req.body;

    if (!id || !nickname) {
      return res.status(400).json({ error: "Missing required fields: id, nickname" });
    }

    // UPSERT: dacă există -> update, altfel -> insert
    const [result] = await pool.query(
      `INSERT INTO users_data (id, nickname, avatar)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE nickname = VALUES(nickname), avatar = VALUES(avatar)`,
      [id, nickname, avatar]
    );

    res.status(201).json({ message: "User data saved successfully", id, nickname, avatar });
  } catch (err) {
    console.error("createOrUpdateUserData error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
