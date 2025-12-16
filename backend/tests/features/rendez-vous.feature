# language: fr
Fonctionnalité: Prise de rendez-vous
  En tant que client connecté
  Je veux pouvoir prendre un rendez-vous avec un technicien
  Afin d'obtenir une assistance technique

  Contexte:
    Étant donné qu'un client existe avec l'email "client.rdv@test.com"
    Et qu'un employé "Tech Support" avec l'email "tech@test.com" a des horaires disponibles
    Et que le client est connecté

  Scénario: Création d'un rendez-vous avec succès
    Quand je crée un rendez-vous pour le "2025-12-15" à "10:00:00"
    Et je spécifie le service "Support Technique"
    Et je sélectionne l'employé "tech@test.com"
    Alors je devrais recevoir un code de statut 201
    Et la réponse devrait contenir un "id" de rendez-vous
    Et le statut du rendez-vous devrait être "Programmé"
    Et la date devrait être "2025-12-15"

  Scénario: Rendez-vous refusé avec une date passée
    Quand je tente de créer un rendez-vous pour le "2020-01-01"
    Alors je devrais recevoir un code de statut 400
    Et la réponse devrait contenir "passé" dans le message

  Scénario: Consultation de mes rendez-vous
    Étant donné que j'ai un rendez-vous programmé
    Quand je consulte la liste de mes rendez-vous
    Alors je devrais recevoir un code de statut 200
    Et la liste devrait contenir au moins 1 rendez-vous
    Et chaque rendez-vous devrait avoir une "date_rdv" et un "statut"
