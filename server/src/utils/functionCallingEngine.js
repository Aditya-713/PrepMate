/**
 * Function Calling & Tool Use Engine
 * Defines tools, standard JSON Schemas, and handles function dispatching.
 */

// Tool Schemas following OpenAI / Standard Function Calling Specifications
const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'searchSkillTaxonomy',
      description: 'Searches technical skill taxonomies, prerequisites, and domain categories for a given skill or role.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The skill or engineering domain to search (e.g. React, Vector DB, Node.js)' },
          category: { type: 'string', description: 'Optional taxonomy category filter (e.g. Frontend, Backend, AI/ML)' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'calculateScoreBreakdown',
      description: 'Calculates candidate match score breakdown based on overlap ratio, metric density, and depth.',
      parameters: {
        type: 'object',
        properties: {
          overlappingCount: { type: 'number', description: 'Number of matching skills between resume and job description' },
          missingCount: { type: 'number', description: 'Number of missing skills required by job description' },
          textSimilarity: { type: 'number', description: 'Cosine similarity score (0 to 100)' }
        },
        required: ['overlappingCount', 'missingCount', 'textSimilarity']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'fetchJobRoleRequirements',
      description: 'Fetches prerequisite tech stack, core competencies, and interview guidelines for a specific target role.',
      parameters: {
        type: 'object',
        properties: {
          roleTitle: { type: 'string', description: 'Target job title (e.g. Full Stack Engineer, AI/ML Specialist, Frontend Developer)' }
        },
        required: ['roleTitle']
      }
    }
  }
];

// Tool Implementation Handlers
const toolHandlers = {
  searchSkillTaxonomy: async ({ query, category }) => {
    const q = (query || '').toLowerCase();
    const taxonomy = {
      javascript: { category: 'Frontend/Core JS', concepts: ['Event Loop', 'Hoisting', 'Promises', 'Closures'] },
      react: { category: 'Frontend', concepts: ['Virtual DOM', 'Hooks', 'State Management', 'JSX'] },
      'node.js': { category: 'Backend', concepts: ['Event Loop', 'Express', 'Async I/O', 'Streams'] },
      rag: { category: 'AI/ML Systems', concepts: ['Embeddings', 'Vector DB', 'Cosine Similarity', 'Chunking'] },
      agent: { category: 'AI/ML Systems', concepts: ['Function Calling', 'Multi-step Loop', 'Tool Use', 'Reasoning'] },
      eval: { category: 'LLM Engineering', concepts: ['Eval Sets', 'Benchmark Datasets', 'Regression Testing', 'Rubrics'] }
    };

    const matchedKey = Object.keys(taxonomy).find(k => q.includes(k) || k.includes(q));
    if (matchedKey) {
      return { success: true, skill: matchedKey, details: taxonomy[matchedKey] };
    }
    return {
      success: true,
      skill: query,
      details: { category: category || 'General Engineering', concepts: ['Core Principles', 'Best Practices', 'System Design'] }
    };
  },

  calculateScoreBreakdown: async ({ overlappingCount, missingCount, textSimilarity }) => {
    const totalSkills = (overlappingCount || 0) + (missingCount || 0);
    const skillRatio = totalSkills > 0 ? overlappingCount / totalSkills : 0.5;
    const compositeScore = Math.round((skillRatio * 60) + ((textSimilarity || 50) * 0.4));

    return {
      success: true,
      overallScore: Math.min(100, Math.max(10, compositeScore)),
      breakdown: {
        skillMatchRatioPercentage: Math.round(skillRatio * 100),
        textSimilarityScore: textSimilarity,
        readinessLevel: compositeScore > 80 ? 'Interview Ready' : compositeScore > 60 ? 'Moderate Fit' : 'Needs Preparation'
      }
    };
  },

  fetchJobRoleRequirements: async ({ roleTitle }) => {
    const role = (roleTitle || '').toLowerCase();
    let requirements = {
      coreSkills: ['JavaScript', 'System Design', 'Git', 'REST APIs'],
      recommendedQuestions: ['Explain API security', 'Discuss database indexing', 'Walk through a complex project']
    };

    if (role.includes('ai') || role.includes('machine learning') || role.includes('llm')) {
      requirements = {
        coreSkills: ['Python', 'Embeddings', 'Vector DB', 'Function Calling', 'LLM Eval Sets', 'Multi-Step Agents'],
        recommendedQuestions: ['Explain RAG vector search', 'How do tool calling agents function?', 'How to build LLM eval benchmarks']
      };
    } else if (role.includes('frontend') || role.includes('react')) {
      requirements = {
        coreSkills: ['JavaScript', 'React', 'CSS3/HTML5', 'Event Loop', 'Hoisting'],
        recommendedQuestions: ['Explain Event Loop microtasks', 'Contrast var vs let/const hoisting', 'Optimize React re-renders']
      };
    }

    return { success: true, roleTitle, requirements };
  }
};

/**
 * Parses and executes a tool call requested by LLM schema
 */
const executeToolCall = async (toolName, toolArgs) => {
  const handler = toolHandlers[toolName];
  if (!handler) {
    throw new Error(`Tool handler '${toolName}' is not registered in the Tool Use Engine.`);
  }
  return await handler(toolArgs);
};

module.exports = {
  TOOL_DEFINITIONS,
  executeToolCall,
  toolHandlers
};
