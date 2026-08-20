# Product Requirement Document (PRD) - PrepMate

## 1. Product Overview & Vision
**PrepMate** is an AI-powered mock interview preparation platform designed to help job seekers simulate real-world technical and behavioral interviews. By leveraging candidate resumes and specific target job descriptions, PrepMate provides personalized skill gap analyses, custom question sets, real-time interactive SSE mock interviews, and structured evaluation reports.

---

## 2. Target Audience & Personas
- **Software Engineers & Technical Candidates**: Preparing for technical, system design, and coding/behavioral interviews.
- **Job Seekers across Domains**: Needing tailored feedback based on their specific experience vs target role descriptions.
- **Platform Administrators**: Monitoring system usage, API token consumption, and user demographics.

---

## 3. Goals & Objectives
- **Personalized Interviewing**: Tailor question generation based on TF-IDF cosine similarity between candidates' resumes and job descriptions.
- **Real-Time Interactive Experience**: Deliver low-latency, token-by-token streaming responses during live mock interviews using Server-Sent Events (SSE).
- **Actionable Insights**: Provide candidates with post-interview evaluation scores (out of 10), key strengths, areas for improvement, and feedback per question.
- **Security & Reliability**: Ensure role-based access control (RBAC), password encryption, rate limiting, and robust input validation.

---

## 4. Key Functional Requirements

### 4.1 Authentication & User Management
- **User Registration & Login**: JWT-based authentication using `bcrypt` hashed passwords.
- **Role-Based Access Control (RBAC)**: Support for `user` and `admin` roles. Admin signup protected via secret verification code.
- **Profile Access**: Protected `/api/auth/me` endpoint to retrieve user metadata.

### 4.2 Resume & Job Description Intake
- **Resume Upload**: PDF file parsing using `pdf-parse` with Multer file storage.
- **Skill Extraction**: Automatic technical skill taxonomy extraction from parsed PDF text.
- **Job Description Parsing**: Raw text intake for target job positions.

### 4.3 RAG-Lite Question Generation
- **Skill Overlap Analysis**: Calculate TF-IDF vectors and cosine similarity scores between resume skills and job description text.
- **Tailored Question Sets**: Produce 8-10 customized questions spanning technical depth, problem-solving, behavioral, and system design categories.

### 4.4 Real-Time Streaming Mock Interview (SSE)
- **Token-by-Token Response**: Real-time response streaming for interviewer evaluation and follow-up prompts using Server-Sent Events (SSE).
- **Dynamic Follow-Ups**: Contextual responses based on previous Q&A turns.
- **Token Usage Tracking**: Log prompt and completion token counts per session.

### 4.5 Performance Evaluation & Dashboard
- **Session History**: Track historical interview attempts with scores and timestamps.
- **Detailed Evaluation Report**: Comprehensive breakdown including overall score, strengths, growth areas, and transcripts.

### 4.6 Admin Management Portal
- **System Metrics**: Overview of total users, interview sessions, and cumulative token consumption.
- **User List**: Admin management table listing user records and roles.

---

## 5. Non-Functional Requirements
- **Performance & Latency**: SSE stream initiation within < 1 second; RAG question generation within < 3 seconds.
- **Security**: Password hashing with `bcryptjs` (salt rounds 10), JWT verification, request sanitization, role guards.
- **Reliability & Availability**: Database abstraction supporting MongoDB Atlas with an automatic in-memory fallback (`mongodb-memory-server`) for resilient local execution.
- **Usability**: Responsive glassmorphism CSS design system built with Vite, React 18, and Lucide icons.

---

## 6. Success Metrics
- Average score improvement across multiple mock interview sessions.
- Candidate completion rate of generated interview sessions (> 80%).
- Low streaming latency (< 500ms first-token time).
