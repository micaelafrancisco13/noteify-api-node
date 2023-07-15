const joi = require("joi");
const mongoose = require("mongoose");
const { parseISO, startOfDay } = require("date-fns");
const { utcToZonedTime } = require("date-fns-tz");

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
  const timeZone = "Asia/Manila"; // Assuming the user's time zone is in the Philippines

  const currentDate = new Date(); // Get the current date in the server's time zone
  const upcomingDate = parseISO(note.upcomingDate); // Parse the upcomingDate from the client

  const currentDateInTimeZone = startOfDay(
    utcToZonedTime(currentDate, timeZone)
  );
  const upcomingDateInTimeZone = startOfDay(
    utcToZonedTime(upcomingDate, timeZone)
  );

  console.log("currentDate", currentDateInTimeZone);
  console.log("upcomingDate", upcomingDateInTimeZone);

  const schema = joi.object({
    title: joi.string().min(1).max(255).required().label("Title"),
    description: joi.string().min(1).max(255).required().label("Description"),
    categoryId: joi.objectId().required().label("Category ID"),
    upcomingDate: joi
      .date()
      .min(currentDateInTimeZone)
      .required()
      .label("Upcoming date"),
  });

  return schema.validate({ ...note, upcomingDate: upcomingDateInTimeZone });
}

function isObjectIdValid(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

exports.Note = Note;
exports.validate = validateNote;
exports.isObjectIdValid = isObjectIdValid;
