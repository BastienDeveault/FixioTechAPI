import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import Login from "../vues/login";

// Mock du hook useNavigate
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    __esModule: true,
    ...actual,
    useNavigate: () => mockNavigate,
    Link: actual.Link,
    NavLink: actual.NavLink,
  };
});

describe("Login Component", () => {
  // Réinitialise les mocks avant chaque test
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("devrait rendre le formulaire de connexion", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Vérifie que les éléments essentiels sont présents
    expect(screen.getByText("Connexion")).toBeInTheDocument();
    expect(screen.getByLabelText("Adresse courriel")).toBeInTheDocument();
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Se connecter" })
    ).toBeInTheDocument();
  });

  it("devrait afficher une erreur si les champs sont vides", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Clique sur le bouton sans remplir les champs
    const submitButton = screen.getByRole("button", { name: "Se connecter" });
    await userEvent.click(submitButton);

    // Vérifie le message d'erreur
    expect(
      screen.getByText("Veuillez remplir tous les champs")
    ).toBeInTheDocument();
  });

  it("devrait permettre la saisie des données", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Simule la saisie des données
    const emailInput = screen.getByLabelText("Adresse courriel");
    const passwordInput = screen.getByLabelText("Mot de passe");

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");

    // Vérifie que les valeurs ont été saisies
    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  it("devrait rediriger vers la page d'accueil après une connexion réussie", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Simule une connexion réussie
    const emailInput = screen.getByLabelText("Adresse courriel");
    const passwordInput = screen.getByLabelText("Mot de passe");
    const submitButton = screen.getByRole("button", { name: "Se connecter" });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(submitButton);

    // Vérifie que le bouton affiche "Connexion en cours..."
    expect(submitButton).toBeDisabled();
    expect(screen.getByText("Connexion en cours...")).toBeInTheDocument();

    // Attend la redirection
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
