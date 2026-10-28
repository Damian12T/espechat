// Validaciones puras (sin acceso a base de datos), compartidas por HTTP y sockets.

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const PASSWORD_MIN_LENGTH = 6;
const MAX_MESSAGE_LENGTH = 500;

function validateCredentials(username, password) {
  const errors = [];

  if (typeof username !== "string" || !USERNAME_REGEX.test(username)) {
    errors.push(
      "El nombre de usuario debe tener entre 3 y 20 caracteres y solo puede contener letras, numeros y guion bajo."
    );
  }

  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    errors.push(
      `La contrasena debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`
    );
  }

  return errors;
}

// Devuelve el mensaje limpio, o null si no es valido.
function sanitizeMessage(rawMessage) {
  if (typeof rawMessage !== "string") return null;
  const trimmed = rawMessage.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_MESSAGE_LENGTH) return null;
  return trimmed;
}

module.exports = {
  validateCredentials,
  sanitizeMessage,
  PASSWORD_MIN_LENGTH,
  MAX_MESSAGE_LENGTH,
};
