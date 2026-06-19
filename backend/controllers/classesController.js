const {
  BATAS_MAHASISWA_PER_KELAS,
  BATAS_MATA_KULIAH,
  BATAS_SEMESTER,
  DURASI_SATU_HARI,
  ambilTreeKelas,
  buatId,
  httpError,
  mapClass,
  pastikanKelasMilikUser,
  run,
  sekarang,
  transaction,
  validasiNilai,
  validasiSks,
  wajibString
} = require("./helpers");

async function getClasses(req, res, next) {
  try {
    res.json({ classes: await ambilTreeKelas(req.user.id) });
  } catch (error) {
    next(error);
  }
}

async function createClass(req, res, next) {
  try {
    const namaKelas = wajibString(req.body.namaKelas || req.body.name, "Nama kelas");
    const waktu = sekarang();
    const id = req.body.idKelas || req.body.id || buatId("kelas");
    await run(
      "INSERT INTO classes (id, user_id, name, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      [id, req.user.id, namaKelas, waktu + DURASI_SATU_HARI, waktu, waktu]
    );
    const kelas = await pastikanKelasMilikUser(req.user.id, id);
    res.status(201).json({ class: mapClass(kelas, []) });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT") {
      next(httpError(409, "Nama kelas sudah digunakan."));
      return;
    }
    next(error);
  }
}

async function updateClass(req, res, next) {
  try {
    await pastikanKelasMilikUser(req.user.id, req.params.id);
    const namaKelas = wajibString(req.body.namaKelas || req.body.name, "Nama kelas");
    await run("UPDATE classes SET name = ?, updated_at = ? WHERE id = ? AND user_id = ?", [namaKelas, sekarang(), req.params.id, req.user.id]);
    const kelas = await pastikanKelasMilikUser(req.user.id, req.params.id);
    res.json({ class: mapClass(kelas, []) });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT") {
      next(httpError(409, "Nama kelas sudah digunakan."));
      return;
    }
    next(error);
  }
}

async function deleteClass(req, res, next) {
  try {
    await pastikanKelasMilikUser(req.user.id, req.params.id);
    await run("DELETE FROM classes WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    res.json({ message: "Kelas berhasil dihapus." });
  } catch (error) {
    next(error);
  }
}

async function extendTime(req, res, next) {
  try {
    const kelas = await pastikanKelasMilikUser(req.user.id, req.params.id);
    const tambahan = Number(req.body.tambahan || req.body.milliseconds || req.body.ms || DURASI_SATU_HARI);
    if (!Number.isFinite(tambahan) || tambahan <= 0) {
      throw httpError(400, "Tambahan waktu tidak valid.");
    }
    const expiresAt = Math.max(kelas.expires_at || sekarang(), sekarang()) + tambahan;
    await run("UPDATE classes SET expires_at = ?, updated_at = ? WHERE id = ? AND user_id = ?", [expiresAt, sekarang(), req.params.id, req.user.id]);
    const kelasBaru = await pastikanKelasMilikUser(req.user.id, req.params.id);
    res.json({ class: mapClass(kelasBaru, []) });
  } catch (error) {
    next(error);
  }
}

async function resetTime(req, res, next) {
  try {
    await pastikanKelasMilikUser(req.user.id, req.params.id);
    await run("UPDATE classes SET expires_at = ?, updated_at = ? WHERE id = ? AND user_id = ?", [sekarang() + DURASI_SATU_HARI, sekarang(), req.params.id, req.user.id]);
    const kelasBaru = await pastikanKelasMilikUser(req.user.id, req.params.id);
    res.json({ class: mapClass(kelasBaru, []) });
  } catch (error) {
    next(error);
  }
}

async function syncClasses(req, res, next) {
  try {
    const daftarKelas = Array.isArray(req.body.classes) ? req.body.classes : [];
    await transaction(async () => {
      await run("DELETE FROM classes WHERE user_id = ?", [req.user.id]);
      for (const kelas of daftarKelas) {
        const waktu = sekarang();
        const idKelas = kelas.idKelas || kelas.id || buatId("kelas");
        await run(
          "INSERT INTO classes (id, user_id, name, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
          [
            idKelas,
            req.user.id,
            wajibString(kelas.namaKelas || kelas.name, "Nama kelas"),
            Number(kelas.kedaluwarsaPada || kelas.expires_at || waktu + DURASI_SATU_HARI),
            Number(kelas.dibuatPada || kelas.created_at || waktu),
            Number(kelas.diperbaruiPada || kelas.updated_at || waktu)
          ]
        );

        const daftarMahasiswa = Array.isArray(kelas.daftarMahasiswa) ? kelas.daftarMahasiswa : [];
        if (daftarMahasiswa.length > BATAS_MAHASISWA_PER_KELAS) {
          throw httpError(400, "Jumlah mahasiswa per kelas maksimal 50.");
        }

        for (const mahasiswa of daftarMahasiswa) {
          const idMahasiswa = mahasiswa.idMahasiswa || mahasiswa.id || buatId("mahasiswa");
          await run(
            "INSERT INTO students (id, user_id, class_id, name, nim, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
              idMahasiswa,
              req.user.id,
              idKelas,
              wajibString(mahasiswa.nama || mahasiswa.name, "Nama mahasiswa"),
              wajibString(mahasiswa.nim, "NIM mahasiswa"),
              Number(mahasiswa.dibuatPada || mahasiswa.created_at || waktu),
              Number(mahasiswa.diperbaruiPada || mahasiswa.updated_at || waktu)
            ]
          );

          const daftarSemester = Array.isArray(mahasiswa.daftarSemester) ? mahasiswa.daftarSemester : [];
          if (daftarSemester.length > BATAS_SEMESTER) {
            throw httpError(400, "Jumlah semester maksimal 14.");
          }

          for (const semester of daftarSemester) {
            const idSemester = semester.idSemester || semester.id || buatId("semester");
            const nomorSemester = Number(semester.nomorSemester || semester.semester_number);
            if (!Number.isFinite(nomorSemester) || nomorSemester < 1 || nomorSemester > BATAS_SEMESTER) {
              throw httpError(400, "Nomor semester wajib diisi antara 1 sampai 14.");
            }

            await run(
              "INSERT INTO semesters (id, user_id, class_id, student_id, semester_number, edit_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              [
                idSemester,
                req.user.id,
                idKelas,
                idMahasiswa,
                nomorSemester,
                Number(semester.jumlahEdit || semester.edit_count || 0),
                Number(semester.dibuatPada || semester.created_at || waktu),
                Number(semester.diperbaruiPada || semester.updated_at || waktu)
              ]
            );

            const daftarMataKuliah = Array.isArray(semester.daftarMataKuliah) ? semester.daftarMataKuliah : [];
            if (daftarMataKuliah.length > BATAS_MATA_KULIAH) {
              throw httpError(400, "Jumlah mata kuliah per semester maksimal 9.");
            }

            for (const mataKuliah of daftarMataKuliah) {
              await run(
                "INSERT INTO courses (id, user_id, semester_id, name, sks, grade, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [
                  mataKuliah.idMataKuliah || mataKuliah.id || buatId("mata-kuliah"),
                  req.user.id,
                  idSemester,
                  wajibString(mataKuliah.namaMataKuliah || mataKuliah.name, "Nama mata kuliah"),
                  validasiSks(mataKuliah.sks),
                  validasiNilai(mataKuliah.nilaiHuruf || mataKuliah.grade),
                  Number(mataKuliah.dibuatPada || mataKuliah.created_at || waktu),
                  Number(mataKuliah.diperbaruiPada || mataKuliah.updated_at || waktu)
                ]
              );
            }
          }
        }
      }
    });
    res.json({ classes: await ambilTreeKelas(req.user.id) });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  extendTime,
  resetTime,
  syncClasses
};
