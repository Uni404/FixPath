# FixPath

A web-based home appliance fault diagnosis platform. Users submit device fault reports, receive automated diagnoses, and request expert consultations when needed.

---

## Live Application

| Service | URL |
|---|---|
| Frontend | https://frontend-fixpath.up.railway.app |
| Backend API | https://fixpath-fixpath.up.railway.app |

No installation required — open the frontend URL in any modern web browser.

---

## Test Credentials

| Role | Email | Password |
|---|---|---|
| User | micheal@example.com | user123 |
| Expert | alex@example.com | expert123 |
| Expert | sarah@example.com | expert456 |

**Recommended evaluation flow:**
1. Log in as the **User** to submit a device fault report, trigger a diagnosis, and book a consultation
2. Log in as **Expert (alex)** to accept and complete the consultation
3. Return to the User account to submit feedback

---

## Running Locally

The backend connects to the Railway-hosted MySQL database. No local database setup is required.

### Backend
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

A `.env` file is required in the `backend/` directory. Use `backend/env.example` as a template and fill in the database credentials.

---

## Project Structure

```
Fixpath/
├── backend/
│   ├── src/
│   │   ├── controllers/     — Request handlers
│   │   ├── routes/          — Express route definitions
│   │   ├── services/        — Diagnosis engine
│   │   └── middleware/      — File upload (multer)
│   ├── env.example          — Environment variable template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js           — Full SPA (user + expert interfaces)
│   │   └── api.js           — Axios API client
│   └── package.json
├── database/
│   ├── schema.sql           — MySQL table definitions
│   └── seed.sql             — Reference data and test accounts
└── docs/                    — Progress reports and submission documentation
```

---

## Running Tests

```bash
cd backend
npm test
```

Unit tests cover the diagnosis engine scoring logic (`src/services/diagnosisEngine.test.js`).
