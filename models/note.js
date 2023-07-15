const joi = require("joi");
const mongoose = require("mongoose");
const { startOfDay, parseISO, isAfter } = require("date-fns");
const { zonedTimeToUtc, formatInTimeZone } = require("date-fns-tz");

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
  const customDateValidator = (value, helpers) => {
    const currentDate = new Date();
    const upcomingDate = value;

    if (!isAfter(upcomingDate, currentDate))
      return helpers.error("date.invalid", {
        message: `"Upcoming date" must be equal or later than the current date`,
      });

    return value;
  };

  const schema = joi.object({
    title: joi.string().min(1).max(255).required().label("Title"),
    description: joi.string().min(1).max(255).required().label("Description"),
    categoryId: joi.objectId().required().label("Category ID"),
    upcomingDate: joi
      .date()
      .custom(customDateValidator)
      .required()
      .label("Upcoming date"),
  });

  return schema.validate(note);
}

function convertTimezone(parsedUpcomingDate) {
  const currentUserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const format = "yyyy-MM-dd";
  const timeZone = "Asia/Singapore";

  return {
    currentDate: new Date(
      formatInTimeZone(new Date(), currentUserTimezone, format)
    ),
    upcomingDate: zonedTimeToUtc(parsedUpcomingDate, timeZone),
  };
}

function isObjectIdValid(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

exports.Note = Note;
exports.validate = validateNote;
exports.isObjectIdValid = isObjectIdValid;
