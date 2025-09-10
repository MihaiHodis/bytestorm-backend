// routes/actuatorsRoutes.js
import { Router } from "express";
import { listActuators } from "../controllers/actuatorsController.js";

const router = Router();

// GET /actuators → lista actuatoarelor
router.get("/", listActuators);

export default router;
