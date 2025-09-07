// routes/usersDataRoutes.js
import { Router } from "express";
import { listUsersData, getUserDataByUID } from "../controllers/usersDataController.js";

const router = Router();

// toate înregistrările
router.get("/", listUsersData);

// un singur user, după UID
router.get("/:uid", getUserDataByUID);

export default router;
