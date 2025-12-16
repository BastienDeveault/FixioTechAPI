import { db } from "../config/databaseConnexion.js";
import { colonnesJour, baseDisponibiliteQuery } from "./utils.js";

function emptyToNull(value) {
  return value === undefined || value === null || value === "" ? null : value;
}

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

const addRendezVous = (req, res, next) => {
  const { client_id, employe_id, date_rdv, heure_rdv } = req.body;
  const description_probleme = emptyToNull(req.body.description_probleme);

  if (!client_id || !date_rdv || !heure_rdv) {
    return res.status(400).json({
      message: "client_id, date_rdv et heure_rdv sont requis",
    });
  }

  // Vérifier que la date n'est pas dans le passé
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rdvDate = new Date(date_rdv + "T00:00:00");
  if (rdvDate < today) {
    return res.status(400).json({
      message: "La date du rendez-vous ne peut pas être dans le passé",
    });
  }

  const { debutCol, finCol } = colonnesJour(date_rdv);

  // Utilisation de la requête de base commune, avec SELECT u.id
  const baseSql = baseDisponibiliteQuery(debutCol, finCol, "u.id");
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
    statut,
    description_probleme,
  } = req.body;

  const updateFields = [];
  const updateValues = [];

  if (client_id !== undefined) {
    updateFields.push(`client_id = $${updateValues.length + 1}`);
    updateValues.push(client_id);
  }
  if (employe_id !== undefined) {
    updateFields.push(`employe_id = $${updateValues.length + 1}`);
    updateValues.push(employe_id);
  }
  if (date_rdv !== undefined) {
    updateFields.push(`date_rdv = $${updateValues.length + 1}`);
    updateValues.push(date_rdv);
  }
  if (heure_rdv !== undefined) {
    updateFields.push(`heure_rdv = $${updateValues.length + 1}`);
    updateValues.push(heure_rdv);
  }
  if (statut !== undefined) {
    updateFields.push(`statut = $${updateValues.length + 1}`);
    updateValues.push(statut);
  }
  if (description_probleme !== undefined) {
    updateFields.push(`description_probleme = $${updateValues.length + 1}`);
    updateValues.push(emptyToNull(description_probleme));
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ message: "Aucun champ à mettre à jour" });
  }

  // id devient le dernier paramètre
  updateValues.push(id);
  const idIndex = updateValues.length;

  const sql = `
    UPDATE rendez_vous
    SET ${updateFields.join(", ")}
    WHERE id = $${idIndex}
    RETURNING *
  `;

  db.query(sql, updateValues, (err, results) => {
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
  getRendezVous, getRendezVousById, addRendezVous, updateRendezVous, deleteRendezVous, getRendezVousByEmployeId, getRendezVousByClientId,
};