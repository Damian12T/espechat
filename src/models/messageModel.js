const db = require("../db/connection");

// SQLite guarda datetime('now') en UTC sin zona ("2026-10-07 05:33:33");
// se devuelve en ISO 8601 con "Z" para que el navegador no lo interprete como hora local.
const ISO_CREATED_AT = "strftime('%Y-%m-%dT%H:%M:%SZ', created_at) AS created_at";

const insertStmt = db.prepare(
  "INSERT INTO messages (username, content) VALUES (?, ?)"
);
const findByIdStmt = db.prepare(
  `SELECT username, content, ${ISO_CREATED_AT} FROM messages WHERE id = ?`
);
const recentStmt = db.prepare(
  `SELECT username, content, ${ISO_CREATED_AT} FROM messages ORDER BY id DESC LIMIT ?`
);

// Devuelve el mensaje guardado, con la fecha asignada por la base de datos.
function saveMessage(username, content) {
  const result = insertStmt.run(username, content);
  return findByIdStmt.get(result.lastInsertRowid);
}

// Se devuelven en orden cronologico ascendente para pintarlos directamente en pantalla.
function getRecentMessages(limit = 50) {
  return recentStmt.all(limit).reverse();
}

module.exports = { saveMessage, getRecentMessages };
