# BIT Student Information Management System

A React dashboard and Express API for managing student records, backed by MongoDB.

## Run locally (Windows)

Requirements: Node.js 18 or newer, npm, and MongoDB locally or a MongoDB Atlas database.

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` to your database connection string. The default connects to a local MongoDB database named `CCProjectOne`.
2. From PowerShell at the repository root, run:

   ```powershell
   .\start-project.ps1
   ```

3. Open <http://localhost:5173>. The API is at <http://localhost:5000>; its health endpoint is <http://localhost:5000/api/health>.
4. Stop both services with `.\stop-project.ps1`.

The startup script installs dependencies when needed. For manual startup, open two terminals: run `npm install` then `npm start` in `backend`; run `npm install` then `npm run dev` in `frontend`. Keep `VITE_API_URL` empty in `frontend/.env` to use the Vite proxy, or set it to `http://localhost:5000` to call the backend directly.

## Deploy

### Backend (Render)

The root `render.yaml` creates a Node web service rooted at `backend`, starts it with `npm start`, and checks `/api/health`. Set these values in the Render service environment:

- `MONGODB_URI`: production MongoDB connection string. Add the Render outbound IP policy or allow network access in MongoDB Atlas as appropriate.
- `FRONTEND_URL`: exact deployed frontend origin, such as `https://your-site.netlify.app` (no path). Multiple origins can be comma-separated.
- `NODE_ENV=production` is set by the blueprint. Render supplies `PORT`.

The server listens on the hosting platform's `PORT`, and refuses to start in production without `MONGODB_URI`.

### Frontend (Netlify)

The root `netlify.toml` builds the `frontend` directory, publishes Vite's `dist` output, and rewrites SPA routes to `index.html`. Set `VITE_API_URL` in Netlify's build environment to the backend origin, for example `https://bit-student-api.onrender.com` (no trailing slash), then trigger a new deploy. Vite embeds this value at build time. If the API is served from the same origin as the frontend, leave it unset and the app uses `/api`.

The frontend and backend origins must agree: the Netlify origin belongs in backend `FRONTEND_URL`, and the Render origin belongs in Netlify `VITE_API_URL`.

## API

All endpoints are prefixed with `/api`:

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | API and database status |
| GET | `/students` | List students |
| GET | `/students/:id` | Read one student |
| POST | `/students` | Create a student |
| PUT | `/students/:id` | Update a student |
| DELETE | `/students/:id` | Delete a student |

Student fields: `studentId`, `name`, `email`, `department`, `semester` (1–8), and optional `contact`.

## Environment files

Use `backend/.env.example` as a template. Real `.env` files are ignored by Git; never commit database credentials. `VITE_API_URL` is public frontend configuration and must contain only the API base URL, never a secret.
