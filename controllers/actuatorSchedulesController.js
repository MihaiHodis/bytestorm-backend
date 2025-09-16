// controllers/actuatorSchedulesController.js
import pool from "../config/db.js";

// GET /actuator_schedules?greenhouse_id=...
export async function listSchedules(req, res) {
  try {
    const { greenhouse_id } = req.query;

    if (!greenhouse_id) {
      return res.status(400).json({ error: "greenhouse_id is required" });
    }

    const [rows] = await pool.query(
      `SELECT id, actuator_id, greenhouse_id, schedule_date, start_time, end_time, issued_by_user_id, created_at
       FROM actuator_schedules
       WHERE greenhouse_id = ?`,
      [greenhouse_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("listSchedules error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /actuator_schedules
export async function createSchedule(req, res) {
  try {
    const { actuator_id, greenhouse_id, schedule_date, start_time, end_time } = req.body;

    if (!actuator_id || !greenhouse_id || !schedule_date || !start_time || !end_time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // UID din tokenul Firebase
    const issued_by_user_id = req.user?.uid;
    if (!issued_by_user_id) {
      return res.status(401).json({ error: "Unauthorized: No Firebase UID" });
    }

    const [result] = await pool.query(
      `INSERT INTO actuator_schedules (actuator_id, greenhouse_id, schedule_date, start_time, end_time, issued_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [actuator_id, greenhouse_id, schedule_date, start_time, end_time, issued_by_user_id]
    );

    res.status(201).json({
      id: result.insertId,
      actuator_id,
      greenhouse_id,
      schedule_date,
      start_time,
      end_time,
      issued_by_user_id
    });
  } catch (err) {
    console.error("createSchedule error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}


// DELETE /actuator_schedules/:id
export async function deleteSchedule(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Schedule ID is required" });
    }

    const [result] = await pool.query(
      `DELETE FROM actuator_schedules WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json({ message: "Schedule deleted successfully", id });
  } catch (err) {
    console.error("deleteSchedule error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
