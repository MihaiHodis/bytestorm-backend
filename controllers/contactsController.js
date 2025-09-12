import pool from "../config/db.js";

// helper pentru normalizarea timestamp-ului din ISO (cu T și Z) în format MySQL
function normalizeTimestamp(ts) {
  if (!ts) return null;
  return ts.replace("T", " ").replace("Z", "");
}

// ================================
// GET /contacts
// ================================
export async function listContacts(req, res) {
  try {
    const userUid = req.user.uid;

    const [rows] = await pool.query(
      "SELECT * FROM contacts WHERE owner_user_id = ? ORDER BY id DESC",
      [userUid]
    );
    res.json(rows);
  } catch (err) {
    console.error("listContacts error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ================================
// GET /contacts/:id
// ================================
export async function getContactById(req, res) {
  try {
    const { id } = req.params;
    const userUid = req.user.uid;

    const [rows] = await pool.query(
      "SELECT * FROM contacts WHERE id = ? AND owner_user_id = ?",
      [id, userUid]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("getContactById error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ================================
// POST /contacts
// ================================
export async function createContact(req, res) {
  try {
    const userUid = req.user.uid;
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

    // normalizăm timestamp-ul (dacă e trimis)
    const ts = normalizeTimestamp(timestamp);

    // câmpuri de bază
    const fields = [
      "owner_user_id",
      "title",
      "description",
      "category",
      "email",
      "status",
      "source",
      "moduleCategory",
      "priority",
    ];
    const values = [
      userUid,
      title,
      description,
      category,
      email,
      status || "new",
      source || "contact_page",
      moduleCategory,
      priority || "medium",
    ];

    // dacă există timestamp, îl adăugăm explicit
    if (ts) {
      fields.splice(5, 0, "timestamp"); // îl punem după email
      values.splice(5, 0, ts);
    }

    // construim query-ul dinamic
    const placeholders = fields.map(() => "?").join(", ");
    const sql = `INSERT INTO contacts (${fields.join(", ")}) VALUES (${placeholders})`;

    const [result] = await pool.query(sql, values);

    res.status(201).json({
      id: result.insertId,
      owner_user_id: userUid,
      title,
      description,
      category,
      email,
      timestamp: ts || "NOW()", // dacă lipsește, MySQL a pus implicit CURRENT_TIMESTAMP
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

// ================================
// PATCH /contacts/:id
// ================================
export async function updateContact(req, res) {
  try {
    const { id } = req.params;
    const userUid = req.user.uid;
    const fields = req.body;

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    if (fields.timestamp) {
      fields.timestamp = normalizeTimestamp(fields.timestamp);
    }

    const setClause = Object.keys(fields)
      .map((f) => `${f} = ?`)
      .join(", ");
    const values = [...Object.values(fields), id, userUid];

    const [result] = await pool.query(
      `UPDATE contacts SET ${setClause} WHERE id = ? AND owner_user_id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Contact not found or unauthorized" });
    }

    res.json({ message: "Contact updated successfully" });
  } catch (err) {
    console.error("updateContact error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ================================
// DELETE /contacts/:id
// ================================
export async function deleteContact(req, res) {
  try {
    const { id } = req.params;
    const userUid = req.user.uid;

    const [result] = await pool.query(
      "DELETE FROM contacts WHERE id = ? AND owner_user_id = ?",
      [id, userUid]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Contact not found or unauthorized" });
    }

    res.json({ message: "Contact deleted successfully" });
  } catch (err) {
    console.error("deleteContact error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
