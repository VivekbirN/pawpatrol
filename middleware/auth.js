const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
function auth(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload to request object
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

// Middleware to check if user has admin role
function adminAuth(req, res, next) {
  auth(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }
  });
}

// Middleware to check if user has vet role
function vetAuth(req, res, next) {
  auth(req, res, () => {
    if (req.user.role === 'vet' || req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied: Veterinarian privileges required' });
    }
  });
}

module.exports = { auth, adminAuth, vetAuth };