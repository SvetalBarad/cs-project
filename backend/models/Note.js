const { pool } = require('../config/db');

class Note {
  constructor(id, title, description, filename, filepath, filetype, filesize, userId) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.filename = filename;
    this.filepath = filepath;
    this.filetype = filetype;
    this.filesize = filesize;
    this.userId = userId;
  }

  async save() {
    try {
      const [result] = await pool.execute(
        'INSERT INTO notes (title, description, filename, filepath, filetype, filesize, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [this.title, this.description, this.filename, this.filepath, this.filetype, this.filesize, this.userId]
      );

      this.id = result.insertId;
      return this;
    } catch (error) {
      console.error('Save note error:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM notes WHERE id = ?', [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Find note by ID error:', error);
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await pool.execute(`
        SELECT n.*, u.name as uploader_name, u.email as uploader_email 
        FROM notes n 
        JOIN users u ON n.user_id = u.id 
        ORDER BY n.created_at DESC
      `);
      return rows;
    } catch (error) {
      console.error('Find all notes error:', error);
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const [rows] = await pool.execute('SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC', [userId]);
      return rows;
    } catch (error) {
      console.error('Find notes by user ID error:', error);
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      // Check ownership if userId is provided
      if (userId) {
        const [rows] = await pool.execute('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
        if (rows.length === 0) {
          throw new Error('Note not found or you are not authorized to delete it');
        }
      }

      const [result] = await pool.execute('DELETE FROM notes WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Delete note error:', error);
      throw error;
    }
  }
}

module.exports = Note; 