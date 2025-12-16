import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../app.js';
import { db } from '../../config/databaseConnexion.js';

// Variables partagées entre les steps
let response;
let testUserId;
let testEmail;
let testData = {};

// Nettoyage avant chaque scénario
Before(async function() {
  response = null;
  testUserId = null;
  testData = {};
});

// ========== INSCRIPTION ==========

Given('je suis sur la page d\'inscription', function() {
  // Pas d'action nécessaire pour l'API
  return true;
});

Given('que je suis sur la page d\'inscription', function() {
  // Alias - Pas d'action nécessaire pour l'API
  return true;
});

Given('aucun utilisateur avec l\'email {string} n\'existe', async function(email) {
  await db.queryPromise('DELETE FROM utilisateurs WHERE email = $1', [email]);
  testEmail = email;
});

Given('qu\'aucun utilisateur avec l\'email {string} n\'existe', async function(email) {
  await db.queryPromise('DELETE FROM utilisateurs WHERE email = $1', [email]);
  testEmail = email;
});

Given('un utilisateur avec l\'email {string} existe déjà', async function(email) {
  await db.queryPromise('DELETE FROM utilisateurs WHERE email = $1', [email]);
  const result = await db.queryPromise(
    'INSERT INTO utilisateurs (email, mot_de_passe, nom_complet, role) VALUES ($1, $2, $3, $4) RETURNING id',
    [email, 'Test1234$', 'Utilisateur Existant', 'client']
  );
  testUserId = result.rows[0].id;
  testEmail = email;
});

Given('qu\'un utilisateur avec l\'email {string} existe déjà', async function(email) {
  await db.queryPromise('DELETE FROM utilisateurs WHERE email = $1', [email]);
  const result = await db.queryPromise(
    'INSERT INTO utilisateurs (email, mot_de_passe, nom_complet, role) VALUES ($1, $2, $3, $4) RETURNING id',
    [email, 'Test1234$', 'Utilisateur Existant', 'client']
  );
  testUserId = result.rows[0].id;
  testEmail = email;
});

When('je remplis le formulaire avec:', async function(dataTable) {
  const data = dataTable.rowsHash();
  testData = data;
});

When('je soumets le formulaire d\'inscription', async function() {
  response = await request(app)
    .post('/api/utilisateurs/inscription')
    .send(testData);
  this.response = response;
});

When('je tente de m\'inscrire avec l\'email {string}', async function(email) {
  response = await request(app)
    .post('/api/utilisateurs/inscription')
    .send({
      email: email,
      mot_de_passe: 'Test1234$',
      nom_complet: 'Test User',
      role: 'client'
    });
  this.response = response;
});

When('je tente de m\'inscrire avec un mot de passe {string}', async function(password) {
  response = await request(app)
    .post('/api/utilisateurs/inscription')
    .send({
      email: 'test@invalid.com',
      mot_de_passe: password,
      nom_complet: 'Test User',
      role: 'client'
    });
  this.response = response;
});

Then('je devrais recevoir un code de statut {int}', function(statusCode) {
  // Utiliser this.response si disponible, sinon response
  const resp = this.response || response;
  expect(resp).to.not.be.null;
  expect(resp.status).to.equal(statusCode);
});

Then('la réponse devrait contenir un {string}', function(field) {
  expect(response.body).to.have.property(field);
});

Then('la réponse devrait contenir l\'email {string}', function(email) {
  expect(response.body.email).to.equal(email);
});

Then('la réponse devrait contenir un message d\'erreur', function() {
  const resp = this.response || response;
  expect(resp).to.not.be.null;
  expect(resp.body).to.have.property('message');
  expect(resp.body.message).to.be.a('string');
});

Then('la réponse devrait contenir un message d\'erreur sur le mot de passe', function() {
  expect(response.body).to.have.property('message');
  expect(response.body.message.toLowerCase()).to.match(/mot.*passe|password/);
});

// Nettoyage après chaque scénario
After(async function() {
  // Nettoyer les données de test
  if (testEmail) {
    await db.queryPromise('DELETE FROM utilisateurs WHERE email = $1', [testEmail]);
  }
  if (testUserId) {
    await db.queryPromise('DELETE FROM utilisateurs WHERE id = $1', [testUserId]);
  }
});
