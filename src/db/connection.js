const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
const { dbPath } = require("../config/env");

// Base de datos de archivo unico. Por defecto se ubica en data/, fuera de src,
// para no mezclar datos persistentes con el codigo fuente de la aplicacion.
// La carpeta no se versiona, asi que se crea si no existe (p. ej. tras clonar).
const IN_MEMORY = dbPath === ":memory:";
if (!IN_MEMORY) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new Database(dbPath);
if (!IN_MEMORY) {
  db.pragma("journal_mode = WAL");
}

module.exports = db;
