import { Router } from "express";
import { listSensors } from "../controllers/sensorsController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", verifyFirebaseToken, listSensors);
// router.post("/", verifyFirebaseToken, createSensor); // dacă vrei să adăugăm și creare

export default router;
