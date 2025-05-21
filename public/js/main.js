// Toggle mobile navigation menu
const navSlide = () => {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-links li');

  if (burger) {
    burger.addEventListener('click', () => {
      // Toggle Nav
      nav.classList.toggle('nav-active');

      // Animate Links
      navLinks.forEach((link, index) => {
        if (link.style.animation) {
          link.style.animation = '';
        } else {
          link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        }
      });

      // Burger Animation
      burger.classList.toggle('toggle');
    });
  }
};

// Check if user is logged in
const checkAuthStatus = () => {
  const token = localStorage.getItem('token');
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (token) {
    // User is logged in
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';

    // Get user info from token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload.role;

      // Show/hide elements based on user role
      const adminElements = document.querySelectorAll('.admin-only');
      const vetElements = document.querySelectorAll('.vet-only');
      const volunteerElements = document.querySelectorAll('.volunteer-only');

      adminElements.forEach(el => {
        el.style.display = userRole === 'admin' ? 'block' : 'none';
      });

      vetElements.forEach(el => {
        el.style.display = userRole === 'vet' ? 'block' : 'none';
      });

      volunteerElements.forEach(el => {
        el.style.display = userRole === 'volunteer' || userRole === 'admin' ? 'block' : 'none';
      });
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  } else {
    // User is not logged in
    if (loginBtn) loginBtn.style.display = 'block';
    if (registerBtn) registerBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';

    // Hide role-specific elements
    document.querySelectorAll('.admin-only, .vet-only, .volunteer-only').forEach(el => {
      el.style.display = 'none';
    });
  }
};

// Handle logout
const setupLogout = () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    });
  }
};

// Show alert message
const showAlert = (message, type = 'success') => {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.appendChild(document.createTextNode(message));

  // Get the container element
  const container = document.querySelector('.container') || document.body;
  const main = document.querySelector('main');

  // Insert alert before main content
  container.insertBefore(alertDiv, main);

  // Remove alert after 3 seconds
  setTimeout(() => {
    document.querySelector('.alert').remove();
  }, 3000);
};

// Format date to readable format
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Initialize the application
const app = () => {
  navSlide();
  checkAuthStatus();
  setupLogout();
};

// Run the app when DOM content is loaded
document.addEventListener('DOMContentLoaded', app);