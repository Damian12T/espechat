const session = require("express-session");
const { sessionSecret, isProduction } = require("./env");

// MemoryStore es aceptable para un proyecto de alcance academico/portafolio
// con un unico proceso. En un despliegue con varias instancias del servidor
// se deberia reemplazar por un store compartido (p. ej. connect-sqlite3 o Redis).
const sessionMiddleware = session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    // No se envia en peticiones POST iniciadas desde otros sitios (mitiga CSRF)
    sameSite: "lax",
    secure: isProduction,
    maxAge: 1000 * 60 * 60 * 8,
  },
});

module.exports = sessionMiddleware;
