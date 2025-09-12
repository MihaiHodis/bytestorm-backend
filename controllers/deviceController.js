import pool from "../config/db.js";

// Endpoint pentru comenzi venite de la hardware
export async function createDeviceCommand(req, res) {
  try {
    const { actuator_id, command } = req.body;

    if (!actuator_id || !command) {
      return res.status(400).json({
        error: "Missing required fields: actuator_id, command",
      });
    }

    // Verificăm că actuatorul există și e funcțional
    const [check] = await pool.query(
      "SELECT id FROM actuators WHERE id = ? AND technical_status = 'functional'",
      [actuator_id]
    );

    if (check.length === 0) {
      return res.status(404).json({ error: "Actuator not found or not functional" });
    }

    // Inserăm comanda (user-ul este "device")
    const [result] = await pool.query(
      `INSERT INTO actuator_commands 
       (actuator_id, command, issued_by_user_id, issued_at)
       VALUES (?, ?, ?, NOW())`,
      [actuator_id, command, "DEVICE_API"]
    );

    // Actualizăm status-ul actuatorului
    await pool.query("UPDATE actuators SET status = ? WHERE id = ?", [
      command === "on" ? "on" : "off",
      actuator_id,
    ]);

    res.status(201).json({
      id: result.insertId,
      actuator_id,
      command,
      issued_by: "device",
      issued_at: new Date(),
    });
  } catch (err) {
    console.error("createDeviceCommand error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
