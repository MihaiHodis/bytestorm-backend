import db from "../config/db.js";

const fieldToSensorType = {
  temp: "temperature",
  light: "light",
  soil_moisture: "soil_moisture",
};

export const receiveSensorData = async (req, res) => {
  const { device_uid } = req.params;
  const payload = (req.body && typeof req.body === "object") ? req.body : {}; // ✅ fallback

  try {
    // debug optional
    // console.log("Headers:", req.headers);
    // console.log("Payload:", payload);

    const [ctrl] = await db.query(
      "SELECT id FROM controllers WHERE device_uid = ?",
      [device_uid]
    );
    if (ctrl.length === 0) {
      return res.status(404).json({ message: "Controller not found" });
    }
    const controllerId = ctrl[0].id;

    const [sensors] = await db.query(
      "SELECT id, type FROM sensors WHERE controller_id = ?",
      [controllerId]
    );
    const sensorIdByType = Object.fromEntries(sensors.map(s => [s.type, s.id]));

    const allowedFields = ["temp", "light", "soil_moisture"];
    const inserts = [];

    for (const key of allowedFields) {
      if (!(key in payload)) continue;          // ✅ nu mai explodează
      const val = Number(payload[key]);
      if (!Number.isFinite(val)) continue;

      const sensorType = fieldToSensorType[key];
      const sensorId = sensorIdByType[sensorType];
      if (!sensorId) continue;

      inserts.push(
        db.query("INSERT INTO sensor_readings (sensor_id, value) VALUES (?, ?)", [sensorId, val])
      );
    }

    if (inserts.length === 0) {
      return res.status(400).json({
        message: "No valid readings in payload (expected: temp, light, soil_moisture)."
      });
    }

    await Promise.all(inserts);
    res.status(200).json({ message: "Readings stored", stored: inserts.length });
  } catch (err) {
    console.error("receiveSensorData error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
