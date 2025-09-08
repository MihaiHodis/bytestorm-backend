// routes/usersDataRoutes.js
import { Router } from "express";
import {
  listUsersData,
  getUserData,
  updateUserData
} from "../controllers/usersDataController.js";

const router = Router();

// GET toate datele
router.get("/", listUsersData);

// GET date pentru un utilizator după ID
router.get("/:id", getUserData);

// POST pentru update profil (nickname/avatar)
router.post("/:id", updateUserData);

export default router;
