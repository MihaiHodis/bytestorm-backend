import express from "express";
import { listSchedules, createSchedule, deleteSchedule } from "../controllers/actuatorSchedulesController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyFirebaseToken, listSchedules);          // GET /actuator_schedules?greenhouse_id=1
router.post("/", verifyFirebaseToken, createSchedule);        // POST /actuator_schedules
router.delete("/:id", verifyFirebaseToken, deleteSchedule);   // DELETE /actuator_schedules/123

export default router;
