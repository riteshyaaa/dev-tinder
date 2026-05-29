const cloudinary = require("cloudinary").v2;
const multer = require("multer");
require("dotenv").config();

/**
 * Cloudinary server-side configuration.
 * Provides secure signed uploads (vs. unsigned from frontend).
 *
 * Env vars needed:
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

// Multer memory storage (for buffer-based upload to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer - Image file buffer
 * @param {Object} options - { folder, publicId }
 * @returns {Promise<Object>} - { url, publicId, width, height }
 */
const uploadToCloudinary = (buffer, options = {}) => {
  const { folder = "devtinder/profiles", publicId } = options;

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: "image",
      transformation: [
        { width: 500, height: 500, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    };
    if (publicId) uploadOptions.public_id = publicId;

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);
      resolve({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      });
    });

    stream.end(buffer);
  });
};

/**
 * Delete an image from Cloudinary.
 * @param {string} publicId
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete failed:", err.message);
  }
};

module.exports = { cloudinary, upload, uploadToCloudinary, deleteFromCloudinary };
