// Limitador de intentos en memoria por IP, para mitigar fuerza bruta en login/registro.
// Suficiente para un solo proceso; con varias instancias deberia usarse un store compartido.
function createRateLimiter({ windowMs, max, message }) {
  const hits = new Map();

  const limiter = (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    let entry = hits.get(key);

    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;
    if (entry.count > max) {
      res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ errors: [message] });
    }
    next();
  };

  // Limpieza periodica de entradas vencidas para que el mapa no crezca sin limite.
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (now >= entry.resetAt) hits.delete(key);
    }
  }, windowMs);
  timer.unref();

  return limiter;
}

module.exports = createRateLimiter;
