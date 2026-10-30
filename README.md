# Week 3 Projects

This folder contains two separate projects:

- `task-manager/` - the full-stack task manager with its own React frontend and Express backend.
- `todo-frontend/` - a React client for the Week 2 To-Do API in `../backend_assignments_week2/01-todo-list-api`.

Run the commands below from the workspace root.

## Run the Week 2 To-Do API and frontend

Start MongoDB, then in one terminal:

```bash
cd backend_assignments_week2/01-todo-list-api
npm install
cp .env.example .env
# Set MONGO_URI in .env
npm run dev
```

In another terminal:

```bash
cd week3/todo-frontend
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`). The frontend calls the
Week 2 API at `http://localhost:5001/api` by default. Change `VITE_API_URL`
in `todo-frontend/.env` if the API runs at a different address.

The To-Do API is intentionally unauthenticated and stores all tasks in the
same collection. The frontend provides create, list, edit, complete/reopen,
delete, status filtering and text search.

For the full Task Manager setup, see `task-manager/README.md`.
