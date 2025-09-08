// controllers/usersDataController.js
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

// POST /users_data/:id   (pentru update profil)
export async function updateUserData(req, res) {
  try {
    const { id } = req.params;
    const fields = req.body;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Construim dinamically clauza SET pentru update
    const setClause = Object.keys(fields)
      .map(f => `${f} = ?`)
      .join(", ");
    const values = [...Object.values(fields), id];

    const [result] = await pool.query(
      `UPDATE users_data SET ${setClause} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User data not found" });
    }

    res.json({ message: "User data updated successfully", id, ...fields });
  } catch (err) {
    console.error("updateUserData error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
