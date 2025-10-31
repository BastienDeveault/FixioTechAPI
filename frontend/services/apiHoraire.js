const API_URL = "http://localhost:3000/api/horaires";

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

/**
 * GET /api/horaires
 */
export async function getHoraires() {
  return httpJson(API_URL);
}

/**
 * GET /api/horaires/:id
 */
export async function getHoraire(id) {
  return httpJson(`${API_URL}/${id}`);
}

/**
 * POST /api/horaires
 * @param {Object} horaire
 * {
 *   employe_id,
 *   lundi_debut, lundi_fin,
 *   mardi_debut, mardi_fin,
 *   mercredi_debut, mercredi_fin,
 *   jeudi_debut, jeudi_fin,
 *   vendredi_debut, vendredi_fin,
 *   samedi_debut, samedi_fin,
 *   dimanche_debut, dimanche_fin
 * }
 */
export async function addHoraire(horaire) {
  const payload = {
    employe_id: horaire.employe_id,
    lundi_debut: horaire.lundi_debut ?? null,
    lundi_fin: horaire.lundi_fin ?? null,
    mardi_debut: horaire.mardi_debut ?? null,
    mardi_fin: horaire.mardi_fin ?? null,
    mercredi_debut: horaire.mercredi_debut ?? null,
    mercredi_fin: horaire.mercredi_fin ?? null,
    jeudi_debut: horaire.jeudi_debut ?? null,
    jeudi_fin: horaire.jeudi_fin ?? null,
    vendredi_debut: horaire.vendredi_debut ?? null,
    vendredi_fin: horaire.vendredi_fin ?? null,
    samedi_debut: horaire.samedi_debut ?? null,
    samedi_fin: horaire.samedi_fin ?? null,
    dimanche_debut: horaire.dimanche_debut ?? null,
    dimanche_fin: horaire.dimanche_fin ?? null,
  };

  return httpJson(API_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * PUT /api/horaires/:id
 */
export async function updateHoraire(id, horaire) {
  const payload = {
    employe_id: horaire.employe_id,
    lundi_debut: horaire.lundi_debut ?? null,
    lundi_fin: horaire.lundi_fin ?? null,
    mardi_debut: horaire.mardi_debut ?? null,
    mardi_fin: horaire.mardi_fin ?? null,
    mercredi_debut: horaire.mercredi_debut ?? null,
    mercredi_fin: horaire.mercredi_fin ?? null,
    jeudi_debut: horaire.jeudi_debut ?? null,
    jeudi_fin: horaire.jeudi_fin ?? null,
    vendredi_debut: horaire.vendredi_debut ?? null,
    vendredi_fin: horaire.vendredi_fin ?? null,
    samedi_debut: horaire.samedi_debut ?? null,
    samedi_fin: horaire.samedi_fin ?? null,
    dimanche_debut: horaire.dimanche_debut ?? null,
    dimanche_fin: horaire.dimanche_fin ?? null,
  };

  return httpJson(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * DELETE /api/horaires/:id
 */
export async function deleteHoraire(id) {
  return httpJson(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}

// GET /api/horaires/employe/:employeId
export async function getHoraireByEmploye(employeId) {
  return httpJson(`${API_URL}/employe/${employeId}`);
}

// Helper front : charge par employé puis decide add/update
export async function saveHoraireForEmploye(horaire) {
  // horaire doit contenir employe_id et éventuellement id si déjà existant
  if (horaire.id) {
    return updateHoraire(horaire.id, horaire);
  }
  return addHoraire(horaire);
}
