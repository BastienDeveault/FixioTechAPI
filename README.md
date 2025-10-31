# FixioTech

FixioTech est une application web de gestion de rendez-vous entre
clients et employés, développée dans le cadre du projet de session.

## 📖 Description

L'application permet aux utilisateurs de : - Créer un compte et se
connecter - Consulter les horaires disponibles des employés - Réserver
des rendez-vous en fonction des plages horaires

Les employés peuvent : - Créer leur compte et se connecter - Gérer leurs
disponibilités - Consulter la liste des rendez-vous planifiés

## 🛠 Technologies utilisées

- **Front-end** : React, Vite
- **Back-end** : Node.js, Express
- **Base de données** : MySQL 8+
- **Tests** : Vitest, @testing-library/react, JSDOM

## 💻 Instructions d'installation

### 1️⃣ Prérequis

- Node.js 18+ et npm
- MySQL 8+
- Git

### 2️⃣ Installation du projet

Clonez le dépôt :

```bash
git clone https://github.com/<ton_repo>/FixioTech.git
cd FixioTech
```

Installez les dépendances :

```bash
npm install
```

### 3️⃣ Configuration de la base de données

1.  Ouvrir MySQL Workbench ou terminal\
2.  Exécuter le script SQL situé dans `/database/schema.sql` :

### 4️⃣ Lancer le projet

```bash
npm run dev
```

Le projet sera disponible sur <http://localhost:5173>.

## 👨‍💻 Manuel utilisateur (succinct)

### Utilisateur

1.  Aller sur la page d'accueil
2.  Cliquer sur **Inscription** pour créer un compte
3.  Entrer un email et un mot de passe valide
4.  Se connecter pour accéder aux fonctionnalités (prise de rendez-vous)

### Employé

1.  Créer un compte via **Inscription**
2.  Définir ses disponibilités
3.  Consulter les rendez-vous planifiés

## 🧪 Lancer les tests

Pour exécuter les tests unitaires (Vitest) :

```bash
npm run test
```

Les tests actuels couvrent : - Formulaire d'inscription (cas de
validation) - Formulaire de connexion (cas de validation)

Les tests d'intégration et end-to-end seront ajoutés dans les prochains
sprints.
