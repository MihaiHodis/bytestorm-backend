// controllers/outsideWeatherController.js
import pool from '../config/db.js'; // importă conexiunea ta mysql2/promise

export async function listOutsideWeather(req, res) {
  try {
    const { greenhouse_id, from, to, limit } = req.query;

    const params = [];
    const where = [];
    if (greenhouse_id) {
      where.push('greenhouse_id = ?');
      params.push(greenhouse_id);
    }
    if (from) {
      where.push('timestamp >= ?');
      params.push(new Date(from));
    }
    if (to) {
      where.push('timestamp <= ?');
      params.push(new Date(to));
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const limitSql = limit ? `LIMIT ${Number(limit)}` : '';

    const [rows] = await pool.query(
      `
      SELECT id, greenhouse_id, timestamp, temperature, humidity
      FROM outside_weather
      ${whereSql}
      ORDER BY timestamp ASC
      ${limitSql}
      `,
      params
    );

    // normalizare date (ISO 8601)
    const data = rows.map(r => ({
      id: String(r.id),
      greenhouse_id: String(r.greenhouse_id),
      timestamp: new Date(r.timestamp).toISOString(),
      temperature: Number(r.temperature),
      humidity: Number(r.humidity)
    }));

    res.json(data);
  } catch (err) {
    console.error('listOutsideWeather error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
