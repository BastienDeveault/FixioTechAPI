import React from "react";
import "./services_aides.css";

const ServicesAides = () => {
  const services = [
    {
      id: 1,
      titre: "Diagnostic et Dépannage Informatique",
      description:
        "Assistance en direct par vidéo pour diagnostiquer et résoudre les problèmes de votre ordinateur, tablette ou téléphone intelligent.",
      details: [
        "Analyse des problèmes de performance",
        "Résolution des erreurs système",
        "Suppression de logiciels malveillants",
        "Optimisation du système",
      ],
      icone: "🖥️",
    },
    {
      id: 2,
      titre: "Installation et Configuration",
      description:
        "Guidage pas à pas pour l'installation et la configuration de vos logiciels et périphériques.",
      details: [
        "Installation de logiciels et applications",
        "Configuration de périphériques",
        "Mise à jour des pilotes",
        "Paramétrage de la sécurité",
      ],
      icone: "⚙️",
    },
    {
      id: 4,
      titre: "Récupération de Données",
      description:
        "Aide à la récupération de vos fichiers perdus ou supprimés accidentellement.",
      details: [
        "Récupération de fichiers effacés",
        "Sauvegarde de données",
        "Transfert de données",
        "Conseil en stockage sécurisé",
      ],
      icone: "💾",
    },
    {
      id: 5,
      titre: "Formation Personnalisée",
      description:
        "Sessions de formation individuelles pour mieux maîtriser vos outils numériques.",
      details: [
        "Initiation aux logiciels courants",
        "Utilisation avancée des applications",
        "Sécurité et bonnes pratiques",
        "Productivité numérique",
      ],
      icone: "📚",
    },
    {
      id: 6,
      titre: "Support Professionnel",
      description:
        "Solutions adaptées aux besoins des professionnels et des entreprises.",
      details: [
        "Configuration de postes de travail",
        "Gestion des outils collaboratifs",
        "Support logiciels métiers",
        "Conseil en infrastructure",
      ],
      icone: "💼",
    },
  ];

  return (
    <div className="services-container">
      <div className="services-header">
        <h1>Nos Services d'Assistance Technique</h1>
        <p className="services-intro">
          Bénéficiez d'une assistance technique professionnelle en temps réel
          grâce à nos sessions vidéo personnalisées. Nos experts sont
          disponibles 24h/24 pour résoudre tous vos problèmes techniques.
        </p>
      </div>

      <div className="services-grid">
        {services.map((service) => (
          <div key={service.id} className="service-card">
            <div className="service-icon">{service.icone}</div>
            <h2>{service.titre}</h2>
            <p className="service-description">{service.description}</p>
            <ul className="service-details">
              {service.details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="services-cta">
        <h3>Prêt à résoudre vos problèmes techniques ?</h3>
        <p>
          Prenez rendez-vous avec l'un de nos experts et obtenez une assistance
          personnalisée en quelques clics.
        </p>
        <button
          onClick={() => (window.location.href = "/rendez-vous")}
          className="cta-bouton"
        >
          Prendre Rendez-vous
        </button>
      </div>
    </div>
  );
};

export default ServicesAides;
