import { db } from "../config/databaseConnexion.js";

// -----------------------------------------------------------------------------
// Helpers génériques
// -----------------------------------------------------------------------------

function runQuery(sql, params, next, onSuccess) {
  db.query(sql, params, (err, results) => {
    if (err) return next(err);
    onSuccess(results);
  });
}

/**
 * Helper pour récupérer un horaire unique selon une clause WHERE.
 * - whereClause : chaîne du type "id = $1" ou "employe_id = $1"
 * - params : tableau de paramètres pour la requête
 * - options.allowNull :
 *      - false  -> 404 si aucun horaire
 *      - true   -> 200 avec `null` si aucun horaire
 */
function findHoraire(whereClause, params, next, res, { allowNull = false } = {}) {
  const sql = `SELECT * FROM horaires WHERE ${whereClause}`;

  runQuery(sql, params, next, (results) => {
    const rows = results.rows;
    if (rows.length === 0) {
      if (allowNull) return res.status(200).json(null);
      return res.status(404).json({ message: "Horaire non trouvé" });
    }
    res.json(rows[0]);
  });
}

// -----------------------------------------------------------------------------
// Gestion des colonnes d'horaires (jours de la semaine)
// -----------------------------------------------------------------------------

const JOUR_COLS = [
  "lundi_debut", "lundi_fin",
  "mardi_debut", "mardi_fin",
  "mercredi_debut", "mercredi_fin",
  "jeudi_debut", "jeudi_fin",
  "vendredi_debut", "vendredi_fin",
  "samedi_debut", "samedi_fin",
  "dimanche_debut", "dimanche_fin",
];

function buildHoraireParamsFromBody(body) {
  return JOUR_COLS.map((col) => body[col]);
}

/**
 * Normalise services_proposes pour qu'il finisse TOUJOURS en tableau.
 * Accepte :
 *  - Array (cas normal)
 *  - String JSON (ex: '["Support technique"]')
 *  - null/undefined/autre => []
 */
function normalizeServices(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

// -----------------------------------------------------------------------------
// Contrôleurs
// -----------------------------------------------------------------------------

const getHoraires = async (req, res, next) => {
  runQuery("SELECT * FROM horaires", [], next, (results) => {
    res.json(results.rows);
  });
};

const getHoraireById = async (req, res, next) => {
  const { id } = req.params;
  findHoraire("id = $1", [id], next, res);
};

const addHoraire = async (req, res, next) => {
  const { employe_id } = req.body;

  if (!employe_id) {
    return res.status(400).json({ message: "Champs requis manquant" });
  }

  const services = normalizeServices(req.body.services_proposes);
  const jourParams = buildHoraireParamsFromBody(req.body);

  const sql = `
    INSERT INTO horaires (
      employe_id,
      services_proposes,
      ${JOUR_COLS.join(", ")}
    )
    VALUES (
      $1,
      $2::jsonb,
      ${JOUR_COLS.map((_, i) => `$${i + 3}`).join(", ")}
    )
    RETURNING *
  `;

  const params = [employe_id, JSON.stringify(services), ...jourParams];

  runQuery(sql, params, next, (results) => {
    res.status(201).json(results.rows[0]);
  });
};

const updateHoraire = async (req, res, next) => {
  const { id } = req.params;
  const { employe_id } = req.body;

  if (!employe_id) {
    return res.status(400).json({ message: "Champs requis manquant" });
  }

  const services = normalizeServices(req.body.services_proposes);
  const jourParams = buildHoraireParamsFromBody(req.body);

  const setJourCols = JOUR_COLS.map((col, i) => `${col} = $${i + 3}`).join(", ");

  const sql = `
    UPDATE horaires
    SET
      employe_id = $1,
      services_proposes = $2::jsonb,
      ${setJourCols}
    WHERE id = $${JOUR_COLS.length + 3}
    RETURNING *
  `;

  const params = [employe_id, JSON.stringify(services), ...jourParams, id];

  runQuery(sql, params, next, (results) => {
    if (results.rowCount === 0) {
      return res.status(404).json({ message: "Horaire non trouvé" });
    }
    res.status(200).json(results.rows[0]);
  });
};

const deleteHoraire = async (req, res, next) => {
  const { id } = req.params;

  const sql = "DELETE FROM horaires WHERE id = $1";

  runQuery(sql, [id], next, (results) => {
    if (results.rowCount === 0) {
      return res.status(404).json({ message: "Horaire non trouvé" });
    }
    res.status(200).json({ message: "Horaire supprimé avec succès" });
  });
};

const getHoraireByEmployeId = async (req, res, next) => {
  const { employeId } = req.params;
  findHoraire("employe_id = $1", [employeId], next, res, { allowNull: true });
};

export {
  getHoraires,
  getHoraireById,
  addHoraire,
  updateHoraire,
  deleteHoraire,
  getHoraireByEmployeId,
};