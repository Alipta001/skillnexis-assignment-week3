const multer = require("multer");
const path = require("path");
const fs = require("fs");
const dir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(dir, { recursive: true });
const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename: (_req, file, cb) =>
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`,
    ),
});
const fileFilter = (_req, file, cb) =>
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Only JPEG, PNG, WEBP and GIF images are allowed"));
module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");
