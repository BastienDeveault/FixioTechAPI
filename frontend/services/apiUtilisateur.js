const API_URL = "http://localhost:3000/api/utilisateurs";

async function httpJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    let message = `Erreur HTTP ${res.status}`;
    if (contentType.includes("application/json")) {
      try {
        const body = await res.json();
        message = body?.message || message;
      } catch {}
    } else {
      try {
        const text = await res.text();
        if (text) message = text;
      } catch {}
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;

  if (contentType.includes("application/json")) {
    return res.json();
  } else {
    const text = await res.text();
    return text || null;
  }
}

async function getUtilisateurs() {
  return httpJson(API_URL); // GET /api/utilisateurs
}

async function getUtilisateur(id) {
  return httpJson(`${API_URL}/${id}`); // GET /api/utilisateurs/:id
}

async function addUtilisateur(utilisateur) {
  const payload = {
    email: utilisateur.courriel,
    mot_de_passe: utilisateur.mot_de_passe,
    nom_complet: utilisateur.nom_complet,
    role: utilisateur.role || "client",
  };

  return httpJson(API_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function loginUtilisateur(utilisateur) {
  const payload = {
    email: utilisateur.courriel,
    mot_de_passe: utilisateur.mot_de_passe,
  };

  return httpJson(`${API_URL}/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function updateUtilisateur(id, updates) {
  return httpJson(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

async function deleteUtilisateur(id) {
  return httpJson(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}

async function getEmployes() {
  return httpJson(`${API_URL}?role=employe`);
}

async function getEmployesDisponibles(dateISO, heureHHmm) {
  const qs = new URLSearchParams({ date: dateISO, heure: heureHHmm });
  return httpJson(`${API_URL}/disponibles?${qs.toString()}`);
}

export {
  getUtilisateurs,
  getUtilisateur,
  addUtilisateur,
  loginUtilisateur,
  updateUtilisateur,
  deleteUtilisateur,
  getEmployes,
  getEmployesDisponibles,
};
