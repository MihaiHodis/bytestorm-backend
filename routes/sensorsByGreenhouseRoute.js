import { Router } from "express";
import { getSensorsByGreenhouse } from "../controllers/sensorsByGreenhouseController.js";

const router = Router();
router.get("/sensors", getSensorsByGreenhouse);

export default router;
