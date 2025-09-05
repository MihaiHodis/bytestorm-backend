import { Router } from "express";
import { listSensorReadings } from "../controllers/sensorReadingsController.js";

const router = Router();
router.get("/", listSensorReadings); // GET /sensors_readings?sensor_id=ID
export default router;