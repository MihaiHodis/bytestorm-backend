import { Router } from "express";
import {
  listContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
} from "../controllers/contactsController.js";

const router = Router();

router.get("/", listContacts);
router.get("/:id", getContactById);
router.post("/", createContact);
router.patch("/:id", updateContact);
router.delete("/:id", deleteContact);

export default router;
