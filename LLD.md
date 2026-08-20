# Low-Level Design (LLD) - PrepMate

## 1. Database Schemas (Mongoose Models)

### 1.1 User Schema (`server/src/models/User.js`)
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
}
```
- **Hooks**: Pre-save hook using `bcrypt.hash(password, 10)`.
- **Methods**: `comparePassword(candidatePassword)` using `bcrypt.compare`.

### 1.2 Resume Schema (`server/src/models/Resume.js`)
```javascript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  extractedText: { type: String, required: true },
  skills: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
}
```

### 1.3 InterviewSession Schema (`server/src/models/InterviewSession.js`)
```javascript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resumeId: { type: Schema.Types.ObjectId, ref: 'Resume' },
  jobTitle: { type: String, required: true },
  jobDescription: { type: String, required: true },
  similarityScore: { type: Number, default: 0 },
  extractedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  questions: [{
    id: String,
    category: { type: String, enum: ['technical', 'behavioral', 'system_design', 'problem_solving'] },
    questionText: String,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] }
  }],
  transcript: [{
    questionId: String,
    questionText: String,
    userAnswer: String,
    aiFeedback: String,
    timestamp: { type: Date, default: Date.now }
  }],
  evaluation: {
    overallScore: Number,
    strengths: [String],
    areasForImprovement: [String],
    summaryFeedback: String
  },
  tokenUsage: {
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 }
  },
  status: { type: String, enum: ['created', 'in_progress', 'completed'], default: 'created' },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 2. Module Implementations & Utility Functions

### 2.1 PDF Parsing Module (`server/src/utils/pdfParser.js`)
- `extractTextFromBuffer(buffer)`: Accepts Multer file buffer, processes via `pdf-parse`, returns sanitized text string.

### 2.2 RAG & Skill Extraction Module (`server/src/utils/ragSkillsExtractor.js`)
- `extractSkills(text)`: Scans input text against predefined technology taxonomy (Node.js, React, Docker, Python, MongoDB, AWS, etc.).
- `calculateTfidfSimilarity(docA, docB)`: Computes term frequencies, inverse document frequencies, and cosine similarity vector dot product between candidate resume and job description.
- `analyzeSkillGap(resumeText, jobDescriptionText)`: Combines skill taxonomy matching with cosine similarity to return extracted skills, missing skills, and overlap ratio.

### 2.3 AI Orchestration Module (`server/src/utils/aiService.js`)
- `generateInterviewQuestions({ resumeText, jobDescription, skillGap })`: Formats prompt and routes request to active AI provider (OpenAI / Claude / Gemini / Smart Mock). Returns JSON question array.
- `streamAnswerFeedback({ questionText, userAnswer, context }, res)`: Sets up SSE headers (`res.setHeader('Content-Type', 'text/event-stream')`), streams response chunks, and closes stream with `data: [DONE]`.
- `generateFinalEvaluation({ transcript, jobTitle })`: Evaluates full transcript to produce numeric score, strengths, and areas for improvement.

---

## 3. API Specifications & Endpoints

| Method | Route | Middleware | Input Body | Output Response |
|---|---|---|---|---|
| `POST` | `/api/auth/signup` | Validation | `{ name, email, password, adminCode? }` | `{ token, user }` |
| `POST` | `/api/auth/login` | Validation | `{ email, password }` | `{ token, user }` |
| `GET` | `/api/auth/me` | AuthGuard | None | `{ user }` |
| `POST` | `/api/resumes/upload` | AuthGuard, Multer | Multipart PDF | `{ resumeId, extractedSkills, fileName }` |
| `POST` | `/api/interviews/generate-questions` | AuthGuard, RateLimit | `{ resumeId?, jobTitle, jobDescription }` | `{ sessionId, questions, similarityScore }` |
| `POST` | `/api/interviews/:id/answer-stream` | AuthGuard, RateLimit | `{ questionId, questionText, userAnswer }` | SSE Stream (`data: chunk`) |
| `POST` | `/api/interviews/:id/complete` | AuthGuard | None | `{ evaluation, status: 'completed' }` |
| `GET` | `/api/admin/stats` | AuthGuard, RequireAdmin | None | `{ totalUsers, totalInterviews, totalTokenUsage }` |

---

## 4. Middleware & Error Handling Strategy

### 4.1 Error Handling (`server/src/middleware/error.middleware.js`)
- Catches uncaught controller exceptions.
- Formats standard JSON error schema:
  ```json
  {
    "success": false,
    "error": "Error message description",
    "stack": "Included only in non-production environments"
  }
  ```

### 4.2 Request Validation (`server/src/utils/validators.js`)
- Uses Joi schemas for request payload validation before reaching controller handlers.
