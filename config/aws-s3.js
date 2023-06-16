const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");

AWS.config.update({
  accessKeyId: "AKIASBOR6EMBTQDZR5TO",
  secretAccessKey: "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",
  region: "ap-northeast-1",
});

const s3 = new AWS.S3();

// Configure multer to use multer-s3 as the storage engine
const storage = multerS3({
  s3,
  bucket: "noteify-todo-app",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  contentDisposition: "inline",
  key: function (req, file, callback) {
    const userId = req.user._id;
    const fileName = constructFileName(file.originalname, userId);
    const filePath = `users/${userId}/display-picture/${fileName}`;
    callback(null, filePath);
  },
});

function constructFileName(originalFileName, userId) {
  return `${userId}${path.extname(originalFileName)}`;
}

const upload = multer({ storage });

module.exports.upload = upload;
module.exports.s3 = s3;
module.exports.constructFileName = constructFileName;
