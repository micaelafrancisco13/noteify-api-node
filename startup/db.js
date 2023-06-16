const mongoose = require("mongoose");
const config = require("config");

module.exports = function () {
  const db = config.get("DATABASE");

  mongoose
    .connect(db)
    .then(() => console.log(`Connected to ${db}`))
    .catch((error) => console.error("Could not connect to MongoDB", error));
};
