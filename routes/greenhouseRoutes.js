import { Router } from "express";
import { listGreenhouses } from "../controllers/greenhouseController.js";

const router = Router();

router.get("/", listGreenhouses);

export default router;
