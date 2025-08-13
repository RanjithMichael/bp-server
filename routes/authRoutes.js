import express from "express";

const router = express.Router();

// POST /api/auth/register
router.post("/register", (req, res) => {
  res.send("Register route working");
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  res.send("Login route working");
});

export default router;




