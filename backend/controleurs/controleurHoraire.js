import db from "../config/databaseConnexion.js";

const getHoraires = async (req, res, next) => {
  db.query("SELECT * FROM horaires", (err, results) => {
    if (err) {
      return next(err);
    }
    res.json(results);
  });
};

const getHoraireById = async (req, res, next) => {
  const { id } = req.params;
  db.query("SELECT * FROM horaires WHERE id = ?", [id], (err, results) => {
    if (err) {
      return next(err);
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Horaire non trouvé" });
    }
    res.json(results[0]);
  });
};

const addHoraire = async (req, res, next) => {
  const {
    employe_id,
    lundi_debut,
    lundi_fin,
    mardi_debut,
    mardi_fin,
    mercredi_debut,
    mercredi_fin,
    jeudi_debut,
    jeudi_fin,
    vendredi_debut,
    vendredi_fin,
    samedi_debut,
    samedi_fin,
    dimanche_debut,
    dimanche_fin,
  } = req.body;
  if (!employe_id) {
    return res.status(400).json({ message: "Champs requis manquant" });
  }

  db.query(
    "INSERT INTO horaires (employe_id, lundi_debut, lundi_fin, mardi_debut, mardi_fin, mercredi_debut, mercredi_fin, jeudi_debut, jeudi_fin, vendredi_debut, vendredi_fin, samedi_debut, samedi_fin, dimanche_debut, dimanche_fin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      employe_id,
      lundi_debut,
      lundi_fin,
      mardi_debut,
      mardi_fin,
      mercredi_debut,
      mercredi_fin,
      jeudi_debut,
      jeudi_fin,
      vendredi_debut,
      vendredi_fin,
      samedi_debut,
      samedi_fin,
      dimanche_debut,
      dimanche_fin,
    ],
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.status(201).json({
        id: results.insertId,
        employe_id,
        lundi_debut,
        lundi_fin,
        mardi_debut,
        mardi_fin,
        mercredi_debut,
        mercredi_fin,
        jeudi_debut,
        jeudi_fin,
        vendredi_debut,
        vendredi_fin,
        samedi_debut,
        samedi_fin,
        dimanche_debut,
        dimanche_fin,
      });
    }
  );
};

const updateHoraire = async (req, res, next) => {
  const { id } = req.params;
  const {
    employe_id,
    lundi_debut,
    lundi_fin,
    mardi_debut,
    mardi_fin,
    mercredi_debut,
    mercredi_fin,
    jeudi_debut,
    jeudi_fin,
    vendredi_debut,
    vendredi_fin,
    samedi_debut,
    samedi_fin,
    dimanche_debut,
    dimanche_fin,
  } = req.body;

  db.query(
    "UPDATE horaires SET employe_id = ?, lundi_debut = ?, lundi_fin = ?, mardi_debut = ?, mardi_fin = ?, mercredi_debut = ?, mercredi_fin = ?, jeudi_debut = ?, jeudi_fin = ?, vendredi_debut = ?, vendredi_fin = ?, samedi_debut = ?, samedi_fin = ?, dimanche_debut = ?, dimanche_fin = ? WHERE id = ?",
    [
      employe_id,
      lundi_debut,
      lundi_fin,
      mardi_debut,
      mardi_fin,
      mercredi_debut,
      mercredi_fin,
      jeudi_debut,
      jeudi_fin,
      vendredi_debut,
      vendredi_fin,
      samedi_debut,
      samedi_fin,
      dimanche_debut,
      dimanche_fin,
      id,
    ],
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Horaire non trouvé" });
      }
      res.status(200).json({
        id,
        employe_id,
        lundi_debut,
        lundi_fin,
        mardi_debut,
        mardi_fin,
        mercredi_debut,
        mercredi_fin,
        jeudi_debut,
        jeudi_fin,
        vendredi_debut,
        vendredi_fin,
        samedi_debut,
        samedi_fin,
        dimanche_debut,
        dimanche_fin,
      });
    }
  );
};

const deleteHoraire = async (req, res, next) => {
  const { id } = req.params;

  db.query("DELETE FROM horaires WHERE id = ?", [id], (err, results) => {
    if (err) {
      return next(err);
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Horaire non trouvé" });
    }
    res.status(200).json({ message: "Horaire supprimé avec succès" });
  });
};

const getHoraireByEmployeId = async (req, res, next) => {
  const { employeId } = req.params;
  db.query(
    "SELECT * FROM horaires WHERE employe_id = ?",
    [employeId],
    (err, results) => {
      if (err) return next(err);
      if (results.length === 0) return res.status(200).json(null);
      res.json(results[0]);
    }
  );
};

export {
  getHoraires,
  getHoraireById,
  addHoraire,
  updateHoraire,
  deleteHoraire,
  getHoraireByEmployeId,
};
