/**
 * Formal LLM Eval Sets & Automated Benchmark Evaluator Engine
 * Evaluates LLM outputs against golden benchmark sets, assessing schema compliance,
 * topic coverage, latency, and token usage metrics.
 */

const evalDataset = require('../data/interviewEvalSet.json');
const { generateInterviewQuestions } = require('./aiService');
const { performRagSkillAnalysis } = require('./ragSkillsExtractor');

/**
 * Runs a single evaluation test case
 */
const runSingleEvalCase = async (evalCase) => {
  const startTime = Date.now();

  const skillAnalysis = performRagSkillAnalysis(evalCase.resumeText, evalCase.jobDescription);
  const questions = await generateInterviewQuestions({
    resumeText: evalCase.resumeText,
    jobDescription: evalCase.jobDescription,
    targetRole: evalCase.role,
    skillAnalysis
  });

  const latencyMs = Date.now() - startTime;

  // 1. Validate output schema format
  let schemaValid = Array.isArray(questions) && questions.length >= evalCase.expectedMinQuestions;
  if (schemaValid) {
    for (const q of questions) {
      for (const key of evalCase.requiredSchemaKeys) {
        if (!(key in q) || typeof q[key] !== 'string') {
          schemaValid = false;
          break;
        }
      }
    }
  }

  // 2. Assess Viva topic coverage
  const allQuestionText = questions.map(q => `${q.category} ${q.question} ${q.rationale}`).join(' ').toLowerCase();
  const coveredTopics = evalCase.expectedTopics.filter(topic => {
    const keywords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    return keywords.some(kw => allQuestionText.includes(kw));
  });

  const topicCoverageRatio = evalCase.expectedTopics.length > 0
    ? coveredTopics.length / evalCase.expectedTopics.length
    : 1.0;

  // Calculate composite eval benchmark score (0 - 100)
  const score = Math.round(
    (schemaValid ? 50 : 0) +
    (topicCoverageRatio * 40) +
    (latencyMs < 2000 ? 10 : 5)
  );

  return {
    evalId: evalCase.id,
    name: evalCase.name,
    passed: schemaValid && topicCoverageRatio >= 0.5,
    score,
    metrics: {
      latencyMs,
      schemaValid,
      questionsGenerated: questions.length,
      expectedTopics: evalCase.expectedTopics,
      coveredTopics,
      topicCoveragePercentage: Math.round(topicCoverageRatio * 100)
    }
  };
};

/**
 * Runs complete Benchmark Suite over all registered Eval Cases
 */
const runBenchmarkSuite = async () => {
  const results = [];
  let totalScore = 0;
  let passedCases = 0;

  for (const caseData of evalDataset) {
    const res = await runSingleEvalCase(caseData);
    results.push(res);
    totalScore += res.score;
    if (res.passed) passedCases++;
  }

  const averageScore = Math.round(totalScore / (evalDataset.length || 1));
  const passRatePercentage = Math.round((passedCases / (evalDataset.length || 1)) * 100);

  return {
    timestamp: new Date().toISOString(),
    totalCases: evalDataset.length,
    passedCases,
    passRatePercentage,
    averageScore,
    status: passRatePercentage >= 80 ? 'PASSED' : 'NEEDS_OPTIMIZATION',
    cases: results
  };
};

module.exports = {
  evalDataset,
  runSingleEvalCase,
  runBenchmarkSuite
};
