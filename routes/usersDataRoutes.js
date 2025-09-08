import { Router } from "express";
import {
  listUsersData,
  getUserData,
  createOrUpdateUserData
} from "../controllers/usersDataController.js";

const router = Router();

router.get("/", listUsersData);
router.get("/:id", getUserData);
router.post("/", createOrUpdateUserData);

export default router;
