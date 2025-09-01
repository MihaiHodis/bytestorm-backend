// routes/usersRoutes.js
import { Router } from "express";
import { listAllUsers } from "../controllers/usersController.js";

const router = Router();

// Frontend-ul tău face: GET /users -> ia toți userii și filtrează client-side
router.get("/", listAllUsers);

export default router;
