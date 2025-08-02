import express from "express";
import { getAllUsers, getUserById } from "../controllers/clientController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rute protejate
router.get("/", verifyToken, getAllUsers);
router.get("/:id", verifyToken, getUserById);


export default router;
