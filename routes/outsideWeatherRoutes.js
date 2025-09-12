import { Router } from "express";
import { listOutsideWeather } from "../controllers/outsideWeatherController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", verifyFirebaseToken, listOutsideWeather);

export default router;
