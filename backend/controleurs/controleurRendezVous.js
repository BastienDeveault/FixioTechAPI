import { db } from "../config/databaseConnexion.js";

const getRendezVous = (req, res, next) => {
  const { client_id, employe_id } = req.query;
  let sql = "SELECT * FROM rendez_vous";
  const params = [];

  if (client_id) {
    sql += " WHERE client_id = ?";
    params.push(client_id);
  } else if (employe_id) {
    sql += " WHERE employe_id = ?";
    params.push(employe_id);
  }

  sql += " ORDER BY date_rdv ASC, heure_rdv ASC";

  db.query(sql, params, (err, results) => {
    if (err) return next(err);
    res.json(results);
  });
};

const getRendezVousById = async (req, res, next) => {
  const { id } = req.params;
  db.query("SELECT * FROM rendez_vous WHERE id = ?", [id], (err, results) => {
    if (err) {
      return next(err);
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }
    res.json(results[0]);
  });
};

function colonnesJour(dateISO) {
  const j = new Date(`${dateISO}T00:00:00`).getDay();
  const noms = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
  ];
  const jour = noms[j];
  return { debutCol: `${jour}_debut`, finCol: `${jour}_fin` };
}

const addRendezVous = (req, res, next) => {
  const { client_id, employe_id, date_rdv, heure_rdv } = req.body;
  const description_probleme =
    (req.body.description_probleme ?? "") === ""
      ? null
      : req.body.description_probleme;

  if (!client_id || !date_rdv || !heure_rdv) {
    return res
      .status(400)
      .json({ message: "client_id, date_rdv et heure_rdv sont requis" });
  }

  const { debutCol, finCol } = colonnesJour(date_rdv);

  // Si un employe_id est fourni: vérifier disponibilité.
  // Sinon: choisir automatiquement un employé disponible.
  const baseSql = `
    SELECT u.id
    FROM utilisateurs u
    JOIN horaires h ON h.employe_id = u.id
    LEFT JOIN rendez_vous r
      ON r.employe_id = u.id AND r.date_rdv = ? AND r.heure_rdv = ?
    WHERE u.role = 'employe'
      AND h.${debutCol} IS NOT NULL
      AND h.${finCol}   IS NOT NULL
      AND h.${debutCol} <= ?
      AND ? < h.${finCol}
      AND r.id IS NULL
  `;

  const params = [date_rdv, heure_rdv, heure_rdv, heure_rdv];

  const sql = employe_id
    ? `${baseSql} AND u.id = ?`
    : `${baseSql} ORDER BY u.nom_complet ASC LIMIT 1`;

  const finalParams = employe_id ? [...params, employe_id] : params;

  db.query(sql, finalParams, (err, rows) => {
    if (err) return next(err);
    if (!rows || rows.length === 0) {
      return res
        .status(409)
        .json({ message: "Aucun employé disponible pour ce créneau." });
    }
    const chosenEmployeId = employe_id || rows[0].id;

    const insertSql = `
      INSERT INTO rendez_vous (client_id, employe_id, date_rdv, heure_rdv, description_probleme)
      VALUES (?, ?, ?, ?, ?)
    `;
    const insertParams = [
      client_id,
      chosenEmployeId,
      date_rdv,
      heure_rdv,
      description_probleme,
    ];

    db.query(insertSql, insertParams, (err2, r2) => {
      if (err2) return next(err2);
      res.status(201).json({
        id: r2.insertId,
        client_id,
        employe_id: chosenEmployeId,
        date_rdv,
        heure_rdv,
        description_probleme,
      });
    });
  });
};

const updateRendezVous = async (req, res, next) => {
  const { id } = req.params;
  const { client_id, employe_id, date_rdv, heure_rdv } = req.body;
  const description_probleme = emptyToNull(req.body.description_probleme);

  const sql = `
    UPDATE rendez_vous
    SET client_id = ?, employe_id = ?, date_rdv = ?, heure_rdv = ?, description_probleme = ?
    WHERE id = ?
  `;
  const params = [
    client_id,
    employe_id,
    date_rdv,
    heure_rdv,
    description_probleme,
    id,
  ];

  db.query(sql, params, (err, results) => {
    if (err) return next(err);
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }
    res.status(200).json({
      id,
      client_id,
      employe_id,
      date_rdv,
      heure_rdv,
      description_probleme,
    });
  });
};

const deleteRendezVous = async (req, res, next) => {
  const { id } = req.params;

  db.query("DELETE FROM rendez_vous WHERE id = ?", [id], (err, results) => {
    if (err) {
      return next(err);
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }
    res.status(200).json({ message: "Rendez-vous supprimé avec succès" });
  });
};

// --- LISTER les rendez-vous d'un EMPLOYÉ donné ---
const getRendezVousByEmployeId = async (req, res, next) => {
  const { employe_id } = req.params;
  db.query(
    `SELECT * 
     FROM rendez_vous 
     WHERE employe_id = ? 
     ORDER BY date_rdv ASC, heure_rdv ASC`,
    [employe_id],
    (err, results) => {
      if (err) return next(err);
      res.json(results);
    }
  );
};

// --- LISTER les rendez-vous d'un CLIENT donné ---
const getRendezVousByClientId = async (req, res, next) => {
  const { client_id } = req.params;
  db.query(
    `SELECT * 
     FROM rendez_vous 
     WHERE client_id = ? 
     ORDER BY date_rdv ASC, heure_rdv ASC`,
    [client_id],
    (err, results) => {
      if (err) return next(err);
      res.json(results);
    }
  );
};

export {
  getRendezVous,
  getRendezVousById,
  addRendezVous,
  updateRendezVous,
  deleteRendezVous,
  getRendezVousByEmployeId,
  getRendezVousByClientId,
};
