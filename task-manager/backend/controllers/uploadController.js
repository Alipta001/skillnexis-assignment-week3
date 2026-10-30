class UploadController {
  static async uploadImage(req, res) {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "Please select an image" });
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    return res.status(201).json({
      success: true,
      message: "Image uploaded",
      imageUrl,
      file: {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  }
}
module.exports = UploadController;
