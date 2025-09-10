// routes/actuatorCommandsRoutes.js
import { Router } from "express";
import {
  listActuatorCommands,
  createActuatorCommand
} from "../controllers/actuatorsController.js";

const router = Router();

// Middleware simplu de debug pentru toate requesturile din acest router
router.use((req, res, next) => {
  console.log(`[actuator_commands] ${req.method} ${req.originalUrl}`);
  next();
});

// GET /actuator_commands
router.get("/", (req, res, next) => {
  console.log("GET /actuator_commands triggered");
  listActuatorCommands(req, res, next);
});

// POST /actuator_commands
router.post("/", (req, res, next) => {
  console.log("POST /actuator_commands triggered, body:", req.body);
  createActuatorCommand(req, res, next);
});

export default router;
