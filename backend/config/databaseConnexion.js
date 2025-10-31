import mysql from "mysql2"

const db = mysql.createConnection({
    host: "localhost",
    user: "fixio",
    password: "fixio123!?$",
    database: "fixiotech"
});

db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
    } else {
        console.log('Connecté à la base de données MySQL.');
    }
});

export default db;
