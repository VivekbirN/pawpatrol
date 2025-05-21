# Street Dogs and Cats Management System

A comprehensive system for NGOs, municipalities, and animal lovers to track, care for, and manage stray animals effectively.

## Features

### Authentication & Roles
- User Login/Register (public users, volunteers)
- Admin Panel (for NGOs or municipality)
- Optional: Vet Login for health tracking

### Core Features
- Animal Registration
  - Upload photo, species (dog/cat), breed (if known), age, gender
  - Location found
  - Health condition
  - Tag or chip ID (if applicable)
- Health and Vaccination Records
  - Vaccination status (rabies, parvo, etc.)
  - Medical history and ongoing treatments
  - Vet assigned
- Feeding Schedule & Volunteers
  - List of feeding points/locations
  - Daily/weekly feeding schedule
  - Volunteer sign-up for feeding duty
- Adoption Portal
  - List of adoptable animals
  - Adoption request form
  - Admin panel to approve/decline applications
- Lost & Found Reports
  - Users can report found animals
  - Users can post about lost pets
- Rescue Requests
  - Form to request rescue
  - Admin dashboard to assign tasks to volunteers

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MySQL

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up the MySQL database using the provided schema
4. Configure the environment variables
5. Start the server: `npm start`
6. Access the application at: http://localhost:3000