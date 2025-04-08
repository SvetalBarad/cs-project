const path = require('path');
const fs = require('fs');
const Note = require('../models/Note');

// @desc    Upload a new note
// @route   POST /upload
// @access  Private
exports.uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Create new note
    const note = new Note(
      null,
      req.body.title,
      req.body.description || '',
      req.file.originalname,
      req.file.path,
      req.file.mimetype,
      req.file.size,
      req.user.id
    );

    await note.save();

    res.status(201).json({
      success: true,
      data: {
        _id: note.id,
        title: note.title,
        description: note.description,
        filename: note.filename,
        filetype: note.filetype,
        filesize: note.filesize,
        uploadedBy: req.user.id
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    
    // Remove file if note creation fails
    if (req.file) {
      fs.unlink(req.file.path, err => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get all notes/resources
// @route   GET /resources
// @access  Public
exports.getAllResources = async (req, res) => {
  try {
    const notes = await Note.findAll();

    // Format the response to match the expected frontend format
    const formattedNotes = notes.map(note => ({
      _id: note.id,
      title: note.title,
      description: note.description,
      filename: note.filename,
      filepath: note.filepath,
      filetype: note.filetype,
      filesize: note.filesize,
      uploadedBy: {
        name: note.uploader_name,
        email: note.uploader_email
      },
      createdAt: note.created_at,
      updatedAt: note.updated_at
    }));

    res.status(200).json({
      success: true,
      count: notes.length,
      data: formattedNotes
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get notes uploaded by logged in user
// @route   GET /my-notes
// @access  Private
exports.getMyNotes = async (req, res) => {
  try {
    const notes = await Note.findByUserId(req.user.id);

    // Format the response to match the expected frontend format
    const formattedNotes = notes.map(note => ({
      _id: note.id,
      title: note.title,
      description: note.description,
      filename: note.filename,
      filepath: note.filepath,
      filetype: note.filetype,
      filesize: note.filesize,
      uploadedBy: req.user.id,
      createdAt: note.created_at,
      updatedAt: note.updated_at
    }));

    res.status(200).json({
      success: true,
      count: notes.length,
      data: formattedNotes
    });
  } catch (error) {
    console.error('Get my notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Download a file
// @route   GET /download/:id
// @access  Public
exports.downloadNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check if file exists
    if (!fs.existsSync(note.filepath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Set download headers
    res.setHeader('Content-Disposition', `attachment; filename=${note.filename}`);
    res.setHeader('Content-Type', note.filetype);

    // Stream the file to the client
    const filestream = fs.createReadStream(note.filepath);
    filestream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete a note/resource
// @route   DELETE /resources/:id
// @access  Private
exports.deleteResource = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Delete file from filesystem if it exists
    if (fs.existsSync(note.filepath)) {
      fs.unlinkSync(note.filepath);
    }

    // Delete from database
    await Note.delete(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
}; 