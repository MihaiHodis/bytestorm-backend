import { Router } from "express";
import { createDeviceCommand } from "../controllers/deviceController.js";
import { verifyDeviceKey } from "../middleware/deviceAuth.js";

const router = Router();

// Endpoint pentru device (Pico)
router.post("/", verifyDeviceKey, createDeviceCommand);

export default router;
