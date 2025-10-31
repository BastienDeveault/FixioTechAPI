import { body } from "express-validator";

const timeRe = /^([0-1]\d|2[0-3]):([0-5]\d)$/; // HH:MM

const addRendezVousValidation = [
  body("client_id").isInt().withMessage("ID client invalide"),
  body("employe_id").isInt().withMessage("ID employé invalide"),
  body("date_rdv").isISO8601().withMessage("Date de rendez-vous invalide"),
  body("heure_rdv")
    .matches(timeRe)
    .withMessage("Heure de rendez-vous invalide"),
  body("description_probleme")
    .optional()
    .isString()
    .withMessage("Description du problème invalide")
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Description trop longue (max 5000)."),
];

const updateRendezVousValidation = [
  body("client_id").optional().isInt().withMessage("ID client invalide"),
  body("employe_id").optional().isInt().withMessage("ID employé invalide"),
  body("date_rdv")
    .optional()
    .isISO8601()
    .withMessage("Date de rendez-vous invalide"),
  body("heure_rdv")
    .optional()
    .matches(timeRe)
    .withMessage("Heure de rendez-vous invalide"),
  body("description_probleme")
    .optional()
    .isString()
    .withMessage("Description du problème invalide")
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Description trop longue (max 5000)."),
];

export { addRendezVousValidation, updateRendezVousValidation };
