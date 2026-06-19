const AplikasiIPgrade = (function () {
  const apiBackend = window.IPgradeAPI || null;
  const KUNCI_AKUN = "ipgrade_akun";
  const KUNCI_SESI = "ipgrade_sesi";
  const KUNCI_KELAS = "ipgrade_kelas";
  const KUNCI_PROFIL = "ipgrade_profil";
  const KUNCI_SIDEBAR_CIUT = "ipgrade_sidebar_ciut";
  const KUNCI_TEMA = "ipgrade_tema";
  const DURASI_SATU_HARI = 24 * 60 * 60 * 1000;
  const BATAS_KELAS_DASHBOARD = 5;
  const BATAS_MAHASISWA_PER_KELAS = 50;
  const BATAS_SEMESTER = 14;
  const BATAS_MATA_KULIAH = 9;
  const PETA_BOBOT_NILAI = { A: 4, B: 3, C: 2, D: 1, E: 0 };
  const PILIHAN_TAMBAH_HARI = [
    { label: "Tambah 1 Hari", nilai: DURASI_SATU_HARI },
    { label: "Tambah 3 Hari", nilai: 3 * DURASI_SATU_HARI }
  ];

  const elemen = {
    tampilanLanding: document.getElementById("tampilanLanding"),
    tampilanAutentikasi: document.getElementById("tampilanAutentikasi"),
    tampilanProfil: document.getElementById("tampilanProfil"),
    tampilanAplikasi: document.getElementById("tampilanAplikasi"),
    sidebarAplikasi: document.getElementById("sidebarAplikasi"),
    areaScrollAplikasi: document.getElementById("areaScrollAplikasi"),
    kontainerNotifikasi: document.getElementById("kontainerNotifikasi"),
    tombolTemaGlobal: document.getElementById("tombolTemaGlobal"),
    labelTemaGlobal: document.getElementById("labelTemaGlobal"),
    teksKetikanIndex: document.getElementById("teksKetikanIndex"),
    pilihanLoginAwal: document.getElementById("pilihanLoginAwal"),
    formEmailLogin: document.getElementById("formEmailLogin"),
    formLogin: document.getElementById("formLogin"),
    formRegister: document.getElementById("formRegister"),
    formProfil: document.getElementById("formProfil"),
    inputEmailLogin: document.getElementById("inputEmailLogin"),
    loginPassword: document.getElementById("loginPassword"),
    registerEmail: document.getElementById("registerEmail"),
    teksEmailLoginAktif: document.getElementById("teksEmailLoginAktif"),
    teksAkunBelumAda: document.getElementById("teksAkunBelumAda"),
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
    intervalCountdown: null,
    emailAuthAktif: ""
  };

  const IKON_SVG = {
    "dashboard": `<svg class="ikon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <g stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M7 30 L32 9 L57 30" fill="none"/>
    <path d="M13 28 V56 H51 V28 L32 13 Z" fill="var(--icon-primary, #A3E635)"/>
    <path d="M14 18 V28" fill="none"/>
    <path d="M25 22 H31 V29 H25 Z" fill="var(--icon-surface, #FFFFFF)"/>
    <path d="M35 22 H41 V29 H35 Z" fill="var(--icon-surface, #FFFFFF)"/>
    <path d="M20 36 H31 V45 H20 Z" fill="var(--icon-accent, #FACC15)"/>
    <path d="M35 36 H46 V45 H35 Z" fill="var(--icon-secondary, #38BDF8)"/>
    <path d="M20 48 H31 V56 H20 Z" fill="var(--icon-secondary, #38BDF8)"/>
    <path d="M35 48 H46 V56 H35 Z" fill="var(--icon-accent, #FB923C)"/>
  </g>
</svg>`,
    "manajemen-kelas": `<svg class="ikon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <g stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 18 H25 L32 25 H55 V50 H8 Z" fill="var(--icon-accent, #FBBF24)"/>
    <path d="M11 28 H57 L51 54 H7 Z" fill="var(--icon-surface, #FDE68A)"/>
    <circle cx="27" cy="39" r="6" fill="var(--icon-surface, #FFFFFF)"/>
    <circle cx="40" cy="37" r="6" fill="var(--icon-surface, #FFFFFF)"/>
    <path d="M17 52 C18 44 22 40 27 40 C32 40 36 44 37 52 Z" fill="var(--icon-surface, #FFFFFF)"/>
    <path d="M34 50 C35 43 38 39 43 39 C48 39 52 43 53 50 Z" fill="var(--icon-surface, #FFFFFF)"/>
  </g>
</svg>`,
    "data-semester": `<svg class="ikon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <g stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 17 H20 C25 17 29 19 32 23 C35 19 39 17 44 17 H55 V51 H43 C38 51 35 53 32 56 C29 53 26 51 21 51 H9 Z" fill="var(--icon-primary, #84CC16)"/>
    <path d="M14 11 H25 C29 11 31 13 32 16 V51 C30 49 27 48 23 48 H14 Z" fill="var(--icon-surface, #FFFFFF)"/>
    <path d="M50 11 H39 C35 11 33 13 32 16 V51 C34 49 37 48 41 48 H50 Z" fill="var(--icon-surface, #FFFFFF)"/>
    <path d="M20 23 H29"/>
    <path d="M20 32 H29"/>
    <path d="M20 41 H27"/>
    <path d="M38 22 H43 L47 18"/>
    <path d="M38 32 H43 L48 27"/>
    <path d="M38 42 H43 L48 37"/>
  </g>
</svg>`,
    "hasil": `<svg class="ikon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <g stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M7 55 H57"/>
    <path d="M13 55 V41 H24 V55 Z" fill="var(--icon-surface, #FFFFFF)"/>
    <path d="M30 55 V31 H41 V55 Z" fill="var(--icon-surface, #FFFFFF)"/>
    <path d="M47 55 V22 H58 V55 Z" fill="var(--icon-surface, #FFFFFF)"/>
    <path d="M12 32 L26 18 L39 30 L56 10" fill="none"/>
    <path d="M48 10 H56 V18" fill="var(--icon-accent, #F97316)"/>
  </g>
</svg>`,
    "light-mode": `<svg class="ikon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <g stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="32" cy="32" r="12" fill="var(--icon-accent, #FCD34D)"/>
    <path d="M32 6 V16"/>
    <path d="M32 48 V58"/>
    <path d="M6 32 H16"/>
    <path d="M48 32 H58"/>
    <path d="M13 13 L20 20"/>
    <path d="M44 44 L51 51"/>
    <path d="M51 13 L44 20"/>
    <path d="M20 44 L13 51"/>
  </g>
</svg>`,
    "dark-mode": `<svg class="ikon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <g stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M47 7 C38 10 31 19 31 30 C31 43 41 53 55 54 C49 60 40 62 31 59 C18 55 9 43 11 29 C13 15 26 5 40 6 C43 6 45 7 47 7 Z" fill="var(--icon-primary, #60A5FA)"/>
    <path d="M43 18 C38 25 38 34 44 42 C39 40 35 35 35 29 C35 24 38 20 43 18 Z" fill="var(--icon-surface, #FFFFFF)" stroke="none"/>
  </g>
</svg>`,
    "logout": `<svg class="ikon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <g stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 12 H40 V24" fill="none"/>
    <path d="M40 40 V52 H13 V12" fill="none"/>
    <path d="M27 32 H55" fill="none"/>
    <path d="M45 22 L55 32 L45 42" fill="none"/>
  </g>
</svg>`
  };

  function buatIkonSvg(namaIkon, kelasTambahan) {
    const svg = IKON_SVG[namaIkon];
    const kelas = String(kelasTambahan || "").replace(/[^a-z0-9_-]/gi, " ").trim();

    if (!svg) {
      return "";
    }

    return kelas ? svg.replace('class="ikon-svg"', 'class="ikon-svg ' + kelas + '"') : svg;
  }


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

  function normalisasiEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function buatKunciAkun(provider, email) {
    return provider + ":" + normalisasiEmail(email);
  }

  function normalisasiAkun(akunLama) {
    const akun = akunLama || {};
    const provider = akun.provider || (akun.email ? "email" : "legacy");
    const email = normalisasiEmail(akun.email || (provider === "email" ? akun.username : ""));
    const kunciAkun = akun.kunciAkun || (provider === "legacy" ? String(akun.username || "").trim() : buatKunciAkun(provider, email));

    return Object.assign({}, akun, {
      idAkun: akun.idAkun || buatId("akun"),
      username: akun.username || email || kunciAkun,
      email: email,
      provider: provider,
      kunciAkun: kunciAkun
    });
  }

  function ambilSemuaAkun() {
    if (apiBackend) {
      return apiBackend.keadaan.user ? [Object.assign({ provider: "email", kunciAkun: apiBackend.keadaan.user.email }, apiBackend.keadaan.user)] : [];
    }

    const daftarAkun = bacaJson(KUNCI_AKUN, []);
    const daftarTernormalisasi = daftarAkun.map(normalisasiAkun);

    if (JSON.stringify(daftarAkun) !== JSON.stringify(daftarTernormalisasi)) {
      simpanSemuaAkun(daftarTernormalisasi);
    }

    return daftarTernormalisasi;
  }

  function simpanSemuaAkun(daftarAkun) {
    if (apiBackend) {
      return;
    }
    simpanJson(KUNCI_AKUN, daftarAkun);
  }

  function ambilSesiAktif() {
    if (apiBackend) {
      return apiBackend.ambilToken() ? ((apiBackend.keadaan.user && apiBackend.keadaan.user.email) || "__backend__") : "";
    }
    return String(localStorage.getItem(KUNCI_SESI) || "").trim();
  }

  function simpanSesiAktif(username) {
    if (apiBackend) {
      return;
    }
    localStorage.setItem(KUNCI_SESI, username);
  }

  function hapusSesiAktif() {
    if (apiBackend) {
      apiBackend.hapusToken();
    }
    localStorage.removeItem(KUNCI_SESI);
  }

  function ambilSemuaProfil() {
    if (apiBackend) {
      const user = apiBackend.keadaan.user;
      if (!user) {
        return {};
      }
      return {
        [user.email]: {
          nama: user.nama || user.name || "",
          nim: user.nim || "",
          kelas: user.kelas || user.class_name || "",
          dibuatPada: user.created_at || Date.now(),
          diperbaruiPada: user.updated_at || Date.now()
        }
      };
    }
    return bacaJson(KUNCI_PROFIL, {});
  }

  function simpanSemuaProfil(daftarProfil) {
    if (apiBackend) {
      return;
    }
    simpanJson(KUNCI_PROFIL, daftarProfil);
  }

  function ambilProfilPengguna(kunciAkun) {
    const semuaProfil = ambilSemuaProfil();
    return semuaProfil[kunciAkun] || {};
  }

  function simpanProfilPengguna(kunciAkun, profil) {
    if (apiBackend) {
      apiBackend.keadaan.user = Object.assign({}, apiBackend.keadaan.user || {}, {
        nama: profil.nama,
        name: profil.nama,
        nim: profil.nim,
        kelas: profil.kelas,
        class_name: profil.kelas
      });
      return;
    }
    const semuaProfil = ambilSemuaProfil();
    semuaProfil[kunciAkun] = Object.assign({}, semuaProfil[kunciAkun] || {}, profil, {
      diperbaruiPada: Date.now()
    });
    simpanSemuaProfil(semuaProfil);
  }

  function ambilSemuaKelas() {
    if (apiBackend) {
      return {
        [ambilSesiAktif()]: apiBackend.keadaan.classes || []
      };
    }
    return bacaJson(KUNCI_KELAS, {});
  }

  function simpanSemuaKelas(dataKelas) {
    if (apiBackend) {
      const daftarKelas = dataKelas[ambilSesiAktif()] || [];
      apiBackend.keadaan.classes = daftarKelas;
      return apiBackend.syncClasses(daftarKelas);
    }
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
    if (apiBackend) {
      const daftarTernormalisasi = daftarKelas.map(normalisasiKelas);
      apiBackend.keadaan.classes = daftarTernormalisasi;
      return apiBackend.syncClasses(daftarTernormalisasi);
    }
    const semuaKelas = ambilSemuaKelas();
    semuaKelas[username] = daftarKelas;
    simpanSemuaKelas(semuaKelas);
  }

  function cariAkun(identitas) {
    if (apiBackend) {
      const user = apiBackend.keadaan.user;
      if (!user) {
        return null;
      }
      const targetBackend = String(identitas || "").trim().toLowerCase();
      return normalisasiEmail(user.email) === targetBackend || String(user.username || "").trim().toLowerCase() === targetBackend
        ? Object.assign({ provider: "email", kunciAkun: user.email }, user)
        : null;
    }

    const target = String(identitas || "").trim().toLowerCase();
    return ambilSemuaAkun().find(function (akun) {
      return String(akun.kunciAkun || "").trim().toLowerCase() === target ||
        normalisasiEmail(akun.email) === target ||
        String(akun.username || "").trim().toLowerCase() === target;
    }) || null;
  }

  function akunSudahTerdaftar(email) {
    return Boolean(cariAkun(normalisasiEmail(email)));
  }

  function ambilAkunAktif() {
    if (apiBackend) {
      const user = apiBackend.keadaan.user;
      return user ? Object.assign({ provider: "email", kunciAkun: user.email }, user) : null;
    }
    return cariAkun(ambilSesiAktif());
  }

  function profilAktifLengkap() {
    if (apiBackend) {
      const user = apiBackend.keadaan.user;
      return Boolean(user && String(user.nama || user.name || "").trim());
    }
    const kunciAkun = ambilSesiAktif();
    const profil = ambilProfilPengguna(kunciAkun);
    return Boolean(String(profil.nama || "").trim());
  }

  function ambilNamaTampilPengguna(kunciAkun) {
    if (apiBackend) {
      const user = apiBackend.keadaan.user;
      return String((user && (user.nama || user.name || user.email)) || "-").trim();
    }
    const profil = ambilProfilPengguna(kunciAkun);
    const akun = cariAkun(kunciAkun);
    return String(profil.nama || (akun && (akun.email || akun.username)) || kunciAkun || "-").trim();
  }

  function ambilTemaTersimpan() {
    const tema = localStorage.getItem(KUNCI_TEMA);
    return tema === "terang" ? "terang" : "gelap";
  }

  function terapkanTema(tema) {
    const temaAktif = tema === "terang" ? "terang" : "gelap";
    const dataTema = temaAktif === "terang" ? "light" : "dark";
    document.body.classList.toggle("tema-terang", temaAktif === "terang");
    document.body.classList.toggle("tema-gelap", temaAktif === "gelap");
    document.body.dataset.theme = dataTema;
    document.documentElement.dataset.theme = dataTema;
    localStorage.setItem(KUNCI_TEMA, temaAktif);

    if (elemen.labelTemaGlobal) {
      elemen.labelTemaGlobal.innerHTML = buatIkonSvg(temaAktif === "terang" ? "light-mode" : "dark-mode", "ikon-tema");
    }

    if (elemen.tombolTemaGlobal) {
      elemen.tombolTemaGlobal.setAttribute("aria-label", temaAktif === "gelap" ? "Tema aktif mode gelap. Ganti ke mode terang" : "Tema aktif mode terang. Ganti ke mode gelap");
      elemen.tombolTemaGlobal.setAttribute("aria-pressed", temaAktif === "gelap" ? "true" : "false");
    }
  }

  function ambilTitikTransisiTema(event) {
    if (event && event.currentTarget) {
      const kotakTombol = event.currentTarget.getBoundingClientRect();
      return {
        x: kotakTombol.left + kotakTombol.width / 2,
        y: kotakTombol.top + kotakTombol.height / 2
      };
    }

    return {
      x: 36,
      y: 36
    };
  }

  function perbaruiTemaAktif(temaBaru) {
    terapkanTema(temaBaru);
    if (ambilSesiAktif()) {
      renderSidebar(keadaan.halamanAktif);
    }

    if (keadaan.halamanAktif === "hasil") {
      renderHasil();
    }
  }

  function ubahTema(event) {
    const temaBaru = ambilTemaTersimpan() === "gelap" ? "terang" : "gelap";
    const titikTransisi = ambilTitikTransisiTema(event);
    const kurangiGerak = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.documentElement.style.setProperty("--tema-x", titikTransisi.x + "px");
    document.documentElement.style.setProperty("--tema-y", titikTransisi.y + "px");

    if (!document.startViewTransition || kurangiGerak) {
      perbaruiTemaAktif(temaBaru);
      return;
    }

    document.documentElement.classList.add("transisi-tema-wave");

    const transisiTema = document.startViewTransition(function () {
      perbaruiTemaAktif(temaBaru);
    });

    transisiTema.finished.finally(function () {
      document.documentElement.classList.remove("transisi-tema-wave");
    });
  }

  function ambilWarnaGrafik() {
    const modeTerang = ambilTemaTersimpan() === "terang";
    return {
      areaAwal: modeTerang ? "rgba(14, 165, 233, 0.28)" : "rgba(96, 165, 250, 0.26)",
      areaAkhir: modeTerang ? "rgba(249, 115, 22, 0.14)" : "rgba(45, 212, 191, 0.12)",
      garis: modeTerang ? "#65A30D" : "#60A5FA",
      titik: modeTerang ? "#F97316" : "#FBBF24",
      batasTitik: modeTerang ? "#111827" : "#F9FAFB",
      teks: modeTerang ? "#111827" : "#F9FAFB",
      grid: modeTerang ? "rgba(17, 24, 39, 0.18)" : "rgba(249, 250, 251, 0.18)"
    };
  }

  function tampilkanLangkahAuth(langkahAktif) {
    [
      { nama: "awal", panel: elemen.pilihanLoginAwal },
      { nama: "email", panel: elemen.formEmailLogin },
      { nama: "login", panel: elemen.formLogin },
      { nama: "register", panel: elemen.formRegister }
    ].forEach(function (item) {
      if (item.panel) {
        item.panel.classList.toggle("tersembunyi", item.nama !== langkahAktif);
      }
    });
  }

  function resetTombolLihatPassword() {
    Array.from(document.querySelectorAll(".tombol-lihat-password")).forEach(function (tombol) {
      const input = document.getElementById(tombol.getAttribute("data-target-password"));
      if (input) {
        input.type = "password";
      }
      tombol.textContent = "Lihat";
    });
  }

  function isiLoginDariAkunDiingat() {
    keadaan.emailAuthAktif = "";
    if (elemen.formEmailLogin) {
      elemen.formEmailLogin.reset();
    }
    if (elemen.formLogin) {
      elemen.formLogin.reset();
    }
    if (elemen.formRegister) {
      elemen.formRegister.reset();
    }
    if (elemen.teksAkunBelumAda) {
      elemen.teksAkunBelumAda.classList.add("tersembunyi");
    }
    resetTombolLihatPassword();
    tampilkanLangkahAuth("awal");
  }

  async function migrasiDataLokalJikaAda() {
    if (!apiBackend || !apiBackend.keadaan.user) {
      return;
    }

    const email = normalisasiEmail(apiBackend.keadaan.user.email);
    const kunciLegacy = buatKunciAkun("email", email);
    const semuaKelasLegacy = bacaJson(KUNCI_KELAS, {});
    const daftarKelasLegacy = semuaKelasLegacy[email] || semuaKelasLegacy[kunciLegacy] || [];

    if (!apiBackend.keadaan.classes.length && daftarKelasLegacy.length) {
      await apiBackend.syncClasses(daftarKelasLegacy.map(normalisasiKelas));
    }

    localStorage.removeItem(KUNCI_AKUN);
    localStorage.removeItem(KUNCI_KELAS);
    localStorage.removeItem(KUNCI_PROFIL);
    localStorage.removeItem(KUNCI_SESI);
  }

  function tampilkanInputEmail() {
    tampilkanLangkahAuth("email");
    window.requestAnimationFrame(function () {
      if (elemen.inputEmailLogin) {
        elemen.inputEmailLogin.focus();
      }
    });
  }

  function siapkanLoginEmail(email) {
    const emailNormal = normalisasiEmail(email);
    keadaan.emailAuthAktif = emailNormal;

    if (elemen.teksEmailLoginAktif) {
      elemen.teksEmailLoginAktif.textContent = emailNormal;
    }
    if (elemen.loginPassword) {
      elemen.loginPassword.value = "";
    }
    if (elemen.registerEmail) {
      elemen.registerEmail.value = emailNormal;
    }
    if (elemen.teksAkunBelumAda) {
      elemen.teksAkunBelumAda.classList.toggle("tersembunyi", akunSudahTerdaftar(emailNormal));
    }

    resetTombolLihatPassword();
    tampilkanLangkahAuth("login");
    window.requestAnimationFrame(function () {
      if (elemen.loginPassword) {
        elemen.loginPassword.focus();
      }
    });
  }

  function siapkanRegisterEmail(email) {
    const emailNormal = normalisasiEmail(email || keadaan.emailAuthAktif || (elemen.registerEmail && elemen.registerEmail.value));
    keadaan.emailAuthAktif = emailNormal;

    if (elemen.registerEmail) {
      elemen.registerEmail.value = emailNormal;
    }

    document.getElementById("registerPassword").value = "";
    document.getElementById("registerVerifikasi").value = "";
    resetTombolLihatPassword();
    tampilkanLangkahAuth("register");
    window.requestAnimationFrame(function () {
      const targetFokus = emailNormal ? document.getElementById("registerPassword") : elemen.registerEmail;
      if (targetFokus) {
        targetFokus.focus();
      }
    });
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

  function validasiEmail(email) {
    const emailNormal = normalisasiEmail(email);
    const polaEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!polaEmail.test(emailNormal)) {
      throw new Error("Masukkan email yang valid.");
    }

    return emailNormal;
  }

  function validasiPassword(password, verifikasiPassword) {
    if (!String(password || "").trim()) {
      throw new Error("Password wajib diisi.");
    }

    if (password !== verifikasiPassword) {
      throw new Error("Password dan verifikasi password harus sama.");
    }
  }

  function buatAkunEmail(email, password) {
    const emailNormal = validasiEmail(email);
    return {
      idAkun: buatId("akun"),
      kunciAkun: buatKunciAkun("email", emailNormal),
      provider: "email",
      username: emailNormal,
      email: emailNormal,
      password: password,
      dibuatPada: Date.now()
    };
  }

  function ambilAtauBuatAkunSosial(provider) {
    const emailDemo = provider === "google" ? "demo.google@ipgrade.local" : "demo.facebook@ipgrade.local";
    const kunciAkun = buatKunciAkun(provider, emailDemo);
    const akunAda = cariAkun(kunciAkun);

    if (akunAda) {
      return akunAda;
    }

    // TODO: Ganti simulasi localStorage ini dengan backend Django dan OAuth asli.
    const akunBaru = {
      idAkun: buatId("akun"),
      kunciAkun: kunciAkun,
      provider: provider,
      username: emailDemo,
      email: emailDemo,
      password: "",
      dibuatPada: Date.now()
    };
    const daftarAkun = ambilSemuaAkun();
    daftarAkun.push(akunBaru);
    simpanSemuaAkun(daftarAkun);
    return akunBaru;
  }

  function isiFormProfilAktif() {
    const kunciAkun = ambilSesiAktif();
    const profil = ambilProfilPengguna(kunciAkun);

    document.getElementById("inputNamaProfil").value = profil.nama || "";
    document.getElementById("inputNimProfil").value = profil.nim || "";
    document.getElementById("inputKelasProfil").value = profil.kelas || "";
  }

  function lanjutkanSetelahAutentikasi() {
    if (!ambilSesiAktif()) {
      tampilkanTampilan("autentikasi");
      return;
    }

    if (!profilAktifLengkap()) {
      isiFormProfilAktif();
      tampilkanTampilan("profil");
      return;
    }

    tampilkanHalamanAplikasi("dashboard");
  }

  function buatKelasBaru(namaKelas) {
    return {
      idKelas: buatId("kelas"),
      namaKelas: namaKelas,
      kedaluwarsaPada: Date.now() + DURASI_SATU_HARI,
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

    return simpanKelasPengguna(username, daftarBaru);
  }

  function resetTimerKelasKeSatuHari(username, idKelas) {
    const daftarKelas = ambilKelasPengguna(username);
    const daftarBaru = daftarKelas.map(function (kelas) {
      if (kelas.idKelas !== idKelas) {
        return kelas;
      }

      return Object.assign({}, kelas, {
        kedaluwarsaPada: Date.now() + DURASI_SATU_HARI,
        diperbaruiPada: Date.now()
      });
    });

    return simpanKelasPengguna(username, daftarBaru);
  }

  function renderSidebar(halamanAktif) {
    const kunciAkun = ambilSesiAktif();
    const akun = ambilAkunAktif();
    const profil = ambilProfilPengguna(kunciAkun);
    const namaTampil = ambilNamaTampilPengguna(kunciAkun);
    const detailTampil = profil.kelas || profil.nim || (akun && (akun.email || akun.username)) || kunciAkun;
    const temaAktif = ambilTemaTersimpan();
    const namaIkonTema = temaAktif === "terang" ? "light-mode" : "dark-mode";
    const ikonTema = buatIkonSvg(namaIkonTema, "ikon-tema");
    const labelTema = "<span class='teks-tema-sidebar'>Tema</span><span class='ikon-tema-sidebar' aria-hidden='true'>" + ikonTema + "</span>";
    const ariaTema = temaAktif === "gelap" ? "Tema aktif mode gelap. Ganti ke mode terang" : "Tema aktif mode terang. Ganti ke mode gelap";

    elemen.sidebarAplikasi.innerHTML = [
      "<div class='kepala-sidebar'>",
        "<div class='merek-sidebar'>",
          "<span class='logo-merek'>IP</span>",
          "<div class='teks-merek'>",
            "<strong>" + amankanHtml(namaTampil) + "</strong>",
            "<small>" + amankanHtml(detailTampil) + "</small>",
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
      "<div class='panel-tema-sidebar'>",
        "<button type='button' id='tombolTemaSidebar' class='tombol-tema-sidebar' aria-label='" + ariaTema + "'>" + labelTema + "</button>",
      "</div>",
      "<div class='aksi-sidebar'>",
        "<button type='button' id='tombolLogoutSidebar' class='tombol tombol-bahaya tombol-penuh'>",
          "<span class='ikon-logout-sidebar' aria-hidden='true'>" + buatIkonSvg("logout", "ikon-logout") + "</span>",
          "<span class='teks-logout-sidebar'>Logout</span>",
        "</button>",
      "</div>"
    ].join("");

    document.body.classList.toggle("sidebar-ciut", localStorage.getItem(KUNCI_SIDEBAR_CIUT) === "ya");

    document.getElementById("tombolCiutSidebar").addEventListener("click", function () {
      const sedangCiut = document.body.classList.toggle("sidebar-ciut");
      localStorage.setItem(KUNCI_SIDEBAR_CIUT, sedangCiut ? "ya" : "tidak");
    });

    document.getElementById("tombolTemaSidebar").addEventListener("click", function (event) {
      ubahTema(event);
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
    const daftarIkon = {
      dashboard: "dashboard",
      kelas: "manajemen-kelas",
      semester: "data-semester",
      hasil: "hasil"
    };
    const ikon = buatIkonSvg(daftarIkon[kode], "ikon-menu-gambar");

    return [
      "<button type='button' class='item-menu-sidebar " + (kode === halamanAktif ? "aktif" : "") + "' data-menu-aplikasi='" + kode + "' aria-label='" + label + "' title='" + label + "'>",
        "<span class='ikon-menu' aria-hidden='true'>" + ikon + "</span>",
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
    elemen.tampilanProfil.classList.toggle("tersembunyi", target !== "profil");
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

    if (!profilAktifLengkap()) {
      isiFormProfilAktif();
      tampilkanTampilan("profil");
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

    document.getElementById("namaPenggunaDashboard").textContent = ambilNamaTampilPengguna(username);
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
      elemen.daftarCountdownKelasDashboard.innerHTML = "<div class='keadaan-kosong'>Buat kelas baru dari menu Manajemen Kelas.</div>";
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
          PILIHAN_TAMBAH_HARI.map(function (opsi) {
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
      const daftarMahasiswa = kelas.daftarMahasiswa || [];
      const kelasScrollMahasiswa = daftarMahasiswa.length > 2 ? " daftar-mahasiswa-kelas-scroll" : "";

      return [
        "<article class='kartu-kelas-manajemen' data-id-kelas='" + kelas.idKelas + "'>",
          "<div class='kepala-kelas-manajemen'>",
            "<div>",
              "<span class='label-kartu'>" + amankanHtml(kelas.namaKelas) + "</span>",
              "<p class='teks-tipis'>" + daftarMahasiswa.length + "/" + BATAS_MAHASISWA_PER_KELAS + " mahasiswa</p>",
              "<p class='teks-tipis'>Countdown: <strong class='teks-waktu-kelas' data-teks-waktu-kelas='" + kelas.idKelas + "'>" + formatWaktuSisa(Math.max(0, kelas.kedaluwarsaPada - Date.now())) + "</strong></p>",
            "</div>",
            "<div class='baris-tombol-kecil'>",
              "<button type='button' class='tombol tombol-garis tombol-kecil' data-aksi='edit-kelas' data-id-kelas='" + kelas.idKelas + "'>Edit Kelas</button>",
              "<button type='button' class='tombol tombol-bahaya tombol-kecil' data-aksi='hapus-kelas' data-id-kelas='" + kelas.idKelas + "'>Hapus Kelas</button>",
            "</div>",
          "</div>",
          "<div class='grup-tambah-jam'>",
            PILIHAN_TAMBAH_HARI.map(function (opsi) {
              return "<button type='button' class='tombol tombol-garis tombol-mini' data-aksi='tambah-jam-kelas' data-id-kelas='" + kelas.idKelas + "' data-tambahan='" + opsi.nilai + "'>" + opsi.label + "</button>";
            }).join(""),
          "</div>",
          "<div class='daftar-mahasiswa-kelas" + kelasScrollMahasiswa + "'>",
            daftarMahasiswa.length
              ? daftarMahasiswa.map(function (mahasiswa) {
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
    pesanKosong.classList.add("tersembunyi");

    kontainerProfil.innerHTML = buatRingkasanHasilTerpilih(kelas, mahasiswa, ringkasan);
    kontainerStatistik.innerHTML = "";

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
          "<button type='button' class='tombol-akordeon' data-aksi='buka-akordeon' data-target-panel='" + idPanel + "' aria-controls='" + idPanel + "' aria-expanded='false'>",
            "<div class='kepala-akordeon-semester'>",
              "<div>",
                "<span class='label-kartu'>Semester " + semester.nomorSemester + "</span>",
                "<strong>IPS " + formatAngka(semester.ips) + "</strong>",
              "</div>",
              "<span class='teks-tipis'>" + semester.totalSksSemester + " SKS</span>",
            "</div>",
            "<span class='teks-tipis label-toggle-akordeon'>Buka detail</span>",
          "</button>",
          "<div id='" + idPanel + "' class='isi-akordeon' aria-hidden='true'>",
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

  function buatRingkasanHasilTerpilih(kelas, mahasiswa, ringkasan) {
    const jumlahSemester = ringkasan.daftarSemesterTerurut.length;
    const nilaiAkademik = jumlahSemester >= 2
      ? "<p><strong>IPK :</strong> " + formatAngka(ringkasan.ipk) + "</p>"
      : jumlahSemester === 1
        ? "<p><strong>IP :</strong> " + formatAngka(ringkasan.daftarSemesterTerurut[0].ips) + "</p>"
        : "<p class='status-ringkasan-hasil'>Belum ada data</p>";

    return [
      "<article class='kartu-identitas-hasil kartu-ringkasan-terpilih'>",
        "<div class='baris-meta-hasil'>",
          "<span><strong>Kelas:</strong> " + amankanHtml(kelas.namaKelas) + "</span>",
          "<span><strong>Jumlah SKS:</strong> " + ringkasan.totalSksKeseluruhan + "</span>",
          "<span><strong>Jumlah Semester:</strong> " + jumlahSemester + "</span>",
        "</div>",
        "<div class='baris-identitas-hasil'>",
          "<p><strong>Nama:</strong> " + amankanHtml(mahasiswa.nama) + "</p>",
          "<p><strong>NIM :</strong> " + amankanHtml(mahasiswa.nim) + "</p>",
          nilaiAkademik,
        "</div>",
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
    inisialisasiTab(document.getElementById("kontainerTabHasil"));

    if (elemen.tombolTemaGlobal) {
      elemen.tombolTemaGlobal.addEventListener("click", function (event) {
        ubahTema(event);
      });
    }

    document.getElementById("tombolMasukAutentikasi").addEventListener("click", function () {
      isiLoginDariAkunDiingat();
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

    document.getElementById("tombolMasukEmail").addEventListener("click", function () {
      tampilkanInputEmail();
    });

    Array.from(document.querySelectorAll("[data-auth-kembali]")).forEach(function (tombol) {
      tombol.addEventListener("click", function () {
        isiLoginDariAkunDiingat();
      });
    });

    document.getElementById("tombolLoginGoogle").addEventListener("click", function () {
      if (apiBackend) {
        tampilkanNotifikasi("Login Google demo dinonaktifkan untuk backend lokal. Gunakan login email.", "peringatan");
        return;
      }
      const akun = ambilAtauBuatAkunSosial("google");
      simpanSesiAktif(akun.kunciAkun);
      lanjutkanSetelahAutentikasi();
    });

    document.getElementById("tombolLoginFacebook").addEventListener("click", function () {
      if (apiBackend) {
        tampilkanNotifikasi("Login Facebook demo dinonaktifkan untuk backend lokal. Gunakan login email.", "peringatan");
        return;
      }
      const akun = ambilAtauBuatAkunSosial("facebook");
      simpanSesiAktif(akun.kunciAkun);
      lanjutkanSetelahAutentikasi();
    });

    elemen.formEmailLogin.addEventListener("submit", function (event) {
      event.preventDefault();

      try {
        siapkanLoginEmail(validasiEmail(elemen.inputEmailLogin.value));
      } catch (error) {
        tampilkanNotifikasi(error.message, "gagal");
      }
    });

    document.getElementById("tombolUbahEmailLogin").addEventListener("click", function () {
      tampilkanInputEmail();
    });

    document.getElementById("tombolBukaRegister").addEventListener("click", function () {
      siapkanRegisterEmail(keadaan.emailAuthAktif);
    });

    elemen.formLogin.addEventListener("submit", async function (event) {
      event.preventDefault();
      const password = document.getElementById("loginPassword").value;

      try {
        const email = validasiEmail(keadaan.emailAuthAktif);
        if (apiBackend) {
          await apiBackend.login(email, password);
          await migrasiDataLokalJikaAda();
          lanjutkanSetelahAutentikasi();
          return;
        }

        const akun = cariAkun(email);

        if (!String(password || "").trim()) {
          throw new Error("Password wajib diisi.");
        }

        if (!akun) {
          throw new Error("Akun belum terdaftar. Pilih Daftar untuk membuat akun.");
        }

        if (akun.provider !== "email") {
          throw new Error("Akun ini dibuat lewat login sosial. Gunakan tombol sosial yang sesuai.");
        }

        if (akun.password !== password) {
          throw new Error("Login gagal. Periksa kembali email dan password.");
        }

        simpanSesiAktif(akun.kunciAkun);
        lanjutkanSetelahAutentikasi();
      } catch (error) {
        tampilkanNotifikasi(error.message, "gagal");
      }
    });

    elemen.formRegister.addEventListener("submit", async function (event) {
      event.preventDefault();
      const email = document.getElementById("registerEmail").value;
      const password = document.getElementById("registerPassword").value;
      const verifikasiPassword = document.getElementById("registerVerifikasi").value;

      try {
        const emailNormal = validasiEmail(email);
        validasiPassword(password, verifikasiPassword);

        if (apiBackend) {
          await apiBackend.register(emailNormal, password);
          await migrasiDataLokalJikaAda();
          lanjutkanSetelahAutentikasi();
          return;
        }

        if (akunSudahTerdaftar(emailNormal)) {
          throw new Error("Akun dengan email ini sudah ada. Login dengan password akun tersebut.");
        }

        const akunBaru = buatAkunEmail(emailNormal, password);
        const daftarAkun = ambilSemuaAkun();
        daftarAkun.push(akunBaru);
        simpanSemuaAkun(daftarAkun);
        simpanSesiAktif(akunBaru.kunciAkun);
        lanjutkanSetelahAutentikasi();
      } catch (error) {
        tampilkanNotifikasi(error.message, "gagal");
      }
    });

    elemen.formProfil.addEventListener("submit", async function (event) {
      event.preventDefault();
      const kunciAkun = ambilSesiAktif();
      const nama = document.getElementById("inputNamaProfil").value.trim();
      const nim = document.getElementById("inputNimProfil").value.trim();
      const kelas = document.getElementById("inputKelasProfil").value.trim();

      try {
        if (!kunciAkun) {
          throw new Error("Sesi tidak ditemukan. Silakan login ulang.");
        }

        if (!nama) {
          throw new Error("Nama wajib diisi.");
        }

        const profilBaru = {
          nama: nama,
          nim: nim,
          kelas: kelas,
          dibuatPada: ambilProfilPengguna(kunciAkun).dibuatPada || Date.now()
        };
        if (apiBackend) {
          await apiBackend.updateProfile(profilBaru);
        } else {
          simpanProfilPengguna(kunciAkun, profilBaru);
        }
        tampilkanHalamanAplikasi("dashboard");
      } catch (error) {
        tampilkanNotifikasi(error.message, "gagal");
      }
    });

    document.getElementById("tombolLogoutProfil").addEventListener("click", function () {
      hapusSesiAktif();
      tampilkanTampilan("autentikasi");
      tampilkanNotifikasi("Kamu sudah logout dari IPgrade.", "peringatan");
    });

    document.getElementById("formKelas").addEventListener("submit", async function (event) {
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

        await simpanKelasPengguna(username, daftarKelas);
        resetFormKelas();
        renderSemuaHalaman();
        tampilkanNotifikasi("Data kelas berhasil disimpan.", "sukses");
      } catch (error) {
        tampilkanNotifikasi(error.message, "gagal");
      }
    });

    document.getElementById("formMahasiswa").addEventListener("submit", async function (event) {
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

        await simpanKelasPengguna(username, daftarKelas);
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

    document.getElementById("formSemester").addEventListener("submit", async function (event) {
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
            kelasBaru.kedaluwarsaPada = Date.now() + DURASI_SATU_HARI;
          }

          if (infoResetTimer) {
            kelasBaru.kedaluwarsaPada = Date.now() + DURASI_SATU_HARI;
          }

          return kelasBaru;
        });

        await simpanKelasPengguna(username, daftarKelas);
        resetFormSemester();
        renderSemuaHalaman();
        tampilkanNotifikasi(infoResetTimer ? "Edit ke-3 tercapai. Timer kelas di-reset menjadi 1 hari lagi." : "Data semester berhasil disimpan.", "sukses");
      } catch (error) {
        tampilkanNotifikasi(error.message, "gagal");
      }
    });

    elemen.daftarKelasManajemen.addEventListener("click", async function (event) {
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
          await simpanKelasPengguna(username, daftarKelas);
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
          await simpanKelasPengguna(username, daftarKelas);
          resetFormMahasiswa();
          renderSemuaHalaman();
          tampilkanNotifikasi("Mahasiswa beserta data semester miliknya berhasil dihapus.", "peringatan");
          return;
        }

        if (aksi === "tambah-jam-kelas") {
          await tambahJamKelas(username, idKelas, Number(tombol.getAttribute("data-tambahan")));
          renderSemuaHalaman();
          tampilkanNotifikasi("Waktu kedaluwarsa kelas berhasil ditambah.", "sukses");
        }
      } catch (error) {
        tampilkanNotifikasi(error.message, "gagal");
      }
    });

    elemen.daftarCountdownKelasDashboard.addEventListener("click", async function (event) {
      const tombol = event.target.closest("[data-aksi='tambah-jam-kelas']");
      if (!tombol) {
        return;
      }

      await tambahJamKelas(ambilSesiAktif(), tombol.getAttribute("data-id-kelas"), Number(tombol.getAttribute("data-tambahan")));
      renderSemuaHalaman();
      tampilkanNotifikasi("Waktu kedaluwarsa kelas berhasil ditambah.", "sukses");
    });

    elemen.daftarSemesterTersimpan.addEventListener("click", async function (event) {
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
            kelasBaru.kedaluwarsaPada = Date.now() + DURASI_SATU_HARI;
          }

          return kelasBaru;
        });

        await simpanKelasPengguna(username, daftarKelas);
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
      if (!panel) {
        return;
      }

      const sedangTerbuka = panel.classList.contains("aktif");
      elemen.daftarAccordionSemester.querySelectorAll(".isi-akordeon.aktif").forEach(function (panelTerbuka) {
        panelTerbuka.classList.remove("aktif");
        panelTerbuka.setAttribute("aria-hidden", "true");
      });

      elemen.daftarAccordionSemester.querySelectorAll("[data-aksi='buka-akordeon']").forEach(function (tombolAkordeon) {
        tombolAkordeon.setAttribute("aria-expanded", "false");
        const label = tombolAkordeon.querySelector(".label-toggle-akordeon");
        if (label) {
          label.textContent = "Buka detail";
        }
      });

      if (!sedangTerbuka) {
        panel.classList.add("aktif");
        panel.setAttribute("aria-hidden", "false");
        tombol.setAttribute("aria-expanded", "true");
        const labelAktif = tombol.querySelector(".label-toggle-akordeon");
        if (labelAktif) {
          labelAktif.textContent = "Tutup detail";
        }
      }
    });
  }

  async function mulaiAplikasi() {
    terapkanTema(ambilTemaTersimpan());
    aktifkanAnimasiJudul();
    mulaiAnimasiKetikan();
    inisialisasiEvent();
    isiLoginDariAkunDiingat();
    resetFormKelas();
    resetFormMahasiswa();
    resetFormSemester();

    if (apiBackend) {
      await apiBackend.muatAwal();
      await migrasiDataLokalJikaAda();
    }

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
