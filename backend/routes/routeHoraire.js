import express from "express";
import * as horaireController from "../controleurs/controleurHoraire.js";
import {
  addHoraireValidation,
  updateHoraireValidation,
} from "../validateurs/validateurHoraire.js";

const routerHoraire = express.Router();

routerHoraire.get("/", horaireController.getHoraires);
routerHoraire.get("/:id", horaireController.getHoraireById);
routerHoraire.get("/employe/:employeId", horaireController.getHoraireByEmployeId);
routerHoraire.post("/", addHoraireValidation, horaireController.addHoraire);
routerHoraire.put("/:id", updateHoraireValidation, horaireController.updateHoraire);
routerHoraire.delete("/:id", horaireController.deleteHoraire);

export default routerHoraire;
