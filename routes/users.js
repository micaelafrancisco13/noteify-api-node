const {
  User,
  validate,
  validatePersonalDetails,
  validateEmail,
  validatePassword,
  isObjectIdValid,
} = require("../models/user");
const auth = require("../middleware/auth");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

router.post("/logout", async (req, res) => {
  res.send("Logged out successfully!");
});

router.get("/me", [auth], async (req, res) => {
  if (!isObjectIdValid(req.user._id))
    return res.status(400).send("Invalid object ID.");

  const user = await User.findById(req.user._id).select("-password -notes");
  if (!user) return res.status(404).send("User does not exist.");

  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  const { firstName, lastName, email, password } = req.body;
  user = new User({
    firstName,
    lastName,
    email,
    password,
  });
  user.password = await hashedPassword(user.password);
  await user.save();

  const token = user.generateAuthToken();

  res
    .header("Authorization", `Bearer ${token}`)
    .send(_.omit(user._doc, ["password"]));
});

// update basic credentials - first & last names
router.put("/me/personal", [auth], async (req, res) => {
  const userId = req.user._id;

  if (!isObjectIdValid(userId))
    return res.status(400).send("Invalid object ID.");

  const { error } = validatePersonalDetails(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { firstName, lastName } = req.body;

  const currentUser = await User.findByIdAndUpdate(
    userId,
    { firstName, lastName },
    { new: true }
  );

  if (!currentUser) return res.status(404).send("User does not exist.");

  res.send(_.omit(currentUser._doc, ["password"]));
});

router.put("/me/email", [auth], async (req, res) => {
  const userId = req.user._id;

  if (!isObjectIdValid(userId))
    return res.status(400).send("Invalid object ID.");

  const { error } = validateEmail(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { email } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).send("Email already taken.");

  const currentUser = await User.findByIdAndUpdate(
    userId,
    { email },
    { new: true }
  );

  if (!currentUser) return res.status(404).send("User does not exist.");

  res.send(_.omit(currentUser._doc, ["password"]));
});

router.put("/me/password", [auth], async (req, res) => {
  const userId = req.user._id;

  if (!isObjectIdValid(userId))
    return res.status(400).send("Invalid object ID.");

  const { error } = validatePassword(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { password } = req.body;
  const newPassword = await hashedPassword(password);

  const currentUser = await User.findByIdAndUpdate(
    userId,
    { password: newPassword },
    { new: true }
  );

  if (!currentUser) return res.status(404).send("User does not exist.");

  res.send(_.omit(currentUser._doc, ["password"]));
});

async function hashedPassword(password) {
  const salt = await bcrypt.genSalt(13);
  return await bcrypt.hash(password, salt);
}

module.exports = router;
