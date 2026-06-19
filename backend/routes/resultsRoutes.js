const express = require("express");
const authMiddleware = require("../middleware/auth");
const { calculate, getResults, summary } = require("../controllers/resultsController");

const router = express.Router();

router.use(authMiddleware);
router.post("/calculate", calculate);
router.get("/", getResults);
router.get("/summary", summary);

module.exports = router;
