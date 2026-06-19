const express = require("express");
const authMiddleware = require("../middleware/auth");
const { createClass, deleteClass, extendTime, getClasses, resetTime, syncClasses, updateClass } = require("../controllers/classesController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getClasses);
router.put("/sync", syncClasses);
router.post("/", createClass);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);
router.patch("/:id/extend-time", extendTime);
router.patch("/:id/reset-time", resetTime);

module.exports = router;
