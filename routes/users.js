const { User, validate, isObjectIdValid } = require("../models/user");
const auth = require("../middleware/auth");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

router.get("/", [auth], async (req, res) => {
  if (!isObjectIdValid(req.user._id))
    return res.status(400).send("Invalid object ID.");

  const user = await User.findById(req.user._id).select(
    "-password -notes -__v"
  );
  if (!user)
    return res.status(404).send("The user with the given ID was not found.");

  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  });
  const salt = await bcrypt.genSalt(13);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();

  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.omit(user._doc, ["password", "__v"]));
});

module.exports = router;
