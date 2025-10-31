import mysql from "mysql2/promise";

const ssl =
  process.env.DB_SSL === "true"
    ? { rejectUnauthorized: true, minVersion: "TLSv1.2" }
    : undefined;

export const db = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "",
  ssl,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function assertDb() {
  const [rows] = await db.query("SELECT 1 AS ok");
  return rows[0]?.ok === 1;
}
