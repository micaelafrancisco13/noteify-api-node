const joi = require("joi");
const mongoose = require("mongoose");

const displayPictureSchema = new mongoose.Schema({
  fileName: {
    type: String,
    minLength: 2,
    maxLength: 50,
    trim: true,
    required: true,
  },
  objectUrl: {
    type: String,
    minLength: 2,
    maxLength: 255,
    trim: true,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const DisplayPicture = mongoose.model("DisplayPicture", displayPictureSchema);

function validateDisplayPicture(displayPicture) {
  const schema = joi.object({
    fileName: joi.string().min(2).max(50).required().label("Display picture"),
    objectUrl: joi.string().min(2).max(255).required().label("Display picture"),
    userId: joi.objectId().required().label("User ID"),
  });

  return schema.validate(displayPicture);
}

function isObjectIdValid(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

exports.displayPictureSchema = displayPictureSchema;
exports.DisplayPicture = DisplayPicture;
exports.validate = validateDisplayPicture;
exports.isObjectIdValid = isObjectIdValid;
