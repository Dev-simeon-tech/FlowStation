import express from "express";
import protect from "../middleware/auth.js";
import {
  getAttendants,
  createAttendant,
  editAttendant,
  editAttendantStatus,
} from "../controllers/attendant.controller.js";

const router = express.Router();

router.get("/", protect, getAttendants);
router.post("/new", protect, createAttendant);
router.put("/edit/:id", protect, editAttendant);
router.patch("/status/:id", protect, editAttendantStatus);

export default router;
