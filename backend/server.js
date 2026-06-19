require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { initDb } = require("./database/db");
const authRoutes = require("./routes/authRoutes");
const classesRoutes = require("./routes/classesRoutes");
const studentsRoutes = require("./routes/studentsRoutes");
const semestersRoutes = require("./routes/semestersRoutes");
const coursesRoutes = require("./routes/coursesRoutes");
const resultsRoutes = require("./routes/resultsRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const port = Number(process.env.PORT || 3000);
const corsOrigins = String(process.env.CORS_ORIGIN || "http://127.0.0.1:5500,http://localhost:5500")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin tidak diizinkan CORS."));
  }
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/semesters", semestersRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/results", resultsRoutes);
app.use(errorHandler);

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log("IPgrade backend berjalan di http://localhost:" + port);
    });
  })
  .catch((error) => {
    console.error("Gagal menyiapkan database:", error);
    process.exit(1);
  });
