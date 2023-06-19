const cors = require("cors");

module.exports = function (app) {
  app.use(
    cors({
      // origin: "*",
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
};
