# language: fr
Fonctionnalité: Inscription d'un nouvel utilisateur
  En tant que visiteur
  Je veux pouvoir m'inscrire sur la plateforme
  Afin d'accéder aux services de FixioTech

  Scénario: Inscription réussie avec des données valides
    Étant donné que je suis sur la page d'inscription
    Et qu'aucun utilisateur avec l'email "nouveau@client.com" n'existe
    Quand je remplis le formulaire avec:
      | email           | nouveau@client.com |
      | mot_de_passe    | Test1234$          |
      | nom_complet     | Nouveau Client     |
      | role            | client             |
    Et je soumets le formulaire d'inscription
    Alors je devrais recevoir un code de statut 201
    Et la réponse devrait contenir un "id"
    Et la réponse devrait contenir l'email "nouveau@client.com"

  Scénario: Inscription refusée avec un email déjà utilisé
    Étant donné qu'un utilisateur avec l'email "existant@client.com" existe déjà
    Quand je tente de m'inscrire avec l'email "existant@client.com"
    Alors je devrais recevoir un code de statut 409
    Et la réponse devrait contenir un message d'erreur

  Scénario: Inscription refusée avec des données invalides
    Étant donné que je suis sur la page d'inscription
    Quand je tente de m'inscrire avec un mot de passe "123"
    Alors je devrais recevoir un code de statut 400
    Et la réponse devrait contenir un message d'erreur sur le mot de passe
