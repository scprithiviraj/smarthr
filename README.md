# Smart HR System

A full-stack Human Resource Management System built with Spring Boot and React.

## Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8.0+

## Database Setup

1. Ensure MySQL is running on port `3306`.
2. Create a database named `smarthr` (or let the application create it automatically).
3. Verify your credentials in `backend/src/main/resources/application.properties`:
    - Username: `root`
    - Password: `3227` (Update this if your local password differs)

## Running the Backend

1. Navigate to the backend directory:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   mvn clean install
   ```
3. Run the application:
   ```sh
   mvn spring-boot:run
   ```
   The backend will start on `http://localhost:8080`.

## Running the Frontend

1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

## Default Login

- **Admin User**: Created automatically on first run (or after system reset).
    - Username: `admin`
    - Password: `admin123`
