import db from "../config/db.js";

// Get all clients
export const getAllClients = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM clients");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving clients", error });
  }
};

// Get one client by ID
export const getClientById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM clients WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving client", error });
  }
};

// Create a new client
export const createClient = async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO clients (name, email, phone) VALUES (?, ?, ?)",
      [name, email, phone]
    );
    res.status(201).json({ id: result.insertId, name, email, phone });
  } catch (error) {
    res.status(500).json({ message: "Error creating client", error });
  }
};
