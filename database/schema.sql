-- Create database if not exists
CREATE DATABASE IF NOT EXISTS pet_management;
USE pet_management;

-- Users table (for authentication and roles)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'volunteer', 'public', 'vet') NOT NULL DEFAULT 'public',
  full_name VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Animals table
CREATE TABLE IF NOT EXISTS animals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  species ENUM('dog', 'cat') NOT NULL,
  breed VARCHAR(100),
  age VARCHAR(50),
  gender ENUM('male', 'female', 'unknown') NOT NULL DEFAULT 'unknown',
  color VARCHAR(50),
  photo_url VARCHAR(255),
  location_found TEXT,
  health_condition TEXT,
  tag_id VARCHAR(100),
  chip_id VARCHAR(100),
  status ENUM('stray', 'shelter', 'adopted', 'foster', 'deceased') DEFAULT 'stray',
  registered_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (registered_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Health records table
CREATE TABLE IF NOT EXISTS health_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  animal_id INT NOT NULL,
  record_type ENUM('vaccination', 'treatment', 'checkup', 'surgery', 'other') NOT NULL,
  record_date DATE NOT NULL,
  description TEXT NOT NULL,
  vet_id INT,
  next_appointment DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE,
  FOREIGN KEY (vet_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Feeding locations table
CREATE TABLE IF NOT EXISTS feeding_locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  coordinates VARCHAR(100),
  description TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Feeding schedules table
CREATE TABLE IF NOT EXISTS feeding_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  location_id INT NOT NULL,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  time_of_day TIME NOT NULL,
  volunteer_id INT,
  status ENUM('scheduled', 'completed', 'missed') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES feeding_locations(id) ON DELETE CASCADE,
  FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Adoption applications table
CREATE TABLE IF NOT EXISTS adoption_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  animal_id INT NOT NULL,
  applicant_id INT NOT NULL,
  application_date DATE NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  reason_for_adoption TEXT,
  home_environment TEXT,
  previous_pet_experience TEXT,
  reviewed_by INT,
  review_date DATE,
  review_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE,
  FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Lost and found reports table
CREATE TABLE IF NOT EXISTS lost_found_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_type ENUM('lost', 'found') NOT NULL,
  species ENUM('dog', 'cat') NOT NULL,
  breed VARCHAR(100),
  color VARCHAR(50),
  gender ENUM('male', 'female', 'unknown') DEFAULT 'unknown',
  location TEXT NOT NULL,
  report_date DATE NOT NULL,
  description TEXT,
  photo_url VARCHAR(255),
  contact_name VARCHAR(100) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(100),
  status ENUM('open', 'resolved', 'expired') DEFAULT 'open',
  reported_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Rescue requests table
CREATE TABLE IF NOT EXISTS rescue_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency ENUM('low', 'medium', 'high', 'emergency') DEFAULT 'medium',
  status ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  requested_by INT,
  assigned_to INT,
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completion_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, role, full_name)
VALUES ('admin', 'admin@example.com', '$2a$10$eCc/ZVe9uTbVtQY9.UbfO.aLrI2.5.1EBY1.ZGGWLZcBcAu.YZvwW', 'admin', 'System Administrator');