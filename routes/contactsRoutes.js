import { Router } from "express";
import {
  listContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from "../controllers/contactsController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", verifyFirebaseToken, listContacts);
router.get("/:id", verifyFirebaseToken, getContactById);
router.post("/", verifyFirebaseToken, createContact);
router.patch("/:id", verifyFirebaseToken, updateContact);
router.delete("/:id", verifyFirebaseToken, deleteContact);

export default router;
