const { parentPort } = require("worker_threads");

const PROCESSING_DELAY_MS = 2000;

// El worker espera un mensaje y responde de forma asincrona, simulando una
// tarea costosa que no deberia ejecutarse en el hilo principal.
parentPort.on("message", (mensajeRecibido) => {
  console.log(`[Worker - Receptor]: He recibido el mensaje: "${mensajeRecibido}"`);

  setTimeout(() => {
    const respuesta = `${mensajeRecibido.toUpperCase()} - PROCESADO EXITOSAMENTE`;
    console.log("[Worker]: Enviando mensaje de vuelta al hilo principal...");
    parentPort.postMessage(respuesta);
  }, PROCESSING_DELAY_MS);
});
