const express = require("express");
const router = express.Router();
const { upload, s3, constructFileName } = require("../config/aws-s3");
const auth = require("../middleware/auth");
const bucketName = "noteify-todo-app";

router.post("/", [auth, upload.single("image")], async (req, res) => {
  const s3Uri = req.file.location;

  const objectUrl = s3.getSignedUrl("getObject", {
    Bucket: bucketName,
    Key: req.file.key,
    Expires: 3600, // Expiry time in seconds (1 hour)
  });

  res.send({
    fileName: constructFileName(req.file.originalname, req.user._id),
    s3Uri,
    objectUrl,
  });
});

module.exports = router;
