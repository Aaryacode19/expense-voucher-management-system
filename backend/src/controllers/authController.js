const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_voucher_jwt_key_2026_abc_corp';

exports.login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employee_code: user.employee_code
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employee_code: user.employee_code
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

exports.register = (req, res) => {
  try {
    const { name, email, password, role, department, employee_code } = req.body;

    if (!name || !email || !password || !role || !department) {
      return res.status(400).json({ error: 'All mandatory fields (name, email, password, role, department) are required.' });
    }

    const validRoles = ['EMPLOYEE', 'DIRECTOR', 'ACCOUNTS'];
    if (!validRoles.includes(role.toUpperCase())) {
      return res.status(400).json({ error: 'Role must be EMPLOYEE, DIRECTOR, or ACCOUNTS' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password, role, department, employee_code)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, email, hashedPassword, role.toUpperCase(), department, employee_code || null);
    
    res.status(201).json({
      message: 'User registered successfully',
      userId: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

exports.getMe = (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, department, employee_code, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching user.' });
  }
};
