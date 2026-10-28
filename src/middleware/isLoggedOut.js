// Evita que un usuario ya autenticado vuelva a ver los formularios de login/registro.
module.exports = (req, res, next) => {
  if (req.session && req.session.userId) {
    res.redirect("/");
  } else {
    next();
  }
};
