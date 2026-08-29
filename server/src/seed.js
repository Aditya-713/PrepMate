const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('./config/env');
const User = require('./models/User');
const Resume = require('./models/Resume');
const InterviewSession = require('./models/InterviewSession');

const ROLES = [
  'Senior Frontend Developer',
  'Backend Engineer (Node.js/Go)',
  'Full Stack Software Engineer',
  'DevOps & Infrastructure Engineer',
  'AI / Machine Learning Engineer',
  'Mobile Engineer (React Native/Flutter)',
  'System Architect',
  'QA Automation Engineer'
];

const SKILL_SETS = [
  ['JavaScript', 'TypeScript', 'React', 'JavaScript Event Loop', 'JavaScript Hoisting', 'HTML5', 'CSS3', 'Tailwind', 'Webpack', 'Jest'],
  ['Node.js', 'Express', 'Relational Schema Design (PK/FK)', 'SQL JOINs', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'REST APIs'],
  ['React', 'Node.js', 'Python', 'PostgreSQL', 'SQL JOINs', 'Docker', 'AWS', 'System Design', 'Git', 'CI/CD'],
  ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux', 'Bash', 'Prometheus', 'Grafana'],
  ['Python', 'PyTorch', 'TensorFlow', 'LLM Eval Sets & Benchmarks', 'RAG — Embeddings & Vector Retrieval', 'Multi-Step Agentic Workflows', 'Vector DBs', 'LLMs', 'Pandas'],
  ['React Native', 'Flutter', 'Dart', 'iOS/Android', 'Redux', 'Mobile UI', 'GraphQL', 'Firebase'],
  ['Distributed Systems', 'System Design', 'Relational Schema Design (PK/FK)', 'SQL JOINs', 'Kafka', 'Kubernetes', 'Microservices'],
  ['Selenium', 'Cypress', 'Playwright', 'Jest', 'Postman', 'Automation Frameworks', 'CI/CD', 'Python']
];

const SAMPLE_USERS = [
  { name: 'Aditya Nagane', email: 'aditya@prepmate.ai', role: 'admin' },
  { name: 'Sarah Jenkins', email: 'sarah.j@example.com', role: 'user' },
  { name: 'Michael Chen', email: 'mchen@techcorp.io', role: 'user' },
  { name: 'Priya Sharma', email: 'priya.sharma@devhub.net', role: 'user' },
  { name: 'Alex Rivera', email: 'arivera@cloudscale.org', role: 'user' },
  { name: 'Emily Taylor', email: 'emily.taylor@codecraft.io', role: 'user' }
];

const QUESTIONS_BANK = {
  'Frontend': [
    { question: 'Explain the JavaScript Event Loop, execution stack, microtask queue (Promises), and macrotask queue (setTimeout) with code execution order.', category: 'JavaScript Event Loop', difficulty: 'medium', rationale: 'Tests deep understanding of single-threaded non-blocking asynchronous execution in JavaScript.' },
    { question: 'How does hoisting work in JavaScript for var, let, const, function declarations, and function expressions? What is the Temporal Dead Zone (TDZ)?', category: 'JavaScript Hoisting', difficulty: 'medium', rationale: 'Evaluates knowledge of scope, variable initialization lifecycle, and hoisting nuances.' },
    { question: 'Explain the difference between Virtual DOM and Shadow DOM.', category: 'Technical', difficulty: 'medium' },
    { question: 'How do you optimize React performance for large data lists?', category: 'Performance', difficulty: 'hard' },
    { question: 'Describe how closures work in JavaScript with a practical use case.', category: 'Technical', difficulty: 'easy' },
    { question: 'What strategies do you use for state management in large scale applications?', category: 'System Design', difficulty: 'medium' }
  ],
  'Backend': [
    { question: 'How does Node.js event loop handle asynchronous I/O operations under high load?', category: 'Technical', difficulty: 'hard' },
    { question: 'Design a rate limiter middleware for a high-traffic REST API.', category: 'System Design', difficulty: 'hard' },
    { question: 'Compare SQL indexing vs MongoDB indexing strategies.', category: 'Database', difficulty: 'medium' },
    { question: 'Explain JWT authentication flow and security best practices for token refresh.', category: 'Security', difficulty: 'medium' }
  ],
  'Database': [
    { question: 'How do you design a normalised relational schema using Primary Keys (PK), Foreign Keys (FK), and referential integrity constraints?', category: 'Relational Schema Design', difficulty: 'medium', rationale: 'Evaluates RDBMS database normalization, primary/foreign key modeling, and CASCADE constraints.' },
    { question: 'Explain the technical differences between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN with practical SQL query examples.', category: 'SQL JOINs', difficulty: 'medium', rationale: 'Tests candidate query composition, set operations, and relational data retrieval.' },
    { question: 'How do multi-table SQL JOINs impact query performance on large-scale datasets, and how do composite indexes optimize JOIN execution plans?', category: 'Database Optimization', difficulty: 'hard', rationale: 'Assesses deep knowledge of query execution planners, B-Tree indexes, and JOIN algorithms like Hash Join and Nested Loops.' },
    { question: 'Describe how to implement Many-to-Many (N:M) entity relationships using junction tables with composite Primary Keys and Foreign Key relationships.', category: 'Relational Schema Design', difficulty: 'hard', rationale: 'Verifies advanced relational schema modeling and bridge table primary/foreign key constraints.' }
  ],
  'AI & LLM Architecture': [
    { question: 'How do you design an LLM evaluation set and benchmark suite (e.g., LLM-as-a-Judge, ROUGE/BLEU, semantic similarity metrics) to detect regression during prompt engineering or fine-tuning?', category: 'LLM Eval Sets & Benchmarks', difficulty: 'hard', rationale: 'Evaluates production LLM pipeline quality assessment, automated grading benchmarks, and hallucination measurement.' },
    { question: 'Compare dense vector embeddings (e.g., OpenAI text-embedding-3, BERT) vs sparse retrieval (BM25) in RAG systems, and explain how HNSW vector indexes optimize similarity search.', category: 'RAG — Embeddings & Vector Retrieval', difficulty: 'hard', rationale: 'Assesses architectural knowledge of vector databases, embedding generation, chunking strategies, and hybrid search.' },
    { question: 'Describe how to build a multi-step autonomous AI agent using the ReAct (Reason + Act) pattern, tool execution loops, state management, and loop termination conditions.', category: 'Multi-Step Agentic Workflows', difficulty: 'hard', rationale: 'Tests understanding of autonomous LLM agent execution loops, function calling, stateful memory, and guardrails against infinite loops.' }
  ],
  'General': [
    { question: 'Tell me about a time you had to handle a critical production bug under time pressure.', category: 'Behavioral', difficulty: 'medium' },
    { question: 'How do you handle technical debt while keeping up with sprint feature delivery?', category: 'Behavioral', difficulty: 'medium' },
    { question: 'Explain how you approach designing a scalable microservice architecture.', category: 'System Design', difficulty: 'hard' }
  ]
};

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('Connected to MongoDB Atlas successfully.');

    // Clear existing data
    await User.deleteMany({});
    await Resume.deleteMany({});
    await InterviewSession.deleteMany({});
    console.log('Cleared existing database records.');

    // Create Users
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const createdUsers = [];

    for (const u of SAMPLE_USERS) {
      const user = await User.create({
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role
      });
      createdUsers.push(user);
    }
    console.log(`Created ${createdUsers.length} users.`);

    // Create Resumes for users
    const createdResumes = [];
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const skills = SKILL_SETS[i % SKILL_SETS.length];
      const resume = await Resume.create({
        userId: user._id,
        filename: `${user.name.toLowerCase().replace(/\s+/g, '_')}_resume.pdf`,
        originalName: `${user.name}_Resume.pdf`,
        extractedText: `${user.name} - Experienced candidate with expertise in ${skills.join(', ')}. Proven track record in developing high-performance scalable systems.`,
        parsedSkills: skills
      });
      createdResumes.push(resume);
    }
    console.log(`Created ${createdResumes.length} parsed resumes.`);

    // Create 25 Practice Records / Interview Sessions
    const createdSessions = [];
    const statuses = ['completed', 'completed', 'completed', 'in-progress', 'created'];

    for (let i = 1; i <= 25; i++) {
      const user = createdUsers[i % createdUsers.length];
      const resume = createdResumes[i % createdResumes.length];
      const targetRole = ROLES[i % ROLES.length];
      const status = statuses[i % statuses.length];

      const categories = ['Frontend', 'Backend', 'Database'];
      const techCategory = categories[i % categories.length];
      const sessionQuestions = [
        ...QUESTIONS_BANK[techCategory].map((q, idx) => ({ id: `q_${i}_${idx+1}`, ...q })),
        ...QUESTIONS_BANK['General'].map((q, idx) => ({ id: `q_${i}_gen_${idx+1}`, ...q }))
      ];

      const score = Math.floor(Math.random() * 4) + 7; // score 7-10
      const session = await InterviewSession.create({
        userId: user._id,
        resumeId: resume._id,
        jobDescription: `Looking for an experienced ${targetRole} skilled in modern architecture, high availability, teamwork, and clean code principles.`,
        targetRole,
        skillAnalysis: {
          overlappingSkills: resume.parsedSkills.slice(0, 4),
          missingSkills: ['Kubernetes', 'GraphQL', 'Kafka'].slice(0, (i % 3) + 1),
          matchScore: Math.floor(Math.random() * 25) + 75
        },
        questions: sessionQuestions,
        transcript: status === 'completed' ? [
          { sender: 'ai', content: `Welcome ${user.name}! Let's start with your technical evaluation for the ${targetRole} position.` },
          { sender: 'user', content: `Thank you! I am ready.` },
          { sender: 'ai', content: sessionQuestions[0].question, questionId: sessionQuestions[0].id },
          { sender: 'user', content: `In my previous role, I used a decoupled architecture where components were optimized to minimize re-renders.` }
        ] : [],
        evaluation: status === 'completed' ? {
          score,
          strengths: ['Strong technical fundamentals', 'Clear communication', 'Solid problem solving approach'],
          gaps: ['Could elaborate more on edge-case error handling', 'System metrics scaling details'],
          feedback: `Great performance during the interview! Candidate demonstrated deep understanding of ${targetRole} principles and effective communication skills.`,
          recommendations: ['Review distributed caching patterns', 'Practice system design estimation queries']
        } : {},
        tokenUsage: {
          promptTokens: Math.floor(Math.random() * 500) + 300,
          completionTokens: Math.floor(Math.random() * 400) + 200,
          totalTokens: Math.floor(Math.random() * 900) + 500
        },
        status,
        currentQuestionIndex: status === 'completed' ? sessionQuestions.length : 1,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000) // Spread across past 25 days
      });

      createdSessions.push(session);
    }

    console.log(`==================================================`);
    console.log(`🎉 SUCCESS: Generated and stored 25 Practice Records in MongoDB Atlas!`);
    console.log(`📊 Summary:`);
    console.log(`   - Users created: ${createdUsers.length}`);
    console.log(`   - Resumes stored: ${createdResumes.length}`);
    console.log(`   - Interview Practice Records (PRs) created: ${createdSessions.length}`);
    console.log(`==================================================`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
