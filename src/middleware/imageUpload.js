const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../resources/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: type-timestamp-randomstring.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to only accept images or PDFs for healthLicense
const fileFilter = (req, file, cb) => {
  const allowedImageMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedImageExts = ['.jpeg', '.jpg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Allow PDFs for healthLicense field
  if (file.fieldname === 'healthLicense') {
    if (file.mimetype === 'application/pdf' || ext === '.pdf') {
      cb(null, true);
      return;
    }
  }
  
  // Allow images for other fields
  if (allowedImageMimes.includes(file.mimetype) || allowedImageExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'), false);
  }
};

// Create multer instance
const imageUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Helper to get the full URL for storing in DB
const getImageUrl = (filename) => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 2801}`;
  return `${baseUrl}/resources/images/${filename}`;
};

// Helper to delete an image file (accepts full URL or relative path)
const deleteImage = (imageUrl) => {
  if (!imageUrl) return;
  // Extract relative path from URL if it's a full URL
  let relativePath = imageUrl;
  if (imageUrl.includes('/resources/images/')) {
    relativePath = 'resources/images/' + imageUrl.split('/resources/images/')[1];
  }
  const fullPath = path.join(__dirname, '../../', relativePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = {
  imageUpload,
  getImageUrl,
  deleteImage
};
