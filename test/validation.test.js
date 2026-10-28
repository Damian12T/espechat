const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  validateCredentials,
  sanitizeMessage,
  MAX_MESSAGE_LENGTH,
} = require("../src/utils/validation");

test("acepta credenciales validas", () => {
  assert.deepEqual(validateCredentials("ana_test", "Prueba123"), []);
});

test("rechaza usuario con caracteres no permitidos o fuera de longitud", () => {
  assert.equal(validateCredentials("a!", "Prueba123").length, 1);
  assert.equal(validateCredentials("ab", "Prueba123").length, 1);
  assert.equal(validateCredentials("x".repeat(21), "Prueba123").length, 1);
});

test("rechaza contrasena corta y tipos incorrectos", () => {
  assert.equal(validateCredentials("ana_test", "12345").length, 1);
  assert.equal(validateCredentials(undefined, undefined).length, 2);
  assert.equal(validateCredentials({}, ["x"]).length, 2);
});

test("sanitizeMessage recorta espacios y conserva el texto tal cual", () => {
  assert.equal(sanitizeMessage("  hola  "), "hola");
  assert.equal(sanitizeMessage("<img src=x>"), "<img src=x>");
});

test("sanitizeMessage rechaza vacios, no-strings y mensajes demasiado largos", () => {
  assert.equal(sanitizeMessage("   "), null);
  assert.equal(sanitizeMessage(42), null);
  assert.equal(sanitizeMessage("x".repeat(MAX_MESSAGE_LENGTH + 1)), null);
  assert.equal(sanitizeMessage("x".repeat(MAX_MESSAGE_LENGTH)).length, MAX_MESSAGE_LENGTH);
});
