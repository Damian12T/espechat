// Pruebas de integracion HTTP con base de datos en memoria (no toca data/).
process.env.DB_PATH = ":memory:";
process.env.SESSION_SECRET = "secreto-de-pruebas";
process.env.NODE_ENV = "test";

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const createApp = require("../src/app");
const messageModel = require("../src/models/messageModel");

let server;
let io;
let base;

before(async () => {
  const created = createApp();
  server = created.httpServer;
  io = created.io;
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  io.close();
  await new Promise((resolve) => server.close(resolve));
});

function sessionCookie(res) {
  const cookie = res.headers.getSetCookie().find((c) => c.startsWith("connect.sid="));
  return cookie ? cookie.split(";")[0] : null;
}

function post(path, body, cookie) {
  return fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body),
  });
}

async function sessionOf(cookie) {
  const res = await fetch(base + "/api/session", { headers: cookie ? { Cookie: cookie } : {} });
  return res.json();
}

test("sin sesion, / redirige a /login", async () => {
  const res = await fetch(base + "/", { redirect: "manual" });
  assert.equal(res.status, 302);
  assert.equal(res.headers.get("location"), "/login");
});

test("registro con datos invalidos responde 400 con errores", async () => {
  const res = await post("/auth/register", { username: "a!", password: "1" });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).errors.length, 2);
});

test("registro valido crea la sesion; un usuario repetido responde 409", async () => {
  const res = await post("/auth/register", { username: "ana_test", password: "Prueba123" });
  assert.equal(res.status, 201);
  const cookie = sessionCookie(res);
  assert.ok(cookie);
  assert.deepEqual(await sessionOf(cookie), { authenticated: true, username: "ana_test" });

  const dup = await post("/auth/register", { username: "ana_test", password: "OtraClave1" });
  assert.equal(dup.status, 409);
});

test("login regenera la sesion (protege contra fijacion de sesion)", async () => {
  const first = await post("/auth/login", { username: "ana_test", password: "Prueba123" });
  assert.equal(first.status, 200);
  const cookieA = sessionCookie(first);

  const second = await post("/auth/login", { username: "ana_test", password: "Prueba123" }, cookieA);
  assert.equal(second.status, 200);
  const cookieB = sessionCookie(second);

  assert.notEqual(cookieA, cookieB);
  assert.equal((await sessionOf(cookieA)).authenticated, false);
  assert.equal((await sessionOf(cookieB)).authenticated, true);
});

test("la cookie de sesion es HttpOnly y SameSite=Lax", async () => {
  const res = await post("/auth/login", { username: "ana_test", password: "Prueba123" });
  const raw = res.headers.getSetCookie().find((c) => c.startsWith("connect.sid="));
  assert.match(raw, /HttpOnly/i);
  assert.match(raw, /SameSite=Lax/i);
});

test("contrasena incorrecta responde 401; logout cierra la sesion", async () => {
  const bad = await post("/auth/login", { username: "ana_test", password: "Incorrecta1" });
  assert.equal(bad.status, 401);

  const ok = await post("/auth/login", { username: "ana_test", password: "Prueba123" });
  const cookie = sessionCookie(ok);
  const out = await post("/auth/logout", {}, cookie);
  assert.equal(out.status, 200);
  assert.equal((await sessionOf(cookie)).authenticated, false);
});

test("los mensajes guardados devuelven la fecha en ISO 8601 UTC", () => {
  const saved = messageModel.saveMessage("ana_test", "hola");
  assert.match(saved.created_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  assert.ok(Math.abs(Date.parse(saved.created_at) - Date.now()) < 5_000);
  const recent = messageModel.getRecentMessages(10);
  assert.equal(recent.at(-1).content, "hola");
});

// Va al final porque agota el limite de intentos de login de esta IP.
test("tras demasiados intentos de login responde 429", async () => {
  let last;
  for (let i = 0; i < 12; i++) {
    last = await post("/auth/login", { username: "ana_test", password: "Incorrecta1" });
  }
  assert.equal(last.status, 429);
  assert.match((await last.json()).errors[0], /Demasiados intentos/);
});
