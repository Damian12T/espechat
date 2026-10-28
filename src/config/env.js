const path = require("path");
require("dotenv").config({ quiet: true });

const isProduction = process.env.NODE_ENV === "production";

function requireEnv(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Falta la variable de entorno requerida: ${name}`);
  }
  return value;
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  // En produccion no hay valor por defecto: arrancar sin secreto propio dejaria
  // las cookies de sesion firmadas con una clave publica.
  sessionSecret: requireEnv(
    "SESSION_SECRET",
    isProduction ? undefined : "dev-secret-not-for-production"
  ),
  dbPath:
    process.env.DB_PATH === ":memory:"
      ? ":memory:"
      : path.resolve(process.env.DB_PATH || path.join(__dirname, "..", "..", "data", "espechat.db")),
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction,
};
