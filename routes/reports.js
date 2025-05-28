const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept only images
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// POST - Create a new lost and found report
router.post('/lost-found', upload.single('photo'), async (req, res) => {
  try {
    const { 
      report_type, species, breed, color, gender, location, report_date, 
      description, contact_name, contact_phone, contact_email, reported_by 
    } = req.body;

    // Validate required fields
    if (!report_type || !species || !location || !report_date || !contact_name || !contact_phone) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Process the uploaded file
    let photo_url = null;
    if (req.file) {
      photo_url = `/uploads/${req.file.filename}`;
    }

    // Insert into database
    const [result] = await db.query(
      `INSERT INTO lost_found_reports 
      (report_type, species, breed, color, gender, location, report_date, 
      description, photo_url, contact_name, contact_phone, contact_email, reported_by, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      [report_type, species, breed, color, gender, location, report_date, 
      description, photo_url, contact_name, contact_phone, contact_email, reported_by || null]
    );

    res.status(201).json({ 
      message: 'Report created successfully', 
      reportId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating lost and found report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST - Create a new rescue request
router.post('/rescue', upload.single('photo'), async (req, res) => {
  try {
    const { 
      location, description, urgency, contactName, contactPhone, 
      contactEmail, notes, requested_by, species 
    } = req.body;

    // Validate required fields
    if (!location || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Process the uploaded file
    let photo_url = null;
    if (req.file) {
      photo_url = `/uploads/${req.file.filename}`;
    }

    // Insert into database
    const [result] = await db.query(
      `INSERT INTO rescue_requests 
      (location, description, urgency, status, requested_by, photo_url, 
      contact_name, contact_phone, contact_email, notes, species) 
      VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`,
      [location, description, urgency || 'medium', requested_by || null, photo_url, 
      contactName, contactPhone, contactEmail, notes, species || null]
    );

    res.status(201).json({ 
      message: 'Rescue request created successfully', 
      requestId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating rescue request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET - Get all lost and found reports (with optional filtering)
router.get('/lost-found', auth, async (req, res) => {
  try {
    const { filter } = req.query;
    let query = `
      SELECT lf.*, u.username as reported_by_name 
      FROM lost_found_reports lf 
      LEFT JOIN users u ON lf.reported_by = u.id 
    `;
    
    // Apply filters if provided
    if (filter && filter !== 'all') {
      if (filter === 'lost' || filter === 'found') {
        query += ` WHERE lf.report_type = '${filter}'`;
      } else if (filter === 'open' || filter === 'resolved' || filter === 'expired') {
        query += ` WHERE lf.status = '${filter}'`;
      }
    }
    
    query += ` ORDER BY lf.created_at DESC`;
    
    const [reports] = await db.query(query);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching lost and found reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET - Get all rescue requests (with optional filtering)
router.get('/rescue', auth, async (req, res) => {
  try {
    const { filter } = req.query;
    let query = `
      SELECT r.*, u1.username as requested_by_name, u2.username as assigned_to_name 
      FROM rescue_requests r 
      LEFT JOIN users u1 ON r.requested_by = u1.id 
      LEFT JOIN users u2 ON r.assigned_to = u2.id 
    `;
    
    // Apply filters if provided
    if (filter && filter !== 'all') {
      query += ` WHERE r.status = '${filter}'`;
    }
    
    query += ` ORDER BY r.request_date DESC`;
    
    const [requests] = await db.query(query);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching rescue requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET - Get a specific lost and found report by ID
router.get('/lost-found/:id', auth, async (req, res) => {
  try {
    const [report] = await db.query(
      `SELECT lf.*, u.username as reported_by_name 
      FROM lost_found_reports lf 
      LEFT JOIN users u ON lf.reported_by = u.id 
      WHERE lf.id = ?`,
      [req.params.id]
    );
    
    if (report.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json(report[0]);
  } catch (error) {
    console.error('Error fetching lost and found report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET - Get a specific rescue request by ID
router.get('/rescue/:id', auth, async (req, res) => {
  try {
    const [request] = await db.query(
      `SELECT r.*, u1.username as requested_by_name, u2.username as assigned_to_name 
      FROM rescue_requests r 
      LEFT JOIN users u1 ON r.requested_by = u1.id 
      LEFT JOIN users u2 ON r.assigned_to = u2.id 
      WHERE r.id = ?`,
      [req.params.id]
    );
    
    if (request.length === 0) {
      return res.status(404).json({ message: 'Rescue request not found' });
    }
    
    res.json(request[0]);
  } catch (error) {
    console.error('Error fetching rescue request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT - Update a lost and found report status
router.put('/lost-found/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['open', 'resolved', 'expired'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    await db.query(
      'UPDATE lost_found_reports SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating lost and found report status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT - Update a rescue request status
router.put('/rescue/:id/status', auth, async (req, res) => {
  try {
    const { status, assigned_to } = req.body;
    
    if (!status || !['pending', 'assigned', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    let query = 'UPDATE rescue_requests SET status = ?';
    let params = [status];
    
    if (assigned_to) {
      query += ', assigned_to = ?';
      params.push(assigned_to);
    }
    
    if (status === 'completed') {
      query += ', completion_date = NOW()';
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await db.query(query, params);
    
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating rescue request status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;