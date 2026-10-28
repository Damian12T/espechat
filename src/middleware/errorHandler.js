function notFoundHandler(req, res) {
  res.status(404).sendFile(require("path").join(__dirname, "..", "views", "404.html"));
}

// Middleware de errores de Express: debe declararse con 4 parametros para
// que el framework lo reconozca como manejador de errores.
function errorHandler(err, req, res, next) {
  console.error("[Error no controlado]:", err);
  res.status(500).json({ error: "Ocurrio un error interno en el servidor." });
}

module.exports = { notFoundHandler, errorHandler };
