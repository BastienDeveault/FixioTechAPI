import React, { useState } from "react";
import "./contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    courriel: "",
    telephone: "",
    sujet: "",
    message: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Gère les changements dans le formulaire
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  // Gère la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validations
    if (!formData.nom.trim() || !formData.prenom.trim()) {
      setError("Veuillez entrer votre nom et prénom");
      return;
    }

    if (!formData.courriel.trim()) {
      setError("Veuillez entrer votre adresse courriel");
      return;
    }

    // Validation du format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.courriel)) {
      setError("Veuillez entrer une adresse courriel valide");
      return;
    }

    if (!formData.sujet.trim()) {
      setError("Veuillez entrer un sujet");
      return;
    }

    if (!formData.message.trim()) {
      setError("Veuillez entrer votre message");
      return;
    }

    if (formData.message.trim().length < 10) {
      setError("Le message doit contenir au moins 10 caractères");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Appel à l'API backend pour envoyer le message
      // await sendContactMessage(formData);

      // Simulation d'un appel API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccessMessage(
        "Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais."
      );

      // Réinitialise le formulaire
      setFormData({
        nom: "",
        prenom: "",
        courriel: "",
        telephone: "",
        sujet: "",
        message: "",
      });
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi du message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Contactez-nous</h1>
        <p className="contact-intro">
          Une question ? Un problème technique ? Notre équipe est là pour vous
          aider. Contactez-nous par téléphone, courriel ou remplissez le
          formulaire ci-dessous.
        </p>
      </div>

      <div className="contact-content">
        {/* Section des informations de contact */}
        <div className="contact-info-section">
          <h2>Informations de Contact</h2>

          <div className="contact-cards">
            <div className="contact-card">
              <div className="contact-icon">📞</div>
              <h3>Téléphone</h3>
              <p className="contact-detail">1-800-FIXIO-24</p>
              <p className="contact-detail">(1-800-349-4624)</p>
              <p className="contact-hours">Lun - Ven: 8h - 20h</p>
              <p className="contact-hours">Sam - Dim: 9h - 17h</p>
            </div>

            <div className="contact-card">
              <div className="contact-icon">✉️</div>
              <h3>Courriel</h3>
              <p className="contact-detail">support@fixiotech.com</p>
              <p className="contact-detail">info@fixiotech.com</p>
              <p className="contact-hours">Réponse sous 24h</p>
            </div>

            <div className="contact-card">
              <div className="contact-icon">📍</div>
              <h3>Adresse</h3>
              <p className="contact-detail">123 Rue Tech</p>
              <p className="contact-detail">Montréal, QC H2X 1Y4</p>
              <p className="contact-detail">Canada</p>
            </div>

            <div className="contact-card">
              <div className="contact-icon">🕐</div>
              <h3>Heures d'ouverture</h3>
              <p className="contact-detail">Lundi - Vendredi</p>
              <p className="contact-hours">8h00 - 20h00</p>
              <p className="contact-detail">Samedi - Dimanche</p>
              <p className="contact-hours">9h00 - 17h00</p>
            </div>
          </div>

          <div className="urgence-section">
            <h3>🚨 Support d'urgence 24/7</h3>
            <p>
              Pour les urgences techniques en dehors des heures d'ouverture,
              appelez notre ligne d'urgence :
            </p>
            <p className="urgence-numero">1-800-URGENT-1</p>
          </div>
        </div>

        {/* Section du formulaire de contact */}
        <div className="contact-form-section">
          <h2>Envoyez-nous un message</h2>

          {error && <div className="error-message">{error}</div>}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-groupe">
                <label htmlFor="nom">Nom *</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  className="form-input"
                />
              </div>

              <div className="form-groupe">
                <label htmlFor="prenom">Prénom *</label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Votre prénom"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-groupe">
                <label htmlFor="courriel">Courriel *</label>
                <input
                  type="email"
                  id="courriel"
                  name="courriel"
                  value={formData.courriel}
                  onChange={handleChange}
                  placeholder="votre@courriel.com"
                  className="form-input"
                />
              </div>

              <div className="form-groupe">
                <label htmlFor="telephone">Téléphone</label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-groupe">
              <label htmlFor="sujet">Sujet *</label>
              <input
                type="text"
                id="sujet"
                name="sujet"
                value={formData.sujet}
                onChange={handleChange}
                placeholder="Objet de votre message"
                className="form-input"
              />
            </div>

            <div className="form-groupe">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Décrivez votre question ou problème en détail..."
                rows="6"
                className="form-textarea"
              />
            </div>

            <button
              type="submit"
              className="bouton-soumettre"
              disabled={isLoading}
            >
              {isLoading ? "Envoi en cours..." : "Envoyer le message"}
            </button>

            <p className="form-note">
              * Champs obligatoires. Nous nous engageons à répondre à tous les
              messages dans un délai de 24 heures.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
