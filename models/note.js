const joi = require("joi");
const mongoose = require("mongoose");
const { startOfDay, parseISO } = require("date-fns");

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
  console.log("startOfDay(new Date())", startOfDay(new Date()));
  console.log(
    "startOfDay(parseISO(note.upcomingDate))",
    startOfDay(parseISO(note.upcomingDate))
  );

  const schema = joi.object({
    title: joi.string().min(1).max(255).required().label("Title"),
    description: joi.string().min(1).max(255).required().label("Description"),
    categoryId: joi.objectId().required().label("Category ID"),
    upcomingDate: joi
      .date()
      .min(startOfDay(new Date()))
      .required()
      .label("Upcoming date")
      .messages({
        "date.min": '"Upcoming date" must be a date in the future',
        "any.required": '"Upcoming date" is required',
      }),
  });

  return schema.validate({
    ...note,
    upcomingDate: startOfDay(parseISO(note.upcomingDate)),
  });
}

function isObjectIdValid(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

exports.Note = Note;
exports.validate = validateNote;
exports.isObjectIdValid = isObjectIdValid;
