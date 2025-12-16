import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../app.js';
import { db } from '../../config/databaseConnexion.js';

// Variables partagées
let response;
let testClientId;
let testEmployeId;
let testRendezVousId;
let testData = {};
let testIds = [];

Before(async function() {
  response = null;
  testData = {};
  testIds = [];
});

// ========== RENDEZ-VOUS ==========

Given('un client existe avec l\'email {string}', async function(email) {
  await db.queryPromise('DELETE FROM utilisateurs WHERE email = $1', [email]);
  const result = await db.queryPromise(
    'INSERT INTO utilisateurs (email, mot_de_passe, nom_complet, role) VALUES ($1, $2, $3, $4) RETURNING id',
    [email, 'Test1234$', 'Client Test RDV', 'client']
  );
  testClientId = result.rows[0].id;
  testIds.push({ type: 'utilisateur', id: testClientId });
});

Given('qu\'un client existe avec l\'email {string}', async function(email) {
  await db.queryPromise('DELETE FROM utilisateurs WHERE email = $1', [email]);
  const result = await db.queryPromise(
    'INSERT INTO utilisateurs (email, mot_de_passe, nom_complet, role) VALUES ($1, $2, $3, $4) RETURNING id',
    [email, 'Test1234$', 'Client Test RDV', 'client']
  );
  testClientId = result.rows[0].id;
  testIds.push({ type: 'utilisateur', id: testClientId });
});

Given('un employé {string} avec l\'email {string} a des horaires disponibles', async function(nom, email) {
  await db.queryPromise('DELETE FROM utilisateurs WHERE email = $1', [email]);
  const result = await db.queryPromise(
    'INSERT INTO utilisateurs (email, mot_de_passe, nom_complet, role) VALUES ($1, $2, $3, $4) RETURNING id',
    [email, 'Test1234$', nom, 'employe']
  );
  testEmployeId = result.rows[0].id;
  testIds.push({ type: 'utilisateur', id: testEmployeId });

  // Créer des horaires pour l'employé
  await db.queryPromise(
    `INSERT INTO horaires (employe_id, lundi_debut, lundi_fin, mardi_debut, mardi_fin, 
     mercredi_debut, mercredi_fin, jeudi_debut, jeudi_fin, vendredi_debut, vendredi_fin)
     VALUES ($1, '09:00', '17:00', '09:00', '17:00', '09:00', '17:00', '09:00', '17:00', '09:00', '17:00')`,
    [testEmployeId]
  );
});

Given('qu\'un employé {string} avec l\'email {string} a des horaires disponibles', async function(nom, email) {
  await db.queryPromise('DELETE FROM utilisateurs WHERE email = $1', [email]);
  const result = await db.queryPromise(
    'INSERT INTO utilisateurs (email, mot_de_passe, nom_complet, role) VALUES ($1, $2, $3, $4) RETURNING id',
    [email, 'Test1234$', nom, 'employe']
  );
  testEmployeId = result.rows[0].id;
  testIds.push({ type: 'utilisateur', id: testEmployeId });

  await db.queryPromise(
    `INSERT INTO horaires (employe_id, lundi_debut, lundi_fin, mardi_debut, mardi_fin, 
     mercredi_debut, mercredi_fin, jeudi_debut, jeudi_fin, vendredi_debut, vendredi_fin)
     VALUES ($1, '09:00', '17:00', '09:00', '17:00', '09:00', '17:00', '09:00', '17:00', '09:00', '17:00')`,
    [testEmployeId]
  );
});

Given('le client est connecté', function() {
  testData.isAuthenticated = true;
});

Given('que le client est connecté', function() {
  testData.isAuthenticated = true;
});

Given('j\'ai un rendez-vous programmé', async function() {
  const result = await db.queryPromise(
    'INSERT INTO rendez_vous (client_id, employe_id, date_rdv, heure_rdv, description_probleme) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [testClientId, testEmployeId, '2025-12-15', '10:00:00', 'Test rendez-vous']
  );
  testRendezVousId = result.rows[0].id;
  testIds.push({ type: 'rendez_vous', id: testRendezVousId });
});

Given('que j\'ai un rendez-vous programmé', async function() {
  const result = await db.queryPromise(
    'INSERT INTO rendez_vous (client_id, employe_id, date_rdv, heure_rdv, description_probleme) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [testClientId, testEmployeId, '2025-12-15', '10:00:00', 'Test rendez-vous']
  );
  testRendezVousId = result.rows[0].id;
  testIds.push({ type: 'rendez_vous', id: testRendezVousId });
});

Given('que j\'ai un rendez-vous avec l\'id {string}', async function(idLabel) {
  const result = await db.queryPromise(
    'INSERT INTO rendez_vous (client_id, employe_id, date_rdv, heure_rdv, description_probleme) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [testClientId, testEmployeId, '2025-12-20', '14:00:00', 'Rendez-vous de test']
  );
  testRendezVousId = result.rows[0].id;
  testIds.push({ type: 'rendez_vous', id: testRendezVousId });
  testData[idLabel] = testRendezVousId;
});

When('je crée un rendez-vous pour le {string} à {string}', function(date, heure) {
  testData.date_rdv = date;
  testData.heure_rdv = heure;
});

When('je spécifie le problème {string}', function(description) {
  testData.description_probleme = description;
});

When('je spécifie le service {string}', function(service) {
  testData.service = service;
});

// eslint-disable-next-line no-unused-vars
When('je sélectionne l\'employé {string}', async function(_employeEmail) {
  testData.client_id = testClientId;
  testData.employe_id = testEmployeId;
  
  response = await request(app)
    .post('/api/rendezVous')
    .send(testData);
  this.response = response;
  
  if (response.status === 201) {
    testRendezVousId = response.body.id;
    testIds.push({ type: 'rendez_vous', id: testRendezVousId });
  }
});

When('je tente de créer un rendez-vous pour le {string}', async function(date) {
  response = await request(app)
    .post('/api/rendezVous')
    .send({
      client_id: testClientId,
      employe_id: testEmployeId,
      date_rdv: date,
      heure_rdv: '10:00:00',
      description_probleme: 'Test date passée'
    });
  this.response = response;
});

When('je consulte la liste de mes rendez-vous', async function() {
  response = await request(app)
    .get(`/api/rendezVous?client_id=${testClientId}`);
  this.response = response;
});

Then('la réponse devrait contenir un {string} de rendez-vous', function(field) {
  expect(response.body).to.have.property(field);
  expect(response.body[field]).to.be.a('number');
});

Then('le statut du rendez-vous devrait être {string}', function(statut) {
  expect(response.body).to.have.property('statut');
  expect(response.body.statut).to.equal(statut);
});

Then('la date devrait être {string}', function(date) {
  expect(response.body.date_rdv).to.include(date);
});

Then('la réponse devrait contenir {string} dans le message', function(text) {
  expect(response.body.message).to.include(text);
});

Then('la liste devrait contenir au moins {int} rendez-vous', function(count) {
  expect(Array.isArray(response.body)).to.be.true;
  expect(response.body.length).to.be.at.least(count);
});

Then('chaque rendez-vous devrait avoir une {string} et un {string}', function(field1, field2) {
  expect(response.body[0]).to.have.property(field1);
  expect(response.body[0]).to.have.property(field2);
});

// Nettoyage après chaque scénario
After(async function() {
  // Supprimer dans l'ordre inverse (rendez-vous avant utilisateurs)
  for (const item of testIds.reverse()) {
    if (item.type === 'rendez_vous') {
      await db.queryPromise('DELETE FROM rendez_vous WHERE id = $1', [item.id]);
    }
  }
  for (const item of testIds) {
    if (item.type === 'utilisateur') {
      await db.queryPromise('DELETE FROM horaires WHERE employe_id = $1', [item.id]);
      await db.queryPromise('DELETE FROM utilisateurs WHERE id = $1', [item.id]);
    }
  }
});
