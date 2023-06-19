const express = require("express");
const router = express.Router();
const {
  DisplayPicture,
  validate,
} = require("../models/display-picture");
const { User } = require("../models/user");
const { upload, s3, constructFileName } = require("../config/aws-s3");
const auth = require("../middleware/auth");
const bucketName = "noteify-todo-app";
const AWS = require("aws-sdk");
const _ = require("lodash");

router.post("/", [auth, upload.single("image")], async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user)
    return res
      .status(404)
      .send(`The user with the ID of ${userId} was not found.`);

  const objectUrl = `https://${bucketName}.s3.${AWS.config.region}.amazonaws.com/${req.file.key}`;

  const requestBody = {
    fileName: constructFileName(req.file.originalname, req.user._id),
    objectUrl,
    userId,
  };

  const { error } = validate(requestBody);
  if (error) return res.status(400).send(error.details[0].message);

  let displayPicture = await DisplayPicture.findOne({ user: userId });

  if (!displayPicture)
    displayPicture = new DisplayPicture({
      fileName: requestBody.fileName,
      objectUrl: requestBody.objectUrl,
      user,
    });
  else {
    displayPicture.fileName = requestBody.fileName;
    displayPicture.objectUrl = requestBody.objectUrl;
  }
  await displayPicture.save();

  res.send(_.pick(displayPicture._doc, ["fileName", "objectUrl"]));
});

router.get("/", [auth], async (req, res, next) => {
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
