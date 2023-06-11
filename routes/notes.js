const { Category } = require("../models/category");
const { User } = require("../models/user");
const { Note, validate, isObjectIdValid } = require("../models/note");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.get("/", [auth], async (req, res) => {
  const notes = await Note.find({ user: req.user._id })
    .sort({ dateLastModified: -1 })
    .populate("category");

  res.send(notes);
});

router.post("/", [auth], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { title, description, categoryId, upcomingDate } = req.body;

  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user)
    return res
      .status(404)
      .send(`The user with the ID of ${userId} was not found.`);

  const category = await Category.findById(categoryId);
  if (!category)
    return res
      .status(404)
      .send(`The category with the ID of ${categoryId} was not found.`);

  let note = new Note({
    title,
    description,
    category: categoryId,
    user: userId,
    upcomingDate,
  });
  await note.save();
  note = await note.populate("category");

  res.send(note);
});

router.put("/:noteId", [auth], async (req, res) => {
  const noteId = req.params.noteId;

  if (!isObjectIdValid(noteId))
    return res.status(400).send("Invalid object ID.");

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { title, description, categoryId, upcomingDate } = req.body;

  const category = await Category.findById(categoryId);
  if (!category)
    return res
      .status(404)
      .send(`The category with the ID of ${categoryId} was not found.`);

  let note = await Note.findOne({ _id: noteId, user: req.user._id });
  if (!note)
    return res
      .status(404)
      .send(`The note with the ID of ${noteId} was not found.`);

  note.title = title;
  note.description = description;
  note.category = categoryId;
  note.upcomingDate = upcomingDate;
  await note.save();
  note = await note.populate("category");

  res.send(note);
});

router.delete("/:noteId", [auth], async (req, res) => {
  const noteId = req.params.noteId;

  if (!isObjectIdValid(noteId))
    return res.status(400).send("Invalid object ID.");

  const note = await Note.findOneAndRemove({ _id: noteId, user: req.user._id });
  if (!note)
    return res
      .status(404)
      .send(`The note with the ID of ${noteId} was not found.`);

  res.send(note);
});

router.get("/:noteId", [auth], async (req, res) => {
  const noteId = req.params.noteId;

  if (!isObjectIdValid(noteId))
    return res.status(400).send("Invalid object ID.");

  const note = await Note.findOne({ _id: noteId, user: req.user._id }).populate(
    "category"
  );
  if (!note)
    return res
      .status(404)
      .send(`The note with the ID of ${noteId} was not found.`);

  res.send(note);
});

module.exports = router;

// filter by date query parameter
// const filter = req.query.filter;
// const currentDate = startOfDay(new Date());
// if (filter === "today")
//   notes = notes.filter((n) =>
//     isEqual(startOfDay(new Date(n.upcomingDate)), currentDate)
//   );
// else if (filter === "upcoming")
//   notes = notes.filter((n) =>
//     isAfter(startOfDay(new Date(n.upcomingDate)), currentDate)
//   );
// else if (filter === "past")
//   notes = notes.filter((n) =>
//     isBefore(startOfDay(new Date(n.upcomingDate)), currentDate)
//   );
