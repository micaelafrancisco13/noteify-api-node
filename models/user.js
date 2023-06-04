const joi = require("joi");
joi.objectId = require("joi-objectid")(joi);
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    maxLength: 255,
    minLength: 2,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    maxLength: 255,
    minLength: 2,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    maxLength: 255,
    minLength: 2,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    minLength: 8,
    maxLength: 1024,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = joi.object({
    firstName: joi.string().min(2).max(255).required().label("First name"),
    lastName: joi.string().min(2).max(255).required().label("Last name"),
    email: joi.string().min(2).max(255).required().label("Email address"),
    password: joi.string().min(8).max(1024).required().label("Password"),
  });

  return schema.validate(user);
}

function isObjectIdValid(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

exports.userSchema = userSchema;
exports.User = User;
exports.validate = validateUser;
exports.isObjectIdValid = isObjectIdValid;
