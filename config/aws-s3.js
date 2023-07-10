const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const config = require("config");

const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  credentials: {
    accessKeyId: config.get("AWS_ACCESS_KEY"),
    secretAccessKey: config.get("AWS_SECRET_ACCESS_KEY"),
  },
  region: config.get("AWS_REGION"),
});

// Configure multer to use multer-s3 as the storage engine
const storage = multerS3({
  s3,
  bucket: config.get("S3_BUCKET_NAME"),
  contentType: multerS3.AUTO_CONTENT_TYPE,
  contentDisposition: "inline",
  key: function (req, file, callback) {
    const userId = req.user._id;
    const fileName = userId;
    const filePath = `users/${userId}/display-picture/${fileName}`;
    callback(null, filePath);
  },
});

const upload = multer({ storage });

module.exports.upload = upload;
module.exports.s3 = s3;
