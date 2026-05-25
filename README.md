# Full-Stack Task Management System

A robust, industry-level full-stack application for Task Management built with **React** (Vite) on the frontend and **Java 21 / Spring Boot 3** on the backend, using **MongoDB**. This project incorporates modern software engineering practices, security (JWT), Docker containerization, and Jenkins CI/CD integration.

## Tech Stack

### Frontend
- **Framework**: React 18 (via Vite)
- **Styling**: Vanilla CSS (Premium Glassmorphism, Dark/Light modes)
- **Routing**: React Router DOM
- **HTTP Client**: Axios with Interceptors
- **Notifications**: React Toastify
- **Icons**: Lucide React

### Backend
- **Java**: 21 (LTS)
- **Framework**: Spring Boot 3.3.x
- **Build Tool**: Maven 3.9+
- **Database**: MongoDB
- **Security**: Spring Security 6 with JWT Token Authentication
- **Documentation**: Swagger/OpenAPI 3 (Springdoc)

### DevOps
- **Containerization**: Docker & Docker Compose (Frontend + Backend + MongoDB)
- **Web Server**: Nginx (Frontend static serving & route rewrites)
- **CI/CD**: Jenkins declarative pipeline
- **Testing**: JUnit 5, Mockito

## Features

- **Rich Aesthetics**: Premium UI with glassmorphism, responsive dashboard, and dark/light mode toggles.
- **User Authentication**: Secure Login/Register flow, context-based state, and protected React routes.
- **Task Management**: Full CRUD operations with modals, search filtering, and status tracking.
- **API Security**: JWT validation on backend, Axios interceptors auto-attaching tokens on frontend.

## Setup Instructions

### Running with Docker Compose (Recommended)
This is the easiest way to spin up the entire full-stack application (Frontend, Backend, Database).
```bash
docker-compose up --build
```
- **Frontend**: Available at `http://localhost`
- **Backend API**: Available at `http://localhost:8080/api`
- **Swagger UI**: Available at `http://localhost:8080/swagger-ui.html`

*Note: MongoDB runs internally in the docker network and is exposed to your host on port `27018` to prevent conflicts with local instances.*

### Running Locally (Development Mode)

#### 1. Backend
Ensure MongoDB is running locally (port 27017 or adjust `application.yml`).
```bash
mvn clean install
mvn spring-boot:run
```

#### 2. Frontend
Open a new terminal window in the `frontend` directory.
```bash
cd frontend
npm install
npm run dev
```
The development server will start at `http://localhost:5173`. Backend CORS is already configured to accept requests from this port.
