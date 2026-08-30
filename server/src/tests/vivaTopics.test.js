const request = require('supertest');
const app = require('../app');
const { TOOL_DEFINITIONS, executeToolCall } = require('../utils/functionCallingEngine');
const { VectorStore, performVectorRagRetrieval } = require('../utils/vectorRagEngine');
const { runBenchmarkSuite, runSingleEvalCase, evalDataset } = require('../utils/llmEvalEngine');
const { MultiStepInterviewAgent } = require('../utils/multiStepAgent');

describe('Viva Topics Feature Implementation Test Suite', () => {

  describe('1. Function Calling / Tool Use Engine', () => {
    test('TOOL_DEFINITIONS contains valid function schemas', () => {
      expect(Array.isArray(TOOL_DEFINITIONS)).toBe(true);
      expect(TOOL_DEFINITIONS.length).toBeGreaterThanOrEqual(3);
      expect(TOOL_DEFINITIONS[0].function.name).toBe('searchSkillTaxonomy');
    });

    test('executeToolCall executes searchSkillTaxonomy correctly', async () => {
      const res = await executeToolCall('searchSkillTaxonomy', { query: 'react' });
      expect(res.success).toBe(true);
      expect(res.details.category).toBe('Frontend');
    });

    test('executeToolCall executes calculateScoreBreakdown correctly', async () => {
      const res = await executeToolCall('calculateScoreBreakdown', {
        overlappingCount: 4,
        missingCount: 1,
        textSimilarity: 85
      });
      expect(res.success).toBe(true);
      expect(res.overallScore).toBeGreaterThan(60);
      expect(res.breakdown.readinessLevel).toBe('Interview Ready');
    });

    test('executeToolCall throws for unhandled tools', async () => {
      await expect(executeToolCall('nonExistentTool', {})).rejects.toThrow();
    });
  });

  describe('2. RAG — Dense Vector Embeddings & Similarity Retrieval', () => {
    test('VectorStore chunks document and generates normalized embeddings', () => {
      const store = new VectorStore();
      const text = 'JavaScript event loop handles microtasks and promises with high efficiency.';
      const embedding = store.generateEmbedding(text);
      expect(embedding).toHaveProperty('javascript');
      expect(embedding).toHaveProperty('event');
    });

    test('performVectorRagRetrieval indexes resume and JD and performs topK retrieval', () => {
      const resume = 'Senior Frontend Engineer experienced in React, JavaScript Event Loop, and CSS3.';
      const jd = 'Looking for a React developer proficient in Event Loop mechanics and async promises.';
      const ragRes = performVectorRagRetrieval(resume, jd, 'Event Loop React', 2);

      expect(ragRes.matches.length).toBe(2);
      expect(ragRes.matches[0].score).toBeGreaterThan(0);
      expect(ragRes.augmentedContext).toContain('Source:');
    });
  });

  describe('3. Formal LLM Eval Sets & Automated Benchmark Suite', () => {
    test('evalDataset contains structured benchmark test cases', () => {
      expect(Array.isArray(evalDataset)).toBe(true);
      expect(evalDataset.length).toBeGreaterThanOrEqual(3);
    });

    test('runSingleEvalCase evaluates a benchmark case successfully', async () => {
      const evalCase = evalDataset[0];
      const result = await runSingleEvalCase(evalCase);
      expect(result.evalId).toBe('eval_001');
      expect(result.metrics.schemaValid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(50);
    });

    test('runBenchmarkSuite executes full test set and computes aggregate pass rate', async () => {
      const suiteResult = await runBenchmarkSuite();
      expect(suiteResult.totalCases).toBe(evalDataset.length);
      expect(suiteResult.passRatePercentage).toBeGreaterThanOrEqual(80);
      expect(suiteResult.status).toBe('PASSED');
    });
  });

  describe('4. Multi-Step Autonomous Agent Engine', () => {
    test('MultiStepInterviewAgent executes full 6-step loop with tool calls and RAG context', async () => {
      const agent = new MultiStepInterviewAgent(
        'Full Stack Engineer',
        'Developer experienced in Node.js, React, MongoDB, relational database design.',
        'Hiring Full Stack Engineer skilled in Node.js, React, RAG embeddings, vector retrieval, and multi-step agents.'
      );

      const agentResult = await agent.run();
      expect(agentResult.success).toBe(true);
      expect(agentResult.questions.length).toBeGreaterThanOrEqual(4);
      expect(agentResult.executionTrace.length).toBeGreaterThanOrEqual(6);
      expect(agentResult.readinessScore).toBeGreaterThan(0);
    });
  });

  describe('5. Agent API Endpoints', () => {
    test('GET /api/agent/tools returns registered tool definitions', async () => {
      const res = await request(app).get('/api/agent/tools');
      expect(res.status).toBe(200);
      expect(res.body.tools.length).toBeGreaterThanOrEqual(3);
    });

    test('POST /api/agent/run executes multi-step agent workflow', async () => {
      const res = await request(app).post('/api/agent/run').send({
        targetRole: 'AI Specialist',
        resumeText: 'Experienced with Python, Machine Learning, and standard web development.',
        jobDescription: 'Seeking AI Specialist skilled in RAG vector retrieval, LLM eval sets, and function calling tools.'
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.executionTrace).toBeDefined();
    });

    test('GET /api/agent/eval-suite runs benchmark evaluation suite', async () => {
      const res = await request(app).get('/api/agent/eval-suite');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('PASSED');
    });
  });

});
