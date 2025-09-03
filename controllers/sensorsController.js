// ENDPOINT pentru expunerea senzorilor pentru frontend

import pool from "../config/db.js";

// GET /sensors           -> toate
// GET /sensors?greenhouse_id=1
export async function listSensors(req, res) {
  const gid = req.query.greenhouse_id ? Number(req.query.greenhouse_id) : null;

  try {
    const baseSelect = `
      SELECT
        s.id,
        s.name,
        s.type,
        s.unit,
        s.label,
        s.is_active,
        s.created_at,
        -- alias-uri pt. compatibilitate FE (dacă e nevoie)
        NULL AS value,
        s.created_at AS updated_at,
        c.greenhouse_id
      FROM sensors s
      JOIN controllers c ON c.id = s.controller_id
    `;

    const sql = gid
      ? `${baseSelect} WHERE c.greenhouse_id = ? ORDER BY s.id ASC`
      : `${baseSelect} ORDER BY s.id ASC`;

    const params = gid ? [gid] : [];
    const [rows] = await pool.query(sql, params);

    res.json(rows);
  } catch (err) {
    console.error("listSensors error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
