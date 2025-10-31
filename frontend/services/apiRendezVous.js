// services/apiRendezVous.js
const API_URL = "http://localhost:3000/api/rendezVous";

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

const emptyToNull = (v) => (v === "" ? null : v);

// GET /api/rendezVous
export async function getRendezVous() {
  return httpJson(API_URL);
}

// GET /api/rendezVous/:id
export async function getRendezVousById(id) {
  return httpJson(`${API_URL}/${id}`);
}

// POST /api/rendezVous
export async function addRendezVous(rdv) {
  const payload = {
    client_id: rdv.client_id,
    employe_id: rdv.employe_id,
    date_rdv: rdv.date_rdv, // "YYYY-MM-DD"
    heure_rdv: rdv.heure_rdv, // "HH:mm"
    description_probleme: emptyToNull(rdv.description_probleme ?? null),
  };

  return httpJson(API_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// PUT /api/rendezVous/:id
export async function updateRendezVous(id, rdv) {
  const payload = {
    client_id: rdv.client_id,
    employe_id: rdv.employe_id,
    date_rdv: rdv.date_rdv,
    heure_rdv: rdv.heure_rdv,
    description_probleme: emptyToNull(rdv.description_probleme ?? null),
  };

  return httpJson(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// DELETE /api/rendezVous/:id
export async function deleteRendezVous(id) {
  return httpJson(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function getRendezVousByEmploye(employeId) {
  return httpJson(`${API_URL}/employe/${encodeURIComponent(employeId)}`);
}

export async function getRendezVousByClient(clientId) {
  return httpJson(`${API_URL}/client/${encodeURIComponent(clientId)}`);
}
