import { db } from "../config/databaseConnexion.js";

const getUtilisateurs = (req, res, next) => {
  const { role } = req.query; // ex: employe, client, admin
  let sql = "SELECT id, email, nom_complet, role FROM utilisateurs";
  const params = [];

  if (role) {
    sql += " WHERE role = $1";
    params.push(role);
  }

  db.query(sql, params, (err, results) => {
    if (err) return next(err);
    res.json(results.rows);
  });
};

const getUtilisateurById = async (req, res, next) => {
  const { id } = req.params;

  db.query(
    "SELECT id, email, nom_complet, role FROM utilisateurs WHERE id = $1",
    [id],
    (err, results) => {
      if (err) {
        return next(err);
      }
      const rows = results.rows;
      if (rows.length === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      res.json(rows[0]);
    }
  );
};

const addUtilisateur = async (req, res, next) => {
  const { email, mot_de_passe, nom_complet, role = "client" } = req.body;

  if (!email || !mot_de_passe || !nom_complet) {
    return res.status(400).json({ message: "Champs requis manquants" });
  }

  const sql = `
    INSERT INTO utilisateurs (email, mot_de_passe, nom_complet, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, nom_complet, role
  `;

  db.query(sql, [email, mot_de_passe, nom_complet, role], (err, results) => {
    if (err) {
      return next(err);
    }
    const row = results.rows[0];
    res.status(201).json(row);
  });
};

const updateUtilisateur = async (req, res, next) => {
  const { id } = req.params;
  const { email, mot_de_passe, nom_complet, role } = req.body;

  const updateFields = [];
  const updateValues = [];

  if (email) {
    updateFields.push(`email = $${updateValues.length + 1}`);
    updateValues.push(email);
  }
  if (mot_de_passe) {
    updateFields.push(`mot_de_passe = $${updateValues.length + 1}`);
    updateValues.push(mot_de_passe);
  }
  if (nom_complet) {
    updateFields.push(`nom_complet = $${updateValues.length + 1}`);
    updateValues.push(nom_complet);
  }
  if (role) {
    updateFields.push(`role = $${updateValues.length + 1}`);
    updateValues.push(role);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ message: "Aucun champ à mettre à jour" });
  }

  // id devient le dernier paramètre
  updateValues.push(id);
  const idIndex = updateValues.length;

  const sql = `
    UPDATE utilisateurs
    SET ${updateFields.join(", ")}
    WHERE id = $${idIndex}
    RETURNING id, email, nom_complet, role
  `;

  db.query(sql, updateValues, (err, results) => {
    if (err) {
      return next(err);
    }
    if (results.rowCount === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.status(200).json(results.rows[0]);
  });
};

const deleteUtilisateur = async (req, res, next) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM utilisateurs WHERE id = $1",
    [id],
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.rowCount === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    }
  );
};

const loginUtilisateur = async (req, res, next) => {
  const { email, mot_de_passe } = req.body;

  if (!email || !mot_de_passe) {
    return res.status(400).json({ message: "Champs requis manquants" });
  }

  db.query(
    `
    SELECT id, email, nom_complet, role
    FROM utilisateurs
    WHERE email = $1 AND mot_de_passe = $2
  `,
    [email, mot_de_passe],
    (err, results) => {
      if (err) {
        return next(err);
      }
      const rows = results.rows;
      if (rows.length === 0) {
        return res
          .status(401)
          .json({ message: "Email ou mot de passe incorrect" });
      }
      res.status(200).json({
        message: "Connexion réussie",
        utilisateur: rows[0],
      });
    }
  );
};

function colonnesJour(dateISO) {
  // 0=dimanche .. 6=samedi
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

const getEmployesDisponibles = (req, res, next) => {
  const { date, heure } = req.query; // ex: 2025-10-31, 14:00
  if (!date || !heure) {
    return res.status(400).json({
      message: "Paramètres 'date' et 'heure' requis (YYYY-MM-DD, HH:mm)",
    });
  }

  const { debutCol, finCol } = colonnesJour(date);

  const sql = `
    SELECT u.id, u.email, u.nom_complet, u.role
    FROM utilisateurs u
    JOIN horaires h ON h.employe_id = u.id
    LEFT JOIN rendez_vous r
      ON r.employe_id = u.id AND r.date_rdv = $1 AND r.heure_rdv = $2
    WHERE u.role = 'employe'
      AND h.${debutCol} IS NOT NULL
      AND h.${finCol}   IS NOT NULL
      AND h.${debutCol} <= $3
      AND $4 < h.${finCol}
      AND r.id IS NULL
    ORDER BY u.nom_complet ASC
  `;
  const params = [date, heure, heure, heure];

  db.query(sql, params, (err, results) => {
    if (err) return next(err);
    res.json(results.rows);
  });
};

export {
  getUtilisateurs,
  getUtilisateurById,
  addUtilisateur,
  updateUtilisateur,
  deleteUtilisateur,
  loginUtilisateur,
  getEmployesDisponibles,
};