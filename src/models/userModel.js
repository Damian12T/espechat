const db = require("../db/connection");

const insertStmt = db.prepare(
  "INSERT INTO users (username, password_hash) VALUES (?, ?)"
);
const findByUsernameStmt = db.prepare(
  "SELECT * FROM users WHERE username = ?"
);
const findByIdStmt = db.prepare("SELECT * FROM users WHERE id = ?");

function createUser(username, passwordHash) {
  const result = insertStmt.run(username, passwordHash);
  return findByIdStmt.get(result.lastInsertRowid);
}

function findByUsername(username) {
  return findByUsernameStmt.get(username);
}

function findById(id) {
  return findByIdStmt.get(id);
}

module.exports = { createUser, findByUsername, findById };
