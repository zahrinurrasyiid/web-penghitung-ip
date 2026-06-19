const express = require("express");
const authMiddleware = require("../middleware/auth");
const { createCourse, deleteCourse, getCourses, updateCourse } = require("../controllers/coursesController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getCourses);
router.post("/", createCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

module.exports = router;
