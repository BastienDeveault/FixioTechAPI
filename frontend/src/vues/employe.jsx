import React, { useEffect, useMemo, useState } from "react";
import "./employe.css";
import { useAuth } from "../context/AuthContext";
import { getRendezVous } from "../../services/apiRendezVous";
import { getEmployes } from "../../services/apiUtilisateur"; // optionnel: pour croiser les techniciens si utile plus tard

const mapDbStatutToUi = (db) => {
  // DB: 'Programmé' | 'Annulé' | 'Terminé'
  // UI (classes CSS existantes): en_attente | en_cours | traitee
  if (!db) return "en_attente";
  const s = db.toLowerCase();
  if (s === "terminé" || s === "termine") return "traitee";
  if (s === "programmé" || s === "programme") return "en_attente";
  if (s === "annulé" || s === "annule") return "en_cours"; // fallback visuel neutre
  return "en_attente";
};

const getStatutBadge = (ui) => {
  // ui ∈ { en_attente, en_cours, traitee }
  const badges = {
    en_attente: { classe: "statut-attente", texte: "En attente" },
    en_cours: { classe: "statut-encours", texte: "En cours" },
    traitee: { classe: "statut-traitee", texte: "Traitée" },
  };
  return badges[ui] || badges.en_attente;
};

const getStatutIcon = (ui) => {
  const icons = {
    en_attente: "⏱️",
    en_cours: "🔧",
    traitee: "✅",
  };
  return icons[ui] || "📋";
};

const Employe = () => {
  const { user, role } = useAuth();

  const [loading, setLoading] = useState(true);
  const [rdvs, setRdvs] = useState([]);
  const [error, setError] = useState("");

  const [filtreStatut, setFiltreStatut] = useState("tous");

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setError("Vous devez être connecté pour voir vos demandes.");
      return;
    }
    if (role !== "employe") {
      setLoading(false);
      setError("Cette page est réservée aux techniciens.");
      return;
    }

    let alive = true;
    setLoading(true);
    setError("");

    (async () => {
      try {
        // Récupère uniquement les RDV assignés à cet employé
        const list = await getRendezVous({ employe_id: user.id });
        // Tri: plus récents en haut
        (list || []).sort((a, b) => {
          const ak = `${a.date_rdv} ${a.heure_rdv || ""}`;
          const bk = `${b.date_rdv} ${b.heure_rdv || ""}`;
          return bk.localeCompare(ak);
        });
        if (!alive) return;
        setRdvs(list || []);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Erreur lors du chargement des demandes.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [user, role]);

  const demandes = useMemo(() => {
    // Adapte chaque RDV aux champs attendus par le rendu existant
    return (rdvs || []).map((r) => {
      const ui = mapDbStatutToUi(r.statut || "Programmé");
      return {
        id: r.id,
        // On n’a pas le détail client (nom/email) côté RDV → on affiche un identifiant simple.
        client: {
          nom: `Client #${r.client_id}`,
          courriel: "",
        },
        service: r.service || "Support technique", // champ “service” non stocké en DB : valeur par défaut
        technicien: `Vous (#${r.employe_id})`,
        date: r.date_rdv, // "YYYY-MM-DD"
        heure: r.heure_rdv || "—", // "HH:mm"
        description: r.description_probleme || "—",
        statut: ui, // pour les badges CSS existants
        dateCreation: r.created_at || r.date_rdv || "", // fallback si pas de timestamp
      };
    });
  }, [rdvs]);

  const demandesFiltrees = useMemo(() => {
    if (filtreStatut === "tous") return demandes;
    return demandes.filter((d) => d.statut === filtreStatut);
  }, [demandes, filtreStatut]);

  const countBy = (ui) => demandes.filter((d) => d.statut === ui).length;

  return (
    <div className="employe-container">
      <div className="employe-header">
        <h1>Espace Employé</h1>
        <p className="employe-intro">
          Gérez les demandes de support qui vous sont assignées.
        </p>
      </div>

      {/* Statistiques */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <span className="stat-nombre">{countBy("en_attente")}</span>
            <span className="stat-label">En attente</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔧</div>
          <div className="stat-info">
            <span className="stat-nombre">{countBy("en_cours")}</span>
            <span className="stat-label">En cours</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-nombre">{countBy("traitee")}</span>
            <span className="stat-label">Traitées</span>
          </div>
        </div>
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-nombre">{demandes.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="filtres-container">
        <div className="filtres-groupe">
          <button
            className={`filtre-btn ${filtreStatut === "tous" ? "active" : ""}`}
            onClick={() => setFiltreStatut("tous")}
          >
            Toutes ({demandes.length})
          </button>
          <button
            className={`filtre-btn ${
              filtreStatut === "en_attente" ? "active" : ""
            }`}
            onClick={() => setFiltreStatut("en_attente")}
          >
            En attente ({countBy("en_attente")})
          </button>
          <button
            className={`filtre-btn ${
              filtreStatut === "en_cours" ? "active" : ""
            }`}
            onClick={() => setFiltreStatut("en_cours")}
          >
            En cours ({countBy("en_cours")})
          </button>
          <button
            className={`filtre-btn ${
              filtreStatut === "traitee" ? "active" : ""
            }`}
            onClick={() => setFiltreStatut("traitee")}
          >
            Traitées ({countBy("traitee")})
          </button>
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="demandes-container">
        {loading ? (
          <div className="aucune-demande">
            <div className="aucune-demande-icon">⏳</div>
            <h2>Chargement de vos demandes…</h2>
          </div>
        ) : error ? (
          <div className="aucune-demande">
            <div className="aucune-demande-icon">⚠️</div>
            <h2>{error}</h2>
          </div>
        ) : demandesFiltrees.length === 0 ? (
          <div className="aucune-demande">
            <div className="aucune-demande-icon">📭</div>
            <h2>Aucune demande pour ce filtre</h2>
            <p>Les nouvelles demandes apparaîtront ici.</p>
          </div>
        ) : (
          <div className="demandes-liste">
            {demandesFiltrees.map((demande) => {
              const badge = getStatutBadge(demande.statut);
              return (
                <div key={demande.id} className="demande-card">
                  <div className="demande-header-card">
                    <div className="demande-id-statut">
                      <span className="demande-id">Demande #{demande.id}</span>
                      <span className={`statut-badge ${badge.classe}`}>
                        {getStatutIcon(demande.statut)} {badge.texte}
                      </span>
                    </div>
                    {demande.dateCreation ? (
                      <span className="demande-date">
                        Créée le{" "}
                        {new Date(demande.dateCreation).toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>

                  <div className="demande-body">
                    {/* Informations client (basique, faute de détails DB) */}
                    <div className="client-info">
                      <h3>👤 Informations client</h3>
                      <div className="client-details">
                        <div className="client-detail">
                          <span className="detail-label">Nom :</span>
                          <span className="detail-value">
                            {demande.client.nom}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Informations rendez-vous */}
                    <div className="demande-info-row">
                      <div className="demande-info-item">
                        <span className="info-label">Service</span>
                        <span className="info-value">{demande.service}</span>
                      </div>
                      <div className="demande-info-item">
                        <span className="info-label">Technicien assigné</span>
                        <span className="info-value">{demande.technicien}</span>
                      </div>
                    </div>

                    <div className="demande-info-row">
                      <div className="demande-info-item">
                        <span className="info-label">Date du rendez-vous</span>
                        <span className="info-value">
                          {demande.date}{" "}
                          {demande.heure !== "—" ? `à ${demande.heure}` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="demande-description">
                      <span className="info-label">
                        Description du problème
                      </span>
                      <p>{demande.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Employe;
