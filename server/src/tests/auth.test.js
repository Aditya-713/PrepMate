const request = require('supertest');
const app = require('../app');

describe('Authentication API Endpoints', () => {
  const testUser = {
    name: 'Test Candidate',
    email: `candidate_${Date.now()}@example.com`,
    password: 'password123',
  };

  let authToken = '';

  it('should register a new user successfully (POST /api/auth/signup)', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
  });

  it('should reject registration with invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Invalid Email User',
        email: 'not-an-email',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('should login an existing user (POST /api/auth/login)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    authToken = res.body.token;
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });

  it('should fetch user profile with valid Bearer token (GET /api/auth/me)', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toHaveProperty('email');
  });

  it('should reject unauthenticated request to protected route', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });
});
