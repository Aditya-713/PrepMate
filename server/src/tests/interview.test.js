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
