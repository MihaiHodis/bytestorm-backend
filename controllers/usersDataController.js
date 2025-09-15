// controllers/usersDataController.js
import pool from "../config/db.js";

// GET /users_data
export async function listUsersData(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT id, firebase_uid, nickname, avatar
      FROM users_data
    `);
    res.json(rows);
  } catch (err) {
    console.error("listUsersData error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /users_data/:idOrUid
export async function getUserData(req, res) {
  try {
    const { id } = req.params;

    // Verificăm dacă este numeric sau Firebase UID
    const isNumericId = /^[0-9]+$/.test(id);

    let query, values;
    if (isNumericId) {
      query = `SELECT id, firebase_uid, nickname, avatar 
               FROM users_data 
               WHERE id = ?`;
      values = [id];
    } else {
      query = `SELECT id, firebase_uid, nickname, avatar 
               FROM users_data 
               WHERE firebase_uid = ?`;
      values = [id];
    }

    const [rows] = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User data not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("getUserData error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /users_data/:idOrUid   (pentru update profil)
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

    const isNumericId = /^[0-9]+$/.test(id);

    let whereClause, values;
    if (isNumericId) {
      whereClause = "id = ?";
      values = [...Object.values(fields), id];
    } else {
      whereClause = "firebase_uid = ?";
      values = [...Object.values(fields), id];
    }

    const setClause = Object.keys(fields).map(f => `${f} = ?`).join(", ");

    const [result] = await pool.query(
      `UPDATE users_data SET ${setClause} WHERE ${whereClause}`,
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
