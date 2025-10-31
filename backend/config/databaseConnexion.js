import mysql from "mysql2/promise";
import { Buffer } from "node:buffer";

const isProd = process.env.NODE_ENV === "production";

// Décode le CA si fourni (sinon undefined)
const mysqlCa = process.env.MYSQL_CA_B64
  ? Buffer.from(process.env.MYSQL_CA_B64, "base64").toString("ascii")
  : undefined;

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Aiven exige TLS en prod ; on passe explicitement le CA
  ssl: isProd
    ? {
        ca: mysqlCa,
        rejectUnauthorized: true,
        minVersion: "TLSv1.2",
      }
    : undefined,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function assertDb() {
  const [rows] = await db.query("SELECT 1");
  return rows;
}
