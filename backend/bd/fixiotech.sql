-- ====================================================================
-- DB FixioTech — Script Idempotent (relançable)
-- Compatible MySQL 8+
-- ====================================================================

-- 1) Créer la base si elle n'existe pas
CREATE DATABASE IF NOT EXISTS fixiotech
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE fixiotech;

-- 2) Créer l'utilisateur si absent
CREATE USER IF NOT EXISTS 'fixio'@'localhost' IDENTIFIED BY 'fixio123!?$';
GRANT ALL PRIVILEGES ON fixiotech.* TO 'fixio'@'localhost';
FLUSH PRIVILEGES;

-- ====================================================================
-- TABLE utilisateurs
-- ====================================================================

CREATE TABLE IF NOT EXISTS utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  nom_complet VARCHAR(100) NOT NULL,
  role ENUM('client','employe','admin') NOT NULL DEFAULT 'client'
) ENGINE=InnoDB;

-- ====================================================================
-- TABLE horaires (1 employé = 1 horaire)
-- ====================================================================

CREATE TABLE IF NOT EXISTS horaires (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employe_id INT NOT NULL UNIQUE,

  lundi_debut TIME NULL,     lundi_fin TIME NULL,
  mardi_debut TIME NULL,     mardi_fin TIME NULL,
  mercredi_debut TIME NULL,  mercredi_fin TIME NULL,
  jeudi_debut TIME NULL,     jeudi_fin TIME NULL,
  vendredi_debut TIME NULL,  vendredi_fin TIME NULL,
  samedi_debut TIME NULL,    samedi_fin TIME NULL,
  dimanche_debut TIME NULL,  dimanche_fin TIME NULL,

  CONSTRAINT fk_horaires_employe
    FOREIGN KEY (employe_id)
    REFERENCES utilisateurs(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ====================================================================
-- TABLE rendez_vous
-- ====================================================================

CREATE TABLE IF NOT EXISTS rendez_vous (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id  INT NOT NULL,
  employe_id INT NOT NULL,
  date_rdv   DATE NOT NULL,
  heure_rdv  TIME NOT NULL,
  description_probleme TEXT NULL,
  statut ENUM('Programmé','Annulé','Terminé') DEFAULT 'Programmé',

  CONSTRAINT fk_rdv_client
    FOREIGN KEY (client_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  CONSTRAINT fk_rdv_employe
    FOREIGN KEY (employe_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,

  UNIQUE (employe_id, date_rdv, heure_rdv)
) ENGINE=InnoDB;

-- ====================================================================
-- Triggers — recréés seulement s'ils n'existent pas
-- MySQL n'a pas IF NOT EXISTS pour triggers → on doit DROP puis CREATE
-- ====================================================================

DROP TRIGGER IF EXISTS trg_horaires_role_ins;
DROP TRIGGER IF EXISTS trg_horaires_role_upd;
DROP TRIGGER IF EXISTS trg_rdv_roles_ins;
DROP TRIGGER IF EXISTS trg_rdv_roles_upd;

DELIMITER //

CREATE TRIGGER trg_horaires_role_ins
BEFORE INSERT ON horaires
FOR EACH ROW
BEGIN
  DECLARE r VARCHAR(10);
  SELECT role INTO r FROM utilisateurs WHERE id = NEW.employe_id;
  IF r IS NULL OR r <> 'employe' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='horaires: employe_id doit référencer employe';
  END IF;
END//

CREATE TRIGGER trg_horaires_role_upd
BEFORE UPDATE ON horaires
FOR EACH ROW
BEGIN
  DECLARE r VARCHAR(10);
  SELECT role INTO r FROM utilisateurs WHERE id = NEW.employe_id;
  IF r IS NULL OR r <> 'employe' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='horaires: employe_id doit référencer employe';
  END IF;
END//

CREATE TRIGGER trg_rdv_roles_ins
BEFORE INSERT ON rendez_vous
FOR EACH ROW
BEGIN
  DECLARE r_emp VARCHAR(10);
  DECLARE r_cli VARCHAR(10);
  SELECT role INTO r_emp FROM utilisateurs WHERE id = NEW.employe_id;
  SELECT role INTO r_cli FROM utilisateurs WHERE id = NEW.client_id;
  IF r_emp <> 'employe' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='rendez_vous: employe_id=employe'; END IF;
  IF r_cli <> 'client' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='rendez_vous: client_id=client'; END IF;
END//

CREATE TRIGGER trg_rdv_roles_upd
BEFORE UPDATE ON rendez_vous
FOR EACH ROW
BEGIN
  DECLARE r_emp VARCHAR(10);
  DECLARE r_cli VARCHAR(10);
  SELECT role INTO r_emp FROM utilisateurs WHERE id = NEW.employe_id;
  SELECT role INTO r_cli FROM utilisateurs WHERE id = NEW.client_id;
  IF r_emp <> 'employe' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='rendez_vous: employe_id=employe'; END IF;
  IF r_cli <> 'client' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='rendez_vous: client_id=client'; END IF;
END//

DELIMITER ;