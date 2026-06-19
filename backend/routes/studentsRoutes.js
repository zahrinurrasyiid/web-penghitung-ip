const express = require("express");
const authMiddleware = require("../middleware/auth");
const { createStudent, deleteStudent, getStudents, updateStudent } = require("../controllers/studentsController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getStudents);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

module.exports = router;
