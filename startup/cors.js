const cors = require("cors");

module.exports = function (app) {
  app.use(
    cors({
      origin: "*",
      // origin: "http://localhost:3000",
      credentials: true,
    })
  );
};
