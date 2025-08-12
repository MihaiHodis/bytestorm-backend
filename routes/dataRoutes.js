import express from "express";
import { receiveSensorData } from "../controllers/dataController.js";

const router = express.Router();
router.post("/:device_uid", receiveSensorData);
export default router;
