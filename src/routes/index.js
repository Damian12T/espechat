const express = require("express");
const router = express.Router();
const path = require("path");
const isLoggedIn = require("../middleware/isLoggedIn");
const isLoggedOut = require("../middleware/isLoggedOut");
const authController = require("../controllers/authController");
const createRateLimiter = require("../middleware/rateLimit");

const views = path.join(__dirname, "..", "views");

const QUINCE_MINUTOS = 15 * 60 * 1000;
const loginLimiter = createRateLimiter({
  windowMs: QUINCE_MINUTOS,
  max: 10,
  message: "Demasiados intentos de inicio de sesion. Intente de nuevo en unos minutos.",
});
const registerLimiter = createRateLimiter({
  windowMs: QUINCE_MINUTOS,
  max: 10,
  message: "Demasiados registros desde esta conexion. Intente de nuevo en unos minutos.",
});

router.get("/", isLoggedIn, (req, res) => {
  res.sendFile(path.join(views, "index.html"));
});

router.get("/register", isLoggedOut, (req, res) => {
  res.sendFile(path.join(views, "register.html"));
});

router.get("/login", isLoggedOut, (req, res) => {
  res.sendFile(path.join(views, "login.html"));
});

router.post("/auth/register", registerLimiter, authController.register);
router.post("/auth/login", loginLimiter, authController.login);
router.post("/auth/logout", authController.logout);

router.get("/api/session", (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ authenticated: true, username: req.session.username });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;
