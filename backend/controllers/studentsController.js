const {
  BATAS_MAHASISWA_PER_KELAS,
  all,
  buatId,
  httpError,
  mapStudent,
  pastikanKelasMilikUser,
  pastikanMahasiswaMilikUser,
  run,
  sekarang,
  wajibString
} = require("./helpers");

async function getStudents(req, res, next) {
  try {
    const classId = wajibString(req.query.class_id || req.query.idKelas, "class_id");
    await pastikanKelasMilikUser(req.user.id, classId);
    const rows = await all("SELECT * FROM students WHERE user_id = ? AND class_id = ? ORDER BY created_at ASC", [req.user.id, classId]);
    res.json({ students: rows.map((row) => mapStudent(row, [])) });
  } catch (error) {
    next(error);
  }
}

async function createStudent(req, res, next) {
  try {
    const classId = wajibString(req.body.class_id || req.body.idKelas, "class_id");
    await pastikanKelasMilikUser(req.user.id, classId);
    const total = await all("SELECT id FROM students WHERE user_id = ? AND class_id = ?", [req.user.id, classId]);
    if (total.length >= BATAS_MAHASISWA_PER_KELAS) {
      throw httpError(400, "Jumlah mahasiswa per kelas maksimal 50.");
    }

    const waktu = sekarang();
    const id = req.body.idMahasiswa || req.body.id || buatId("mahasiswa");
    await run(
      "INSERT INTO students (id, user_id, class_id, name, nim, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, req.user.id, classId, wajibString(req.body.nama || req.body.name, "Nama mahasiswa"), wajibString(req.body.nim, "NIM mahasiswa"), waktu, waktu]
    );
    const row = await pastikanMahasiswaMilikUser(req.user.id, id);
    res.status(201).json({ student: mapStudent(row, []) });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT") {
      next(httpError(409, "NIM mahasiswa sudah digunakan di kelas ini."));
      return;
    }
    next(error);
  }
}

async function updateStudent(req, res, next) {
  try {
    await pastikanMahasiswaMilikUser(req.user.id, req.params.id);
    await run(
      "UPDATE students SET name = ?, nim = ?, updated_at = ? WHERE id = ? AND user_id = ?",
      [wajibString(req.body.nama || req.body.name, "Nama mahasiswa"), wajibString(req.body.nim, "NIM mahasiswa"), sekarang(), req.params.id, req.user.id]
    );
    const row = await pastikanMahasiswaMilikUser(req.user.id, req.params.id);
    res.json({ student: mapStudent(row, []) });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT") {
      next(httpError(409, "NIM mahasiswa sudah digunakan di kelas ini."));
      return;
    }
    next(error);
  }
}

async function deleteStudent(req, res, next) {
  try {
    await pastikanMahasiswaMilikUser(req.user.id, req.params.id);
    await run("DELETE FROM students WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    res.json({ message: "Mahasiswa berhasil dihapus." });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent
};
