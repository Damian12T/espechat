const { Server } = require("socket.io");
const messageModel = require("../models/messageModel");
const { sanitizeMessage } = require("../utils/validation");

const RECENT_HISTORY_LIMIT = 50;

module.exports = (httpServer, sessionMiddleware) => {
  const io = new Server(httpServer);

  // Reutiliza el middleware de sesion de Express para que el handshake del
  // socket tenga acceso a req.session, en vez de leer la cookie manualmente.
  io.engine.use(sessionMiddleware);

  io.use((socket, next) => {
    const session = socket.request.session;
    if (!session || !session.userId) {
      return next(new Error("No autenticado"));
    }
    socket.username = session.username;
    next();
  });

  io.on("connection", (socket) => {
    const { username } = socket;

    socket.emit("history", messageModel.getRecentMessages(RECENT_HISTORY_LIMIT));

    // Las fechas viajan en ISO 8601 (UTC); cada cliente las muestra en su hora local.
    socket.broadcast.emit("userStatus", {
      username,
      status: "connected",
      date: new Date().toISOString(),
    });

    socket.on("message", (rawMessage) => {
      const content = sanitizeMessage(rawMessage);
      if (!content) {
        socket.emit("errorMessage", "El mensaje esta vacio o excede la longitud permitida.");
        return;
      }

      const saved = messageModel.saveMessage(username, content);

      io.emit("message", {
        user: username,
        message: content,
        date: saved.created_at,
      });
    });

    socket.on("disconnect", () => {
      socket.broadcast.emit("userStatus", {
        username,
        status: "disconnected",
        date: new Date().toISOString(),
      });
    });
  });

  return io;
};
