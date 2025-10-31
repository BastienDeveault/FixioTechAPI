import React from "react";
import { Link } from "react-router-dom";
import "./accueil.css";

const Accueil = () => {
  return (
    <div className="accueil-container">
      <div className="hero-section">
        <h1>Bienvenue sur FixioTech !</h1>
        <p className="hero-text">
          Votre solution de soutien technique en ligne disponible 24h/24. Prenez
          rendez-vous avec un technicien qualifié et obtenez de l'aide sans
          quitter le confort de votre domicile.
        </p>

        <div className="cta-boutons">
          <Link to="/rendez-vous" className="cta-bouton-rendez-vous">
            Prendre rendez-vous
          </Link>
          <Link to="/services_aides" className="cta-bouton-services">
            Nos services
          </Link>
        </div>
      </div>
      <div className="features-section">
        <div className="feature">
          <h3>Support 24/7</h3>
          <p>Assistance technique disponible à tout moment</p>
        </div>
        <div className="feature">
          <h3>Consultation vidéo</h3>
          <p>Rencontrez nos techniciens en face à face virtuellement</p>
        </div>
        <div className="feature">
          <h3>Solutions rapides</h3>
          <p>Résolution efficace de vos problèmes techniques</p>
        </div>
      </div>
    </div>
  );
};

export default Accueil;
