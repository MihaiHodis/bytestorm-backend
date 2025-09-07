import pool from "../config/db.js";

// helper pentru normalizarea timestamp-ului din ISO (cu T și Z) în format MySQL
function normalizeTimestamp(ts) {
  if (!ts) return null;
  return ts.replace("T", " ").replace("Z", "");
}

// GET /contacts
export async function listContacts(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM contacts ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("listContacts error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /contacts/:id
export async function getContactById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM contacts WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("getContactById error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /contacts
export async function createContact(req, res) {
  try {
    const {
      title,
      description,
      category,
      email,
      timestamp,
      status,
      source,
      moduleCategory,
      priority,
    } = req.body;

    if (!title || !description || !category || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // normalizăm timestamp-ul
    const ts = normalizeTimestamp(timestamp);

    const [result] = await pool.query(
      `INSERT INTO contacts (title, description, category, email, timestamp, status, source, moduleCategory, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        category,
        email,
        ts,
        status || "new",
        source || "contact_page",
        moduleCategory,
        priority || "medium",
      ]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      description,
      category,
      email,
      timestamp: ts,
      status: status || "new",
      source: source || "contact_page",
      moduleCategory,
      priority: priority || "medium",
    });
  } catch (err) {
    console.error("createContact error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// PATCH /contacts/:id
export async function updateContact(req, res) {
  try {
    const { id } = req.params;
    const fields = req.body;

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // normalizăm dacă se trimite timestamp nou
    if (fields.timestamp) {
      fields.timestamp = normalizeTimestamp(fields.timestamp);
    }

    const setClause = Object.keys(fields)
      .map((f) => `${f} = ?`)
      .join(", ");
    const values = [...Object.values(fields), id];

    await pool.query(`UPDATE contacts SET ${setClause} WHERE id = ?`, values);
    res.json({ message: "Contact updated successfully" });
  } catch (err) {
    console.error("updateContact error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// DELETE /contacts/:id
export async function deleteContact(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM contacts WHERE id = ?", [id]);
    res.json({ message: "Contact deleted successfully" });
  } catch (err) {
    console.error("deleteContact error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
