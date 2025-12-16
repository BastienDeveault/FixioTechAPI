import { body } from "express-validator";

const timeRe = /^([0-1]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/; // HH:MM ou HH:MM:SS

// Fabrique générique pour les validations de rendez-vous
function makeRendezVousValidation({ partial = false } = {}) {
  // Si partial = true (update) → tous les champs sont optionnels
  // Sinon (add) → tous les champs sauf description_probleme sont requis
  const field = (name) => (partial ? body(name).optional() : body(name));

  return [
    field("client_id").isInt().withMessage("ID client invalide"),
    field("employe_id").isInt().withMessage("ID employé invalide"),
    field("date_rdv")
      .isISO8601()
      .withMessage("Date de rendez-vous invalide"),
    field("heure_rdv")
      .matches(timeRe)
      .withMessage("Heure de rendez-vous invalide"),

    // Dans les deux cas, la description reste optionnelle
    body("description_probleme")
      .optional()
      .isString()
      .withMessage("Description du problème invalide")
      .trim()
      .isLength({ max: 5000 })
      .withMessage("Description trop longue (max 5000)."),
  ];
}

const addRendezVousValidation = makeRendezVousValidation({ partial: false });
const updateRendezVousValidation = makeRendezVousValidation({ partial: true });

export { addRendezVousValidation, updateRendezVousValidation };