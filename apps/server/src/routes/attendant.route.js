import express from "express";
import protect from "../middleware/auth.js";
import {
  getAttendants,
  createAttendant,
} from "../controllers/attendant.controller.js";

const router = express.Router();

router.get("/", protect, getAttendants);
router.post("/new", protect, createAttendant);

export default router;
