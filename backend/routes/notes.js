const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  uploadNote, 
  getAllResources, 
  getMyNotes,
  downloadNote,
  deleteResource
} = require('../controllers/notesController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

// File filter function to restrict file types
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const filetypes = /pdf|doc|docx|txt|jpg|jpeg|png/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, Word, TXT and image files are allowed!'));
  }
};

// Initialize upload with settings
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// Route for uploading a note (protected)
router.post('/upload', protect, upload.single('file'), uploadNote);

// Route for getting all resources (public)
router.get('/resources', getAllResources);

// Route for getting user's notes (protected)
router.get('/my-notes', protect, getMyNotes);

// Route for downloading a note (public)
router.get('/download/:id', downloadNote);

// Route for deleting a note (protected)
router.delete('/resources/:id', protect, deleteResource);

module.exports = router; 