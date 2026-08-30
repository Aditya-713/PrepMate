/**
 * Multi-Step Agentic Framework
 * Autonomous execution loop combining Tool Calling, Vector RAG Retrieval, and Synthesis steps.
 */

const { executeToolCall } = require('./functionCallingEngine');
const { performVectorRagRetrieval } = require('./vectorRagEngine');
const { performRagSkillAnalysis } = require('./ragSkillsExtractor');

class MultiStepInterviewAgent {
  constructor(targetRole, resumeText, jobDescription) {
    this.targetRole = targetRole || 'Software Engineer';
    this.resumeText = resumeText || '';
    this.jobDescription = jobDescription || '';
    this.executionTrace = [];
  }

  logStep(stepName, detail) {
    this.executionTrace.push({
      step: this.executionTrace.length + 1,
      name: stepName,
      timestamp: new Date().toISOString(),
      detail
    });
  }

  /**
   * Executes the full multi-step agent workflow
   */
  async run() {
    this.logStep('AGENT_START', `Initializing agentic workflow for target role: ${this.targetRole}`);

    // Step 1: Tool Use — Fetch standard role requirements & taxonomy
    this.logStep('TOOL_CALL', 'Executing tool fetchJobRoleRequirements');
    const roleReqs = await executeToolCall('fetchJobRoleRequirements', { roleTitle: this.targetRole });
    this.logStep('TOOL_RESULT', roleReqs);

    // Step 2: Skill Analysis & Cosine Matching
    this.logStep('SKILL_ANALYSIS', 'Extracting skill overlap and gaps');
    const skillAnalysis = performRagSkillAnalysis(this.resumeText, this.jobDescription);
    this.logStep('SKILL_ANALYSIS_RESULT', skillAnalysis);

    // Step 3: Tool Use — Search taxonomy for primary missing skill
    const primaryMissing = skillAnalysis.missingSkills[0] || 'System Design';
    this.logStep('TOOL_CALL', `Executing searchSkillTaxonomy for skill: ${primaryMissing}`);
    const taxonomyInfo = await executeToolCall('searchSkillTaxonomy', { query: primaryMissing });
    this.logStep('TOOL_RESULT', taxonomyInfo);

    // Step 4: RAG Dense Vector Embedding Retrieval
    this.logStep('VECTOR_RAG', 'Retrieving top vector embeddings for interview context');
    const ragRetrieval = performVectorRagRetrieval(
      this.resumeText,
      this.jobDescription,
      `${this.targetRole} ${primaryMissing}`,
      3
    );
    this.logStep('VECTOR_RAG_RESULT', { matchCount: ragRetrieval.matches.length, topScore: ragRetrieval.matches[0]?.score });

    // Step 5: Tool Use — Compute composite match score breakdown
    this.logStep('TOOL_CALL', 'Executing calculateScoreBreakdown tool');
    const scoreBreakdown = await executeToolCall('calculateScoreBreakdown', {
      overlappingCount: skillAnalysis.overlappingSkills.length,
      missingCount: skillAnalysis.missingSkills.length,
      textSimilarity: skillAnalysis.matchScore
    });
    this.logStep('TOOL_RESULT', scoreBreakdown);

    // Step 6: Generate Final Tailored Interview Questions
    this.logStep('INTERVIEW_SYNTHESIS', 'Generating questions leveraging agent context & RAG');
    const { generateInterviewQuestions } = require('./aiService');
    const questions = await generateInterviewQuestions({
      resumeText: this.resumeText,
      jobDescription: this.jobDescription,
      targetRole: this.targetRole,
      skillAnalysis
    });
    this.logStep('SYNTHESIS_COMPLETE', `Generated ${questions.length} tailored interview questions`);

    return {
      success: true,
      agentId: `agent_${Date.now()}`,
      targetRole: this.targetRole,
      readinessScore: scoreBreakdown.overallScore,
      skillAnalysis,
      vectorRagContext: ragRetrieval,
      questions,
      executionTrace: this.executionTrace
    };
  }
}

module.exports = {
  MultiStepInterviewAgent
};
