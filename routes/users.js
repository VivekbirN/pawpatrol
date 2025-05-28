const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { auth, adminAuth } = require('../middleware/auth');

// GET - Get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, username, email, role, full_name as name, phone, created_at as createdAt 
      FROM users 
      ORDER BY created_at DESC`
    );
    
    // Map 'pet-lover' role to 'animal-lover' for frontend display
    const mappedUsers = users.map(user => ({
      ...user,
      role: user.role === 'public' ? 'animal-lover' : user.role
    }));
    
    res.json(mappedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET - Get a specific user by ID (admin only)
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const [user] = await pool.query(
      `SELECT id, username, email, role, full_name as name, phone, created_at as createdAt 
      FROM users 
      WHERE id = ?`,
      [req.params.id]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Map 'public' role to 'animal-lover' for frontend display
    const mappedUser = {
      ...user[0],
      role: user[0].role === 'public' ? 'animal-lover' : user[0].role
    };
    
    res.json(mappedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT - Update a user (admin only)
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    
    // Check if user exists
    const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Map 'animal-lover' role back to 'public' for database storage
    const dbRole = role === 'animal-lover' ? 'public' : role;
    
    // Update user information
    await pool.query(
      `UPDATE users SET 
        full_name = ?, 
        email = ?, 
        phone = ?, 
        role = ? 
      WHERE id = ?`,
      [name, email, phone, dbRole, req.params.id]
    );
    
    // If role changed to/from vet or admin, handle admin_staff table
    if ((dbRole === 'vet' || dbRole === 'admin') && (user[0].role !== 'vet' && user[0].role !== 'admin')) {
      // User is now staff, add to admin_staff table
      await pool.query(
        'INSERT INTO admin_staff (email_id, role) VALUES (?, ?)',
        [email, dbRole]
      );
    } else if ((user[0].role === 'vet' || user[0].role === 'admin') && (dbRole !== 'vet' && dbRole !== 'admin')) {
      // User is no longer staff, remove from admin_staff table
      await pool.query('DELETE FROM admin_staff WHERE email_id = ?', [user[0].email]);
    } else if ((user[0].role === 'vet' || user[0].role === 'admin') && (dbRole === 'vet' || dbRole === 'admin') && user[0].email !== email) {
      // User is still staff but email changed, update admin_staff table
      await pool.query(
        'UPDATE admin_staff SET email_id = ?, role = ? WHERE email_id = ?',
        [email, dbRole, user[0].email]
      );
    }
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE - Delete a user (admin only)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    // Check if user exists
    const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    
    // If user was vet or admin, also delete from admin_staff table
    if (user[0].role === 'vet' || user[0].role === 'admin') {
      await pool.query('DELETE FROM admin_staff WHERE email_id = ?', [user[0].email]);
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;