import db from "../config/db.js";
// endpoint pentru comenzi venite de la hardware (Raspberry Pico, etc.)
const fieldToSensorType = {
  temp: "temperature",
  humidity: "humidity",
  soil_moisture: "soil_moisture",
};

// Acceptă epoch sec/ms sau string ISO; altfel returnează null
function parseIncomingTimestamp(ts) {
  if (ts == null) return null;
  if (Number.isFinite(ts)) {
    const ms = String(ts).length === 10 ? ts * 1000 : ts;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof ts === "string") {
    const d = new Date(ts);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Endpoint pentru recepția datelor de la device-uri (Raspberry Pico, etc.)
 * Protejat cu API Key (x-api-key în header).
 * 
 * POST /data/:device_uid
 */
export const receiveSensorData = async (req, res) => {
  const { device_uid } = req.params;
  const payload = (req.body && typeof req.body === "object") ? req.body : {};
  const ts = parseIncomingTimestamp(payload.timestamp); // opțional global

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // 1) Verificăm controller-ul după device_uid
    const [ctrl] = await conn.query(
      "SELECT id FROM controllers WHERE device_uid = ? LIMIT 1",
      [device_uid]
    );
    if (ctrl.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "Controller not found" });
    }
    const controllerId = ctrl[0].id;

    // 2) Selectăm senzorii funcționali pentru acest controller
    const [sensors] = await conn.query(
      "SELECT id, `type` FROM sensors WHERE controller_id = ? AND technical_status = 'functional'",
      [controllerId]
    );

    const sensorIdByType = Object.fromEntries(
      sensors.map(s => [String(s.type).toLowerCase(), s.id])
    );

    // 3) Inserăm citirile disponibile
    const allowedFields = ["temp", "humidity", "soil_moisture"];
    const insertedIds = [];

    for (const key of allowedFields) {
      if (!(key in payload)) continue;

      const val = Number(payload[key]);
      if (!Number.isFinite(val)) continue;

      const sensorType = fieldToSensorType[key];   // ex: 'temperature'
      const sensorId = sensorIdByType[sensorType];
      if (!sensorId) continue;

      // validare simplă pentru humidity
      if (sensorType === "humidity" && (val < 0 || val > 100)) continue;

      if (ts) {
        const [r] = await conn.query(
          "INSERT INTO sensor_readings (sensor_id, value, timestamp) VALUES (?, ?, ?)",
          [sensorId, val, ts]
        );
        insertedIds.push(r.insertId);
      } else {
        const [r] = await conn.query(
          "INSERT INTO sensor_readings (sensor_id, value, timestamp) VALUES (?, ?, NOW())",
          [sensorId, val]
        );
        insertedIds.push(r.insertId);
      }
    }

    if (insertedIds.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: "No valid readings inserted." });
    }

    await conn.commit();
    return res.status(200).json({
      message: "Readings stored",
      stored: insertedIds.length,
      ids: insertedIds,
    });
  } catch (err) {
    console.error("receiveSensorData error:", err);
    if (conn) { try { await conn.rollback(); } catch {} }
    return res.status(500).json({ message: "Server error", error: String(err?.message || err) });
  } finally {
    if (conn) conn.release();
  }
};
