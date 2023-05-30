const mongoose = require("mongoose");
const categories = require("./routes/categories");
const notes = require("./routes/notes");
const express = require("express");
const app = express();

const db = "get-done";
mongoose
    .connect(`mongodb://127.0.0.1:27017/${db}`)
    .then(() => console.log(`Connected to ${db} MongoDB...`))
    .catch((error) => console.error("Could not connect to MongoDB...", error));

app.use(express.json());
app.use("/api/categories", categories);
app.use("/api/notes", notes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
