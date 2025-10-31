import mysql from "mysql2/promise";

const isProd = process.env.NODE_ENV === "production";

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Aiven exige TLS en prod ; local souvent sans TLS
  ssl: isProd
    ? {
        // Option 1 (souvent suffisant) :
        rejectUnauthorized: true,
        minVersion: "TLSv1.2",
        // Option 2 (si Aiven l’exige) : fournissez explicitement le CA
        // ca: Buffer.from(process.env.MYSQL_CA_B64 ?? "", "base64").toString("ascii"),
      }
    : undefined,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function assertDb() {
  const [rows] = await pool.query("SELECT 1");
  return rows;
}
