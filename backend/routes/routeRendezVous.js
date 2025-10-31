import express from "express";

import {
  getRendezVous,
  getRendezVousById,
  addRendezVous,
  updateRendezVous,
  deleteRendezVous,
  getRendezVousByEmployeId,
  getRendezVousByClientId,
} from "../controleurs/controleurRendezVous.js";

import {
  addRendezVousValidation,
  updateRendezVousValidation,
} from "../validateurs/validateurRendezVous.js";

const routerRendezVous = express.Router();

routerRendezVous.post("/", addRendezVousValidation, addRendezVous);
routerRendezVous.get("/employe/:employe_id", getRendezVousByEmployeId);
routerRendezVous.get("/client/:client_id", getRendezVousByClientId);
routerRendezVous.get("/", getRendezVous);
routerRendezVous.get("/:id", getRendezVousById);
routerRendezVous.put("/:id", updateRendezVousValidation, updateRendezVous);
routerRendezVous.delete("/:id", deleteRendezVous);

export default routerRendezVous;
