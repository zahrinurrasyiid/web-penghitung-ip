const express = require("express");
const authMiddleware = require("../middleware/auth");
const { createSemester, deleteSemester, getSemesters, updateSemester } = require("../controllers/semestersController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getSemesters);
router.post("/", createSemester);
router.put("/:id", updateSemester);
router.delete("/:id", deleteSemester);

module.exports = router;
