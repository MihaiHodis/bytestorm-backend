import pool from "../config/db.js";

// ================================
// GET /actuators
// ================================
export async function listActuators(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM actuators");
    res.json(rows);
  } catch (err) {
    console.error("listActuators error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ================================
// GET /actuator_commands (?actuator_id=...)
// ================================
export async function listActuatorCommands(req, res) {
  try {
    const { actuator_id } = req.query;

    let query = "SELECT * FROM actuator_commands";
    const params = [];

    if (actuator_id) {
      query += " WHERE actuator_id = ? ORDER BY issued_at DESC";
      params.push(actuator_id);
    } else {
      query += " ORDER BY issued_at DESC";
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("listActuatorCommands error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ================================
// POST /actuator_commands
// ================================
export async function createActuatorCommand(req, res) {
  try {
    const { actuator_id, command, level, issued_by_user_id, duration_minutes } = req.body;

    if (!actuator_id || !command || !issued_by_user_id) {
      return res.status(400).json({
        error: "Missing required fields: actuator_id, command, issued_by_user_id",
      });
    }

    // Calculează expires_at dacă se trimite duration_minutes
    let expires_at = null;
    if (command === "on" && duration_minutes && !isNaN(duration_minutes)) {
      const [exp] = await pool.query("SELECT NOW() + INTERVAL ? MINUTE AS exp", [
        duration_minutes,
      ]);
      expires_at = exp[0].exp;
    }

    // Inserăm în actuator_commands
    const [result] = await pool.query(
      `INSERT INTO actuator_commands 
       (actuator_id, command, level, issued_by_user_id, issued_at, expires_at)
       VALUES (?, ?, ?, ?, NOW(), ?)`,
      [actuator_id, command, level || null, issued_by_user_id, expires_at]
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
      level: level || null,
      issued_by_user_id,
      issued_at: new Date(),
      expires_at,
    });
  } catch (err) {
    console.error("createActuatorCommand error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
