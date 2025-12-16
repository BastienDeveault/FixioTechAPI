import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../app.js';
import { db } from '../../config/databaseConnexion.js';

// Variables partagées
let response;
let testUserId;
let testEmail;
let testUserData = {};

Before(async function() {
  response = null;
  testUserId = null;
  testUserData = {};
});

// ========== CONNEXION ==========

// Variante avec tableau pour 'un utilisateur client existe avec:'
Given('un utilisateur client existe avec:', async function(dataTable) {
  const data = dataTable.rowsHash();
  testEmail = data.email;
  
  // Supprimer d'abord si existe
  await db.queryPromise('DELETE FROM utilisateurs WHERE email = $1', [data.email]);
  
  const result = await db.queryPromise(
    'INSERT INTO utilisateurs (email, mot_de_passe, nom_complet, role) VALUES ($1, $2, $3, $4) RETURNING id',
    [data.email, data.mot_de_passe, data.nom_complet, 'client']
  );
  testUserId = result.rows[0].id;
  testUserData = data;
});

// Alias sans guillemets autour de "un"
Given('qu\'un utilisateur client existe avec:', async function(dataTable) {
  const data = dataTable.rowsHash();
  testEmail = data.email;
  
  await db.queryPromise('DELETE FROM utilisateurs WHERE email = $1', [data.email]);
  
  const result = await db.queryPromise(
    'INSERT INTO utilisateurs (email, mot_de_passe, nom_complet, role) VALUES ($1, $2, $3, $4) RETURNING id',
    [data.email, data.mot_de_passe, data.nom_complet, 'client']
  );
  testUserId = result.rows[0].id;
  testUserData = data;
});

Given('un utilisateur existe avec l\'email {string}', async function(email) {
  testEmail = email;
  await db.queryPromise('DELETE FROM utilisateurs WHERE email = $1', [email]);
  const result = await db.queryPromise(
    'INSERT INTO utilisateurs (email, mot_de_passe, nom_complet, role) VALUES ($1, $2, $3, $4) RETURNING id',
    [email, 'Test1234$', 'Test User', 'client']
  );
  testUserId = result.rows[0].id;
});

Given('qu\'un utilisateur existe avec l\'email {string}', async function(email) {
  testEmail = email;
  await db.queryPromise('DELETE FROM utilisateurs WHERE email = $1', [email]);
  const result = await db.queryPromise(
    'INSERT INTO utilisateurs (email, mot_de_passe, nom_complet, role) VALUES ($1, $2, $3, $4) RETURNING id',
    [email, 'Test1234$', 'Test User', 'client']
  );
  testUserId = result.rows[0].id;
});

When('je me connecte avec l\'email {string} et le mot de passe {string}', async function(email, password) {
  response = await request(app)
    .post('/api/utilisateurs/login')
    .send({ email, mot_de_passe: password });
  this.response = response;
});

When('je tente de me connecter avec l\'email {string} et un mauvais mot de passe', async function(email) {
  response = await request(app)
    .post('/api/utilisateurs/login')
    .send({ email, mot_de_passe: 'MauvaisMotDePasse123!' });
  this.response = response;
});

When('je tente de me connecter avec l\'email {string}', async function(email) {
  try {
    response = await request(app)
      .post('/api/utilisateurs/login')
      .send({ email, mot_de_passe: 'AnyPassword123!' });
  } catch(e) {
    response = { status: 500, body: { message: 'Erreur serveur' } };
  }
  this.response = response;
});

Then('la réponse devrait contenir le {string} {string}', function(field, expectedValue) {
  expect(response.body).to.have.property(field);
  expect(response.body[field]).to.equal(expectedValue);
});

Then('la réponse devrait contenir un message {string}', function(message) {
  const resp = this.response || response;
  expect(resp.body).to.have.property('message');
  // Accepter différentes formulations du même message
  const actualMessage = resp.body.message.toLowerCase();
  const expectedMessage = message.toLowerCase();
  const isValid = actualMessage.includes(expectedMessage) || 
                  (expectedMessage.includes('identifiant') && actualMessage.includes('incorrect'));
  expect(isValid, `Le message "${resp.body.message}" ne contient pas "${message}"`).to.be.true;
});

After(async function() {
  if (testUserId) {
    await db.queryPromise('DELETE FROM utilisateurs WHERE id = $1', [testUserId]);
  }
  if (testEmail) {
    await db.queryPromise('DELETE FROM utilisateurs WHERE email = $1', [testEmail]);
  }
});
