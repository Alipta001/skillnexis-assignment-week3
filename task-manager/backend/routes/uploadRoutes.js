const router = require("express").Router();
const UploadController = require("../controllers/uploadController");
const AuthMiddleware = require("../middleware/authMiddleware");
const uploadImage = require("../middleware/uploadMiddleware");
router.post(
  "/image",
  AuthMiddleware.protect,
  (req, res, next) =>
    uploadImage(req, res, (error) => (error ? next(error) : next())),
  UploadController.uploadImage,
);
module.exports = router;
