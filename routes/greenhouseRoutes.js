import { Router } from "express";
import { listGreenhouses } from "../controllers/greenhouseController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", verifyFirebaseToken, listGreenhouses);

export default router;
