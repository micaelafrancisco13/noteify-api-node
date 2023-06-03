const { Category } = require("../models/category");
const { Note, validate, isObjectIdValid } = require("../models/note");
const express = require("express");
const router = express.Router();
const { startOfDay, isEqual, isBefore, isAfter } = require("date-fns");

router.get("/", async (req, res) => {
  const filter = req.query.filter;

  let notes = await Note.find()
    .sort({ dateLastModified: -1 })
    .populate("category");

  const currentDate = startOfDay(new Date());
  if (filter === "today")
    notes = notes.filter((n) =>
      isEqual(startOfDay(new Date(n.upcomingDate)), currentDate)
    );
  else if (filter === "upcoming")
    notes = notes.filter((n) =>
      isAfter(startOfDay(new Date(n.upcomingDate)), currentDate)
    );
  else if (filter === "past")
    notes = notes.filter((n) =>
      isBefore(startOfDay(new Date(n.upcomingDate)), currentDate)
    );

  res.send(notes);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { title, description, categoryId, upcomingDate } = req.body;

  const category = await Category.findById(categoryId);
  if (!category)
    return res
      .status(404)
      .send(`The category with the ID of ${categoryId} was not found.`);

  let note = new Note({
    title,
    description,
    category: categoryId,
    upcomingDate,
  });
  await note.save();
  note = await note.populate("category");

  res.send(note);
});

router.put("/:noteId", async (req, res) => {
  const noteId = req.params.noteId;

  if (!isObjectIdValid(noteId))
    return res.status(400).send("Invalid object ID.");

  let note = await Note.findById(noteId);
  if (!note)
    return res
      .status(404)
      .send(`The note with the ID of ${noteId} was not found.`);

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { title, description, categoryId } = req.body;

  const category = await Category.findById(categoryId);
  if (!category)
    return res
      .status(404)
      .send(`The category with the ID of ${categoryId} was not found.`);

  note = await Note.findOneAndUpdate(
    { _id: noteId },
    {
      title,
      description,
      category: categoryId,
    },
    { new: true }
  ).populate("category");

  res.send(note);
});

router.delete("/:noteId", async (req, res) => {
  const noteId = req.params.noteId;

  if (!isObjectIdValid(noteId))
    return res.status(400).send("Invalid object ID.");

  const note = await Note.findByIdAndRemove(noteId);

  if (!note)
    return res
      .status(404)
      .send(`The note with the ID of ${noteId} was not found.`);

  res.send(note);
});

router.get("/:noteId", async (req, res) => {
  const noteId = req.params.noteId;

  if (!isObjectIdValid(noteId))
    return res.status(400).send("Invalid object ID.");

  const note = await Note.findById(noteId);

  if (!note)
    return res
      .status(404)
      .send(`The note with the ID of ${noteId} was not found.`);

  res.send(note);
});

module.exports = router;
