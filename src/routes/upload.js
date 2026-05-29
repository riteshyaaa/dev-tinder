const express = require("express");
const uploadRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { upload, uploadToCloudinary } = require("../services/cloudinary");

/**
 * POST /upload/image
 * Server-side image upload to Cloudinary with signed credentials.
 * Returns the secure URL for immediate use.
 */
uploadRouter.post(
  "/upload/image",
  userAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const result = await uploadToCloudinary(req.file.buffer, {
        folder: `devtinder/profiles/${req.user._id}`,
      });

      res.json({
        message: "Image uploaded successfully",
        data: result,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

module.exports = uploadRouter;
