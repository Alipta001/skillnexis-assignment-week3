# Full-Stack Task Manager

Combines all requested work:
1. Full Stack To-Do: React, authentication, CRUD and routing.
2. Image Upload: Multer endpoint, React preview and image display.
3. Mini Project: authenticated task manager with filtering/search.

## Requirements
Node.js 18+, npm, MongoDB (local or Atlas).

## Start backend
```bash
cd backend
npm install
cp .env.example .env
```
Set `MONGO_URI` and a long random `JWT_SECRET` in `.env`, then run `npm run dev`.
API: http://localhost:5000

## Start frontend (new terminal)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Open the Vite URL, normally http://localhost:5173.

## API
- POST `/api/auth/register`, POST `/api/auth/login`, GET `/api/auth/me`
- POST `/api/tasks`, GET `/api/tasks`, GET/PUT/DELETE `/api/tasks/:id`
- POST `/api/uploads/image` (multipart/form-data field: `image`)
- GET `/api/health`

Task list filters: `?status=all|pending|in-progress|completed&search=keyword`.
Image formats: JPEG, PNG, WEBP, GIF; max 5 MB.

## Security
Passwords use bcrypt; protected endpoints require Bearer JWT; task queries are scoped to the authenticated user. Do not commit `.env`. For production, use object storage for images, HTTPS, rate limiting and production CORS settings.

See `ASSIGNMENT-SUBMISSION.md` for assignment mapping and viva notes. Import `postman/Task-Manager.postman_collection.json` into Postman.
