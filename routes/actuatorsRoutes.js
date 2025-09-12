import { Router } from "express";
import {
  listActuators,
  listActuatorCommands,
  createActuatorCommand,
} from "../controllers/actuatorsController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = Router();

// Listare actuatoare
router.get("/", verifyFirebaseToken, listActuators);

// Listare comenzi pentru actuatoare
router.get("/commands", verifyFirebaseToken, listActuatorCommands);

// Creare comandă nouă pentru actuator
router.post("/commands", verifyFirebaseToken, createActuatorCommand);

export default router;
