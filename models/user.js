const joi = require("joi");
const config = require("config");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    maxLength: 255,
    minLength: 2,
    required: true,
    trim: true,
    dateLastModified: { type: Date, default: Date.now },
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
  dateRegistered: { type: Date, default: Date.now },
  dateLoggedIn: { type: Date, default: Date.now },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      // firstName: this.firstName,
      // lastName: this.lastName,
      // email: this.email,
    },
    config.get("JWT_PRIVATE_KEY")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function getJoiSchema() {
  return joi.object({
    firstName: joi.string().min(2).max(255).required().label("First name"),
    lastName: joi.string().min(2).max(255).required().label("Last name"),
    email: joi
      .string()
      .email({ tlds: { allow: true } })
      .min(2)
      .max(255)
      .required()
      .label("Email address"),
    password: joi.string().min(8).max(1024).required().label("Password"),
  });
}

function validateUser(user) {
  return getJoiSchema().validate(user);
}

function validatePersonalDetails(user) {
  const baseSchema = getJoiSchema();

  return joi
    .object({
      firstName: baseSchema.extract("firstName").label("First name"),
      lastName: baseSchema.extract("lastName").label("Last name"),
    })
    .validate(user);
}

function validateEmail(user) {
  const baseSchema = getJoiSchema();

  return joi
    .object({
      email: baseSchema.extract("email").label("Email"),
    })
    .validate(user);
}

function validatePassword(user) {
  const baseSchema = getJoiSchema();

  return joi
    .object({
      currentPassword: joi
        .string()
        .min(1)
        .max(1024)
        .required()
        .label("Current password"),
      newPassword: baseSchema.extract("password").label("New password"),
    })
    .validate(user);
}

function isObjectIdValid(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

exports.userSchema = userSchema;
exports.User = User;
exports.validate = validateUser;
exports.validatePersonalDetails = validatePersonalDetails;
exports.validateEmail = validateEmail;
exports.validatePassword = validatePassword;
exports.isObjectIdValid = isObjectIdValid;
