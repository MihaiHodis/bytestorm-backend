import db from "../config/db.js";

const fieldToSensorType = {
  temp: "temperature",
  humidity: "humidity",
  soil_moisture: "soil_moisture",
};

export const receiveSensorData = async (req, res) => {
  const { device_uid } = req.params;
  const payload = (req.body && typeof req.body === "object") ? req.body : {};

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // 1) Confirm DB-ul (debug, temporar)
    const [[dbMeta]] = await conn.query("SELECT DATABASE() AS db, @@hostname AS host, @@port AS port");
    console.log("DB target:", dbMeta);

    // 2) Controller
    const [ctrl] = await conn.query(
      "SELECT id FROM controllers WHERE device_uid = ?",
      [device_uid]
    );
    if (ctrl.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "Controller not found" });
    }
    const controllerId = ctrl[0].id;

    // 3) Senzoare pentru controller
    const [sensors] = await conn.query(
      "SELECT id, `type` FROM sensors WHERE controller_id = ?",
      [controllerId]
    );
    const sensorIdByType = Object.fromEntries(sensors.map(s => [s.type, s.id]));
    console.log("Sensor types available:", Object.keys(sensorIdByType));

    const allowedFields = ["temp", "humidity", "soil_moisture"];
    const insertedIds = [];

    for (const key of allowedFields) {
      if (!(key in payload)) continue;

      const val = Number(payload[key]);
      if (!Number.isFinite(val)) continue;

      const sensorType = fieldToSensorType[key];
      const sensorId = sensorIdByType[sensorType];
      if (!sensorId) {
        console.warn(`No sensorId for type=${sensorType} (key=${key})`);
        continue;
      }

      // (opțional) validări simple ca să eviți out-of-range
      if (sensorType === "humidity" && (val < 0 || val > 100)) {
        console.warn(`Humidity out of range: ${val}`);
        continue;
      }

      const [result] = await conn.query(
        "INSERT INTO sensor_readings (sensor_id, value) VALUES (?, ?)",
        [sensorId, val]
      );
      insertedIds.push(result.insertId);
    }

    if (insertedIds.length === 0) {
      await conn.rollback();
      return res.status(400).json({
        message: "No valid readings inserted (expected: temp, humidity, soil_moisture)."
      });
    }

    await conn.commit();

    return res.status(200).json({
      message: "Readings stored",
      stored: insertedIds.length,
      ids: insertedIds   // <— vezi exact ce s-a inserat
    });
  } catch (err) {
    console.error("receiveSensorData error:", err);
    if (conn) {
      try { await conn.rollback(); } catch {}
    }
    return res.status(500).json({ message: "Server error" });
  } finally {
    if (conn) conn.release();
  }
};
