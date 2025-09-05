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
        s.serial_number,
        s.technical_status,
        c.greenhouse_id
      FROM sensors s
      JOIN controllers c ON c.id = s.controller_id
    `;

    const sql = gid
      ? `${baseSelect} WHERE c.greenhouse_id = ? ORDER BY s.id ASC`
      : `${baseSelect} ORDER BY s.id ASC`;

    const params = gid ? [gid] : [];
    const [rows] = await pool.query(sql, params);

    // 🔑 Formatăm răspunsul exact cum cere frontend-ul
    const sensors = rows.map((sensor) => ({
      id: sensor.id,
      name: sensor.name,
      greenhouse_id: sensor.greenhouse_id,
      type: sensor.type,
      status: "off", // fallback temporar, dacă vreți putem adăuga coloană în DB
      serial_number: sensor.serial_number || "nespecificat",
      technical_status: sensor.technical_status,
    }));

    res.json(sensors);
  } catch (err) {
    console.error("listSensors error:", err);
    res.status(500).json({ error: "Server error" });
  }
}