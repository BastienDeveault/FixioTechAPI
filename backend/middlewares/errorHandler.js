function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  // Status explicite dans l'erreur ?
  let status = Number.isInteger(error.status || error.statusCode)
    ? error.status || error.statusCode
    : null;

  // Mappage PostgreSQL
  if (!status && typeof error.code === "string") {
    switch (error.code) {
      case "23505": // unique_violation
        status = 409;
        // Améliorer le message pour les violations d'unicité d'email
        if (error.message && error.message.includes("utilisateurs_email_key")) {
          error.message = "L'email est déjà utilisé";
        }
        break;

      case "23503": // foreign_key_violation
        status = 409;
        break;

      case "23514": // check_violation (contrainte CHECK)
        status = 400;
        if (error.message && error.message.includes("statut")) {
          error.message = "Statut invalide. Valeurs autorisées: Programmé, Annulé, Terminé";
        }
        break;

      case "42601": // SQL syntax error
        status = 400;
        break;

      case "42703": // Column not found
        status = 400;
        break;

      case "42P01": // Table not found
        status = 500;
        break;

      default:
        status = 500;
    }
  }

  // Si toujours rien
  if (!status) status = 500;

  res.status(status).json({
    message: error.message || "Une erreur inconnue est survenue !",
    details: error.details || null,
    code: error.code || null,
  });
}

export default errorHandler;