const request = require('supertest');
const app = require('../app');

describe('Interview Question Generation API', () => {
  let authToken = '';

  beforeAll(async () => {
    // Signup a user to obtain token
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Interview Test User',
        email: `interviewer_${Date.now()}@example.com`,
        password: 'password123',
      });
    authToken = res.body.token;
  });

  it('should generate tailored interview questions (POST /api/interviews/generate-questions)', async () => {
    const payload = {
      jobDescription: 'We are seeking a Senior Full Stack Engineer proficient in React, Node.js, Express, MongoDB, REST APIs, and Docker.',
      resumeText: 'Experienced Software Engineer skilled in JavaScript, React, Node.js, Git, HTML, CSS, and SQL databases.',
      targetRole: 'Full Stack Engineer',
    };

    const res = await request(app)
      .post('/api/interviews/generate-questions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('session');
    expect(res.body.session.questions.length).toBeGreaterThanOrEqual(4);
    expect(res.body.session.skillAnalysis).toHaveProperty('overlappingSkills');
    expect(res.body.session.skillAnalysis).toHaveProperty('missingSkills');
  });

  it('should detect Relational Schema Design (PK/FK) and SQL JOINs skills in job description', async () => {
    const payload = {
      jobDescription: 'Seeking Database Architect with expertise in Relational Schema Design, Primary Key and Foreign Key modeling, PK/FK constraints, and optimized SQL JOINs (INNER, LEFT, RIGHT).',
      resumeText: 'Software Developer experienced in PostgreSQL, Relational Schema Design with PK/FK constraints, database normalization, and complex SQL JOINs.',
      targetRole: 'Database Architect',
    };

    const res = await request(app)
      .post('/api/interviews/generate-questions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.session.skillAnalysis.overlappingSkills.length).toBeGreaterThan(0);
    const questions = res.body.session.questions;
    expect(questions.some(q => q.category.includes('Relational Schema') || q.category.includes('SQL JOINs'))).toBe(true);
  });

  it('should extract JavaScript Event Loop and Hoisting skills and generate JS core questions', async () => {
    const payload = {
      jobDescription: 'Looking for a Frontend Specialist knowledgeable in JavaScript Event Loop mechanics, microtasks, macrotasks, scoping, and JavaScript Hoisting behaviors.',
      resumeText: 'Frontend Engineer skilled in JavaScript, React, Event Loop performance optimization, and scope hoisting.',
      targetRole: 'Frontend Specialist',
    };

    const res = await request(app)
      .post('/api/interviews/generate-questions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    const skills = res.body.session.skillAnalysis.jdSkills;
    expect(skills.some(s => s.toLowerCase().includes('event loop'))).toBe(true);
    expect(skills.some(s => s.toLowerCase().includes('hoisting'))).toBe(true);
  });

  it('should extract LLM Eval Sets, Vector Retrieval, and Multi-Step Agent skills and generate AI architecture questions', async () => {
    const payload = {
      jobDescription: 'Seeking Senior AI Engineer with expertise in LLM eval sets, benchmarks, RAG embeddings & vector retrieval, and multi-step agent autonomous workflows.',
      resumeText: 'AI Specialist experienced in LangChain, Python, LLM eval, embeddings & vector retrieval, and multi-step agentic workflows.',
      targetRole: 'AI Engineer',
    };

    const res = await request(app)
      .post('/api/interviews/generate-questions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    const skills = res.body.session.skillAnalysis.jdSkills;
    expect(skills.some(s => s.toLowerCase().includes('eval'))).toBe(true);
    expect(skills.some(s => s.toLowerCase().includes('vector retrieval') || s.toLowerCase().includes('embeddings'))).toBe(true);
    expect(skills.some(s => s.toLowerCase().includes('agent'))).toBe(true);
  });

  it('should reject question generation when job description is too short', async () => {
    const res = await request(app)
      .post('/api/interviews/generate-questions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        jobDescription: 'Short JD',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });
});
