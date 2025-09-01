import { Router } from "express";
import { listSensors } from "../controllers/sensorsController.js";

const router = Router();
router.get("/", listSensors); // GET /sensors?greenhouse_id=ID
export default router;
