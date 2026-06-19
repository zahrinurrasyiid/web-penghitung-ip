const { all, catatHasil, hitungRingkasanMahasiswa, pastikanMahasiswaMilikUser, wajibString } = require("./helpers");

async function calculate(req, res, next) {
  try {
    const studentId = wajibString(req.body.student_id || req.body.idMahasiswa, "student_id");
    const summary = await catatHasil(req.user.id, studentId);
    res.json({ summary });
  } catch (error) {
    next(error);
  }
}

async function getResults(req, res, next) {
  try {
    const studentId = wajibString(req.query.student_id || req.query.idMahasiswa, "student_id");
    await pastikanMahasiswaMilikUser(req.user.id, studentId);
    const results = await all("SELECT id, student_id, total_sks, total_mutu, semester_count, ip, ipk, result_type, calculated_at FROM results WHERE user_id = ? AND student_id = ? ORDER BY calculated_at DESC", [req.user.id, studentId]);
    res.json({ results });
  } catch (error) {
    next(error);
  }
}

async function summary(req, res, next) {
  try {
    const studentId = wajibString(req.query.student_id || req.query.idMahasiswa, "student_id");
    res.json({ summary: await hitungRingkasanMahasiswa(req.user.id, studentId) });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  calculate,
  getResults,
  summary
};
