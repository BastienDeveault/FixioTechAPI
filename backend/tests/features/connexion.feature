# language: fr
Fonctionnalité: Connexion d'un utilisateur
  En tant qu'utilisateur inscrit
  Je veux pouvoir me connecter à mon compte
  Afin d'accéder aux fonctionnalités qui me sont réservées

  Scénario: Connexion réussie avec des identifiants valides
    Étant donné qu'un utilisateur client existe avec:
      | email           | client@test.com |
      | mot_de_passe    | Test1234$       |
      | nom_complet     | Client Test     |
    Quand je me connecte avec l'email "client@test.com" et le mot de passe "Test1234$"
    Alors je devrais recevoir un code de statut 200
    Et la réponse devrait contenir le "nom_complet" "Client Test"
    Et la réponse devrait contenir le "role" "client"

  Scénario: Connexion refusée avec un mot de passe incorrect
    Étant donné qu'un utilisateur existe avec l'email "client@test.com"
    Quand je tente de me connecter avec l'email "client@test.com" et un mauvais mot de passe
    Alors je devrais recevoir un code de statut 401
    Et la réponse devrait contenir un message "Identifiants invalides"

  Scénario: Connexion refusée avec un email inexistant
    Quand je tente de me connecter avec l'email "inexistant@test.com"
    Alors je devrais recevoir un code de statut 401
    Et la réponse devrait contenir un message d'erreur
