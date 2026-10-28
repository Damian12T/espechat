const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const { validateCredentials } = require("../utils/validation");

const SALT_ROUNDS = 10;

// Crea una sesion nueva (nuevo id de cookie) antes de guardar la identidad,
// para evitar ataques de fijacion de sesion.
function startSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.save((saveErr) => (saveErr ? reject(saveErr) : resolve()));
    });
  });
}

async function register(req, res) {
  const { username, password } = req.body ?? {};
  const errors = validateCredentials(username, password);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const existingUser = userModel.findByUsername(username);
  if (existingUser) {
    return res.status(409).json({ errors: ["El nombre de usuario ya esta en uso."] });
  }

  // Hash asincrono: no bloquea el event loop mientras se calcula.
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = userModel.createUser(username, passwordHash);

  await startSession(req, user);
  return res.status(201).json({ username: user.username });
}

async function login(req, res) {
  const { username, password } = req.body ?? {};

  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ errors: ["Usuario y contrasena son requeridos."] });
  }

  const user = userModel.findByUsername(username);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ errors: ["Usuario o contrasena incorrectos."] });
  }

  await startSession(req, user);
  return res.status(200).json({ username: user.username });
}

function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.status(200).json({ ok: true });
  });
}

module.exports = { register, login, logout };
