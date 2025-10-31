import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MainNavigation.css";
import { useAuth } from "../../context/AuthContext";

const MainNavigation = () => {
  const { isAuthenticated, role, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="main-navigation">
      <div className="nav-brand">
        <Link to="/" className="brand-link">
          FixioTech
        </Link>
      </div>

      <ul className="nav-links">
        {/* Liens publics */}
        <li>
          <Link to="/" className="nav-link">
            Accueil
          </Link>
        </li>
        <li>
          <Link to="/services_aides" className="nav-link">
            Services
          </Link>
        </li>
        <li>
          <Link to="/contact" className="nav-link">
            Contact
          </Link>
        </li>

        {/* Client connecté */}
        {isAuthenticated && role === "client" && (
          <>
            <li>
              <Link to="/rendez-vous" className="nav-link">
                Rendez-vous
              </Link>
            </li>
            <li>
              <Link to="/client" className="nav-link">
                Mes demandes
              </Link>
            </li>
          </>
        )}

        {/* Employé connecté */}
        {isAuthenticated && role === "employe" && (
          <>
            <li>
              <Link to="/horaires" className="nav-link">
                Horaires
              </Link>
            </li>
            <li>
              <Link to="/employe" className="nav-link">
                Espace employé
              </Link>
            </li>
          </>
        )}

        {/* Admin */}
        {isAuthenticated && role === "admin" && (
          <li>
            <Link to="/logs" className="nav-link">
              📊 Logs
            </Link>
          </li>
        )}

        {/* Connexion / inscription OU déconnexion */}
        {!isAuthenticated ? (
          <>
            <li>
              <Link to="/login" className="nav-link login-link">
                Connexion
              </Link>
            </li>
            <li>
              <Link to="/inscription" className="nav-link signup-link">
                Inscription
              </Link>
            </li>
          </>
        ) : (
          <>
            <li className="nav-username">Bienvenue, {user?.nom_complet}</li>
            <li>
              <button onClick={handleLogout} className="nav-link logout-btn">
                Déconnexion
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default MainNavigation;
