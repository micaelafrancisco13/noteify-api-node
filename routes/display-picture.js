const express = require("express");
const router = express.Router();
const { DisplayPicture, validate } = require("../models/display-picture");
const { User } = require("../models/user");
const { upload, s3 } = require("../config/aws-s3");
const auth = require("../middleware/auth");
const bucketName = "noteify-todo-app";
const config = require("config");
const _ = require("lodash");
const path = require("path");

const S3_BUCKET_NAME = config.get("S3_BUCKET_NAME");
const AWS_REGION = config.get("AWS_REGION");

router.post("/", [auth, upload.single("image")], async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user)
    return res
      .status(404)
      .send(`The user with the ID of ${userId} was not found.`);

  const requestBody = {
    fileName: req.user._id,
    objectUrl: `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${req.file.key}`,
    userId,
  };

  const { error } = validate(requestBody);
  if (error) return res.status(400).send(error.details[0].message);

  const displayPicture = new DisplayPicture({
    fileName: requestBody.fileName,
    objectUrl: requestBody.objectUrl,
    user,
  });
  await displayPicture.save();

  const fileExtension = path.extname(req.file.originalname);
  const newDisplayPicture = displayPicture;
  newDisplayPicture._doc.fileName = `${displayPicture.fileName}${fileExtension}`;

  res.send(_.pick(newDisplayPicture._doc, ["fileName", "objectUrl"]));
});

router.get("/", [auth], async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user)
    return res
      .status(404)
      .send(`The user with the ID of ${userId} was not found.`);

  const displayPicture = await DisplayPicture.findOne({ user: userId });

  if (!displayPicture)
    return res
      .status(404)
      .send(`Current user does not have a display picture.`);

  res.send(_.pick(displayPicture._doc, ["fileName", "objectUrl"]));
});

router.get("/aws", [auth], async (req, res) => {
  console.log("GET DISPLAY PICTURE AWS");
  const userId = req.user._id;
  const folderPath = `users/${userId}/display-picture/`;

  // list objects in the folder
  s3.listObjectsV2({ Bucket: bucketName, Prefix: folderPath }, (err, data) => {
    if (err) res.status(500).send("There was en error listing the S3 objects.");
    else {
      // retrieve the first image found
      if (data.Contents.length > 0) {
        const objectUrl = `https://${bucketName}.s3.${AWS.config.region}.amazonaws.com/${data.Contents[0].Key}`;

        res.send({
          fileName: data.Contents[0].Key.split("/").pop(),
          objectUrl,
        });
      } else res.status(404).send("Display image not found.");
    }
  });
});

module.exports = router;
