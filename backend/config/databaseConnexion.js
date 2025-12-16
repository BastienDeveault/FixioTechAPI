import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

let pool;

if (isProduction) {
  // PROD (Render) → on utilise DATABASE_URL + SSL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // DEV LOCAL & TEST → on utilise les variables d'environnement
  pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "fixiotech",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    client_encoding: "UTF8",
    // Shorter connection timeout for tests
    connectionTimeoutMillis: isTest ? 5000 : 10000,
  });
}

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
  
  // Méthode pour requêtes async/await
  async queryPromise(text, params = []) {
    return await pool.query(text, params);
  }
};

export async function assertDb() {
  try {
    const res = await pool.query("SELECT 1 AS ok");
    return res.rows[0].ok === 1;
  } catch (error) {
    console.error(error);
    return false;
  }
}
