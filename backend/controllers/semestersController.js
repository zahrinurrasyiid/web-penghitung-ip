const {
  BATAS_MATA_KULIAH,
  BATAS_SEMESTER,
  all,
  buatId,
  bumpSemesterEdit,
  httpError,
  mapCourse,
  mapSemester,
  pastikanMahasiswaMilikUser,
  pastikanSemesterMilikUser,
  run,
  sekarang,
  transaction,
  validasiNilai,
  validasiSks,
  wajibString
} = require("./helpers");

function bacaMataKuliah(body) {
  const daftar = Array.isArray(body.daftarMataKuliah || body.courses) ? (body.daftarMataKuliah || body.courses) : [];
  if (!daftar.length) {
    throw httpError(400, "Minimal satu mata kuliah harus diisi.");
  }
  if (daftar.length > BATAS_MATA_KULIAH) {
    throw httpError(400, "Jumlah mata kuliah per semester maksimal 9.");
  }
  return daftar.map((mataKuliah) => ({
    id: mataKuliah.idMataKuliah || mataKuliah.id || buatId("mata-kuliah"),
    name: wajibString(mataKuliah.namaMataKuliah || mataKuliah.name, "Nama mata kuliah"),
    sks: validasiSks(mataKuliah.sks),
    grade: validasiNilai(mataKuliah.nilaiHuruf || mataKuliah.grade)
  }));
}

async function getSemesters(req, res, next) {
  try {
    const studentId = wajibString(req.query.student_id || req.query.idMahasiswa, "student_id");
    await pastikanMahasiswaMilikUser(req.user.id, studentId);
    const semesterRows = await all("SELECT * FROM semesters WHERE user_id = ? AND student_id = ? ORDER BY semester_number ASC", [req.user.id, studentId]);
    const semesters = [];
    for (const semester of semesterRows) {
      const courses = await all("SELECT * FROM courses WHERE user_id = ? AND semester_id = ? ORDER BY created_at ASC", [req.user.id, semester.id]);
      semesters.push(mapSemester(semester, courses.map(mapCourse)));
    }
    res.json({ semesters });
  } catch (error) {
    next(error);
  }
}

async function createSemester(req, res, next) {
  try {
    const studentId = wajibString(req.body.student_id || req.body.idMahasiswa, "student_id");
    const mahasiswa = await pastikanMahasiswaMilikUser(req.user.id, studentId);
    const nomorSemester = Number(req.body.nomorSemester || req.body.semester_number);
    if (!Number.isFinite(nomorSemester) || nomorSemester < 1 || nomorSemester > BATAS_SEMESTER) {
      throw httpError(400, "Nomor semester wajib diisi antara 1 sampai 14.");
    }
    const semesterAda = await all("SELECT id FROM semesters WHERE user_id = ? AND student_id = ?", [req.user.id, studentId]);
    if (semesterAda.length >= BATAS_SEMESTER) {
      throw httpError(400, "Jumlah semester maksimal 14.");
    }
    const daftarMataKuliah = bacaMataKuliah(req.body);
    const waktu = sekarang();
    const id = req.body.idSemester || req.body.id || buatId("semester");

    await transaction(async () => {
      await run(
        "INSERT INTO semesters (id, user_id, class_id, student_id, semester_number, edit_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [id, req.user.id, mahasiswa.class_id, studentId, nomorSemester, 0, waktu, waktu]
      );
      for (const course of daftarMataKuliah) {
        await run(
          "INSERT INTO courses (id, user_id, semester_id, name, sks, grade, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [course.id, req.user.id, id, course.name, course.sks, course.grade, waktu, waktu]
        );
      }
    });

    const row = await pastikanSemesterMilikUser(req.user.id, id);
    const courses = await all("SELECT * FROM courses WHERE user_id = ? AND semester_id = ? ORDER BY created_at ASC", [req.user.id, id]);
    res.status(201).json({ semester: mapSemester(row, courses.map(mapCourse)) });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT") {
      next(httpError(409, "Nomor semester sudah digunakan untuk mahasiswa ini."));
      return;
    }
    next(error);
  }
}

async function updateSemester(req, res, next) {
  try {
    const semester = await pastikanSemesterMilikUser(req.user.id, req.params.id);
    const nomorSemester = Number(req.body.nomorSemester || req.body.semester_number);
    if (!Number.isFinite(nomorSemester) || nomorSemester < 1 || nomorSemester > BATAS_SEMESTER) {
      throw httpError(400, "Nomor semester wajib diisi antara 1 sampai 14.");
    }
    const daftarMataKuliah = bacaMataKuliah(req.body);
    const waktu = sekarang();
    let timerReset = false;

    await transaction(async () => {
      const editBaru = Number(semester.edit_count || 0) + 1;
      timerReset = editBaru >= 3;
      await run(
        "UPDATE semesters SET semester_number = ?, edit_count = ?, updated_at = ? WHERE id = ? AND user_id = ?",
        [nomorSemester, timerReset ? 0 : editBaru, waktu, req.params.id, req.user.id]
      );
      await run("DELETE FROM courses WHERE semester_id = ? AND user_id = ?", [req.params.id, req.user.id]);
      for (const course of daftarMataKuliah) {
        await run(
          "INSERT INTO courses (id, user_id, semester_id, name, sks, grade, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [course.id, req.user.id, req.params.id, course.name, course.sks, course.grade, waktu, waktu]
        );
      }
      if (timerReset) {
        await run("UPDATE classes SET expires_at = ?, updated_at = ? WHERE id = ? AND user_id = ?", [waktu + 24 * 60 * 60 * 1000, waktu, semester.class_id, req.user.id]);
      }
    });

    const row = await pastikanSemesterMilikUser(req.user.id, req.params.id);
    const courses = await all("SELECT * FROM courses WHERE user_id = ? AND semester_id = ? ORDER BY created_at ASC", [req.user.id, req.params.id]);
    res.json({ semester: mapSemester(row, courses.map(mapCourse)), timer_reset: timerReset });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT") {
      next(httpError(409, "Nomor semester sudah digunakan untuk mahasiswa ini."));
      return;
    }
    next(error);
  }
}

async function deleteSemester(req, res, next) {
  try {
    const semester = await pastikanSemesterMilikUser(req.user.id, req.params.id);
    const resetTimer = await bumpSemesterEdit(req.user.id, req.params.id);
    await run("DELETE FROM semesters WHERE id = ? AND user_id = ?", [semester.id, req.user.id]);
    res.json({ message: "Semester berhasil dihapus.", timer_reset: resetTimer });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSemesters,
  createSemester,
  updateSemester,
  deleteSemester
};
