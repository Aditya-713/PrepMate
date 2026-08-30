/**
 * Agent & LLM Eval API Routes
 * Exposes endpoints for Multi-Step Autonomous Agent execution, Function Calling tool definitions, and LLM Benchmark Evals.
 */

const express = require('express');
const router = express.Router();
const { MultiStepInterviewAgent, TOOL_DEFINITIONS, executeToolCall } = require('../utils/aiService');
const { runBenchmarkSuite, runSingleEvalCase } = require('../utils/llmEvalEngine');
const { performVectorRagRetrieval } = require('../utils/vectorRagEngine');

/**
 * @route POST /api/agent/run
 * @desc Executes Multi-Step Autonomous Agent workflow
 */
router.post('/run', async (req, res) => {
  try {
    const { targetRole, resumeText, jobDescription } = req.body;
    if (!targetRole || !resumeText || !jobDescription) {
      return res.status(400).json({ error: 'targetRole, resumeText, and jobDescription are required.' });
    }

    const agent = new MultiStepInterviewAgent(targetRole, resumeText, jobDescription);
    const result = await agent.run();
    return res.json(result);
  } catch (err) {
    console.error('Agent execution error:', err);
    return res.status(500).json({ error: 'Multi-Step Agent execution failed.', details: err.message });
  }
});

/**
 * @route GET /api/agent/tools
 * @desc Returns available Function Calling schemas
 */
router.get('/tools', (req, res) => {
  return res.json({ tools: TOOL_DEFINITIONS });
});

/**
 * @route POST /api/agent/tools/execute
 * @desc Dynamically executes a function call / tool by name
 */
router.post('/tools/execute', async (req, res) => {
  try {
    const { toolName, toolArgs } = req.body;
    if (!toolName) {
      return res.status(400).json({ error: 'toolName is required.' });
    }
    const result = await executeToolCall(toolName, toolArgs || {});
    return res.json({ toolName, result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/agent/rag-search
 * @desc Vector RAG Embedding Similarity Search Endpoint
 */
router.post('/rag-search', (req, res) => {
  try {
    const { resumeText, jobDescription, query, topK } = req.body;
    if (!resumeText || !jobDescription || !query) {
      return res.status(400).json({ error: 'resumeText, jobDescription, and query are required.' });
    }
    const ragResult = performVectorRagRetrieval(resumeText, jobDescription, query, topK || 3);
    return res.json(ragResult);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/agent/eval-suite
 * @desc Runs full LLM Eval benchmark suite over test cases
 */
router.get('/eval-suite', async (req, res) => {
  try {
    const benchmarkResults = await runBenchmarkSuite();
    return res.json(benchmarkResults);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
