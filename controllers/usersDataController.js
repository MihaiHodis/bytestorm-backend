// controllers/usersDataController.js
import pool from '../config/db.js';

// GET /users_data
export async function listUsersData(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT id, UID, email, nickname, avatar
      FROM users_data
    `);

    res.json(rows);
  } catch (err) {
    console.error("listUsersData error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /users_data/:uid
export async function getUserDataByUID(req, res) {
  try {
    const { uid } = req.params;
    const [rows] = await pool.query(
      `SELECT id, UID, email, nickname, avatar 
       FROM users_data 
       WHERE UID = ?`,
      [uid]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User data not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("getUserDataByUID error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
