import { describe, it, expect} from "vitest";
import request from "supertest";
import app from "../../app.js";

describe("Tests d'intégration - API Utilisateurs", () => {
  let testUserId;
  const testUser = {
    email: `test.integration.${Date.now()}@fixiotech.com`,
    mot_de_passe: "Test1234$",
    nom_complet: "Test Integration",
    role: "client",
  };

  describe("POST /api/utilisateurs - Inscription", () => {
    it("devrait créer un nouvel utilisateur avec des données valides", async () => {
      const response = await request(app)
        .post("/api/utilisateurs")
        .send(testUser)
        .expect("Content-Type", /json/)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.nom_complet).toBe(testUser.nom_complet);
      expect(response.body.role).toBe(testUser.role);
      expect(response.body).not.toHaveProperty("mot_de_passe");

      testUserId = response.body.id;
    });

    it("devrait rejeter une inscription avec un email déjà utilisé", async () => {
      const response = await request(app)
        .post("/api/utilisateurs")
        .send(testUser)
        .expect("Content-Type", /json/)
        .expect(409);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("email est déjà utilisé");
    });

    it("devrait rejeter une inscription avec des champs manquants", async () => {
      const response = await request(app)
        .post("/api/utilisateurs")
        .send({
          email: "incomplete@test.com",
          // mot_de_passe manquant
          nom_complet: "Test Incomplet",
        })
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });

    it("devrait rejeter une inscription avec un email invalide", async () => {
      const response = await request(app)
        .post("/api/utilisateurs")
        .send({
          email: "email-invalide",
          mot_de_passe: "Test1234$",
          nom_complet: "Test Email Invalide",
        })
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /api/utilisateurs/login - Connexion", () => {
    it("devrait connecter un utilisateur avec des identifiants valides", async () => {
      const response = await request(app)
        .post("/api/utilisateurs/login")
        .send({
          email: testUser.email,
          mot_de_passe: testUser.mot_de_passe,
        })
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("id");
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.role).toBe(testUser.role);
      expect(response.body).not.toHaveProperty("mot_de_passe");
    });

    it("devrait rejeter une connexion avec un email inexistant", async () => {
      const response = await request(app)
        .post("/api/utilisateurs/login")
        .send({
          email: "inexistant@test.com",
          mot_de_passe: "Test1234$",
        })
        .expect("Content-Type", /json/)
        .expect(401);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("Email ou mot de passe incorrect");
    });

    it("devrait rejeter une connexion avec un mot de passe incorrect", async () => {
      const response = await request(app)
        .post("/api/utilisateurs/login")
        .send({
          email: testUser.email,
          mot_de_passe: "MauvaisMotDePasse123$",
        })
        .expect("Content-Type", /json/)
        .expect(401);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("Email ou mot de passe incorrect");
    });
  });

  describe("GET /api/utilisateurs - Liste des utilisateurs", () => {
    it("devrait récupérer la liste de tous les utilisateurs", async () => {
      const response = await request(app)
        .get("/api/utilisateurs")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty("id");
      expect(response.body[0]).toHaveProperty("email");
      expect(response.body[0]).not.toHaveProperty("mot_de_passe");
    });

    it("devrait filtrer les utilisateurs par role", async () => {
      const response = await request(app)
        .get("/api/utilisateurs?role=client")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((user) => {
        expect(user.role).toBe("client");
      });
    });
  });

  describe("GET /api/utilisateurs/:id - Détails d'un utilisateur", () => {
    it("devrait récupérer les détails d'un utilisateur existant", async () => {
      const response = await request(app)
        .get(`/api/utilisateurs/${testUserId}`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("id", testUserId);
      expect(response.body).toHaveProperty("email", testUser.email);
      expect(response.body).not.toHaveProperty("mot_de_passe");
    });

    it("devrait retourner 404 pour un utilisateur inexistant", async () => {
      const response = await request(app)
        .get("/api/utilisateurs/99999")
        .expect("Content-Type", /json/)
        .expect(404);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("non trouvé");
    });
  });

  describe("GET /api/utilisateurs/disponibles - Employés disponibles", () => {
    it("devrait récupérer la liste des employés disponibles", async () => {
      const response = await request(app)
        .get("/api/utilisateurs/disponibles")
        .query({ date: "2025-12-01", heure: "10:00" })
        .expect("Content-Type", /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((employe) => {
        expect(employe.role).toBe("employe");
        expect(employe).toHaveProperty("id");
        expect(employe).toHaveProperty("nom_complet");
      });
    });
  });

  describe("PUT /api/utilisateurs/:id - Modification d'un utilisateur", () => {
    it("devrait modifier les informations d'un utilisateur", async () => {
      const updates = {
        nom_complet: "Test Integration Modifié",
      };

      const response = await request(app)
        .put(`/api/utilisateurs/${testUserId}`)
        .send(updates)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("id");
      expect(response.body.nom_complet).toBe(updates.nom_complet);
    });

    it("devrait retourner 404 pour la modification d'un utilisateur inexistant", async () => {
      const response = await request(app)
        .put("/api/utilisateurs/99999")
        .send({ nom_complet: "Test" })
        .expect("Content-Type", /json/)
        .expect(404);

      expect(response.body).toHaveProperty("message");
    });
  });

  describe("DELETE /api/utilisateurs/:id - Suppression d'un utilisateur", () => {
    it("devrait supprimer un utilisateur existant", async () => {
      await request(app)
        .delete(`/api/utilisateurs/${testUserId}`)
        .expect("Content-Type", /json/)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("message");
          expect(res.body.message).toContain("supprimé");
        });
    });

    it("devrait retourner 404 pour la suppression d'un utilisateur inexistant", async () => {
      const response = await request(app)
        .delete("/api/utilisateurs/99999")
        .expect("Content-Type", /json/)
        .expect(404);

      expect(response.body).toHaveProperty("message");
    });

    it("devrait confirmer que l'utilisateur a bien été supprimé", async () => {
      await request(app)
        .get(`/api/utilisateurs/${testUserId}`)
        .expect("Content-Type", /json/)
        .expect(404);
    });
  });
});
