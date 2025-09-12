import pool from "../config/db.js";

// returnează ultimele comenzi pentru actuatoare sub forma { pump: bool, fan: bool }
export async function getDeviceCommands(req, res) {
  try {
    const { device_uid } = req.params;

    // Verificăm controller-ul după device_uid
    const [ctrl] = await pool.query(
      "SELECT id FROM controllers WHERE device_uid = ? LIMIT 1",
      [device_uid]
    );
    if (ctrl.length === 0) {
      return res.status(404).json({ error: "Controller not found" });
    }
    const controllerId = ctrl[0].id;

    // Luăm actuatoarele asociate controllerului
    const [rows] = await pool.query(
      `SELECT a.type, a.status 
       FROM actuators a
       WHERE a.controller_id = ?`,
      [controllerId]
    );

    // Transformăm în răspuns { pump: bool, fan: bool }
    const response = {};
    for (const r of rows) {
      if (r.type === "pump") response.pump = r.status === "on";
      if (r.type === "fan") response.fan = r.status === "on";
    }

    res.json(response);
  } catch (err) {
    console.error("getDeviceCommands error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
