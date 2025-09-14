import pool from "../config/db.js";

export async function listSensors(req, res) {
  const gid = req.query.greenhouse_id ? Number(req.query.greenhouse_id) : null;

  try {
    const userUid = req.user.uid; // UID din token

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
      JOIN greenhouses g ON g.id = c.greenhouse_id
      WHERE g.owner_user_id = ?
    `;

    const sql = gid
      ? `${baseSelect} AND c.greenhouse_id = ? ORDER BY s.id ASC`
      : `${baseSelect} ORDER BY s.id ASC`;

    const params = gid ? [userUid, gid] : [userUid];
    const [rows] = await pool.query(sql, params);

    // 🔑 Formatăm răspunsul exact cum cere frontend-ul
    const sensors = rows.map((sensor) => ({
      id: sensor.id,
      name: sensor.name,
      greenhouse_id: sensor.greenhouse_id,
      type: sensor.type,
      unit: sensor.unit || "", // trimitem și unit
      status: "off", // fallback temporar
      serial_number: sensor.serial_number || "nespecificat",
      technical_status: sensor.technical_status,
    }));

    res.json(sensors);
  } catch (err) {
    console.error("listSensors error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
