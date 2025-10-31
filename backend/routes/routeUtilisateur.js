import express from "express";

import {
  getUtilisateurs,
  getUtilisateurById,
  addUtilisateur,
  updateUtilisateur,
  deleteUtilisateur,
  loginUtilisateur,
  getEmployesDisponibles,
} from "../controleurs/controleurUtilisateur.js";

import {
  addUtilisateurValidation,
  updateUtilisateurValidation,
} from "../validateurs/validateurUtilisateur.js";

const routerUtilisateur = express.Router();

routerUtilisateur.get("/", getUtilisateurs);
routerUtilisateur.get("/disponibles", getEmployesDisponibles);
routerUtilisateur.get("/:id", getUtilisateurById);
routerUtilisateur.post("/", addUtilisateurValidation, addUtilisateur);
routerUtilisateur.put("/:id", updateUtilisateurValidation, updateUtilisateur);
routerUtilisateur.delete("/:id", deleteUtilisateur);
routerUtilisateur.post("/login", loginUtilisateur);

export default routerUtilisateur;
