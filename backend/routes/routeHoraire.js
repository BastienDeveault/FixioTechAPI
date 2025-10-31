import express from "express";

import {
  getHoraires,
  getHoraireById,
  addHoraire,
  updateHoraire,
  deleteHoraire,
  getHoraireByEmployeId,
} from "../controleurs/controleurHoraire.js";

import {
  addHoraireValidation,
  updateHoraireValidation,
} from "../validateurs/validateurHoraire.js";

const routerHoraire = express.Router();

routerHoraire.get("/", getHoraires);
routerHoraire.get("/:id", getHoraireById);
routerHoraire.get("/employe/:employeId", getHoraireByEmployeId);
routerHoraire.post("/", addHoraireValidation, addHoraire);
routerHoraire.put("/:id", updateHoraireValidation, updateHoraire);
routerHoraire.delete("/:id", deleteHoraire);

export default routerHoraire;
