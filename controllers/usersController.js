// controllers/usersController.js
import pool from "../config/db.js";

/**
 * GET /api/users/me
 * Returnează profilul utilizatorului autentificat.
 * Dacă nu există în DB, creează unul nou pe baza UID-ului Firebase.
 */
export async function syncUser(req, res) {
  try {
    const userUid = req.user.uid;
    const userEmail = req.user.email || "unknown@example.com";

    // Verificăm dacă există deja userul în DB
    const [rows] = await pool.query(
      "SELECT * FROM users_data WHERE firebase_uid = ?",
      [userUid]
    );

    if (rows.length > 0) {
      return res.json(rows[0]); // utilizatorul există deja
    }

    // Dacă nu există, inserăm userul nou
    const [result] = await pool.query(
      "INSERT INTO users_data (nickname, avatar, firebase_uid) VALUES (?, ?, ?)",
      [userEmail, "default.png", userUid]
    );

    const newUser = {
      id: result.insertId,
      nickname: userEmail,
      avatar: "default.png",
      firebase_uid: userUid,
    };

    res.status(201).json(newUser);
  } catch (err) {
    console.error("syncUser error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * GET /api/users
 * Returnează toți utilizatorii din users_data.
 * Doar pentru debugging sau admin.
 */
export async function listAllUsers(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM users_data");
    res.json(rows);
  } catch (err) {
    console.error("listAllUsers error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
