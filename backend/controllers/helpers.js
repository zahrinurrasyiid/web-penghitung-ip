const { all, get, run, transaction } = require("../database/db");

const DURASI_SATU_HARI = 24 * 60 * 60 * 1000;
const BATAS_MAHASISWA_PER_KELAS = 50;
const BATAS_SEMESTER = 14;
const BATAS_MATA_KULIAH = 9;
const PETA_BOBOT_NILAI = { A: 4, B: 3, C: 2, D: 1, E: 0 };

function buatId(awalan) {
  return awalan + "-" + Date.now() + "-" + Math.random().toString(16).slice(2, 8);
}

function sekarang() {
  return Date.now();
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  error.publicMessage = message;
  return error;
}

function wajibString(nilai, label) {
  const teks = String(nilai || "").trim();
  if (!teks) {
    throw httpError(400, label + " wajib diisi.");
  }
  return teks;
}

function normalisasiEmail(email) {
  const emailNormal = String(email || "").trim().toLowerCase();
  const polaEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!polaEmail.test(emailNormal)) {
    throw httpError(400, "Masukkan email yang valid.");
  }
  return emailNormal;
}

function validasiNilai(nilaiHuruf) {
  const nilai = String(nilaiHuruf || "").trim().toUpperCase();
  if (!Object.prototype.hasOwnProperty.call(PETA_BOBOT_NILAI, nilai)) {
    throw httpError(400, "Nilai hanya boleh A, B, C, D, atau E.");
  }
  return nilai;
}

function validasiSks(sks) {
  const angka = Number(sks);
  if (!Number.isFinite(angka) || angka <= 0 || Math.floor(angka) !== angka) {
    throw httpError(400, "SKS harus berupa bilangan bulat positif.");
  }
  return angka;
}

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    username: row.email,
    name: row.name || "",
    nama: row.name || "",
    nim: row.nim || "",
    class_name: row.class_name || "",
    kelas: row.class_name || "",
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function mapCourse(row) {
  return {
    idMataKuliah: row.id,
    idSemester: row.semester_id,
    namaMataKuliah: row.name,
    sks: row.sks,
    nilaiHuruf: row.grade,
    dibuatPada: row.created_at,
    diperbaruiPada: row.updated_at
  };
}

function mapSemester(row, courses = []) {
  return {
    idSemester: row.id,
    idMahasiswa: row.student_id,
    nomorSemester: row.semester_number,
    jumlahEdit: row.edit_count || 0,
    dibuatPada: row.created_at,
    diperbaruiPada: row.updated_at,
    daftarMataKuliah: courses
  };
}

function mapStudent(row, semesters = []) {
  return {
    idMahasiswa: row.id,
    idKelas: row.class_id,
    nama: row.name,
    nim: row.nim,
    dibuatPada: row.created_at,
    diperbaruiPada: row.updated_at,
    daftarSemester: semesters
  };
}

function mapClass(row, students = []) {
  return {
    idKelas: row.id,
    namaKelas: row.name,
    kedaluwarsaPada: row.expires_at,
    dibuatPada: row.created_at,
    diperbaruiPada: row.updated_at,
    daftarMahasiswa: students
  };
}

async function pastikanKelasMilikUser(userId, classId) {
  const kelas = await get("SELECT * FROM classes WHERE id = ? AND user_id = ?", [classId, userId]);
  if (!kelas) throw httpError(404, "Kelas tidak ditemukan.");
  return kelas;
}

async function pastikanMahasiswaMilikUser(userId, studentId) {
  const mahasiswa = await get("SELECT * FROM students WHERE id = ? AND user_id = ?", [studentId, userId]);
  if (!mahasiswa) throw httpError(404, "Mahasiswa tidak ditemukan.");
  return mahasiswa;
}

async function pastikanSemesterMilikUser(userId, semesterId) {
  const semester = await get("SELECT * FROM semesters WHERE id = ? AND user_id = ?", [semesterId, userId]);
  if (!semester) throw httpError(404, "Semester tidak ditemukan.");
  return semester;
}

async function pastikanCourseMilikUser(userId, courseId) {
  const course = await get("SELECT * FROM courses WHERE id = ? AND user_id = ?", [courseId, userId]);
  if (!course) throw httpError(404, "Mata kuliah tidak ditemukan.");
  return course;
}

async function ambilTreeKelas(userId) {
  const kelasRows = await all("SELECT * FROM classes WHERE user_id = ? ORDER BY created_at ASC", [userId]);
  const hasil = [];

  for (const kelas of kelasRows) {
    const studentRows = await all("SELECT * FROM students WHERE user_id = ? AND class_id = ? ORDER BY created_at ASC", [userId, kelas.id]);
    const students = [];

    for (const student of studentRows) {
      const semesterRows = await all("SELECT * FROM semesters WHERE user_id = ? AND student_id = ? ORDER BY semester_number ASC", [userId, student.id]);
      const semesters = [];

      for (const semester of semesterRows) {
        const courseRows = await all("SELECT * FROM courses WHERE user_id = ? AND semester_id = ? ORDER BY created_at ASC", [userId, semester.id]);
        semesters.push(mapSemester(semester, courseRows.map(mapCourse)));
      }

      students.push(mapStudent(student, semesters));
    }

    hasil.push(mapClass(kelas, students));
  }

  return hasil;
}

async function hitungRingkasanMahasiswa(userId, studentId) {
  const mahasiswa = await pastikanMahasiswaMilikUser(userId, studentId);
  const kelas = await pastikanKelasMilikUser(userId, mahasiswa.class_id);
  const semesterRows = await all("SELECT * FROM semesters WHERE user_id = ? AND student_id = ? ORDER BY semester_number ASC", [userId, studentId]);
  const daftarSemester = [];

  for (const semester of semesterRows) {
    const courses = await all("SELECT * FROM courses WHERE user_id = ? AND semester_id = ?", [userId, semester.id]);
    const totalSksSemester = courses.reduce((total, course) => total + Number(course.sks || 0), 0);
    const totalMutuSemester = courses.reduce((total, course) => total + Number(course.sks || 0) * PETA_BOBOT_NILAI[course.grade], 0);
    daftarSemester.push({
      idSemester: semester.id,
      nomorSemester: semester.semester_number,
      totalSksSemester,
      totalMutuSemester,
      ips: totalSksSemester ? totalMutuSemester / totalSksSemester : 0
    });
  }

  const totalSksKeseluruhan = daftarSemester.reduce((total, semester) => total + semester.totalSksSemester, 0);
  const totalMutuKeseluruhan = daftarSemester.reduce((total, semester) => total + semester.totalMutuSemester, 0);
  const jumlahSemester = daftarSemester.length;
  const ip = jumlahSemester === 1 ? daftarSemester[0].ips : null;
  const ipk = jumlahSemester >= 2 && totalSksKeseluruhan ? totalMutuKeseluruhan / totalSksKeseluruhan : null;

  return {
    student_id: studentId,
    class_id: kelas.id,
    class_name: kelas.name,
    student_name: mahasiswa.name,
    student_nim: mahasiswa.nim,
    total_sks: totalSksKeseluruhan,
    total_mutu: totalMutuKeseluruhan,
    semester_count: jumlahSemester,
    ip,
    ipk,
    result_type: jumlahSemester === 0 ? "empty" : jumlahSemester === 1 ? "ip" : "ipk",
    daftarSemester
  };
}

async function catatHasil(userId, studentId) {
  const ringkasan = await hitungRingkasanMahasiswa(userId, studentId);
  await run(
    "INSERT INTO results (user_id, student_id, total_sks, total_mutu, semester_count, ip, ipk, result_type, calculated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [userId, studentId, ringkasan.total_sks, ringkasan.total_mutu, ringkasan.semester_count, ringkasan.ip, ringkasan.ipk, ringkasan.result_type, sekarang()]
  );
  return ringkasan;
}

async function bumpSemesterEdit(userId, semesterId) {
  const semester = await pastikanSemesterMilikUser(userId, semesterId);
  const editBaru = Number(semester.edit_count || 0) + 1;
  const resetTimer = editBaru >= 3;
  await run(
    "UPDATE semesters SET edit_count = ?, updated_at = ? WHERE id = ? AND user_id = ?",
    [resetTimer ? 0 : editBaru, sekarang(), semesterId, userId]
  );

  if (resetTimer) {
    await run("UPDATE classes SET expires_at = ?, updated_at = ? WHERE id = ? AND user_id = ?", [sekarang() + DURASI_SATU_HARI, sekarang(), semester.class_id, userId]);
  }

  return resetTimer;
}

module.exports = {
  DURASI_SATU_HARI,
  BATAS_MAHASISWA_PER_KELAS,
  BATAS_SEMESTER,
  BATAS_MATA_KULIAH,
  PETA_BOBOT_NILAI,
  all,
  get,
  run,
  transaction,
  buatId,
  sekarang,
  httpError,
  wajibString,
  normalisasiEmail,
  validasiNilai,
  validasiSks,
  mapUser,
  mapCourse,
  mapSemester,
  mapStudent,
  mapClass,
  pastikanKelasMilikUser,
  pastikanMahasiswaMilikUser,
  pastikanSemesterMilikUser,
  pastikanCourseMilikUser,
  ambilTreeKelas,
  hitungRingkasanMahasiswa,
  catatHasil,
  bumpSemesterEdit
};
