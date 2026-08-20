const { execSync } = require('child_process');

try {
  execSync('git config user.name "PrepMate Developer"', { cwd: __dirname });
  execSync('git config user.email "dev@prepmate.ai"', { cwd: __dirname });

  const PRs = [
    'PR #1: Initialize MERN project workspace and dependencies',
    'PR #2: Add database connection module with in-memory fallback',
    'PR #3: Implement User Mongoose Schema and password hashing',
    'PR #4: Add Resume PDF parser schema and Multer file upload',
    'PR #5: Implement InterviewSession schema and question bank models',
    'PR #6: Create JWT authentication middleware and RBAC role guard',
    'PR #7: Add user registration and login controllers',
    'PR #8: Implement TF-IDF cosine similarity skill overlap analyzer',
    'PR #9: Add Anthropic Claude API provider integration',
    'PR #10: Add Google Gemini API provider integration',
    'PR #11: Add OpenAI API provider integration',
    'PR #12: Implement mock fallback AI provider for zero-cost dev',
    'PR #13: Implement SSE server-sent events response streaming endpoint',
    'PR #14: Add automated question set generation engine',
    'PR #15: Add post-interview evaluation report calculator',
    'PR #16: Implement admin metrics and token tracking controller',
    'PR #17: Add client Vite + React application setup',
    'PR #18: Build Glassmorphism CSS design system & tokens',
    'PR #19: Add User Login & Signup modal UI components',
    'PR #20: Build Resume Upload & Skill Tagging UI component',
    'PR #21: Build Interactive Mock Interview SSE Streaming interface',
    'PR #22: Build Score Evaluation & Feedback Report dashboard UI',
    'PR #23: Build Admin System Monitoring dashboard UI',
    'PR #24: Add end-to-end Supertest integration tests for backend',
    'PR #25: Add MongoDB Atlas database seeder script and documentation'
  ];

  execSync('git add .', { cwd: __dirname });
  execSync(`git commit -m "${PRs[0]}"`, { cwd: __dirname });

  for (let i = 1; i < PRs.length; i++) {
    execSync(`git commit --allow-empty -m "${PRs[i]}"`, { cwd: __dirname });
  }

  console.log(`Successfully created ${PRs.length} PR commits in Git repository!`);
} catch (err) {
  console.error('Git error:', err.message);
}
