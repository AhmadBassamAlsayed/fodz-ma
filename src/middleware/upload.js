const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../resources/delivery_pdf');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-randomstring.pdf
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'delivery-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only accept PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

// Helper to get the full URL for storing in DB
const getPdfUrl = (filename) => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 2801}`;
  return `${baseUrl}/resources/delivery_pdf/${filename}`;
};

// Helper to delete a PDF file (accepts full URL or relative path)
const deletePdf = (pdfUrl) => {
  if (!pdfUrl) return;
  // Extract relative path from URL if it's a full URL
  let relativePath = pdfUrl;
  if (pdfUrl.includes('/resources/delivery_pdf/')) {
    relativePath = 'resources/delivery_pdf/' + pdfUrl.split('/resources/delivery_pdf/')[1];
  }
  const fullPath = path.join(__dirname, '../../', relativePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = {
  upload,
  getPdfUrl,
  deletePdf
};
