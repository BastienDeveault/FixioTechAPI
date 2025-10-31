import React, { useEffect, useMemo, useState } from "react";
import "./rendez-vous.css";
import { useAuth } from "../context/AuthContext";
import { addRendezVous } from "../../services/apiRendezVous";
import {
  getEmployes,
  getEmployesDisponibles,
} from "../../services/apiUtilisateur";

const RendezVous = () => {
  const { user, role } = useAuth();

  // ---------- UI state ----------
  const [formData, setFormData] = useState({
    service: "",
    date: "",
    heure: "",
    technicien: "", // employe_id (string)
    description: "",
  });

  // Tous les employés (pour affichage quand pas de date)
  const [allEmployes, setAllEmployes] = useState([]);
  const [loadingAllTech, setLoadingAllTech] = useState(true);

  // Employés disponibles pour un créneau (date+heure)
  const [techniciensDispo, setTechniciensDispo] = useState([]);
  const [loadingDispo, setLoadingDispo] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ---------- Constantes ----------
  const services = [
    "Réparation d'ordinateurs",
    "Réparation de cellulaires",
    "Réparation de tablettes",
    "Services à domicile",
    "Support technique",
    "Formation personnalisée",
  ];

  // 08:00 → 18:00, format "HH:mm"
  const creneauxHoraires = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => {
        const h = String(i + 8).padStart(2, "0");
        return `${h}:00`;
      }),
    []
  );

  // ---------- Helpers ----------
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleChange = (e) => {
    setError("");
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    let alive = true;
    setLoadingAllTech(true);
    setError("");

    getEmployes()
      .then((list) => {
        if (!alive) return;
        setAllEmployes(list || []);
      })
      .catch((err) => {
        if (!alive) return;
        setAllEmployes([]);
        setError(err.message || "Erreur lors du chargement des techniciens.");
      })
      .finally(() => alive && setLoadingAllTech(false));

    return () => {
      alive = false;
    };
  }, []);

  // Charger dynamiquement les techniciens disponibles dès qu'on a date + heure
  useEffect(() => {
    const { date, heure } = formData;

    // Pas de date → on n’appelle pas /disponibles
    if (!date) {
      setTechniciensDispo([]);
      return;
    }
    // Date sans heure → on attend l’heure
    if (date && !heure) {
      setTechniciensDispo([]);
      return;
    }

    let alive = true;
    setLoadingDispo(true);
    setError("");

    getEmployesDisponibles(date, heure)
      .then((list) => {
        if (!alive) return;
        setTechniciensDispo(list || []);
        // Si un tech sélectionné n'est plus dans la liste, on le déselectionne
        if (
          formData.technicien &&
          !(list || []).some(
            (t) => String(t.id) === String(formData.technicien)
          )
        ) {
          setFormData((f) => ({ ...f, technicien: "" }));
        }
      })
      .catch((err) => {
        if (!alive) return;
        setTechniciensDispo([]);
        setError(
          err.message ||
            "Erreur lors du chargement des techniciens disponibles."
        );
      })
      .finally(() => alive && setLoadingDispo(false));

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.date, formData.heure]);

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!formData.service) return setError("Veuillez sélectionner un service");
    if (!formData.date) return setError("Veuillez sélectionner une date");
    if (!formData.heure) return setError("Veuillez sélectionner une heure");
    if (!formData.description.trim())
      return setError("Veuillez décrire brièvement votre problème");

    const dateSelectionnee = new Date(formData.date);
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    if (dateSelectionnee < aujourdhui)
      return setError("La date ne peut pas être dans le passé");

    if (!user?.id) return setError("Vous devez être connecté pour réserver.");

    setIsLoading(true);

    try {
      await addRendezVous({
        client_id: user.id,
        date_rdv: formData.date,
        heure_rdv: formData.heure,
        description_probleme: formData.description,
      });

      setSuccessMessage("Votre rendez-vous a été réservé avec succès !");
      setFormData({ service: "", date: "", heure: "", description: "" });
    } catch (err) {
      setError(err.message || "Aucun technicien disponible à cette heure.");
    } finally {
      setIsLoading(false);
    }
  };

  // Liste de techniciens à afficher selon le contexte :
  // - Pas de date → TOUS les employés (allEmployes)
  // - Date+heure → seulement les disponibles (techniciensDispo)
  const afficherAll = !(formData.date && formData.heure);
  const listeTechniciens = afficherAll ? allEmployes : techniciensDispo;
  const loadingTech = afficherAll ? loadingAllTech : loadingDispo;

  // ---------- Render ----------
  return (
    <div className="rendez-vous-container">
      <div className="rendez-vous-header">
        <h1>Prendre un Rendez-vous</h1>
        <p className="rendez-vous-intro">
          Sélectionnez un service, choisissez un technicien disponible et
          planifiez votre rendez-vous en quelques clics.
        </p>
      </div>

      <div className="rendez-vous-content">
        {/* TECHNICIENS */}
        <div className="techniciens-section">
          <h2>Techniciens {afficherAll ? " (tous)" : "Disponibles"}</h2>

          {afficherAll ? (
            // Aucun date sélectionnée → on affiche TOUS les employés
            loadingTech ? (
              <div className="loading-tech">Chargement des techniciens…</div>
            ) : listeTechniciens.length === 0 ? (
              <div className="no-tech">
                Aucun technicien disponible pour ce créneau.
              </div>
            ) : (
              <div className="techniciens-liste">
                {listeTechniciens.map((t) => (
                  <div
                    key={t.id}
                    className={`technicien-card ${
                      formData.technicien === String(t.id)
                        ? "technicien-selected"
                        : ""
                    }`}
                    onClick={() =>
                      setFormData((f) => ({ ...f, technicien: String(t.id) }))
                    }
                  >
                    <div className="technicien-avatar">
                      {String(t.nom_complet || t.email || "T")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div className="technicien-info">
                      <h3>{t.nom_complet || "Technicien"}</h3>
                      <p>Support & Réparation</p>
                    </div>
                    {formData.technicien === String(t.id) && (
                      <div className="technicien-check">✓</div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : !formData.heure ? (
            // Date choisie mais pas l'heure
            <div className="no-tech">
              Sélectionnez une heure pour voir les techniciens disponibles.
            </div>
          ) : loadingTech ? (
            <div className="loading-tech">Chargement des techniciens…</div>
          ) : listeTechniciens.length === 0 ? (
            // Date + heure choisies ET aucun dispo
            <div className="no-tech">
              Aucun technicien disponible pour ce créneau.
            </div>
          ) : (
            <div className="techniciens-liste">
              {listeTechniciens.map((t) => (
                <div
                  key={t.id}
                  className={`technicien-card ${
                    formData.technicien === String(t.id)
                      ? "technicien-selected"
                      : ""
                  }`}
                  onClick={() =>
                    setFormData((f) => ({ ...f, technicien: String(t.id) }))
                  }
                >
                  <div className="technicien-avatar">
                    {String(t.nom_complet || t.email || "T")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="technicien-info">
                    <h3>{t.nom_complet || "Technicien"}</h3>
                    <p>Support & Réparation</p>
                  </div>
                  {formData.technicien === String(t.id) && (
                    <div className="technicien-check">✓</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FORMULAIRE */}
        <div className="formulaire-section">
          <h2>Détails du Rendez-vous</h2>

          {error && <div className="error-message">{error}</div>}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          <form onSubmit={handleSubmit} className="rendez-vous-form">
            <div className="form-groupe">
              <label htmlFor="service">Service requis *</label>
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">-- Sélectionnez un service --</option>
                {services.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-groupe">
                <label htmlFor="date">Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={getMinDate()}
                  className="form-input"
                />
              </div>

              <div className="form-groupe">
                <label htmlFor="heure">Heure *</label>
                <select
                  id="heure"
                  name="heure"
                  value={formData.heure}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">-- Sélectionnez une heure --</option>
                  {creneauxHoraires.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-groupe">
              <label htmlFor="description">Description du problème *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez brièvement le problème technique que vous rencontrez..."
                rows="5"
                className="form-textarea"
              />
            </div>

            <button
              type="submit"
              className="bouton-soumettre"
              disabled={isLoading}
            >
              {isLoading ? "Envoi en cours..." : "Réserver le rendez-vous"}
            </button>
          </form>

          <p className="form-note">
            * Champs obligatoires. Un technicien vous contactera dans les plus
            brefs délais pour confirmer votre rendez-vous.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RendezVous;
