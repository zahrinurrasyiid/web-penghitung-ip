const IPgradeAPI = (function () {
  const BASE_URL = "http://localhost:3000/api";
  const KUNCI_TOKEN = "ipgrade_token";
  const keadaan = {
    user: null,
    classes: []
  };

  function ambilToken() {
    return localStorage.getItem(KUNCI_TOKEN) || "";
  }

  function simpanToken(token) {
    if (token) {
      localStorage.setItem(KUNCI_TOKEN, token);
    }
  }

  function hapusToken() {
    localStorage.removeItem(KUNCI_TOKEN);
    keadaan.user = null;
    keadaan.classes = [];
  }

  async function request(path, options = {}) {
    const headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
    const token = ambilToken();
    if (token) {
      headers.Authorization = "Bearer " + token;
    }

    const response = await fetch(BASE_URL + path, Object.assign({}, options, { headers }));
    const data = await response.json().catch(function () {
      return {};
    });

    if (!response.ok) {
      throw new Error(data.message || "Request backend gagal.");
    }

    return data;
  }

  async function register(email, password) {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    simpanToken(data.token);
    keadaan.user = data.user;
    keadaan.classes = [];
    return data.user;
  }

  async function login(email, password) {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    simpanToken(data.token);
    keadaan.user = data.user;
    await muatClasses();
    return data.user;
  }

  async function me() {
    const data = await request("/auth/me");
    keadaan.user = data.user;
    return data.user;
  }

  async function updateProfile(profile) {
    const data = await request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profile)
    });
    keadaan.user = data.user;
    return data.user;
  }

  async function muatAwal() {
    if (!ambilToken()) {
      return null;
    }
    try {
      await me();
      await muatClasses();
      return keadaan.user;
    } catch (error) {
      hapusToken();
      return null;
    }
  }

  async function muatClasses() {
    const data = await request("/classes");
    keadaan.classes = Array.isArray(data.classes) ? data.classes : [];
    return keadaan.classes;
  }

  async function syncClasses(classes) {
    const data = await request("/classes/sync", {
      method: "PUT",
      body: JSON.stringify({ classes })
    });
    keadaan.classes = Array.isArray(data.classes) ? data.classes : [];
    return keadaan.classes;
  }

  async function health() {
    return request("/health");
  }

  return {
    BASE_URL,
    keadaan,
    ambilToken,
    simpanToken,
    hapusToken,
    register,
    login,
    me,
    updateProfile,
    muatAwal,
    muatClasses,
    syncClasses,
    health,
    request
  };
})();
