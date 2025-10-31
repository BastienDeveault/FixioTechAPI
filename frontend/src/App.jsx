import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainNavigation from "./vues/Navigation/MainNavigation";
import Accueil from "./vues/accueil";
import Login from "./vues/login";
import Inscription from "./vues/inscription";
import Services from "./vues/services_aides";
import Horaires from "./vues/horaires";
import RendezVous from "./vues/rendez-vous";
import Contact from "./vues/contact";
import Client from "./vues/client";
import Employe from "./vues/employe";
import Logs from "./vues/logs";

function App() {
  return (
    <>
      <MainNavigation />
      <Routes>
        {/* publiques */}
        <Route path="/" element={<Accueil />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/services_aides" element={<Services />} />
        <Route path="/contact" element={<Contact />} />

        {/* client */}
        <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
          <Route path="/rendez-vous" element={<RendezVous />} />
          <Route path="/client" element={<Client />} />
        </Route>

        {/* technicien (employé) */}
        <Route element={<ProtectedRoute allowedRoles={["employe"]} />}>
          <Route path="/horaires" element={<Horaires />} />
          <Route path="/employe" element={<Employe />} />
        </Route>

        {/* admin */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/logs" element={<Logs />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
