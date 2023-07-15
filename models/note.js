const joi = require("joi");
const mongoose = require("mongoose");
const {
  startOfDay,
  parseISO,
  isAfter,
  isEqual,
  compareAsc,
} = require("date-fns");
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
  const currentDate = startOfDay(new Date());
  const parsedUpcomingDate = startOfDay(parseISO(note.upcomingDate));

  console.log("currentDate", currentDate);
  console.log("parsedUpcomingDate", parsedUpcomingDate);

  const parsedUpcomingDateSingapore = zonedTimeToUtc(
    parsedUpcomingDate,
    "Asia/Singapore"
  );

  // Compare the converted parsed upcoming date with the current date
  const dateComparison = compareAsc(parsedUpcomingDateSingapore, currentDate);

  if (dateComparison >= 0) {
    console.log("The parsedUpcomingDate is valid.");
    // Process the request further
  } else {
    console.log("The parsedUpcomingDate is invalid.");
    // Handle the error or return an error response
  }

  const customDateValidator = (value, helpers) => {
    if (
      !isAfter(parsedUpcomingDate, currentDate) &&
      !isEqual(parsedUpcomingDate, currentDate)
    )
      return helpers.error("date.invalid");

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
      .messages({
        "date.invalid": `"Upcoming date" must be equal to or later than the current date`,
      })
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
