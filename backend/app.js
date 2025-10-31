import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import routerUtilisateur from "./routes/routeUtilisateur.js";
import routerHoraire from "./routes/routeHoraire.js";
import routerRendezVous from "./routes/routeRendezVous.js";
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

const origins = ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || origins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/utilisateurs", routerUtilisateur);
app.use("/api/horaires", routerHoraire);
app.use("/api/rendezVous", routerRendezVous);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Api écoute sur le port ${PORT}`));

export default app;
