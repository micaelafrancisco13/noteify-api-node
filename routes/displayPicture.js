const express = require("express");
const router = express.Router();
const { upload, s3, constructFileName } = require("../config/aws-s3");
const auth = require("../middleware/auth");
const bucketName = "noteify-todo-app";

router.post("/", [auth, upload.single("image")], async (req, res) => {
  const objectUrl = s3.getSignedUrl("getObject", {
    Bucket: bucketName,
    Key: req.file.key,
    Expires: 3600, // Expiry time in seconds (1 hour)
  });

  res.send({
    fileName: constructFileName(req.file.originalname, req.user._id),
    objectUrl,
  });
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
        const preSignedUrl = s3.getSignedUrl("getObject", {
          Bucket: bucketName,
          Key: data.Contents[0].Key,
          Expires: 3600,
        });

        res.send({
          fileName: data.Contents[0].Key.split("/").pop(),
          objectUrl: preSignedUrl,
        });
      } else res.status(404).send("Display image not found.");
    }
  });
});

module.exports = router;
