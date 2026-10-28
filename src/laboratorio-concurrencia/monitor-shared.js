const { Worker, isMainThread, workerData } = require("worker_threads");

const INITIAL_BALANCE = 100;

if (isMainThread) {
  runMainThread();
} else {
  runWorkerThread();
}

function runMainThread() {
  // Memoria compartida: un espacio fisico que ambos hilos pueden ver y
  // modificar. SharedArrayBuffer es necesario porque los worker_threads no
  // comparten memoria por defecto (cada uno tiene su propio heap de V8).
  const sharedBuffer = new SharedArrayBuffer(4);
  const sharedArray = new Int32Array(sharedBuffer);
  sharedArray[0] = INITIAL_BALANCE;

  console.log(`[Monitor Principal]: Saldo inicial compartido: $${sharedArray[0]}`);

  const retiro = new Worker(__filename, {
    workerData: { sharedBuffer, tipo: "RETIRO", monto: 40 },
  });
  const deposito = new Worker(__filename, {
    workerData: { sharedBuffer, tipo: "DEPOSITO", monto: 50 },
  });

  let pending = 2;
  const finishWorker = () => {
    pending -= 1;
    if (pending === 0) {
      console.log(`[Monitor Principal]: Saldo final tras ambas operaciones: $${sharedArray[0]}`);
    }
  };

  [retiro, deposito].forEach((worker) => {
    worker.on("exit", finishWorker);
    worker.on("error", (error) => {
      console.error("[Monitor Principal]: Error en worker:", error);
      process.exitCode = 1;
    });
  });
}

function runWorkerThread() {
  const { sharedBuffer, tipo, monto } = workerData;
  const sharedArray = new Int32Array(sharedBuffer);

  console.log(`[Hilo ${tipo}]: Intentando entrar a la zona critica (acceder al monitor)...`);

  // Atomics garantiza exclusion mutua a nivel de memoria compartida: la
  // operacion de lectura-modificacion-escritura es atomica, por lo que no
  // puede producirse una condicion de carrera entre RETIRO y DEPOSITO
  // aunque ambos hilos accedan al mismo Int32Array simultaneamente.
  if (tipo === "RETIRO") {
    Atomics.sub(sharedArray, 0, monto);
    console.log(`[Hilo RETIRO]: Modificacion segura realizada. Resto $${monto}. Saldo intermedio: $${sharedArray[0]}`);
  } else {
    Atomics.add(sharedArray, 0, monto);
    console.log(`[Hilo DEPOSITO]: Modificacion segura realizada. Sumo $${monto}. Saldo intermedio: $${sharedArray[0]}`);
  }
}
