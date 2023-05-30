const { Note, validate, isObjectIdValid } = require("../models/note");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    const notes = await Note.find()
        .sort({ dateLastModified: -1 })
        .populate("category");
    res.send(notes);
});

router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { title, description, categoryId } = req.body;
    let note = new Note({
        title,
        description,
        category: categoryId,
    });
    await note.save();
    note = await note.populate("category");

    res.send(note);
});

router.put("/:noteId", async (req, res) => {
    const noteId = req.params.noteId;

    if (!isObjectIdValid(noteId))
        return res.status(400).send("Invalid object ID.");

    const { title, description, categoryId } = req.body;
    const note = await Note.findOneAndUpdate(
        { _id: noteId },
        {
            title,
            description,
            category: categoryId,
        },
        { new: true }
    ).populate("category");

    if (!note)
        return res
            .status(404)
            .send(`The note with the ID of ${noteId} was not found.`);

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
