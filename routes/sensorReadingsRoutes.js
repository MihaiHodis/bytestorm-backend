import { Router } from "express";
import { listSensorReadings } from "../controllers/sensorReadingsController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", verifyFirebaseToken, listSensorReadings);

export default router;
