import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Render fournit DATABASE_URL directement
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // obligatoire pour Render
  },
});

// On crée un wrapper pour garder db.query(sql, params, callback)
// compatible avec tes contrôleurs actuels
export const db = {
  query(text, params, callback) {
    if (typeof params === "function") {
      callback = params;
      params = [];
    }

    pool
      .query(text, params)
      .then((res) => callback(null, res))
      .catch((err) => callback(err));
  },
};

// Test de connexion
export async function assertDb() {
  try {
    const res = await pool.query("SELECT 1 AS ok");
    return res.rows[0].ok === 1;
  } catch (error) {
    console.error(error);
    return false;
  }
}