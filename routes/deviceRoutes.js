import { Router } from "express";
import { getDeviceCommands } from "../controllers/deviceController.js";
import { verifyDeviceKey } from "../middleware/deviceAuth.js";

const router = Router();

// GET comenzi actuatoare pentru Pico
router.get("/api/data/:device_uid/commands", verifyDeviceKey, getDeviceCommands);

export default router;
