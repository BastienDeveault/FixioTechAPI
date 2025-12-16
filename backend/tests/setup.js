import { beforeAll, afterAll } from "vitest";
import { db } from "../config/databaseConnexion.js";

// Nettoyer la base de données avant tous les tests
beforeAll(async () => {
  console.log("🧪 Configuration des tests d'intégration...");

  // Nettoyer les tables de test (optionnel)
  // await db.query('DELETE FROM rendez_vous WHERE client_id > 1000');
  // await db.query('DELETE FROM utilisateurs WHERE id > 1000');
});

// Fermer les connexions après tous les tests
afterAll(async () => {
  console.log("🧹 Nettoyage après les tests...");
});
