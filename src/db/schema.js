const db = require("./connection");

// Se ejecuta de forma idempotente al iniciar la aplicacion.
// CREATE TABLE IF NOT EXISTS permite correr el proyecto desde cero sin pasos manuales de setup de base de datos.
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at);
  `);
}

module.exports = initSchema;
