const express = require("express");
const categories = require("../routes/categories");
const notes = require("../routes/notes");
const users = require("../routes/users");
const auth = require("../routes/auth");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/categories", categories);
  app.use("/api/notes", notes);
  app.use("/api/users", users);
  app.use("/api/auth", auth);
};
