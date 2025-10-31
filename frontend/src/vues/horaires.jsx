import React, { useEffect, useMemo, useState } from "react";
import "./horaires.css";
import { useAuth } from "../context/AuthContext";
import {
  getHoraireByEmploye,
  addHoraire,
  updateHoraire,
} from "../../services/apiHoraire";

const JOURS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

// Helpers de mapping Front <-> Backend
const k = (jour, type) => `${jour.toLowerCase()}_${type}`; // ex: "Lundi","debut" -> "lundi_debut"

const Horaires = () => {
  const { user, role } = useAuth();
  const isEmploye = role === "employe";

  // État pour les horaires par jour (début et fin) + actif
  const [horairesParJour, setHorairesParJour] = useState(() => {
    // état initial : tout inactif, 08:00-17:00 par défaut
    const base = {};
    JOURS.forEach((j) => {
      base[j] = { actif: false, debut: "08:00", fin: "17:00" };
    });
    return base;
  });

  const [horaireId, setHoraireId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Génère les heures disponibles (8h à 18h)
  const heuresDisponibles = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => {
        const h = String(i + 8).padStart(2, "0");
        return `${h}:00`;
      }),
    []
  );

  // Charger l'horaire existant pour l'employé connecté (s’il existe)
  useEffect(() => {
    if (!user?.id || !isEmploye) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    getHoraireByEmploye(user.id)
      .then((h) => {
        // Aucun horaire encore créé → cas normal : on laisse le formulaire vide
        if (!h) {
          setHoraireId(null);
          return; // ✅ PAS de setForm ici
        }

        const next = {};
        JOURS.forEach((jour) => {
          const debut = h[k(jour, "debut")]; // ex: h.lundi_debut
          const fin = h[k(jour, "fin")];
          const actif = debut != null && fin != null;

          next[jour] = {
            actif,
            debut: actif ? String(debut).slice(0, 5) : "08:00",
            fin: actif ? String(fin).slice(0, 5) : "17:00",
          };
        });
        setHorairesParJour(next);
        setHoraireId(h.id);
      })
      .catch((err) => {
        // Toute autre erreur (réseau/serveur)
        setError(err.message || "Erreur lors du chargement de l'horaire.");
        setHoraireId(null);
      })
      .finally(() => setLoading(false));
  }, [user, isEmploye]);

  // Gère l'activation/désactivation d'un jour
  const handleJourToggle = (jour) => {
    setHorairesParJour((prev) => ({
      ...prev,
      [jour]: {
        ...prev[jour],
        actif: !prev[jour].actif,
      },
    }));
  };

  // Gère le changement d'heure de début
  const handleHeureDebutChange = (jour, heure) => {
    setHorairesParJour((prev) => ({
      ...prev,
      [jour]: {
        ...prev[jour],
        debut: heure,
      },
    }));
  };

  // Gère le changement d'heure de fin
  const handleHeureFinChange = (jour, heure) => {
    setHorairesParJour((prev) => ({
      ...prev,
      [jour]: {
        ...prev[jour],
        fin: heure,
      },
    }));
  };

  // Sauvegarde (create ou update)
  const handleSauvegarder = async () => {
    setError("");
    setSuccessMessage("");

    // Validation : si un jour est actif, fin > début
    for (const jour of JOURS) {
      const d = horairesParJour[jour];
      if (d.actif && d.debut >= d.fin) {
        setError(
          `Erreur pour ${jour} : L'heure de fin doit être après l'heure de début`
        );
        return;
      }
    }

    try {
      // Construire le payload backend
      // Jours inactifs => null
      const payload = {
        employe_id: user.id,
      };
      JOURS.forEach((jour) => {
        const d = horairesParJour[jour];
        payload[k(jour, "debut")] = d.actif ? d.debut : null;
        payload[k(jour, "fin")] = d.actif ? d.fin : null;
      });

      if (horaireId) {
        await updateHoraire(horaireId, payload);
        setSuccessMessage("Votre horaire a été mis à jour avec succès !");
      } else {
        const created = await addHoraire(payload);
        setHoraireId(created?.id ?? null);
        setSuccessMessage("Votre horaire a été créé avec succès !");
      }
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement de l'horaire");
    }
  };

  // Si l'utilisateur n'est pas un employé, affiche un message d'accès restreint
  if (!isEmploye) {
    return (
      <div className="restricted-access">
        <h2>Accès Restreint</h2>
        <p>Cette page est réservée aux techniciens de FixioTech.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="horaires-container">
        <h1 className="horaires-titres">Gestion de mon horaire</h1>
        <div className="calendrier-section">Chargement…</div>
      </div>
    );
  }

  return (
    <div className="horaires-container">
      <h1 className="horaires-titres">Gestion de mon horaire</h1>

      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <div className="horaires-grid">
        {/* Section des disponibilités (seule section conservée) */}
        <div className="calendrier-section">
          <h2 className="calendrier-titre">Mes disponibilités</h2>
          <p className="calendrier-description">
            Sélectionnez les jours où vous êtes disponible et définissez vos
            heures de début et de fin.
          </p>

          <div className="disponibilites-liste">
            {JOURS.map((jour) => (
              <div
                key={jour}
                className={`jour-row ${
                  horairesParJour[jour].actif ? "jour-actif" : ""
                }`}
              >
                <div className="jour-checkbox-container">
                  <label className="jour-checkbox">
                    <input
                      type="checkbox"
                      checked={horairesParJour[jour].actif}
                      onChange={() => handleJourToggle(jour)}
                    />
                    <span className="jour-nom">{jour}</span>
                  </label>
                </div>

                {horairesParJour[jour].actif && (
                  <div className="heures-container">
                    <div className="heure-groupe">
                      <label htmlFor={`debut-${jour}`}>Début</label>
                      <select
                        id={`debut-${jour}`}
                        value={horairesParJour[jour].debut}
                        onChange={(e) =>
                          handleHeureDebutChange(jour, e.target.value)
                        }
                        className="heure-select"
                      >
                        {heuresDisponibles.map((heure) => (
                          <option key={heure} value={heure}>
                            {heure}
                          </option>
                        ))}
                      </select>
                    </div>

                    <span className="heure-separateur">—</span>

                    <div className="heure-groupe">
                      <label htmlFor={`fin-${jour}`}>Fin</label>
                      <select
                        id={`fin-${jour}`}
                        value={horairesParJour[jour].fin}
                        onChange={(e) =>
                          handleHeureFinChange(jour, e.target.value)
                        }
                        className="heure-select"
                      >
                        {heuresDisponibles.map((heure) => (
                          <option key={heure} value={heure}>
                            {heure}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            className="bouton-enregistrer-horaire"
            onClick={handleSauvegarder}
          >
            Enregistrer mon horaire
          </button>
        </div>
      </div>
    </div>
  );
};

export default Horaires;
