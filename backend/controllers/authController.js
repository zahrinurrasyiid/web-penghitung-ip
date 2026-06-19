const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { get, run, normalisasiEmail, wajibString, mapUser, httpError, sekarang } = require("./helpers");

function buatToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || "ipgrade-dev-secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

async function register(req, res, next) {
  try {
    const email = normalisasiEmail(req.body.email);
    const password = wajibString(req.body.password, "Password");
    if (password.length < 6) {
      throw httpError(400, "Password minimal 6 karakter.");
    }

    const akunAda = await get("SELECT id FROM users WHERE email = ?", [email]);
    if (akunAda) {
      throw httpError(409, "Akun dengan email ini sudah ada.");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const waktu = sekarang();
    const hasil = await run(
      "INSERT INTO users (email, password_hash, name, nim, class_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [email, passwordHash, "", "", "", waktu, waktu]
    );
    const user = await get("SELECT id, email, name, nim, class_name, created_at, updated_at FROM users WHERE id = ?", [hasil.id]);
    res.status(201).json({ token: buatToken(user), user: mapUser(user) });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = normalisasiEmail(req.body.email);
    const password = wajibString(req.body.password, "Password");
    const user = await get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      throw httpError(401, "Login gagal. Periksa kembali email dan password.");
    }

    const cocok = await bcrypt.compare(password, user.password_hash);
    if (!cocok) {
      throw httpError(401, "Login gagal. Periksa kembali email dan password.");
    }

    res.json({ token: buatToken(user), user: mapUser(user) });
  } catch (error) {
    next(error);
  }
}

async function me(req, res) {
  res.json({ user: mapUser(req.user) });
}

async function updateProfile(req, res, next) {
  try {
    const nama = wajibString(req.body.nama || req.body.name, "Nama");
    const nim = String(req.body.nim || "").trim();
    const kelas = String(req.body.kelas || req.body.class_name || "").trim();
    await run("UPDATE users SET name = ?, nim = ?, class_name = ?, updated_at = ? WHERE id = ?", [nama, nim, kelas, sekarang(), req.user.id]);
    const user = await get("SELECT id, email, name, nim, class_name, created_at, updated_at FROM users WHERE id = ?", [req.user.id]);
    res.json({ user: mapUser(user) });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  me,
  updateProfile
};
