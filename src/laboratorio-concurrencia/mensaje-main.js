const { Worker } = require("worker_threads");
const path = require("path");

// Demuestra paso de mensajes asincrono entre el hilo principal y un worker,
// sin bloquear el event loop del proceso principal mientras se espera la respuesta.
console.log("[Principal]: Iniciando el sistema de paso de mensajes asincrono.");

const worker = new Worker(path.join(__dirname, "mensaje-worker.js"));

worker.on("message", (resultado) => {
  console.log(`[Principal - Receptor]: Mensaje final recibido del Worker: "${resultado}"`);
  worker.terminate();
});

worker.on("error", (error) => {
  console.error("[Principal]: Error en el Worker:", error);
  process.exitCode = 1;
});

console.log("[Principal]: Enviando mensaje al Worker (sincronizacion por paso de mensajes)...");
worker.postMessage("hola estudiantes de aplicaciones distribuidas");
console.log("[Principal]: Mensaje enviado. El hilo principal sigue libre y no se bloquea.");
