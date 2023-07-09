const cors = require("cors");

module.exports = function (app) {
  app.use(
    cors({
      // origin: "*",
      origin: ["http://localhost:5173", "noteify-by-ela.vercel.app"],
      credentials: true,
    })
  );
};
