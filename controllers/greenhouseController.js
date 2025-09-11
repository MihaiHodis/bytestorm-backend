import pool from "../config/db.js";

// Listare sere ale utilizatorului autentificat
export const listGreenhouses = async (req, res) => {
  try {
    const userUid = req.user.uid; // UID din token
    const [rows] = await pool.query(
      "SELECT * FROM greenhouses WHERE owner_user_id = ?",
      [userUid]
    );
    res.json(rows);
  } catch (err) {
    console.error("listGreenhouses error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Creare seră nouă pentru utilizatorul curent
export const createGreenhouse = async (req, res) => {
  try {
    const userUid = req.user.uid;
    const { name, location } = req.body;

    const [result] = await pool.query(
      "INSERT INTO greenhouses (name, location, owner_user_id) VALUES (?, ?, ?)",
      [name, location, userUid]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      location,
      owner_user_id: userUid,
    });
  } catch (err) {
    console.error("createGreenhouse error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
