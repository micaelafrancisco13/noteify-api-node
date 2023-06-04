const express = require("express");
const categories = require("../routes/categories");
const notes = require("../routes/notes");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/categories", categories);
  app.use("/api/notes", notes);
};
