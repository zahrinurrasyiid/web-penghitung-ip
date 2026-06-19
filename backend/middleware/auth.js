const jwt = require("jsonwebtoken");
const { get } = require("../database/db");

function ambilToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return null;
}

async function authMiddleware(req, res, next) {
  try {
    const token = ambilToken(req);
    if (!token) {
      return res.status(401).json({ message: "Token tidak ditemukan." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || "ipgrade-dev-secret");
    const user = await get("SELECT id, email, name, nim, class_name, created_at, updated_at FROM users WHERE id = ?", [payload.id]);
    if (!user) {
      return res.status(401).json({ message: "User tidak ditemukan." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token tidak valid atau kedaluwarsa." });
  }
}

module.exports = authMiddleware;
