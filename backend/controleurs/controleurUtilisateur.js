import { db } from "../config/databaseConnexion.js";

const getUtilisateurs = (req, res, next) => {
  const { role } = req.query; // ex: employe, client, admin
  let sql = "SELECT id, email, nom_complet, role FROM utilisateurs";
  const params = [];
  if (role) {
    sql += " WHERE role = ?";
    params.push(role);
  }
  db.query(sql, params, (err, results) => {
    if (err) return next(err);
    res.json(results);
  });
};

const getUtilisateurById = async (req, res, next) => {
  const { id } = req.params;
  db.query(
    "SELECT id, email, nom_complet, role FROM utilisateurs WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      res.json(results[0]);
    }
  );
};

const addUtilisateur = async (req, res, next) => {
  const { email, mot_de_passe, nom_complet, role = "client" } = req.body;

  if (!email || !mot_de_passe || !nom_complet) {
    return res.status(400).json({ message: "Champs requis manquants" });
  }

  db.query(
    "INSERT INTO utilisateurs (email, mot_de_passe, nom_complet, role) VALUES (?, ?, ?, ?)",
    [email, mot_de_passe, nom_complet, role],
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.status(201).json({
        id: results.insertId,
        email,
        nom_complet,
        role,
      });
    }
  );
};

const updateUtilisateur = async (req, res, next) => {
  const { id } = req.params;
  const { email, mot_de_passe, nom_complet, role } = req.body;

  const updateFields = [];
  const updateValues = [];

  if (email) {
    updateFields.push("email = ?");
    updateValues.push(email);
  }
  if (mot_de_passe) {
    updateFields.push("mot_de_passe = ?");
    updateValues.push(mot_de_passe);
  }
  if (nom_complet) {
    updateFields.push("nom_complet = ?");
    updateValues.push(nom_complet);
  }
  if (role) {
    updateFields.push("role = ?");
    updateValues.push(role);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ message: "Aucun champ à mettre à jour" });
  }

  updateValues.push(id);

  db.query(
    `UPDATE utilisateurs SET ${updateFields.join(", ")} WHERE id = ?`,
    updateValues,
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      res.status(200).json({
        id,
        ...(email && { email }),
        ...(nom_complet && { nom_complet }),
        ...(role && { role }),
      });
    }
  );
};

const deleteUtilisateur = async (req, res, next) => {
  const { id } = req.params;

  db.query("DELETE FROM utilisateurs WHERE id = ?", [id], (err, results) => {
    if (err) {
      return next(err);
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  });
};

const loginUtilisateur = async (req, res, next) => {
  const { email, mot_de_passe } = req.body;

  if (!email || !mot_de_passe) {
    return res.status(400).json({ message: "Champs requis manquants" });
  }

  db.query(
    "SELECT id, email, nom_complet, role FROM utilisateurs WHERE email = ? AND mot_de_passe = ?",
    [email, mot_de_passe],
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.length === 0) {
        return res
          .status(401)
          .json({ message: "Email ou mot de passe incorrect" });
      }
      res.status(200).json({
        message: "Connexion réussie",
        utilisateur: results[0],
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
      ON r.employe_id = u.id AND r.date_rdv = ? AND r.heure_rdv = ?
    WHERE u.role = 'employe'
      AND h.${debutCol} IS NOT NULL
      AND h.${finCol}   IS NOT NULL
      AND h.${debutCol} <= ?
      AND ? < h.${finCol}
      AND r.id IS NULL
    ORDER BY u.nom_complet ASC
  `;
  const params = [date, heure, heure, heure];

  db.query(sql, params, (err, rows) => {
    if (err) return next(err);
    res.json(rows);
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
