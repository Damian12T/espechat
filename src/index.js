const { port } = require("./config/env");
const createApp = require("./app");

const { httpServer } = createApp();

httpServer.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
