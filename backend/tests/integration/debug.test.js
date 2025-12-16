import { describe, it } from "vitest";
import request from "supertest";
import app from "../../app.js";

describe("Test de base", () => {
  it("devrait répondre à /health", async () => {
    const response = await request(app).get("/health").timeout(5000);

    console.log("Status:", response.status);
    console.log("Body:", response.text);
  }, 10000);
});

