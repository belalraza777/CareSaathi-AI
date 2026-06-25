import multer from "multer";
import fs from "fs";
import path from "path";

// Define the maximum allowed size for chat images in megabytes and convert it to bytes for use in Multer's configuration. This limit helps prevent excessively large files from being uploaded, which could impact server performance and storage.
export const MAX_CHAT_IMAGE_SIZE_MB = 10;
const MAX_CHAT_IMAGE_SIZE_BYTES = MAX_CHAT_IMAGE_SIZE_MB * 1024 * 1024;
const allowedImageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

// Normalize MIME types to ensure consistent handling of uploaded files. This function converts the MIME type to lowercase, trims whitespace, and maps common variations (like "image/jpg") to their standard forms (like "image/jpeg"). It also handles cases where the MIME type is missing or set to a generic value like "application/octet-stream".
const normalizeMimeType = (mimetype = "") => {
  const value = mimetype.toLowerCase().trim();
  if (!value || value === "application/octet-stream") {
    return "";
  }
  if (value === "image/jpg") {
    return "image/jpeg";
  }
  return value;
};

// Determine the MIME type based on the file extension. This function is used as a fallback when the MIME type is not provided or is incorrect. It maps common image file extensions to their corresponding MIME types, ensuring that uploaded files are correctly identified and processed.
const mimeFromExtension = (filename = "") => {
  const extension = path.extname(filename).toLowerCase();
  const map = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  return map[extension] || "";
};

// Ensure the uploads directory exists at startup. Multer will not create it automatically, and we want to avoid runtime errors when handling file uploads.
const uploadDirectory = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Map common image MIME types to file extensions for consistent storage and retrieval.
const extensionByMimeType = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

// Configure Multer storage to save uploaded images to the local filesystem with unique filenames to prevent collisions. We use a combination of timestamp and random number for uniqueness.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const extension = extensionByMimeType[file.mimetype] || ".img";
    // Use a unique filename to prevent overwrite collisions.
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  },
});

// Multer upload instance with file size limits and MIME type filtering to ensure only valid image files are processed. This middleware will be used in the chat message endpoint to handle optional image uploads.
const upload = multer({
  storage,
  limits: { fileSize: MAX_CHAT_IMAGE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    let mimetype = normalizeMimeType(file.mimetype);
    if (!mimetype) {
      mimetype = mimeFromExtension(file.originalname);
    }
    if (mimetype) {
      file.mimetype = mimetype;
    }

    if (!allowedImageMimeTypes.has(file.mimetype)) {
      const error = new Error("Only JPG, PNG, WEBP, and GIF images are allowed.");
      error.status = 400;
      return cb(error);
    }

    return cb(null, true);
  },
});



export const uploadChatImage = upload.single("image");