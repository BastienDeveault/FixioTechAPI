function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  // Priorité à error.status / error.statusCode si présents et numériques
  let status = Number.isInteger(error.status || error.statusCode)
    ? error.status || error.statusCode
    : 500;

  // Map de quelques codes MySQL vers des HTTP codes parlants
  if (!Number.isInteger(status) && typeof error.code === "string") {
    switch (error.code) {
      case "ER_NO_SUCH_TABLE":
        status = 500;
        break; // schéma manquant
      case "ER_DUP_ENTRY":
        status = 409;
        break; // conflit/unique
      case "ER_BAD_FIELD_ERROR":
        status = 400;
        break; // champ invalide
      case "ER_ROW_IS_REFERENCED_2":
      case "ER_NO_REFERENCED_ROW_2":
        status = 409;
        break; // contrainte FK
      default:
        status = 500;
    }
  }

  res.status(status).json({
    message: error.message || "Une erreur inconnue est survenue !",
    details: error.details || null,
    code: error.code || null, // utile au debug côté client
  });
}

export default errorHandler;
