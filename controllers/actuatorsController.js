// ENDPOINT pentru expunerea actuatoarelor pentru frontend

import pool from "../config/db.js";

// GET /actuators           -> toate
// GET /actuators?greenhouse_id=1
export async function listActuators(req, res) {
  const gid = req.query.greenhouse_id ? Number(req.query.greenhouse_id) : null;

  try {
    const baseSelect = `
      SELECT
        a.id,
        a.name,
        a.type,
        a.is_active,
        c.greenhouse_id
      FROM actuators a
      JOIN controllers c ON c.id = a.controller_id
    `;

    const sql = gid
      ? `${baseSelect} WHERE c.greenhouse_id = ? ORDER BY a.id ASC`
      : `${baseSelect} ORDER BY a.id ASC`;

    const params = gid ? [gid] : [];
    const [rows] = await pool.query(sql, params);

    // 🔑 Adaptăm răspunsul exact cum cere frontend-ul
    const actuators = rows.map((actuator) => ({
      id: actuator.id,
      name: actuator.name, // alias din label
      greenhouse_id: actuator.greenhouse_id,
      type: actuator.type,
      status: actuator.is_active === 1 ? "on" : "off", // mapăm tinyint
      serial_number: actuator.serial_number || "nespecificat", // fallback
      technical_status: actuator.technical_status || "functional", // fallback
    }));

    res.json(actuators);
  } catch (err) {
    console.error("listActuators error:", err);
    res.status(500).json({ error: "Server error" });
  }
}