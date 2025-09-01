// controllers/usersController.js
import pool from "../config/db.js";

/**
 * GET /api/users
 * Returnează [{ id, name, password, email? }] pentru compatibilitate cu frontendul actual.
 * ATENȚIE: expune parolele în clar — doar pentru testare!
 */
export async function listAllUsers(req, res) {
  try {
    // Încercăm schema nouă (nume, password); dacă nu există, cădem pe (username, password_hash)
    try {
      const [rows] = await pool.query(
        "SELECT id, nume AS name, password FROM users"
      );
      return res.json(rows);
    } catch (err) {
      if (err?.code !== "ER_BAD_FIELD_ERROR") throw err;
      // fallback pe schema veche
      const [rowsLegacy] = await pool.query(
        "SELECT id, username AS name, password_hash AS password, email FROM users"
      );
      return res.json(rowsLegacy);
    }
  } catch (err) {
    console.error("listAllUsers error:", err);
    return res.status(500).json({ ok: false, error: "Eroare server." });
  }
}
