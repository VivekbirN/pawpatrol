// Handle user authentication (login, register)

// Check if user is logged in and update UI accordingly
document.addEventListener('DOMContentLoaded', function() {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  
  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem('petcare_current_user'));
  
  if (currentUser) {
    // User is logged in, update UI
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (logoutBtn) {
      logoutBtn.style.display = 'inline-block';
      
      // Add logout functionality
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Clear user data
        localStorage.removeItem('petcare_current_user');
        
        // Show success message
        alert('You have been logged out successfully.');
        
        // Reload page to update UI
        window.location.reload();
      });
    }
  } else {
    // User is not logged in
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (registerBtn) registerBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
});

// Helper function to show alerts (for compatibility with existing code)
function showAlert(message, type) {
  alert(message);
}

// The login and registration form submissions are now handled directly in new_auth.html
// This file now only handles the UI updates based on authentication status
      console.error('Registration error:', error);
      showAlert('An error occurred during registration. Please try again.', 'danger');
//     }
//   });
// }

// Function to get authenticated user data
async function getUserData() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }
  
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      // If token is invalid, clear it
      localStorage.removeItem('token');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Function to check if user has required role
function hasRole(requiredRole) {
  const token = localStorage.getItem('token');
  
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role === requiredRole || payload.role === 'admin';
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}