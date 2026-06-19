const express = require("express");
const authMiddleware = require("../middleware/auth");
const { login, me, register, updateProfile } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;
