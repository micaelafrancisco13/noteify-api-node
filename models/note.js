const joi = require("joi");
const mongoose = require("mongoose");
const { startOfDay, parseISO } = require("date-fns");
const { utcToZonedTime, formatInTimeZone } = require("date-fns-tz");

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
  const { currentDate, upcomingDate } = convertTimezone(
    parseISO(note.upcomingDate)
  );

  const schema = joi.object({
    title: joi.string().min(1).max(255).required().label("Title"),
    description: joi.string().min(1).max(255).required().label("Description"),
    categoryId: joi.objectId().required().label("Category ID"),
    upcomingDate: joi
      .date()
      .min(currentDate)
      .required()
      .label("Upcoming date")
      .messages({
        "date.min": '"Upcoming date" must be a date in the future',
        "any.required": '"Upcoming date" is required',
      }),
  });

  return schema.validate({
    ...note,
    upcomingDate,
  });
}

function convertTimezone(parsedUpcomingDate) {
  const currentUserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const format = "yyyy-MM-dd";
  return {
    currentDate: new Date(
      formatInTimeZone(new Date(), currentUserTimezone, format)
    ),
    upcomingDate: new Date(
      formatInTimeZone(parsedUpcomingDate, currentUserTimezone, format)
    ),
  };
}

function isObjectIdValid(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

exports.Note = Note;
exports.validate = validateNote;
exports.isObjectIdValid = isObjectIdValid;
