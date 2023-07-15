const joi = require("joi");
const mongoose = require("mongoose");
const { startOfDay, parseISO, formatISO } = require("date-fns");
const { zonedTimeToUtc } = require("date-fns-tz");

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    minLength: 1,
    maxLength: 255,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    minLength: 1,
    maxLength: 255,
    trim: true,
    required: true,
  },
  dateCreated: { type: Date, default: Date.now },
  dateLastModified: { type: Date, default: Date.now },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  upcomingDate: { type: Date, required: true },
});

noteSchema.pre("save", async function () {
  this.dateLastModified = Date.now();
});

const Note = mongoose.model("note", noteSchema);

function validateNote(note) {
  const timeZone = "UTC"; // Use UTC for consistent date comparison

  // const currentDate = startOfDay(new Date());
  // const parsedUpcomingDate = startOfDay(parseISO(note.upcomingDate));

  const currentDate = zonedTimeToUtc(startOfDay(new Date()), timeZone);
  const parsedUpcomingDate = zonedTimeToUtc(
    startOfDay(parseISO(note.upcomingDate)),
    timeZone
  );

  console.log("currentDate", currentDate);
  console.log("parsedUpcomingDate", parsedUpcomingDate);

  const schema = joi.object({
    title: joi.string().min(1).max(255).required().label("Title"),
    description: joi.string().min(1).max(255).required().label("Description"),
    categoryId: joi.objectId().required().label("Category ID"),
    upcomingDate: joi.date().min(currentDate).required().label("Upcoming date"),
  });

  return schema.validate({ ...note, upcomingDate: parsedUpcomingDate });
}

function isObjectIdValid(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

exports.Note = Note;
exports.validate = validateNote;
exports.isObjectIdValid = isObjectIdValid;
