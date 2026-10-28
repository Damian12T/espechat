const { test } = require("node:test");
const assert = require("node:assert/strict");
const createRateLimiter = require("../src/middleware/rateLimit");

function fakeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    set(name, value) { this.headers[name] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test("deja pasar hasta el maximo y luego responde 429 con Retry-After", () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 2, message: "demasiados" });
  let passed = 0;
  for (let i = 0; i < 3; i++) {
    const res = fakeRes();
    limiter({ ip: "1.1.1.1" }, res, () => passed++);
    if (i === 2) {
      assert.equal(res.statusCode, 429);
      assert.deepEqual(res.body, { errors: ["demasiados"] });
      assert.ok(Number(res.headers["Retry-After"]) > 0);
    }
  }
  assert.equal(passed, 2);
});

test("cuenta cada IP por separado", () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 1, message: "x" });
  let passed = 0;
  limiter({ ip: "1.1.1.1" }, fakeRes(), () => passed++);
  limiter({ ip: "2.2.2.2" }, fakeRes(), () => passed++);
  assert.equal(passed, 2);
});

test("reinicia el contador cuando vence la ventana", async () => {
  const limiter = createRateLimiter({ windowMs: 30, max: 1, message: "x" });
  let passed = 0;
  limiter({ ip: "3.3.3.3" }, fakeRes(), () => passed++);
  limiter({ ip: "3.3.3.3" }, fakeRes(), () => passed++);
  await new Promise((r) => setTimeout(r, 40));
  limiter({ ip: "3.3.3.3" }, fakeRes(), () => passed++);
  assert.equal(passed, 2);
});
