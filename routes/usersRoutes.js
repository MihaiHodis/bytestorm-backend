import { Router } from "express";
import { syncUser, listAllUsers } from "../controllers/usersController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = Router();

// Sinc user (autentificare Firebase necesară)
router.get("/me", verifyFirebaseToken, syncUser);

// Listare toți userii (poate rămâne doar pentru debugging)
router.get("/", listAllUsers);

export default router;
