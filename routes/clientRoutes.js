import express from "express";
import { getAllClients, getClientById, createClient } from "../controllers/clientController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rute protejate
router.get("/", verifyToken, getAllClients);
router.get("/:id", verifyToken, getClientById);

// Creare client fără protecție
router.post("/", createClient);

export default router;
