import pool from "../config/db.js";

// GET /sensors_readings
// GET /sensors_readings?sensor_id=1
export async function listSensorReadings(req, res) {
  const sensorId = req.query.sensor_id ? Number(req.query.sensor_id) : null;

  try {
    const baseSelect = `
      SELECT
        r.id,
        r.sensor_id,
        r.timestamp,
        r.value
      FROM sensor_readings r
    `;

    const sql = sensorId
      ? `${baseSelect} WHERE r.sensor_id = ? ORDER BY r.timestamp ASC`
      : `${baseSelect} ORDER BY r.timestamp ASC`;

    const params = sensorId ? [sensorId] : [];
    const [rows] = await pool.query(sql, params);

    // Formatăm exact cum cere frontend-ul
    const readings = rows.map((r) => ({
      id: String(r.id), // frontend le vrea ca string
      sensor_id: String(r.sensor_id),
      timestamp: r.timestamp.toISOString(), // convertim în format ISO 8601
      value: Number(r.value),
    }));

    res.json(readings);
  } catch (err) {
    console.error("listSensorReadings error:", err);
    res.status(500).json({ error: "Server error" });
  }
}