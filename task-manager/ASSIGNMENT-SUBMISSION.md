# Assignment Submission Guide

## 1. Full Stack To-Do Application
- React frontend connected to Express REST API using Axios.
- Registration/login, JWT authentication and protected routing.
- Create, read, update and delete tasks.
- Status updates and user-specific task records.
Files: `frontend/src/context/AuthContext.jsx`, `frontend/src/components/ProtectedRoute.jsx`, `frontend/src/pages/Dashboard.jsx`, backend auth/task controllers and routes.

## 2. Image Upload Feature
- `POST /api/uploads/image` accepts multipart form-data field `image`.
- Multer stores images in `backend/uploads`.
- JPEG/PNG/WEBP/GIF, maximum 5 MB.
- React previews selected image, uploads it, stores returned URL on the task, and displays it.
Files: `backend/middleware/uploadMiddleware.js`, `backend/controllers/uploadController.js`, `frontend/src/components/TaskForm.jsx`, `TaskCard.jsx`.

## 3. Task Manager Mini Project
- React + Express + MongoDB.
- Login, task CRUD, status filtering, title/description search, due dates and image attachments.
- Every task belongs to its creator; users cannot access another user's tasks.

## Screenshots to add before submission
Registration, login, dashboard, create-task form, uploaded image on task card, filter/search result, Postman API responses.

## Viva points
React Router handles navigation; Axios calls the API; JWT authenticates users; bcrypt hashes passwords; Mongoose defines MongoDB schemas; Multer processes multipart uploads; owner-scoped queries protect each user's tasks. Controllers use ES6 classes with static async methods.
