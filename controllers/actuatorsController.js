import pool from "../config/db.js";

// ================================
// GET /actuators
// ================================
export async function listActuators(req, res) {
  try {
    const userUid = req.user.uid;

    const [rows] = await pool.query(
      `SELECT a.*
       FROM actuators a
       JOIN controllers c ON c.id = a.controller_id
       JOIN greenhouses g ON g.id = c.greenhouse_id
       WHERE g.owner_user_id = ?`,
      [userUid]
    );

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
    const userUid = req.user.uid;

    let query = `
      SELECT ac.*
      FROM actuator_commands ac
      JOIN actuators a ON a.id = ac.actuator_id
      JOIN controllers c ON c.id = a.controller_id
      JOIN greenhouses g ON g.id = c.greenhouse_id
      WHERE g.owner_user_id = ?
    `;
    const params = [userUid];

    if (actuator_id) {
      query += " AND ac.actuator_id = ? ORDER BY ac.issued_at DESC";
      params.push(actuator_id);
    } else {
      query += " ORDER BY ac.issued_at DESC";
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("listActuatorCommands error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ================================
// POST /actuator_commands venite din aplicație frontend
// ================================
export async function createActuatorCommand(req, res) {
  try {
    const { actuator_id, command, level, duration_minutes } = req.body;
    const userUid = req.user.uid;

    if (!actuator_id || !command) {
      return res.status(400).json({
        error: "Missing required fields: actuator_id, command",
      });
    }

    // Verificăm că actuatorul aparține userului logat
    const [check] = await pool.query(
      `SELECT a.id
       FROM actuators a
       JOIN controllers c ON c.id = a.controller_id
       JOIN greenhouses g ON g.id = c.greenhouse_id
       WHERE a.id = ? AND g.owner_user_id = ?`,
      [actuator_id, userUid]
    );

    if (check.length === 0) {
      return res.status(403).json({ error: "Unauthorized actuator access" });
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
      [actuator_id, command, level || null, userUid, expires_at]
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
      issued_by_user_id: userUid,
      issued_at: new Date(),
      expires_at,
    });
  } catch (err) {
    console.error("createActuatorCommand error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
