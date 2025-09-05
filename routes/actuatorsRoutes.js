import { Router } from "express";
import { listActuators } from "../controllers/actuatorsController.js";

const router = Router();
router.get("/", listActuators); // GET /actuators?greenhouse_id=ID
export default router;