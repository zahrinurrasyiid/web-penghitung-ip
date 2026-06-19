const {
  BATAS_MATA_KULIAH,
  all,
  bumpSemesterEdit,
  buatId,
  httpError,
  mapCourse,
  pastikanCourseMilikUser,
  pastikanSemesterMilikUser,
  run,
  sekarang,
  validasiNilai,
  validasiSks,
  wajibString
} = require("./helpers");

async function getCourses(req, res, next) {
  try {
    const semesterId = wajibString(req.query.semester_id || req.query.idSemester, "semester_id");
    await pastikanSemesterMilikUser(req.user.id, semesterId);
    const rows = await all("SELECT * FROM courses WHERE user_id = ? AND semester_id = ? ORDER BY created_at ASC", [req.user.id, semesterId]);
    res.json({ courses: rows.map(mapCourse) });
  } catch (error) {
    next(error);
  }
}

async function createCourse(req, res, next) {
  try {
    const semesterId = wajibString(req.body.semester_id || req.body.idSemester, "semester_id");
    await pastikanSemesterMilikUser(req.user.id, semesterId);
    const rows = await all("SELECT id FROM courses WHERE user_id = ? AND semester_id = ?", [req.user.id, semesterId]);
    if (rows.length >= BATAS_MATA_KULIAH) {
      throw httpError(400, "Jumlah mata kuliah per semester maksimal 9.");
    }
    const waktu = sekarang();
    const id = req.body.idMataKuliah || req.body.id || buatId("mata-kuliah");
    await run(
      "INSERT INTO courses (id, user_id, semester_id, name, sks, grade, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        req.user.id,
        semesterId,
        wajibString(req.body.namaMataKuliah || req.body.name, "Nama mata kuliah"),
        validasiSks(req.body.sks),
        validasiNilai(req.body.nilaiHuruf || req.body.grade),
        waktu,
        waktu
      ]
    );
    await bumpSemesterEdit(req.user.id, semesterId);
    const row = await pastikanCourseMilikUser(req.user.id, id);
    res.status(201).json({ course: mapCourse(row) });
  } catch (error) {
    next(error);
  }
}

async function updateCourse(req, res, next) {
  try {
    const course = await pastikanCourseMilikUser(req.user.id, req.params.id);
    await run(
      "UPDATE courses SET name = ?, sks = ?, grade = ?, updated_at = ? WHERE id = ? AND user_id = ?",
      [
        wajibString(req.body.namaMataKuliah || req.body.name, "Nama mata kuliah"),
        validasiSks(req.body.sks),
        validasiNilai(req.body.nilaiHuruf || req.body.grade),
        sekarang(),
        req.params.id,
        req.user.id
      ]
    );
    const resetTimer = await bumpSemesterEdit(req.user.id, course.semester_id);
    const row = await pastikanCourseMilikUser(req.user.id, req.params.id);
    res.json({ course: mapCourse(row), timer_reset: resetTimer });
  } catch (error) {
    next(error);
  }
}

async function deleteCourse(req, res, next) {
  try {
    const course = await pastikanCourseMilikUser(req.user.id, req.params.id);
    const rows = await all("SELECT id FROM courses WHERE user_id = ? AND semester_id = ?", [req.user.id, course.semester_id]);
    if (rows.length <= 1) {
      throw httpError(400, "Semester harus memiliki minimal satu mata kuliah. Hapus semester jika ingin menghapus semuanya.");
    }
    const resetTimer = await bumpSemesterEdit(req.user.id, course.semester_id);
    await run("DELETE FROM courses WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    res.json({ message: "Mata kuliah berhasil dihapus.", timer_reset: resetTimer });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse
};
