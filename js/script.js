const AplikasiIPgrade = (function () {
  const KUNCI_AKUN = "ipgrade_akun";
  const KUNCI_SESI = "ipgrade_sesi";
  const KUNCI_KELAS = "ipgrade_kelas";
  const KUNCI_SIDEBAR_CIUT = "ipgrade_sidebar_ciut";
  const KUNCI_TEMA = "ipgrade_tema";
  const KUNCI_USERNAME_DIINGAT = "ipgrade_username_diingat";
  const DURASI_ENAM_JAM = 6 * 60 * 60 * 1000;
  const BATAS_KELAS_DASHBOARD = 5;
  const BATAS_MAHASISWA_PER_KELAS = 50;
  const BATAS_SEMESTER = 14;
  const BATAS_MATA_KULIAH = 9;
  const PETA_BOBOT_NILAI = { A: 4, B: 3, C: 2, D: 1, E: 0 };
  const PILIHAN_TAMBAH_JAM = [
    { label: "Tambah 30 Menit", nilai: 30 * 60 * 1000 },
    { label: "Tambah 1 Jam", nilai: 60 * 60 * 1000 },
    { label: "Tambah 2 Jam", nilai: 2 * 60 * 60 * 1000 }
  ];

  const elemen = {
    tampilanLanding: document.getElementById("tampilanLanding"),
    tampilanAutentikasi: document.getElementById("tampilanAutentikasi"),
    tampilanAplikasi: document.getElementById("tampilanAplikasi"),
    sidebarAplikasi: document.getElementById("sidebarAplikasi"),
    areaScrollAplikasi: document.getElementById("areaScrollAplikasi"),
    kontainerNotifikasi: document.getElementById("kontainerNotifikasi"),
    teksKetikanIndex: document.getElementById("teksKetikanIndex"),
    loginUsername: document.getElementById("loginUsername"),
    ingatAkunLogin: document.getElementById("ingatAkunLogin"),
    tombolLupakanAkun: document.getElementById("tombolLupakanAkun"),
    daftarCountdownKelasDashboard: document.getElementById("daftarCountdownKelasDashboard"),
    kontrolPaginationDashboard: document.getElementById("kontrolPaginationDashboard"),
    daftarKelasManajemen: document.getElementById("daftarKelasManajemen"),
    daftarSemesterTersimpan: document.getElementById("daftarSemesterTersimpan"),
    daftarAccordionSemester: document.getElementById("daftarAccordionSemester")
  };

  const keadaan = {
    halamanAktif: "landing",
    halamanCountdownDashboard: 1,
    grafikAktif: null,
    intervalCountdown: null
  };

  function amankanHtml(teks) {
    return String(teks || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function bacaJson(kunci, nilaiAwal) {
    try {
      const dataMentah = localStorage.getItem(kunci);
      return dataMentah ? JSON.parse(dataMentah) : nilaiAwal;
    } catch (error) {
      return nilaiAwal;
    }
  }

  function simpanJson(kunci, data) {
    localStorage.setItem(kunci, JSON.stringify(data));
  }

  function buatId(awalan) {
    return awalan + "-" + Date.now() + "-" + Math.random().toString(16).slice(2, 8);
  }

  function ambilSemuaAkun() {
    return bacaJson(KUNCI_AKUN, []);
  }

  function simpanSemuaAkun(daftarAkun) {
    simpanJson(KUNCI_AKUN, daftarAkun);
  }

  function ambilSesiAktif() {
    return String(localStorage.getItem(KUNCI_SESI) || "").trim();
  }

  function simpanSesiAktif(username) {
    localStorage.setItem(KUNCI_SESI, username);
  }

  function hapusSesiAktif() {
    localStorage.removeItem(KUNCI_SESI);
  }

  function ambilSemuaKelas() {
    return bacaJson(KUNCI_KELAS, {});
  }

  function simpanSemuaKelas(dataKelas) {
    simpanJson(KUNCI_KELAS, dataKelas);
  }

  function normalisasiMahasiswa(mahasiswaLama) {
    const mahasiswaBaru = Object.assign({}, mahasiswaLama, {
      idMahasiswa: mahasiswaLama.idMahasiswa || mahasiswaLama["id" + "A" + "nggota"] || buatId("mahasiswa"),
      daftarSemester: mahasiswaLama.daftarSemester || []
    });

    delete mahasiswaBaru["id" + "A" + "nggota"];
    return mahasiswaBaru;
  }

  function normalisasiKelas(kelasLama) {
    const daftarMahasiswa = kelasLama.daftarMahasiswa || kelasLama["daftar" + "A" + "nggota"] || [];
    const kelasBaru = Object.assign({}, kelasLama, {
      daftarMahasiswa: daftarMahasiswa.map(normalisasiMahasiswa)
    });

    delete kelasBaru["daftar" + "A" + "nggota"];
    return kelasBaru;
  }

  function ambilKelasPengguna(username) {
    const semuaKelas = ambilSemuaKelas();
    const daftarKelas = semuaKelas[username] || [];
    const daftarTernormalisasi = daftarKelas.map(normalisasiKelas);

    if (JSON.stringify(daftarKelas) !== JSON.stringify(daftarTernormalisasi)) {
      semuaKelas[username] = daftarTernormalisasi;
      simpanSemuaKelas(semuaKelas);
    }

    return daftarTernormalisasi;
  }

  function simpanKelasPengguna(username, daftarKelas) {
    const semuaKelas = ambilSemuaKelas();
    semuaKelas[username] = daftarKelas;
    simpanSemuaKelas(semuaKelas);
  }

  function cariAkun(username) {
    const target = String(username || "").trim().toLowerCase();
    return ambilSemuaAkun().find(function (akun) {
      return String(akun.username || "").trim().toLowerCase() === target;
    }) || null;
  }

  function usernameSudahDipakai(username) {
    return Boolean(cariAkun(username));
  }

  function ambilTemaTersimpan() {
    const tema = localStorage.getItem(KUNCI_TEMA);
    return tema === "terang" ? "terang" : "gelap";
  }

  function terapkanTema(tema) {
    const temaAktif = tema === "terang" ? "terang" : "gelap";
    document.body.classList.toggle("tema-terang", temaAktif === "terang");
    document.body.classList.toggle("tema-gelap", temaAktif === "gelap");
    localStorage.setItem(KUNCI_TEMA, temaAktif);
  }

  function ubahTema() {
    const temaBaru = ambilTemaTersimpan() === "gelap" ? "terang" : "gelap";
    terapkanTema(temaBaru);
    renderSidebar(keadaan.halamanAktif);

    if (keadaan.halamanAktif === "hasil") {
      renderHasil();
    }
  }

  function ambilWarnaGrafik() {
    const modeTerang = ambilTemaTersimpan() === "terang";
    return {
      areaAwal: modeTerang ? "rgba(11, 76, 147, 0.24)" : "rgba(66, 199, 255, 0.42)",
      areaAkhir: modeTerang ? "rgba(243, 199, 47, 0.10)" : "rgba(124, 108, 255, 0.06)",
      garis: modeTerang ? "#0b4c93" : "#42c7ff",
      titik: modeTerang ? "#f3c72f" : "#ffffff",
      batasTitik: modeTerang ? "#0a376d" : "#7c6cff",
      teks: modeTerang ? "rgba(8, 20, 39, 0.78)" : "rgba(239, 241, 255, 0.78)",
      grid: modeTerang ? "rgba(10, 54, 112, 0.14)" : "rgba(124, 108, 255, 0.12)"
    };
  }

  function isiLoginDariAkunDiingat() {
    const usernameDiingat = localStorage.getItem(KUNCI_USERNAME_DIINGAT) || "";

    if (elemen.loginUsername && usernameDiingat) {
      elemen.loginUsername.value = usernameDiingat;
    }

    if (elemen.ingatAkunLogin) {
      elemen.ingatAkunLogin.checked = Boolean(usernameDiingat);
    }

    if (elemen.tombolLupakanAkun) {
      elemen.tombolLupakanAkun.classList.toggle("tersembunyi", !usernameDiingat);
    }
  }

  function formatAngka(nilai) {
    return Number(nilai || 0).toFixed(2);
  }

  function formatWaktuSisa(milidetik) {
    const totalDetik = Math.max(0, Math.floor(milidetik / 1000));
    const jam = String(Math.floor(totalDetik / 3600)).padStart(2, "0");
    const menit = String(Math.floor((totalDetik % 3600) / 60)).padStart(2, "0");
    const detik = String(totalDetik % 60).padStart(2, "0");
    return jam + ":" + menit + ":" + detik;
  }

  function tampilkanNotifikasi(pesan, tipe) {
    const notifikasi = document.createElement("div");
    notifikasi.className = "notifikasi " + (tipe || "info");
    notifikasi.textContent = pesan;
    elemen.kontainerNotifikasi.appendChild(notifikasi);

    window.setTimeout(function () {
      notifikasi.style.opacity = "0";
      notifikasi.style.transform = "translateY(-8px)";
    }, 2600);

    window.setTimeout(function () {
      notifikasi.remove();
    }, 3000);
  }

  function aktifkanAnimasiJudul() {
    document.querySelectorAll("[data-judul-animasi]").forEach(function (judul, indeks) {
      judul.style.animationDelay = (indeks * 0.2) + "s";
    });
  }

  function mulaiAnimasiKetikan() {
    const daftarKalimat = [
      "Kelola kelas dengan tampilan yang bersih.",
      "Pantau semester tiap mahasiswa secara rapi.",
      "Hitung IPS dan IPK langsung dari browser.",
      "Lihat progres akademik lewat grafik modern."
    ];

    let indeksKalimat = 0;
    let indeksHuruf = 0;
    let sedangMenghapus = false;

    function jalankan() {
      const kalimatAktif = daftarKalimat[indeksKalimat];

      if (!sedangMenghapus) {
        elemen.teksKetikanIndex.textContent = kalimatAktif.slice(0, indeksHuruf + 1);
        indeksHuruf += 1;

        if (indeksHuruf === kalimatAktif.length) {
          window.setTimeout(function () {
            sedangMenghapus = true;
            jalankan();
          }, 2000);
          return;
        }

        window.setTimeout(jalankan, 42);
        return;
      }

      elemen.teksKetikanIndex.textContent = kalimatAktif.slice(0, Math.max(0, indeksHuruf - 1));
      indeksHuruf -= 1;

      if (indeksHuruf <= 0) {
        sedangMenghapus = false;
        indeksKalimat = (indeksKalimat + 1) % daftarKalimat.length;
        window.setTimeout(jalankan, 900);
        return;
      }

      window.setTimeout(jalankan, 24);
    }

    jalankan();
  }

  function aktifkanTab(kontainer, targetTab) {
    if (!kontainer) {
      return;
    }

    Array.from(kontainer.querySelectorAll("[data-target-tab]")).forEach(function (tombol) {
      tombol.classList.toggle("aktif", tombol.getAttribute("data-target-tab") === targetTab);
    });

    Array.from(kontainer.querySelectorAll("[data-panel-tab]")).forEach(function (panel) {
      panel.classList.toggle("aktif", panel.getAttribute("data-panel-tab") === targetTab);
    });
  }

  function inisialisasiTab(kontainer) {
    if (!kontainer || kontainer.dataset.tabAktif === "ya") {
      return;
    }

    kontainer.dataset.tabAktif = "ya";
    kontainer.addEventListener("click", function (event) {
      const tombol = event.target.closest("[data-target-tab]");
      if (!tombol) {
        return;
      }

      aktifkanTab(kontainer, tombol.getAttribute("data-target-tab"));
    });
  }

  function validasiUsername(username) {
    if (String(username || "").trim().length < 4) {
      throw new Error("Username minimal 4 karakter.");
    }
  }

  function validasiPassword(password, verifikasiPassword) {
    if (!String(password || "").trim()) {
      throw new Error("Password wajib diisi.");
    }

    if (password !== verifikasiPassword) {
      throw new Error("Password dan verifikasi password harus sama.");
    }
  }

  function buatKelasBaru(namaKelas) {
    return {
      idKelas: buatId("kelas"),
      namaKelas: namaKelas,
      kedaluwarsaPada: Date.now() + DURASI_ENAM_JAM,
      dibuatPada: Date.now(),
      diperbaruiPada: Date.now(),
      daftarMahasiswa: []
    };
  }

  function profilMahasiswaLengkap(mahasiswa) {
    return Boolean(String(mahasiswa.nama || "").trim() && String(mahasiswa.nim || "").trim());
  }

  function hitungTotalMahasiswa(daftarKelas) {
    return daftarKelas.reduce(function (total, kelas) {
      return total + (kelas.daftarMahasiswa || []).length;
    }, 0);
  }

  function hitungTotalSksSemester(semester) {
    return (semester.daftarMataKuliah || []).reduce(function (total, mataKuliah) {
      return total + Number(mataKuliah.sks || 0);
    }, 0);
  }

  function hitungTotalMutuSemester(semester) {
    return (semester.daftarMataKuliah || []).reduce(function (total, mataKuliah) {
      const bobot = PETA_BOBOT_NILAI[mataKuliah.nilaiHuruf] || 0;
      return total + (bobot * Number(mataKuliah.sks || 0));
    }, 0);
  }

  function hitungIpsSemester(semester) {
    const totalSks = hitungTotalSksSemester(semester);
    return totalSks ? hitungTotalMutuSemester(semester) / totalSks : 0;
  }

  function urutkanSemester(daftarSemester) {
    return [].concat(daftarSemester || []).sort(function (a, b) {
      return Number(a.nomorSemester) - Number(b.nomorSemester);
    });
  }

  function hitungRingkasanMahasiswa(mahasiswa) {
    const daftarSemesterTerurut = urutkanSemester(mahasiswa.daftarSemester || []).map(function (semester) {
      return Object.assign({}, semester, {
        totalSksSemester: hitungTotalSksSemester(semester),
        ips: hitungIpsSemester(semester)
      });
    });

    const totalSksKeseluruhan = daftarSemesterTerurut.reduce(function (total, semester) {
      return total + semester.totalSksSemester;
    }, 0);

    const totalMutuKeseluruhan = daftarSemesterTerurut.reduce(function (total, semester) {
      return total + hitungTotalMutuSemester(semester);
    }, 0);

    return {
      daftarSemesterTerurut: daftarSemesterTerurut,
      totalSksKeseluruhan: totalSksKeseluruhan,
      ipk: daftarSemesterTerurut.length >= 2 && totalSksKeseluruhan ? totalMutuKeseluruhan / totalSksKeseluruhan : null
    };
  }

  function bersihkanKelasKedaluwarsa(username) {
    const daftarKelas = ambilKelasPengguna(username);
    const daftarAktif = daftarKelas.filter(function (kelas) {
      return Number(kelas.kedaluwarsaPada || 0) > Date.now();
    });

    if (daftarAktif.length !== daftarKelas.length) {
      simpanKelasPengguna(username, daftarAktif);
      return true;
    }

    return false;
  }

  function ambilKelasById(username, idKelas) {
    return ambilKelasPengguna(username).find(function (kelas) {
      return kelas.idKelas === idKelas;
    }) || null;
  }

  function ambilMahasiswaById(username, idKelas, idMahasiswa) {
    const kelas = ambilKelasById(username, idKelas);
    if (!kelas) {
      return null;
    }

    return (kelas.daftarMahasiswa || []).find(function (mahasiswa) {
      return mahasiswa.idMahasiswa === idMahasiswa;
    }) || null;
  }

  function tambahJamKelas(username, idKelas, tambahanMilidetik) {
    const daftarKelas = ambilKelasPengguna(username);
    const daftarBaru = daftarKelas.map(function (kelas) {
      if (kelas.idKelas !== idKelas) {
        return kelas;
      }

      const dasarWaktu = Math.max(Date.now(), Number(kelas.kedaluwarsaPada || 0));
      return Object.assign({}, kelas, {
        kedaluwarsaPada: dasarWaktu + tambahanMilidetik,
        diperbaruiPada: Date.now()
      });
    });

    simpanKelasPengguna(username, daftarBaru);
  }

  function resetTimerKelasKeEnamJam(username, idKelas) {
    const daftarKelas = ambilKelasPengguna(username);
    const daftarBaru = daftarKelas.map(function (kelas) {
      if (kelas.idKelas !== idKelas) {
        return kelas;
      }

      return Object.assign({}, kelas, {
        kedaluwarsaPada: Date.now() + DURASI_ENAM_JAM,
        diperbaruiPada: Date.now()
      });
    });

    simpanKelasPengguna(username, daftarBaru);
  }

  function renderSidebar(halamanAktif) {
    const username = ambilSesiAktif();
    const temaAktif = ambilTemaTersimpan();
    const labelTema = temaAktif === "gelap" ? "Mode Terang" : "Mode Gelap";

    elemen.sidebarAplikasi.innerHTML = [
      "<div class='kepala-sidebar'>",
        "<div class='merek-sidebar'>",
          "<span class='logo-merek'>IP</span>",
          "<div class='teks-merek'>",
            "<strong>IPgrade</strong>",
            "<small>" + amankanHtml(username) + "</small>",
          "</div>",
        "</div>",
        "<button type='button' id='tombolCiutSidebar' class='tombol-ciut-sidebar'>||</button>",
      "</div>",
      "<nav class='menu-sidebar'>",
        buatMenuSidebar("dashboard", "Dashboard", halamanAktif),
        buatMenuSidebar("kelas", "Manajemen Kelas", halamanAktif),
        buatMenuSidebar("semester", "Data Semester", halamanAktif),
        buatMenuSidebar("hasil", "Hasil", halamanAktif),
      "</nav>",
      "<div class='informasi-sidebar'>",
        "<span class='label-kartu'>Status Data</span>",
        "<p class='teks-pendamping'>Semua semester berada di dalam mahasiswa kelas. Countdown berlaku per kelas.</p>",
      "</div>",
      "<div class='panel-tema-sidebar'>",
        "<span class='label-kartu'>Tema</span>",
        "<button type='button' id='tombolTemaSidebar' class='tombol-tema-sidebar'>" + labelTema + "</button>",
      "</div>",
      "<div class='aksi-sidebar'>",
        "<button type='button' id='tombolLogoutSidebar' class='tombol tombol-bahaya tombol-penuh'>",
          "<span class='teks-logout-sidebar'>Logout</span>",
        "</button>",
      "</div>"
    ].join("");

    document.body.classList.toggle("sidebar-ciut", localStorage.getItem(KUNCI_SIDEBAR_CIUT) === "ya");

    document.getElementById("tombolCiutSidebar").addEventListener("click", function () {
      const sedangCiut = document.body.classList.toggle("sidebar-ciut");
      localStorage.setItem(KUNCI_SIDEBAR_CIUT, sedangCiut ? "ya" : "tidak");
    });

    document.getElementById("tombolTemaSidebar").addEventListener("click", function () {
      ubahTema();
      tampilkanNotifikasi("Tema berhasil diganti ke " + (ambilTemaTersimpan() === "terang" ? "mode terang." : "mode gelap."), "sukses");
    });

    document.getElementById("tombolLogoutSidebar").addEventListener("click", function () {
      hapusSesiAktif();
      hentikanCountdownGlobal();
      tampilkanTampilan("autentikasi");
      tampilkanNotifikasi("Kamu sudah logout dari IPgrade.", "peringatan");
    });

    Array.from(document.querySelectorAll("[data-menu-aplikasi]")).forEach(function (tombol) {
      tombol.addEventListener("click", function () {
        tampilkanHalamanAplikasi(tombol.getAttribute("data-menu-aplikasi"));
      });
    });
  }

  function buatMenuSidebar(kode, label, halamanAktif) {
    return [
      "<button type='button' class='item-menu-sidebar " + (kode === halamanAktif ? "aktif" : "") + "' data-menu-aplikasi='" + kode + "'>",
        "<span class='ikon-menu'>" + label.slice(0, 2).toUpperCase() + "</span>",
        "<span class='teks-menu-sidebar'>" + label + "</span>",
      "</button>"
    ].join("");
  }

  function resetScrollKontenAplikasi() {
    if (!elemen.areaScrollAplikasi) {
      return;
    }

    elemen.areaScrollAplikasi.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
    elemen.areaScrollAplikasi.focus({ preventScroll: true });
  }

  function tampilkanTampilan(target) {
    elemen.tampilanLanding.classList.toggle("tersembunyi", target !== "landing");
    elemen.tampilanAutentikasi.classList.toggle("tersembunyi", target !== "autentikasi");
    elemen.tampilanAplikasi.classList.toggle("tersembunyi", target !== "aplikasi");
    document.body.classList.toggle("mode-aplikasi", target === "aplikasi");

    if (target === "autentikasi") {
      isiLoginDariAkunDiingat();
    }
  }

  function tampilkanHalamanAplikasi(halaman) {
    const username = ambilSesiAktif();
    if (!username) {
      tampilkanTampilan("autentikasi");
      return;
    }

    keadaan.halamanAktif = halaman;
    bersihkanKelasKedaluwarsa(username);
    tampilkanTampilan("aplikasi");
    renderSidebar(halaman);

    Array.from(document.querySelectorAll("[data-halaman-aplikasi]")).forEach(function (panel) {
      const cocok = panel.getAttribute("data-halaman-aplikasi") === halaman;
      panel.classList.toggle("tersembunyi", !cocok);
      panel.classList.toggle("aktif", cocok);
    });

    renderSemuaHalaman();
    mulaiCountdownGlobal();

    window.requestAnimationFrame(function () {
      resetScrollKontenAplikasi();
    });
  }

  function renderSemuaHalaman() {
    const username = ambilSesiAktif();
    if (!username) {
      return;
    }

    renderDashboard();
    renderPilihanKelasSemua();
    renderManajemenKelas();
    renderSemester();
    renderHasil();
  }

  function renderDashboard() {
    const username = ambilSesiAktif();
    const daftarKelas = ambilKelasPengguna(username);
    const totalMahasiswa = hitungTotalMahasiswa(daftarKelas);

    document.getElementById("namaPenggunaDashboard").textContent = username;
    document.getElementById("jumlahKelasDashboard").textContent = String(daftarKelas.length);
    document.getElementById("jumlahMahasiswaDashboard").textContent = String(totalMahasiswa);

    const totalHalaman = Math.max(1, Math.ceil(daftarKelas.length / BATAS_KELAS_DASHBOARD));
    keadaan.halamanCountdownDashboard = Math.min(keadaan.halamanCountdownDashboard, totalHalaman);
    keadaan.halamanCountdownDashboard = Math.max(1, keadaan.halamanCountdownDashboard);

    const indeksAwal = (keadaan.halamanCountdownDashboard - 1) * BATAS_KELAS_DASHBOARD;
    const daftarTampil = daftarKelas.slice(indeksAwal, indeksAwal + BATAS_KELAS_DASHBOARD);

    elemen.kontrolPaginationDashboard.innerHTML = [
      "<button type='button' class='tombol tombol-garis tombol-mini' id='tombolHalamanSebelumnya' " + (keadaan.halamanCountdownDashboard === 1 ? "disabled" : "") + ">Sebelumnya</button>",
      "<span class='chip-info'>Halaman " + keadaan.halamanCountdownDashboard + " / " + totalHalaman + "</span>",
      "<button type='button' class='tombol tombol-garis tombol-mini' id='tombolHalamanBerikutnya' " + (keadaan.halamanCountdownDashboard === totalHalaman ? "disabled" : "") + ">Berikutnya</button>"
    ].join("");

    if (!daftarTampil.length) {
      elemen.daftarCountdownKelasDashboard.innerHTML = "<div class='keadaan-kosong'>Belum ada kelas aktif. Buat kelas baru dari menu Manajemen Kelas.</div>";
    } else {
      elemen.daftarCountdownKelasDashboard.innerHTML = daftarTampil.map(function (kelas) {
        return buatKartuCountdownKelas(kelas, "dashboard");
      }).join("");
    }

    const tombolHalamanSebelumnya = document.getElementById("tombolHalamanSebelumnya");
    const tombolHalamanBerikutnya = document.getElementById("tombolHalamanBerikutnya");

    if (tombolHalamanSebelumnya) {
      tombolHalamanSebelumnya.addEventListener("click", function () {
        keadaan.halamanCountdownDashboard -= 1;
        renderDashboard();
      });
    }

    if (tombolHalamanBerikutnya) {
      tombolHalamanBerikutnya.addEventListener("click", function () {
        keadaan.halamanCountdownDashboard += 1;
        renderDashboard();
      });
    }
  }

  function buatKartuCountdownKelas(kelas, sumber) {
    return [
      "<article class='item-kelas-dashboard' data-id-kelas='" + kelas.idKelas + "' data-sumber='" + sumber + "'>",
        "<div class='kepala-item-kelas'>",
          "<div>",
            "<span class='label-kartu'>" + amankanHtml(kelas.namaKelas) + "</span>",
            "<strong class='angka-ringkasan-hasil teks-waktu-kelas' data-teks-waktu-kelas='" + kelas.idKelas + "'>" + formatWaktuSisa(Math.max(0, kelas.kedaluwarsaPada - Date.now())) + "</strong>",
          "</div>",
          "<span class='teks-tipis'>" + (kelas.daftarMahasiswa || []).length + " mahasiswa</span>",
        "</div>",
        "<div class='grup-tambah-jam'>",
          PILIHAN_TAMBAH_JAM.map(function (opsi) {
            return "<button type='button' class='tombol tombol-garis tombol-mini' data-aksi='tambah-jam-kelas' data-id-kelas='" + kelas.idKelas + "' data-tambahan='" + opsi.nilai + "'>" + opsi.label + "</button>";
          }).join(""),
        "</div>",
      "</article>"
    ].join("");
  }

  function renderPilihanKelasSemua() {
    const username = ambilSesiAktif();
    const daftarKelas = ambilKelasPengguna(username);

    isiPilihanSelect(document.getElementById("pilihanKelasMahasiswa"), daftarKelas, "Pilih kelas untuk mahasiswa");
    isiPilihanSelect(document.getElementById("pilihanKelasSemester"), daftarKelas, "Pilih kelas untuk semester");
    isiPilihanSelect(document.getElementById("pilihanKelasHasil"), daftarKelas, "Pilih kelas untuk hasil");

    renderPilihanMahasiswaSemester();
    renderPilihanMahasiswaHasil();
  }

  function isiPilihanSelect(select, daftarKelas, placeholder) {
    if (!select) {
      return;
    }

    const nilaiAktif = select.value;
    select.innerHTML = ["<option value=''>" + placeholder + "</option>"].concat(
      daftarKelas.map(function (kelas) {
        return "<option value='" + kelas.idKelas + "'>" + amankanHtml(kelas.namaKelas) + "</option>";
      })
    ).join("");

    if (daftarKelas.some(function (kelas) { return kelas.idKelas === nilaiAktif; })) {
      select.value = nilaiAktif;
    }
  }

  function renderManajemenKelas() {
    const username = ambilSesiAktif();
    const daftarKelas = ambilKelasPengguna(username);

    if (!daftarKelas.length) {
      elemen.daftarKelasManajemen.innerHTML = "<div class='keadaan-kosong'>Belum ada kelas. Tambahkan kelas terlebih dahulu, lalu isi mahasiswa di dalamnya.</div>";
      return;
    }

    elemen.daftarKelasManajemen.innerHTML = daftarKelas.map(function (kelas) {
      return [
        "<article class='kartu-kelas-manajemen' data-id-kelas='" + kelas.idKelas + "'>",
          "<div class='kepala-kelas-manajemen'>",
            "<div>",
              "<span class='label-kartu'>" + amankanHtml(kelas.namaKelas) + "</span>",
              "<p class='teks-tipis'>" + (kelas.daftarMahasiswa || []).length + "/" + BATAS_MAHASISWA_PER_KELAS + " mahasiswa</p>",
              "<p class='teks-tipis'>Countdown: <strong class='teks-waktu-kelas' data-teks-waktu-kelas='" + kelas.idKelas + "'>" + formatWaktuSisa(Math.max(0, kelas.kedaluwarsaPada - Date.now())) + "</strong></p>",
            "</div>",
            "<div class='baris-tombol-kecil'>",
              "<button type='button' class='tombol tombol-garis tombol-kecil' data-aksi='edit-kelas' data-id-kelas='" + kelas.idKelas + "'>Edit Kelas</button>",
              "<button type='button' class='tombol tombol-bahaya tombol-kecil' data-aksi='hapus-kelas' data-id-kelas='" + kelas.idKelas + "'>Hapus Kelas</button>",
            "</div>",
          "</div>",
          "<div class='grup-tambah-jam'>",
            PILIHAN_TAMBAH_JAM.map(function (opsi) {
              return "<button type='button' class='tombol tombol-garis tombol-mini' data-aksi='tambah-jam-kelas' data-id-kelas='" + kelas.idKelas + "' data-tambahan='" + opsi.nilai + "'>" + opsi.label + "</button>";
            }).join(""),
          "</div>",
          "<div class='daftar-mahasiswa-kelas'>",
            (kelas.daftarMahasiswa || []).length
              ? kelas.daftarMahasiswa.map(function (mahasiswa) {
                  return [
                    "<div class='baris-mahasiswa' data-id-mahasiswa='" + mahasiswa.idMahasiswa + "'>",
                      "<div>",
                        "<strong>" + amankanHtml(mahasiswa.nama) + "</strong>",
                        "<p class='teks-tipis'>" + amankanHtml(mahasiswa.nim) + " | " + ((mahasiswa.daftarSemester || []).length) + " semester</p>",
                      "</div>",
                      "<div class='baris-tombol-kecil'>",
                        "<button type='button' class='tombol tombol-garis tombol-mini' data-aksi='edit-mahasiswa' data-id-kelas='" + kelas.idKelas + "' data-id-mahasiswa='" + mahasiswa.idMahasiswa + "'>Edit</button>",
                        "<button type='button' class='tombol tombol-bahaya tombol-mini' data-aksi='hapus-mahasiswa' data-id-kelas='" + kelas.idKelas + "' data-id-mahasiswa='" + mahasiswa.idMahasiswa + "'>Hapus</button>",
                      "</div>",
                    "</div>"
                  ].join("");
                }).join("")
              : "<div class='keadaan-kosong'>Belum ada mahasiswa di kelas ini.</div>",
          "</div>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderPilihanMahasiswaSemester() {
    const username = ambilSesiAktif();
    const idKelas = document.getElementById("pilihanKelasSemester").value;
    const selectMahasiswa = document.getElementById("pilihanMahasiswaSemester");
    const kotakInfo = document.getElementById("ringkasanPilihanSemester");

    if (!idKelas) {
      selectMahasiswa.innerHTML = "<option value=''>Pilih mahasiswa</option>";
      kotakInfo.textContent = "Pilih kelas dan mahasiswa untuk mulai mengelola semester.";
      return;
    }

    const kelas = ambilKelasById(username, idKelas);
    const daftarMahasiswa = kelas ? (kelas.daftarMahasiswa || []) : [];
    const nilaiAktif = selectMahasiswa.value;

    selectMahasiswa.innerHTML = ["<option value=''>Pilih mahasiswa</option>"].concat(
      daftarMahasiswa.map(function (mahasiswa) {
        return "<option value='" + mahasiswa.idMahasiswa + "'>" + amankanHtml(mahasiswa.nama) + " - " + amankanHtml(mahasiswa.nim) + "</option>";
      })
    ).join("");

    if (daftarMahasiswa.some(function (mahasiswa) { return mahasiswa.idMahasiswa === nilaiAktif; })) {
      selectMahasiswa.value = nilaiAktif;
    }

    const mahasiswa = ambilMahasiswaById(username, idKelas, selectMahasiswa.value);
    if (!mahasiswa) {
      kotakInfo.textContent = kelas ? "Pilih mahasiswa dari kelas " + kelas.namaKelas + "." : "Pilih mahasiswa.";
      return;
    }

    kotakInfo.innerHTML = "<strong>" + amankanHtml(kelas.namaKelas) + "</strong><br>" + amankanHtml(mahasiswa.nama) + " | " + amankanHtml(mahasiswa.nim);
  }

  function renderSemester() {
    const username = ambilSesiAktif();
    const idKelas = document.getElementById("pilihanKelasSemester").value;
    const idMahasiswa = document.getElementById("pilihanMahasiswaSemester").value;

    renderPilihanMahasiswaSemester();

    if (!idKelas || !idMahasiswa) {
      elemen.daftarSemesterTersimpan.innerHTML = "<div class='keadaan-kosong'>Pilih kelas dan mahasiswa terlebih dahulu untuk melihat data semester.</div>";
      return;
    }

    const mahasiswa = ambilMahasiswaById(username, idKelas, idMahasiswa);
    if (!mahasiswa) {
      elemen.daftarSemesterTersimpan.innerHTML = "<div class='keadaan-kosong'>Mahasiswa tidak ditemukan.</div>";
      return;
    }

    const daftarSemester = urutkanSemester(mahasiswa.daftarSemester || []);
    if (!daftarSemester.length) {
      elemen.daftarSemesterTersimpan.innerHTML = "<div class='keadaan-kosong'>Belum ada semester tersimpan untuk mahasiswa ini.</div>";
      return;
    }

    elemen.daftarSemesterTersimpan.innerHTML = daftarSemester.map(function (semester) {
      const totalSksSemester = hitungTotalSksSemester(semester);
      const ipsSemester = hitungIpsSemester(semester);

      return [
        "<article class='kartu-semester' data-id-semester='" + semester.idSemester + "'>",
          "<div class='ringkasan-semester'>",
            "<div>",
              "<span class='label-kartu'>Semester " + semester.nomorSemester + "</span>",
              "<h3 class='judul-kartu-semester'>IPS " + formatAngka(ipsSemester) + "</h3>",
              "<p class='teks-tipis'>" + totalSksSemester + " SKS | " + semester.daftarMataKuliah.length + " mata kuliah | Edit menuju reset timer: " + Number(semester.jumlahEdit || 0) + "/3</p>",
            "</div>",
            "<div class='baris-tombol-kecil'>",
              "<button type='button' class='tombol tombol-garis tombol-kecil' data-aksi='edit-semester' data-id-semester='" + semester.idSemester + "'>Edit</button>",
              "<button type='button' class='tombol tombol-bahaya tombol-kecil' data-aksi='hapus-semester' data-id-semester='" + semester.idSemester + "'>Hapus Semester</button>",
            "</div>",
          "</div>",
          "<div class='tabel-semester-mini'>",
            "<div class='baris-header-mini'><span>Mata Kuliah</span><span>SKS</span><span>Nilai</span><span>Aksi</span></div>",
            semester.daftarMataKuliah.map(function (mataKuliah) {
              return [
                "<div class='baris-data-mini' data-id-mata-kuliah='" + mataKuliah.idMataKuliah + "'>",
                  "<span>" + amankanHtml(mataKuliah.namaMataKuliah) + "</span>",
                  "<span>" + mataKuliah.sks + "</span>",
                  "<span>" + mataKuliah.nilaiHuruf + "</span>",
                  "<button type='button' class='tombol-link-kecil' data-aksi='hapus-mata-kuliah' data-id-semester='" + semester.idSemester + "' data-id-mata-kuliah='" + mataKuliah.idMataKuliah + "'>Hapus</button>",
                "</div>"
              ].join("");
            }).join(""),
          "</div>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderPilihanMahasiswaHasil() {
    const username = ambilSesiAktif();
    const idKelas = document.getElementById("pilihanKelasHasil").value;
    const selectMahasiswa = document.getElementById("pilihanMahasiswaHasil");
    const kotakInfo = document.getElementById("ringkasanPilihanHasil");

    if (!idKelas) {
      selectMahasiswa.innerHTML = "<option value=''>Pilih mahasiswa</option>";
      kotakInfo.textContent = "Pilih kelas dan mahasiswa untuk melihat hasil.";
      return;
    }

    const kelas = ambilKelasById(username, idKelas);
    const daftarMahasiswa = kelas ? (kelas.daftarMahasiswa || []) : [];
    const nilaiAktif = selectMahasiswa.value;

    selectMahasiswa.innerHTML = ["<option value=''>Pilih mahasiswa</option>"].concat(
      daftarMahasiswa.map(function (mahasiswa) {
        return "<option value='" + mahasiswa.idMahasiswa + "'>" + amankanHtml(mahasiswa.nama) + " - " + amankanHtml(mahasiswa.nim) + "</option>";
      })
    ).join("");

    if (daftarMahasiswa.some(function (mahasiswa) { return mahasiswa.idMahasiswa === nilaiAktif; })) {
      selectMahasiswa.value = nilaiAktif;
    }

    const mahasiswa = ambilMahasiswaById(username, idKelas, selectMahasiswa.value);
    if (!mahasiswa) {
      kotakInfo.textContent = kelas ? "Pilih mahasiswa dari kelas " + kelas.namaKelas + "." : "Pilih mahasiswa.";
      return;
    }

    kotakInfo.innerHTML = "<strong>" + amankanHtml(kelas.namaKelas) + "</strong><br>" + amankanHtml(mahasiswa.nama) + " | " + amankanHtml(mahasiswa.nim);
  }

  function renderHasil() {
    const username = ambilSesiAktif();
    const idKelas = document.getElementById("pilihanKelasHasil").value;
    const idMahasiswa = document.getElementById("pilihanMahasiswaHasil").value;
    const pesanKosong = document.getElementById("pesanKosongHasil");
    const statusGrafikKosong = document.getElementById("statusGrafikKosong");
    const kontainerProfil = document.getElementById("kartuProfilHasil");
    const kontainerStatistik = document.getElementById("kartuStatistikHasil");

    renderPilihanMahasiswaHasil();

    if (!idKelas || !idMahasiswa) {
      pesanKosong.classList.remove("tersembunyi");
      statusGrafikKosong.classList.remove("tersembunyi");
      kontainerProfil.innerHTML = "";
      kontainerStatistik.innerHTML = "";
      elemen.daftarAccordionSemester.innerHTML = "";
      hancurkanGrafik();
      return;
    }

    const kelas = ambilKelasById(username, idKelas);
    const mahasiswa = ambilMahasiswaById(username, idKelas, idMahasiswa);

    if (!kelas || !mahasiswa) {
      pesanKosong.classList.remove("tersembunyi");
      statusGrafikKosong.classList.remove("tersembunyi");
      kontainerProfil.innerHTML = "";
      kontainerStatistik.innerHTML = "";
      elemen.daftarAccordionSemester.innerHTML = "";
      hancurkanGrafik();
      return;
    }

    const ringkasan = hitungRingkasanMahasiswa(mahasiswa);
    pesanKosong.classList.toggle("tersembunyi", ringkasan.daftarSemesterTerurut.length > 0);

    kontainerProfil.innerHTML = [
      buatKartuIdentitas("Nama Kelas", kelas.namaKelas),
      buatKartuIdentitas("Nama Mahasiswa", mahasiswa.nama),
      buatKartuIdentitas("NIM Mahasiswa", mahasiswa.nim)
    ].join("");

    kontainerStatistik.innerHTML = [
      buatKartuRingkasan("Total SKS", String(ringkasan.totalSksKeseluruhan), "Akumulasi seluruh SKS mahasiswa ini."),
      buatKartuRingkasan("Jumlah Semester", String(ringkasan.daftarSemesterTerurut.length), "Semester diurutkan otomatis dari kecil ke besar."),
      buatKartuRingkasan(
        "IPK Mahasiswa",
        ringkasan.ipk === null ? "-" : formatAngka(ringkasan.ipk),
        ringkasan.ipk === null ? "IPK belum tersedia, minimal 2 semester" : "IPK dihitung dari semua semester mahasiswa."
      )
    ].join("");

    if (!ringkasan.daftarSemesterTerurut.length) {
      elemen.daftarAccordionSemester.innerHTML = "";
      statusGrafikKosong.classList.remove("tersembunyi");
      hancurkanGrafik();
      return;
    }

    elemen.daftarAccordionSemester.innerHTML = ringkasan.daftarSemesterTerurut.map(function (semester) {
      const idPanel = "panel-" + semester.idSemester;
      return [
        "<article class='item-akordeon'>",
          "<button type='button' class='tombol-akordeon' data-aksi='buka-akordeon' data-target-panel='" + idPanel + "'>",
            "<div class='kepala-akordeon-semester'>",
              "<div>",
                "<span class='label-kartu'>Semester " + semester.nomorSemester + "</span>",
                "<strong>IPS " + formatAngka(semester.ips) + "</strong>",
              "</div>",
              "<span class='teks-tipis'>" + semester.totalSksSemester + " SKS</span>",
            "</div>",
            "<span class='teks-tipis'>Buka detail</span>",
          "</button>",
          "<div id='" + idPanel + "' class='isi-akordeon'>",
            "<div class='tabel-detail-semester'>",
              "<div class='baris-tabel-detail kepala'><span>Mata Kuliah</span><span>SKS</span><span>Nilai</span></div>",
              semester.daftarMataKuliah.map(function (mataKuliah) {
                return "<div class='baris-tabel-detail'><span>" + amankanHtml(mataKuliah.namaMataKuliah) + "</span><span>" + mataKuliah.sks + "</span><span>" + mataKuliah.nilaiHuruf + "</span></div>";
              }).join(""),
            "</div>",
            "<p class='catatan-ringkasan-hasil'>Total SKS semester: " + semester.totalSksSemester + " | IPS semester: " + formatAngka(semester.ips) + "</p>",
          "</div>",
        "</article>"
      ].join("");
    }).join("");

    renderGrafikIps(ringkasan.daftarSemesterTerurut);
    statusGrafikKosong.classList.add("tersembunyi");
  }

  function buatKartuIdentitas(label, nilai) {
    return [
      "<article class='kartu-identitas-hasil'>",
        "<span class='label-kartu'>" + amankanHtml(label) + "</span>",
        "<strong class='angka-ringkasan-hasil'>" + amankanHtml(nilai) + "</strong>",
      "</article>"
    ].join("");
  }

  function buatKartuRingkasan(label, nilai, catatan) {
    return [
      "<article class='kartu-ringkasan-hasil'>",
        "<span class='label-kartu'>" + amankanHtml(label) + "</span>",
        "<strong class='angka-ringkasan-hasil'>" + amankanHtml(nilai) + "</strong>",
        "<p class='catatan-ringkasan-hasil'>" + amankanHtml(catatan) + "</p>",
      "</article>"
    ].join("");
  }

  function renderGrafikIps(daftarSemesterTerurut) {
    hancurkanGrafik();

    if (!window.Chart || !daftarSemesterTerurut.length) {
      return;
    }

    const kanvas = document.getElementById("kanvasGrafikIps");
    const konteks = kanvas.getContext("2d");
    const warnaGrafik = ambilWarnaGrafik();
    const gradien = konteks.createLinearGradient(0, 0, 0, 320);
    gradien.addColorStop(0, warnaGrafik.areaAwal);
    gradien.addColorStop(1, warnaGrafik.areaAkhir);

    keadaan.grafikAktif = new window.Chart(konteks, {
      type: "line",
      data: {
        labels: daftarSemesterTerurut.map(function (semester) {
          return "Semester " + semester.nomorSemester;
        }),
        datasets: [{
          label: "IPS",
          data: daftarSemesterTerurut.map(function (semester) {
            return Number(formatAngka(semester.ips));
          }),
          fill: true,
          backgroundColor: gradien,
          borderColor: warnaGrafik.garis,
          borderWidth: 3,
          pointBackgroundColor: warnaGrafik.titik,
          pointBorderColor: warnaGrafik.batasTitik,
          pointBorderWidth: 2,
          pointRadius: 5,
          tension: 0.32
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: warnaGrafik.teks,
              font: {
                family: "Outfit",
                weight: "600"
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: warnaGrafik.teks
            },
            grid: {
              color: warnaGrafik.grid
            }
          },
          y: {
            min: 0,
            max: 4,
            ticks: {
              stepSize: 0.5,
              color: warnaGrafik.teks
            },
            grid: {
              color: warnaGrafik.grid
            }
          }
        }
      }
    });
  }

  function hancurkanGrafik() {
    if (keadaan.grafikAktif) {
      keadaan.grafikAktif.destroy();
      keadaan.grafikAktif = null;
    }
  }

  function mulaiCountdownGlobal() {
    hentikanCountdownGlobal();

    function perbaruiCountdown() {
      const username = ambilSesiAktif();
      if (!username) {
        hentikanCountdownGlobal();
        return;
      }

      const adaYangTerhapus = bersihkanKelasKedaluwarsa(username);
      if (adaYangTerhapus) {
        renderSemuaHalaman();
        tampilkanNotifikasi("Ada kelas yang kedaluwarsa dan terhapus otomatis.", "peringatan");
      }

      Array.from(document.querySelectorAll("[data-teks-waktu-kelas]")).forEach(function (elemenWaktu) {
        const kelas = ambilKelasById(username, elemenWaktu.getAttribute("data-teks-waktu-kelas"));
        elemenWaktu.textContent = kelas
          ? formatWaktuSisa(Math.max(0, kelas.kedaluwarsaPada - Date.now()))
          : "00:00:00";
      });
    }

    perbaruiCountdown();
    keadaan.intervalCountdown = window.setInterval(perbaruiCountdown, 1000);
  }

  function hentikanCountdownGlobal() {
    if (keadaan.intervalCountdown) {
      window.clearInterval(keadaan.intervalCountdown);
      keadaan.intervalCountdown = null;
    }
  }

  function resetFormKelas() {
    document.getElementById("idKelasTersembunyi").value = "";
    document.getElementById("inputNamaKelas").value = "";
  }

  function resetFormMahasiswa() {
    document.getElementById("idMahasiswaTersembunyi").value = "";
    document.getElementById("inputNamaMahasiswa").value = "";
    document.getElementById("inputNimMahasiswa").value = "";
  }

  function resetFormSemester() {
    document.getElementById("idSemesterTersembunyi").value = "";
    document.getElementById("inputNomorSemester").value = "";
    document.getElementById("daftarMataKuliahForm").innerHTML = "";
    tambahBarisMataKuliah();
  }

  function tambahBarisMataKuliah(dataMataKuliah) {
    const daftarForm = document.getElementById("daftarMataKuliahForm");
    if (daftarForm.children.length >= BATAS_MATA_KULIAH) {
      tampilkanNotifikasi("Jumlah mata kuliah per semester maksimal 9.", "peringatan");
      return;
    }

    const baris = document.createElement("div");
    baris.className = "baris-mata-kuliah";
    baris.innerHTML = [
      "<input type='text' class='input-glow input-nama-mata-kuliah' placeholder='Nama mata kuliah' value='" + amankanHtml(dataMataKuliah && dataMataKuliah.namaMataKuliah ? dataMataKuliah.namaMataKuliah : "") + "'>",
      "<input type='number' class='input-glow input-sks-mata-kuliah' min='1' step='1' placeholder='SKS' value='" + amankanHtml(dataMataKuliah && dataMataKuliah.sks ? String(dataMataKuliah.sks) : "") + "'>",
      "<select class='input-glow input-nilai-mata-kuliah'>",
        "<option value=''>Nilai</option>",
        "<option value='A'>A</option>",
        "<option value='B'>B</option>",
        "<option value='C'>C</option>",
        "<option value='D'>D</option>",
        "<option value='E'>E</option>",
      "</select>",
      "<button type='button' class='tombol tombol-bahaya tombol-kecil tombol-hapus-baris'>Hapus</button>"
    ].join("");

    baris.querySelector(".input-nilai-mata-kuliah").value = dataMataKuliah && dataMataKuliah.nilaiHuruf ? dataMataKuliah.nilaiHuruf : "";

    baris.querySelector(".tombol-hapus-baris").addEventListener("click", function () {
      if (daftarForm.children.length === 1) {
        tampilkanNotifikasi("Minimal sisakan satu baris mata kuliah di form.", "peringatan");
        return;
      }
      baris.remove();
    });

    daftarForm.appendChild(baris);
  }

  function isiFormEditKelas(idKelas) {
    const username = ambilSesiAktif();
    const kelas = ambilKelasById(username, idKelas);
    if (!kelas) {
      tampilkanNotifikasi("Kelas tidak ditemukan.", "gagal");
      return;
    }

    document.getElementById("idKelasTersembunyi").value = kelas.idKelas;
    document.getElementById("inputNamaKelas").value = kelas.namaKelas;
  }

  function isiFormEditMahasiswa(idKelas, idMahasiswa) {
    const username = ambilSesiAktif();
    const mahasiswa = ambilMahasiswaById(username, idKelas, idMahasiswa);
    if (!mahasiswa) {
      tampilkanNotifikasi("Mahasiswa tidak ditemukan.", "gagal");
      return;
    }

    document.getElementById("idMahasiswaTersembunyi").value = mahasiswa.idMahasiswa;
    document.getElementById("pilihanKelasMahasiswa").value = idKelas;
    document.getElementById("inputNamaMahasiswa").value = mahasiswa.nama;
    document.getElementById("inputNimMahasiswa").value = mahasiswa.nim;
  }

  function isiFormEditSemester(idSemester) {
    const username = ambilSesiAktif();
    const idKelas = document.getElementById("pilihanKelasSemester").value;
    const idMahasiswa = document.getElementById("pilihanMahasiswaSemester").value;
    const mahasiswa = ambilMahasiswaById(username, idKelas, idMahasiswa);

    if (!mahasiswa) {
      tampilkanNotifikasi("Mahasiswa tidak ditemukan.", "gagal");
      return;
    }

    const semester = (mahasiswa.daftarSemester || []).find(function (itemSemester) {
      return itemSemester.idSemester === idSemester;
    });

    if (!semester) {
      tampilkanNotifikasi("Semester tidak ditemukan.", "gagal");
      return;
    }

    document.getElementById("idSemesterTersembunyi").value = semester.idSemester;
    document.getElementById("inputNomorSemester").value = semester.nomorSemester;
    document.getElementById("daftarMataKuliahForm").innerHTML = "";
    semester.daftarMataKuliah.forEach(function (mataKuliah) {
      tambahBarisMataKuliah(mataKuliah);
    });
    resetScrollKontenAplikasi();
  }

  function toggleLihatPassword(idInput) {
    const input = document.getElementById(idInput);
    if (!input) {
      return;
    }

    input.type = input.type === "password" ? "text" : "password";
  }

  function inisialisasiEvent() {
    inisialisasiTab(document.getElementById("kontainerTabAutentikasi"));
    inisialisasiTab(document.getElementById("kontainerTabHasil"));

    document.getElementById("tombolMasukAutentikasi").addEventListener("click", function () {
      tampilkanTampilan("autentikasi");
    });

    document.getElementById("tombolKembaliLanding").addEventListener("click", function () {
      tampilkanTampilan("landing");
    });

    Array.from(document.querySelectorAll(".tombol-lihat-password")).forEach(function (tombol) {
      tombol.addEventListener("click", function () {
        toggleLihatPassword(tombol.getAttribute("data-target-password"));
        tombol.textContent = tombol.textContent === "Lihat" ? "Tutup" : "Lihat";
      });
    });

    if (elemen.tombolLupakanAkun) {
      elemen.tombolLupakanAkun.addEventListener("click", function () {
        localStorage.removeItem(KUNCI_USERNAME_DIINGAT);
        if (elemen.loginUsername) {
          elemen.loginUsername.value = "";
        }
        if (elemen.ingatAkunLogin) {
          elemen.ingatAkunLogin.checked = false;
        }
        isiLoginDariAkunDiingat();
        tampilkanNotifikasi("Username tersimpan sudah dihapus.", "peringatan");
      });
    }

    document.getElementById("formRegister").addEventListener("submit", function (event) {
      event.preventDefault();
      const username = document.getElementById("registerUsername").value.trim();
      const password = document.getElementById("registerPassword").value;
      const verifikasiPassword = document.getElementById("registerVerifikasi").value;

      try {
        validasiUsername(username);
        validasiPassword(password, verifikasiPassword);

        if (usernameSudahDipakai(username)) {
          throw new Error("Username sudah digunakan");
        }

        const daftarAkun = ambilSemuaAkun();
        daftarAkun.push({
          idAkun: buatId("akun"),
          username: username,
          password: password,
          dibuatPada: Date.now()
        });
        simpanSemuaAkun(daftarAkun);

        event.target.reset();
        document.getElementById("loginUsername").value = username;
        Array.from(document.querySelectorAll(".tombol-lihat-password")).forEach(function (tombol) {
          tombol.textContent = "Lihat";
        });
        aktifkanTab(document.getElementById("kontainerTabAutentikasi"), "login");
        tampilkanNotifikasi("Register berhasil. Silakan login dengan akun yang baru dibuat.", "sukses");
      } catch (error) {
        tampilkanNotifikasi(error.message, "gagal");
      }
    });

    document.getElementById("formLogin").addEventListener("submit", function (event) {
      event.preventDefault();
      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value;

      try {
        validasiUsername(username);
        const akun = cariAkun(username);

        if (!akun || akun.password !== password) {
          throw new Error("Login gagal. Periksa kembali username dan password.");
        }

        simpanSesiAktif(akun.username);
        if (elemen.ingatAkunLogin && elemen.ingatAkunLogin.checked) {
          localStorage.setItem(KUNCI_USERNAME_DIINGAT, akun.username);
        } else {
          localStorage.removeItem(KUNCI_USERNAME_DIINGAT);
        }
        isiLoginDariAkunDiingat();
        tampilkanHalamanAplikasi("dashboard");
      } catch (error) {
        tampilkanNotifikasi(error.message, "gagal");
      }
    });

    document.getElementById("formKelas").addEventListener("submit", function (event) {
      event.preventDefault();
      const username = ambilSesiAktif();
      const idKelas = document.getElementById("idKelasTersembunyi").value;
      const namaKelas = document.getElementById("inputNamaKelas").value.trim();

      try {
        if (!namaKelas) {
          throw new Error("Nama kelas wajib diisi.");
        }

        let daftarKelas = ambilKelasPengguna(username);
        const bentrokNama = daftarKelas.some(function (kelas) {
          return kelas.namaKelas.toLowerCase() === namaKelas.toLowerCase() && kelas.idKelas !== idKelas;
        });

        if (bentrokNama) {
          throw new Error("Nama kelas sudah digunakan.");
        }

        if (idKelas) {
          daftarKelas = daftarKelas.map(function (kelas) {
            if (kelas.idKelas !== idKelas) {
              return kelas;
            }
            return Object.assign({}, kelas, {
              namaKelas: namaKelas,
              diperbaruiPada: Date.now()
            });
          });
        } else {
          daftarKelas = daftarKelas.concat(buatKelasBaru(namaKelas));
        }

        simpanKelasPengguna(username, daftarKelas);
        resetFormKelas();
        renderSemuaHalaman();
        tampilkanNotifikasi("Data kelas berhasil disimpan.", "sukses");
      } catch (error) {
        tampilkanNotifikasi(error.message, "gagal");
      }
    });

    document.getElementById("formMahasiswa").addEventListener("submit", function (event) {
      event.preventDefault();
      const username = ambilSesiAktif();
      const idKelas = document.getElementById("pilihanKelasMahasiswa").value;
      const idMahasiswa = document.getElementById("idMahasiswaTersembunyi").value;
      const nama = document.getElementById("inputNamaMahasiswa").value.trim();
      const nim = document.getElementById("inputNimMahasiswa").value.trim();

      try {
        if (!idKelas) {
          throw new Error("Pilih kelas terlebih dahulu sebelum menyimpan mahasiswa.");
        }

        if (!profilMahasiswaLengkap({ nama: nama, nim: nim })) {
          throw new Error("Nama mahasiswa dan NIM mahasiswa wajib diisi.");
        }

        let daftarKelas = ambilKelasPengguna(username);
        daftarKelas = daftarKelas.map(function (kelas) {
          if (kelas.idKelas !== idKelas) {
            return kelas;
          }

          const daftarMahasiswa = kelas.daftarMahasiswa || [];
          const bentrokNim = daftarMahasiswa.some(function (mahasiswa) {
            return mahasiswa.nim === nim && mahasiswa.idMahasiswa !== idMahasiswa;
          });

          if (bentrokNim) {
            throw new Error("NIM mahasiswa sudah digunakan di kelas ini.");
          }

          if (!idMahasiswa && daftarMahasiswa.length >= BATAS_MAHASISWA_PER_KELAS) {
            throw new Error("Jumlah mahasiswa per kelas maksimal 50.");
          }

          const daftarMahasiswaBaru = idMahasiswa
            ? daftarMahasiswa.map(function (mahasiswa) {
                return mahasiswa.idMahasiswa === idMahasiswa
                  ? Object.assign({}, mahasiswa, {
                      nama: nama,
                      nim: nim,
                      diperbaruiPada: Date.now()
                    })
                  : mahasiswa;
              })
            : daftarMahasiswa.concat({
                idMahasiswa: buatId("mahasiswa"),
                nama: nama,
                nim: nim,
                dibuatPada: Date.now(),
                diperbaruiPada: Date.now(),
                daftarSemester: []
              });

          return Object.assign({}, kelas, {
            daftarMahasiswa: daftarMahasiswaBaru,
            diperbaruiPada: Date.now()
          });
        });

        simpanKelasPengguna(username, daftarKelas);
        resetFormMahasiswa();
        renderSemuaHalaman();
        tampilkanNotifikasi("Data mahasiswa berhasil disimpan.", "sukses");
      } catch (error) {
        tampilkanNotifikasi(error.message, "gagal");
      }
    });

    document.getElementById("pilihanKelasSemester").addEventListener("change", function () {
      resetFormSemester();
      renderSemester();
    });

    document.getElementById("pilihanMahasiswaSemester").addEventListener("change", function () {
      resetFormSemester();
      renderSemester();
    });

    document.getElementById("pilihanKelasHasil").addEventListener("change", function () {
      renderHasil();
    });

    document.getElementById("pilihanMahasiswaHasil").addEventListener("change", function () {
      renderHasil();
    });

    document.getElementById("tombolTambahMataKuliah").addEventListener("click", function () {
      tambahBarisMataKuliah();
    });

    document.getElementById("tombolResetFormSemester").addEventListener("click", function () {
      resetFormSemester();
    });

    document.getElementById("formSemester").addEventListener("submit", function (event) {
      event.preventDefault();
      const username = ambilSesiAktif();
      const idKelas = document.getElementById("pilihanKelasSemester").value;
      const idMahasiswa = document.getElementById("pilihanMahasiswaSemester").value;
      const idSemester = document.getElementById("idSemesterTersembunyi").value;
      const nomorSemester = Number(document.getElementById("inputNomorSemester").value);

      try {
        if (!idKelas || !idMahasiswa) {
          throw new Error("Pilih kelas dan mahasiswa terlebih dahulu.");
        }

        if (!Number.isFinite(nomorSemester) || nomorSemester < 1 || nomorSemester > BATAS_SEMESTER) {
          throw new Error("Nomor semester wajib diisi antara 1 sampai 14.");
        }

        const daftarMataKuliah = Array.from(document.querySelectorAll("#daftarMataKuliahForm .baris-mata-kuliah")).map(function (baris) {
          const namaMataKuliah = baris.querySelector(".input-nama-mata-kuliah").value.trim();
          const sks = Number(baris.querySelector(".input-sks-mata-kuliah").value);
          const nilaiHuruf = baris.querySelector(".input-nilai-mata-kuliah").value;

          if (!namaMataKuliah) {
            throw new Error("Nama mata kuliah wajib diisi.");
          }

          if (!Number.isFinite(sks) || sks <= 0 || Math.floor(sks) !== sks) {
            throw new Error("SKS harus berupa bilangan bulat positif.");
          }

          if (!PETA_BOBOT_NILAI.hasOwnProperty(nilaiHuruf)) {
            throw new Error("Nilai hanya boleh A, B, C, D, atau E.");
          }

          return {
            idMataKuliah: buatId("mata-kuliah"),
            namaMataKuliah: namaMataKuliah,
            sks: sks,
            nilaiHuruf: nilaiHuruf
          };
        });

        if (!daftarMataKuliah.length) {
          throw new Error("Minimal satu mata kuliah harus diisi.");
        }

        if (daftarMataKuliah.length > BATAS_MATA_KULIAH) {
          throw new Error("Jumlah mata kuliah per semester maksimal 9.");
        }

        let infoResetTimer = false;
        let daftarKelas = ambilKelasPengguna(username);
        daftarKelas = daftarKelas.map(function (kelas) {
          if (kelas.idKelas !== idKelas) {
            return kelas;
          }

          const daftarMahasiswaBaru = (kelas.daftarMahasiswa || []).map(function (mahasiswa) {
            if (mahasiswa.idMahasiswa !== idMahasiswa) {
              return mahasiswa;
            }

            const daftarSemester = mahasiswa.daftarSemester || [];
            const semesterBentrok = daftarSemester.some(function (semester) {
              return Number(semester.nomorSemester) === nomorSemester && semester.idSemester !== idSemester;
            });

            if (semesterBentrok) {
              throw new Error("Nomor semester sudah digunakan untuk mahasiswa ini.");
            }

            const semesterLama = daftarSemester.find(function (semester) {
              return semester.idSemester === idSemester;
            }) || null;

            if (!idSemester && daftarSemester.length >= BATAS_SEMESTER) {
              throw new Error("Jumlah semester maksimal 14.");
            }

            let daftarSemesterBaru;
            if (semesterLama) {
              const jumlahEditBaru = Number(semesterLama.jumlahEdit || 0) + 1;
              infoResetTimer = jumlahEditBaru >= 3;
              daftarSemesterBaru = daftarSemester.map(function (semester) {
                if (semester.idSemester !== idSemester) {
                  return semester;
                }

                return {
                  idSemester: semester.idSemester,
                  nomorSemester: nomorSemester,
                  daftarMataKuliah: daftarMataKuliah,
                  jumlahEdit: jumlahEditBaru >= 3 ? 0 : jumlahEditBaru,
                  dibuatPada: semester.dibuatPada,
                  diperbaruiPada: Date.now()
                };
              });
            } else {
              daftarSemesterBaru = daftarSemester.concat({
                idSemester: buatId("semester"),
                nomorSemester: nomorSemester,
                daftarMataKuliah: daftarMataKuliah,
                jumlahEdit: 0,
                dibuatPada: Date.now(),
                diperbaruiPada: Date.now()
              });
            }

            return Object.assign({}, mahasiswa, {
              daftarSemester: daftarSemesterBaru,
              diperbaruiPada: Date.now()
            });
          });

          const kelasBaru = Object.assign({}, kelas, {
            daftarMahasiswa: daftarMahasiswaBaru,
            diperbaruiPada: Date.now()
          });

          if (!kelasBaru.kedaluwarsaPada) {
            kelasBaru.kedaluwarsaPada = Date.now() + DURASI_ENAM_JAM;
          }

          if (infoResetTimer) {
            kelasBaru.kedaluwarsaPada = Date.now() + DURASI_ENAM_JAM;
          }

          return kelasBaru;
        });

        simpanKelasPengguna(username, daftarKelas);
        resetFormSemester();
        renderSemuaHalaman();
        tampilkanNotifikasi(infoResetTimer ? "Edit ke-3 tercapai. Timer kelas di-reset menjadi 6 jam lagi." : "Data semester berhasil disimpan.", "sukses");
      } catch (error) {
        tampilkanNotifikasi(error.message, "gagal");
      }
    });

    elemen.daftarKelasManajemen.addEventListener("click", function (event) {
      const tombol = event.target.closest("[data-aksi]");
      if (!tombol) {
        return;
      }

      const username = ambilSesiAktif();
      const aksi = tombol.getAttribute("data-aksi");
      const idKelas = tombol.getAttribute("data-id-kelas");
      const idMahasiswa = tombol.getAttribute("data-id-mahasiswa");

      try {
        if (aksi === "edit-kelas") {
          isiFormEditKelas(idKelas);
          return;
        }

        if (aksi === "hapus-kelas") {
          const daftarKelas = ambilKelasPengguna(username).filter(function (kelas) {
            return kelas.idKelas !== idKelas;
          });
          simpanKelasPengguna(username, daftarKelas);
          resetFormKelas();
          resetFormMahasiswa();
          renderSemuaHalaman();
          tampilkanNotifikasi("Kelas beserta seluruh mahasiswa dan semester di dalamnya berhasil dihapus.", "peringatan");
          return;
        }

        if (aksi === "edit-mahasiswa") {
          isiFormEditMahasiswa(idKelas, idMahasiswa);
          return;
        }

        if (aksi === "hapus-mahasiswa") {
          const daftarKelas = ambilKelasPengguna(username).map(function (kelas) {
            if (kelas.idKelas !== idKelas) {
              return kelas;
            }
            return Object.assign({}, kelas, {
              daftarMahasiswa: (kelas.daftarMahasiswa || []).filter(function (mahasiswa) {
                return mahasiswa.idMahasiswa !== idMahasiswa;
              }),
              diperbaruiPada: Date.now()
            });
          });
          simpanKelasPengguna(username, daftarKelas);
          resetFormMahasiswa();
          renderSemuaHalaman();
          tampilkanNotifikasi("Mahasiswa beserta data semester miliknya berhasil dihapus.", "peringatan");
          return;
        }

        if (aksi === "tambah-jam-kelas") {
          tambahJamKelas(username, idKelas, Number(tombol.getAttribute("data-tambahan")));
          renderSemuaHalaman();
          tampilkanNotifikasi("Waktu kedaluwarsa kelas berhasil ditambah.", "sukses");
        }
      } catch (error) {
        tampilkanNotifikasi(error.message, "gagal");
      }
    });

    elemen.daftarCountdownKelasDashboard.addEventListener("click", function (event) {
      const tombol = event.target.closest("[data-aksi='tambah-jam-kelas']");
      if (!tombol) {
        return;
      }

      tambahJamKelas(ambilSesiAktif(), tombol.getAttribute("data-id-kelas"), Number(tombol.getAttribute("data-tambahan")));
      renderSemuaHalaman();
      tampilkanNotifikasi("Waktu kedaluwarsa kelas berhasil ditambah.", "sukses");
    });

    elemen.daftarSemesterTersimpan.addEventListener("click", function (event) {
      const tombol = event.target.closest("[data-aksi]");
      if (!tombol) {
        return;
      }

      const username = ambilSesiAktif();
      const idKelas = document.getElementById("pilihanKelasSemester").value;
      const idMahasiswa = document.getElementById("pilihanMahasiswaSemester").value;
      const aksi = tombol.getAttribute("data-aksi");
      const idSemester = tombol.getAttribute("data-id-semester");
      const idMataKuliah = tombol.getAttribute("data-id-mata-kuliah");

      try {
        if (aksi === "edit-semester") {
          isiFormEditSemester(idSemester);
          return;
        }

        let infoResetTimer = false;

        const daftarKelas = ambilKelasPengguna(username).map(function (kelas) {
          if (kelas.idKelas !== idKelas) {
            return kelas;
          }

          const daftarMahasiswaBaru = (kelas.daftarMahasiswa || []).map(function (mahasiswa) {
            if (mahasiswa.idMahasiswa !== idMahasiswa) {
              return mahasiswa;
            }

            if (aksi === "hapus-semester") {
              const semesterTarget = (mahasiswa.daftarSemester || []).find(function (semester) {
                return semester.idSemester === idSemester;
              });

              if (!semesterTarget) {
                throw new Error("Semester tidak ditemukan.");
              }

              const jumlahEditBaru = Number(semesterTarget.jumlahEdit || 0) + 1;
              infoResetTimer = jumlahEditBaru >= 3;

              return Object.assign({}, mahasiswa, {
                daftarSemester: (mahasiswa.daftarSemester || []).filter(function (semester) {
                  return semester.idSemester !== idSemester;
                }),
                diperbaruiPada: Date.now()
              });
            }

            if (aksi === "hapus-mata-kuliah") {
              const daftarSemesterBaru = (mahasiswa.daftarSemester || []).map(function (semester) {
                if (semester.idSemester !== idSemester) {
                  return semester;
                }

                const daftarMataKuliahBaru = (semester.daftarMataKuliah || []).filter(function (mataKuliah) {
                  return mataKuliah.idMataKuliah !== idMataKuliah;
                });

                if (daftarMataKuliahBaru.length === semester.daftarMataKuliah.length) {
                  throw new Error("Mata kuliah tidak ditemukan.");
                }

                if (!daftarMataKuliahBaru.length) {
                  throw new Error("Semester harus memiliki minimal satu mata kuliah. Hapus semester jika ingin menghapus semuanya.");
                }

                const jumlahEditBaru = Number(semester.jumlahEdit || 0) + 1;
                infoResetTimer = jumlahEditBaru >= 3;

                return Object.assign({}, semester, {
                  daftarMataKuliah: daftarMataKuliahBaru,
                  jumlahEdit: jumlahEditBaru >= 3 ? 0 : jumlahEditBaru,
                  diperbaruiPada: Date.now()
                });
              });

              return Object.assign({}, mahasiswa, {
                daftarSemester: daftarSemesterBaru,
                diperbaruiPada: Date.now()
              });
            }

            return mahasiswa;
          });

          const kelasBaru = Object.assign({}, kelas, {
            daftarMahasiswa: daftarMahasiswaBaru,
            diperbaruiPada: Date.now()
          });

          if (infoResetTimer) {
            kelasBaru.kedaluwarsaPada = Date.now() + DURASI_ENAM_JAM;
          }

          return kelasBaru;
        });

        simpanKelasPengguna(username, daftarKelas);
        resetFormSemester();
        renderSemuaHalaman();

        if (aksi === "hapus-semester") {
          tampilkanNotifikasi(infoResetTimer ? "Semester dihapus dan timer kelas di-reset setelah edit ke-3." : "Semester berhasil dihapus.", infoResetTimer ? "sukses" : "peringatan");
        } else {
          tampilkanNotifikasi(infoResetTimer ? "Mata kuliah dihapus dan timer kelas di-reset setelah edit ke-3." : "Mata kuliah berhasil dihapus.", infoResetTimer ? "sukses" : "peringatan");
        }
      } catch (error) {
        tampilkanNotifikasi(error.message, "gagal");
      }
    });

    elemen.daftarAccordionSemester.addEventListener("click", function (event) {
      const tombol = event.target.closest("[data-aksi='buka-akordeon']");
      if (!tombol) {
        return;
      }

      const panel = document.getElementById(tombol.getAttribute("data-target-panel"));
      if (panel) {
        panel.classList.toggle("aktif");
      }
    });
  }

  function mulaiAplikasi() {
    terapkanTema(ambilTemaTersimpan());
    aktifkanAnimasiJudul();
    mulaiAnimasiKetikan();
    inisialisasiEvent();
    isiLoginDariAkunDiingat();
    resetFormKelas();
    resetFormMahasiswa();
    resetFormSemester();

    if (ambilSesiAktif()) {
      tampilkanHalamanAplikasi("dashboard");
    } else {
      tampilkanTampilan("landing");
    }
  }

  return {
    mulaiAplikasi: mulaiAplikasi
  };
})();

AplikasiIPgrade.mulaiAplikasi();


