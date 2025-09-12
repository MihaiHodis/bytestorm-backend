import pool from "../config/db.js";

// GET /outside_weather
export async function listOutsideWeather(req, res) {
  try {
    const userUid = req.user.uid; // user Firebase
    const { greenhouse_id, from, to, limit } = req.query;

    const params = [userUid];
    const where = ["g.owner_user_id = ?"];

    if (greenhouse_id) {
      where.push("ow.greenhouse_id = ?");
      params.push(greenhouse_id);
    }
    if (from) {
      where.push("ow.timestamp >= ?");
      params.push(new Date(from));
    }
    if (to) {
      where.push("ow.timestamp <= ?");
      params.push(new Date(to));
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const limitSql = limit ? `LIMIT ${Number(limit)}` : "";

    const [rows] = await pool.query(
      `
      SELECT ow.id, ow.greenhouse_id, ow.timestamp, ow.temperature, ow.humidity
      FROM outside_weather ow
      JOIN greenhouses g ON g.id = ow.greenhouse_id
      ${whereSql}
      ORDER BY ow.timestamp ASC
      ${limitSql}
      `,
      params
    );

    // normalizare date (ISO 8601)
    const data = rows.map((r) => ({
      id: String(r.id),
      greenhouse_id: String(r.greenhouse_id),
      timestamp: new Date(r.timestamp).toISOString(),
      temperature: Number(r.temperature),
      humidity: Number(r.humidity),
    }));

    res.json(data);
  } catch (err) {
    console.error("listOutsideWeather error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
