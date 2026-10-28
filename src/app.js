const express = require("express");
const { createServer } = require("http");
const path = require("path");
const cookieParser = require("cookie-parser");

const sessionMiddleware = require("./config/session");

// Debe ejecutarse antes de requerir cualquier modulo que use la base de
// datos (modelos, rutas, sockets), ya que estos preparan sus consultas SQL
// en el momento en que se cargan.
require("./db/schema")();

const chatSocket = require("./sockets/chatSocket");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

// Construye la aplicacion sin ponerla a escuchar (lo hace index.js o las pruebas).
function createApp() {
  const app = express();
  const httpServer = createServer(app);

  app.set("views", path.join(__dirname, "views"));

  app.use(cookieParser());
  app.use(express.json());
  app.use(sessionMiddleware);

  app.use(require("./routes"));
  app.use(express.static(path.join(__dirname, "public")));

  app.use(notFoundHandler);
  app.use(errorHandler);

  const io = chatSocket(httpServer, sessionMiddleware);

  return { app, httpServer, io };
}

module.exports = createApp;
