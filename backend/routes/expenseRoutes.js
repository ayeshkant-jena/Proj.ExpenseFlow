import express from "express";
import multer from "multer";
import path from "path";

import {
  addExpense,
  getMyExpenses,
  getAllExpenses,
  updateExpenseStatus,
  updateExpense,
} from "../controllers/expenseController.js";

import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

const router = express.Router();

// Employee
router.post("/", protect, upload.single("receipt"), addExpense);
router.get("/my", protect, getMyExpenses);
router.patch("/:id", protect, upload.single("receipt"), updateExpense);

// Admin
router.get("/", protect, isAdmin, getAllExpenses);
router.patch("/:id/status", protect, isAdmin, updateExpenseStatus);

export default router;
