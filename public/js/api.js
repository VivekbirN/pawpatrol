// API utility functions for authentication

// Base URL for API calls
const API_URL = '/api';

// Register a new user
async function registerUser(userData) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('petcare_token', data.token);
      localStorage.setItem('petcare_current_user', JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Login user
async function loginUser(credentials) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('petcare_token', data.token);
      localStorage.setItem('petcare_current_user', JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Get current user
async function getCurrentUser() {
  try {
    const token = localStorage.getItem('petcare_token');
    
    if (!token) {
      return null;
    }
    
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'x-auth-token': token
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user data');
    }
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// Logout user
function logoutUser() {
  localStorage.removeItem('petcare_token');
  localStorage.removeItem('petcare_current_user');
}

// Export functions
window.authApi = {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser
};