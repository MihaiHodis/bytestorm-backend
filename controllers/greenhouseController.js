import pool from "../config/db.js";

export const listGreenhouses = async (req, res) => {
  try {
    // UID-ul autentificat de Firebase (din middleware)
    const userUid = req.user.uid;

    const [rows] = await pool.query(
      "SELECT * FROM greenhouses WHERE owner_user_id = ?",
      [userUid]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching greenhouses:", error);
    res.status(500).json({ message: "Server error" });
  }
};
