import { Router } from "express";
import { listGreenhouses, createGreenhouse } from "../controllers/greenhouseController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", verifyFirebaseToken, listGreenhouses);
router.post("/", verifyFirebaseToken, createGreenhouse);

export default router;
