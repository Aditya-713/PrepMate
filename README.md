# AI Interview Prep Platform (PrepMate)

PrepMate is a full-stack MERN application engineered to empower job seekers with AI-driven interview preparation. By uploading a resume PDF and pasting a target job description, users receive RAG-lite skill gap analysis, custom interview questions, real-time SSE streaming mock interviews, and structured post-interview evaluation reports.

---

## Key Features

1. **Authentication & Authorization**
   - JWT token-based authentication with bcrypt password hashing.
   - Protected routes on client & server.
   - Role-based authorization (`user` / `admin`) with a dedicated `/admin` management portal.

2. **Resume & Job Description Intake**
   - PDF file upload using Multer with `pdf-parse` text extraction.
   - Technical skill taxonomy extraction.
   - Job description parsing.

3. **RAG-Lite AI Question Generation**
   - Compares resume text with job description text using TF-IDF and Cosine Similarity.
   - Identifies overlapping skills and missing skill gaps.
   - Generates 8-10 tailored interview questions covering technical depth, behavioral, system design, and problem solving.

4. **Multi-Step Live SSE Streaming Mock Interview**
   - Interactive conversational chat interface.
   - Token-by-token real-time streaming response (Server-Sent Events).
   - Dynamic follow-up question generation based on candidate answers.
   - Comprehensive token usage tracking per interview session.

5. **Performance Evaluation Dashboard**
   - Historical interview session list with performance scores.
   - Detailed evaluation report showing score out of 10, key strengths, areas for improvement, feedback, and full Q&A transcript.

6. **Backend Engineering Standards**
   - Centralized error handling middleware.
   - Request body validation with Joi schemas.
   - Rate limiting on AI & Auth endpoints (`express-rate-limit`).
   - Secure environment variable isolation via `.env`.

---

## Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Lucide Icons, Custom Modern CSS Tokens
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose (with in-memory fallback for local dev)
- **Auth**: JSON Web Tokens (JWT), Bcrypt.js
- **AI Integrations**: Support for OpenAI, Anthropic Claude, Google Gemini, or Built-in Smart Mock Engine

---

## Project Structure

```
PrepMate/
├── package.json               # Root orchestrator scripts
├── README.md                  # Setup & Usage Documentation
├── server/
│   ├── package.json           # Express backend dependencies
│   ├── .env.example           # Environment template
│   ├── .env                   # Active environment secrets
│   ├── src/
│   │   ├── app.js             # Express app setup & route registration
│   │   ├── server.js          # DB connection & server initialization
│   │   ├── config/            # Environment & MongoDB configuration
│   │   ├── models/            # Mongoose Schemas (User, Resume, InterviewSession)
│   │   ├── middleware/        # Auth, Role, Error, Upload & Rate Limiters
│   │   ├── controllers/       # Business logic for Auth, Resumes, Interviews & Admin
│   │   ├── routes/            # REST API endpoint definitions
│   │   ├── utils/             # PDF parser, RAG skill extractor, AI service & validators
│   │   └── tests/             # Jest & Supertest automated integration tests
└── client/
    ├── package.json           # React frontend dependencies
    ├── vite.config.js         # Vite dev server & proxy settings
    ├── src/
    │   ├── main.jsx           # App mounting
    │   ├── App.jsx            # React Router definitions
    │   ├── index.css          # Design system & chat UI styling
    │   ├── context/           # AuthContext provider
    │   ├── services/          # API & SSE Streaming fetch wrappers
    │   ├── components/        # Navbar, ProtectedRoute, AdminRoute, LoadingSpinner
    │   └── pages/             # Login, Signup, Dashboard, ResumeUpload, QuestionGen, MockInterview, SessionDetail, AdminDashboard
```

---

## Installation & Setup Guide

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Optional: Local MongoDB or MongoDB Atlas URI (An in-memory fallback will automatically run if MongoDB is not active).

### Step 1: Install Dependencies
From the root directory, run the setup script to install dependencies for both server and client:
```bash
npm run setup
```

Or manually inside `/server` and `/client`:
```bash
cd server && npm install
cd ../client && npm install
```

### Step 2: Configure Environment Variables
Inside `/server`, verify or customize your `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/prepmate
JWT_SECRET=prepmate_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d

# AI API Keys (Optional - Smart Mock Fallback Active if Keys Omitted)
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GEMINI_API_KEY=
DEFAULT_AI_PROVIDER=mock

ADMIN_SIGNUP_CODE=admin123secret
```

### Step 3: Run Development Servers

**Run Backend Server** (Port 5000):
```bash
npm run dev:server
```

**Run Frontend Client** (Port 5173):
```bash
npm run dev:client
```

Access the application in your browser at `http://localhost:5173`.

---

## Running Automated Tests

To execute the Jest integration test suite for Auth and Interview Generation endpoints:
```bash
npm run test:server
```

---

## API Endpoints Summary

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Protected | Get logged-in user profile |
| `POST` | `/api/resumes/upload` | Protected | Upload PDF resume and extract text/skills |
| `GET` | `/api/resumes` | Protected | Get list of user's uploaded resumes |
| `POST` | `/api/interviews/generate-questions` | Protected (Rate-Limited) | Trigger RAG analysis & generate tailored questions |
| `GET` | `/api/interviews` | Protected | List user's interview history |
| `GET` | `/api/interviews/:sessionId` | Protected | Get session detail, transcript & evaluation |
| `POST` | `/api/interviews/:sessionId/answer-stream` | Protected (Rate-Limited) | Stream candidate answer & AI follow-up (SSE) |
| `POST` | `/api/interviews/:sessionId/complete` | Protected | Complete interview & generate final evaluation |
| `GET` | `/api/admin/stats` | Admin Only | View system metrics & token usage |
| `GET` | `/api/admin/users` | Admin Only | View list of registered platform users |

---

## License
ISC
