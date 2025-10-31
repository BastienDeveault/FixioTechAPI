import { body } from "express-validator";

const addUtilisateurValidation = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("L'email est requis")
        .isEmail()
        .withMessage("Email invalide"),
    body("mot_de_passe")
        .notEmpty()
        .withMessage("Le mot de passe est requis")
        .isLength({ min: 6 })
        .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
    body("nom_complet")
        .trim()
        .notEmpty()
        .withMessage("Le nom complet est requis")
        .isLength({ max: 100 })
        .withMessage("Le nom complet ne peut pas dépasser 100 caractères"),
    body("role")
        .optional()
        .isIn(["client", "employe", "admin"])
        .withMessage("Le rôle doit être 'client', 'employe' ou 'admin'")
];

const updateUtilisateurValidation = [
    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Email invalide"),
    body("mot_de_passe")
        .optional()
        .isLength({ min: 6 })
        .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
    body("nom_complet")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage("Le nom complet doit contenir entre 1 et 100 caractères"),
    body("role")
        .optional()
        .isIn(["client", "employe", "admin"])
        .withMessage("Le rôle doit être 'client', 'employe' ou 'admin'")
];

export { addUtilisateurValidation, updateUtilisateurValidation };