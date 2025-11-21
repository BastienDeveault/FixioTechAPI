import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { assertDb, db } from "./config/databaseConnexion.js";
import routerUtilisateur from "./routes/routeUtilisateur.js";
import routerHoraire from "./routes/routeHoraire.js";
import routerRendezVous from "./routes/routeRendezVous.js";
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

// ---- CORS ----
const allowList = new Set([
  "http://localhost:5173",
  process.env.FRONTEND_ORIGIN, // ex: https://ton-frontend.onrender.com
]);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // outils CLI, Postman
      if (allowList.has(origin) || origin.endsWith(".onrender.com"))
        return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ---- Middlewares / routes ----
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await assertDb();
    res.status(200).send("OK");
  } catch {
    res.status(500).send("DB DOWN");
  }
});

app.use("/api/utilisateurs", routerUtilisateur);
app.use("/api/horaires", routerHoraire);
app.use("/api/rendezVous", routerRendezVous);

app.get("/test-db", async (_req, res) => {
  try {
    const result = await new Promise((resolve, reject) => {
      db.query("SELECT NOW()", (err, r) => {
        if (err) reject(err);
        else resolve(r);
      });
    });

    const now = result.rows[0].now;
    res.status(200).send(`Database OK — NOW() = ${now}`);
  } catch (error) {
    res.status(500).send(`Database ERROR — ${error.message}`);
  }
});

app.use(errorHandler);

// ---- Lancement ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API écoute sur le port ${PORT}`);
});

export default app;
