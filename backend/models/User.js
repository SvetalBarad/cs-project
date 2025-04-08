const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  constructor(id, name, email, password) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
  }

  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Find user by email error:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT id, name, email, created_at FROM users WHERE id = ?', [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Find user by ID error:', error);
      throw error;
    }
  }

  async save() {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);

      // Insert user into database
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [this.name, this.email, this.password]
      );

      this.id = result.insertId;
      return this;
    } catch (error) {
      console.error('Save user error:', error);
      throw error;
    }
  }

  static async comparePassword(providedPassword, storedPassword) {
    return await bcrypt.compare(providedPassword, storedPassword);
  }

  static getSignedJwtToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });
  }
}

module.exports = User; 