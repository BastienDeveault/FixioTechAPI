import { db } from "../config/databaseConnexion.js";

const getRendezVous = (req, res, next) => {
  const { client_id, employe_id } = req.query;

  let sql = "SELECT * FROM rendez_vous";
  const params = [];
  let paramIndex = 1;

  if (client_id) {
    sql += ` WHERE client_id = $${paramIndex}`;
    params.push(client_id);
    paramIndex++;
  } else if (employe_id) {
    sql += ` WHERE employe_id = $${paramIndex}`;
    params.push(employe_id);
    paramIndex++;
  }

  sql += " ORDER BY date_rdv ASC, heure_rdv ASC";

  db.query(sql, params, (err, results) => {
    if (err) return next(err);
    res.json(results.rows);
  });
};

const getRendezVousById = async (req, res, next) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM rendez_vous WHERE id = $1",
    [id],
    (err, results) => {
      if (err) return next(err);
      const rows = results.rows;
      if (rows.length === 0) {
        return res.status(404).json({ message: "Rendez-vous non trouvé" });
      }
      res.json(rows[0]);
    }
  );
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

function emptyToNull(value) {
  return value === undefined || value === null || value === "" ? null : value;
}

const addRendezVous = (req, res, next) => {
  const { client_id, employe_id, date_rdv, heure_rdv } = req.body;
  const description_probleme = emptyToNull(req.body.description_probleme);

  if (!client_id || !date_rdv || !heure_rdv) {
    return res.status(400).json({
      message: "client_id, date_rdv et heure_rdv sont requis",
    });
  }

  const { debutCol, finCol } = colonnesJour(date_rdv);

  const baseSql = `
    SELECT u.id
    FROM utilisateurs u
    JOIN horaires h ON h.employe_id = u.id
    LEFT JOIN rendez_vous r
      ON r.employe_id = u.id AND r.date_rdv = $1 AND r.heure_rdv = $2
    WHERE u.role = 'employe'
      AND h.${debutCol} IS NOT NULL
      AND h.${finCol} IS NOT NULL
      AND h.${debutCol} <= $3
      AND $4 < h.${finCol}
      AND r.id IS NULL
  `;
  const params = [date_rdv, heure_rdv, heure_rdv, heure_rdv];

  const sql = employe_id
    ? `${baseSql} AND u.id = $5`
    : `${baseSql} ORDER BY u.nom_complet ASC LIMIT 1`;

  const finalParams = employe_id ? [...params, employe_id] : params;

  db.query(sql, finalParams, (err, results) => {
    if (err) return next(err);

    const rows = results.rows;

    if (!rows || rows.length === 0) {
      return res
        .status(409)
        .json({ message: "Aucun employé disponible pour ce créneau." });
    }

    const chosenEmployeId = employe_id || rows[0].id;

    const insertSql = `
      INSERT INTO rendez_vous
      (client_id, employe_id, date_rdv, heure_rdv, description_probleme)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const insertParams = [
      client_id,
      chosenEmployeId,
      date_rdv,
      heure_rdv,
      description_probleme,
    ];

    db.query(insertSql, insertParams, (err2, results2) => {
      if (err2) return next(err2);
      res.status(201).json(results2.rows[0]);
    });
  });
};

const updateRendezVous = async (req, res, next) => {
  const { id } = req.params;

  const {
    client_id,
    employe_id,
    date_rdv,
    heure_rdv,
    description_probleme,
  } = {
    ...req.body,
    description_probleme: emptyToNull(req.body.description_probleme),
  };

  const sql = `
    UPDATE rendez_vous
    SET client_id = $1,
        employe_id = $2,
        date_rdv = $3,
        heure_rdv = $4,
        description_probleme = $5
    WHERE id = $6
    RETURNING *
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
    if (results.rowCount === 0) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }
    res.status(200).json(results.rows[0]);
  });
};

const deleteRendezVous = async (req, res, next) => {
  const { id } = req.params;

  db.query("DELETE FROM rendez_vous WHERE id = $1", [id], (err, results) => {
    if (err) return next(err);
    if (results.rowCount === 0) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }
    res.status(200).json({ message: "Rendez-vous supprimé avec succès" });
  });
};

const getRendezVousByEmployeId = async (req, res, next) => {
  const { employe_id } = req.params;

  db.query(
    `SELECT *
     FROM rendez_vous
     WHERE employe_id = $1
     ORDER BY date_rdv ASC, heure_rdv ASC`,
    [employe_id],
    (err, results) => {
      if (err) return next(err);
      res.json(results.rows);
    }
  );
};

const getRendezVousByClientId = async (req, res, next) => {
  const { client_id } = req.params;

  db.query(
    `SELECT *
     FROM rendez_vous
     WHERE client_id = $1
     ORDER BY date_rdv ASC, heure_rdv ASC`,
    [client_id],
    (err, results) => {
      if (err) return next(err);
      res.json(results.rows);
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