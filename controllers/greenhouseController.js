// ENDPOINT pentru expunerea serelor pentru frontend

import pool from "../config/db.js";

// GET /api/greenhouses
export async function listGreenhouses(_req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, location, created_at FROM greenhouses"
    );
    res.json(rows);
  } catch (err) {
    console.error("listGreenhouses error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
