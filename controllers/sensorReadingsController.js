import pool from "../config/db.js";

// GET /sensors_readings
// GET /sensors_readings?sensor_id=1
export async function listSensorReadings(req, res) {
  const sensorId = req.query.sensor_id ? Number(req.query.sensor_id) : null;

  try {
    const userUid = req.user.uid;

    const baseSelect = `
      SELECT
        r.id,
        r.sensor_id,
        r.timestamp,
        r.value
      FROM sensor_readings r
      JOIN sensors s ON r.sensor_id = s.id
      JOIN controllers c ON c.id = s.controller_id
      JOIN greenhouses g ON g.id = c.greenhouse_id
      WHERE g.owner_user_id = ?
    `;

    const sql = sensorId
      ? `${baseSelect} AND r.sensor_id = ? ORDER BY r.timestamp ASC`
      : `${baseSelect} ORDER BY r.timestamp ASC`;

    const params = sensorId ? [userUid, sensorId] : [userUid];
    const [rows] = await pool.query(sql, params);

    // Formatăm exact cum cere frontend-ul
    const readings = rows.map((r) => ({
      id: String(r.id),
      sensor_id: String(r.sensor_id),
      timestamp: r.timestamp instanceof Date ? r.timestamp.toISOString() : r.timestamp,
      value: Number(r.value),
    }));

    res.json(readings);
  } catch (err) {
    console.error("listSensorReadings error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
