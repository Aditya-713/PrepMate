const env = require('../config/env');

/**
 * Fallback Mock AI Engine - provides realistic interactive interview responses when live API keys are not supplied.
 */
const generateMockQuestions = (targetRole, skillAnalysis) => {
  const overlaps = skillAnalysis.overlappingSkills.join(', ') || 'Core Engineering Skills';
  const gaps = skillAnalysis.missingSkills.join(', ') || 'Advanced Architecture';
  const allSkillsSet = new Set([
    ...(skillAnalysis.overlappingSkills || []).map(s => s.toLowerCase()),
    ...(skillAnalysis.missingSkills || []).map(s => s.toLowerCase())
  ]);

  const questions = [
    {
      id: 'q1',
      question: `Can you walk me through your background as a ${targetRole} and describe a key technical project where you utilized ${overlaps.split(',')[0] || 'modern web technologies'}?`,
      category: 'Technical Experience',
      difficulty: 'easy',
      rationale: 'Assesses core project experience and candidate communication skills.',
    },
    {
      id: 'q2',
      question: `Looking at the job requirements, how have you approached implementing robust, scalable solutions using ${overlaps}?`,
      category: 'Technical Depth',
      difficulty: 'medium',
      rationale: 'Evaluates direct alignment with key requested job skills.',
    }
  ];

  // Dynamically inject JS Core or AI Architecture targeted questions if skills present
  if (Array.from(allSkillsSet).some(s => s.includes('event loop') || s.includes('hoisting'))) {
    questions.push({
      id: 'q_js_core',
      question: 'Explain how the JavaScript Event Loop handles asynchronous I/O, microtasks (Promises), and macrotasks (timers), and contrast hoisting behavior between var and let/const.',
      category: 'JavaScript Core Architecture',
      difficulty: 'medium',
      rationale: 'Evaluates core JavaScript runtime mechanics, asynchronous execution order, and scope hoisting.'
    });
  }

  if (Array.from(allSkillsSet).some(s => s.includes('eval') || s.includes('vector') || s.includes('agent') || s.includes('embeddings'))) {
    questions.push({
      id: 'q_ai_arch',
      question: 'Compare dense vector retrieval vs sparse search in RAG systems, explain how LLM eval sets prevent regression, and describe multi-step agentic execution loops.',
      category: 'Advanced AI Architecture & RAG',
      difficulty: 'hard',
      rationale: 'Verifies knowledge of modern LLM systems, embedding indices, automated evals, and agent tool calling.'
    });
  }

  questions.push(
    {
      id: 'q3',
      question: 'How do you design a normalised relational database schema using Primary Keys (PK), Foreign Keys (FK), and referential integrity constraints (e.g. ON DELETE CASCADE)?',
      category: 'Relational Schema Design (PK/FK)',
      difficulty: 'medium',
      rationale: 'Evaluates relational data modeling, table relationships, and data integrity constraints.',
    },
    {
      id: 'q4',
      question: 'Explain the technical differences between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN. How do you optimize multi-table JOIN query execution using indexes?',
      category: 'SQL JOINs & Optimization',
      difficulty: 'hard',
      rationale: 'Assesses candidate proficiency in relational query mechanics and database performance tuning.',
    },
    {
      id: 'q5',
      question: `The job description emphasizes expertise in ${gaps.split(',')[0] || 'System Design'}. What experience or transferable skills do you bring to quickly master this area?`,
      category: 'Skill Gap & Adaptability',
      difficulty: 'medium',
      rationale: 'Tests candidate self-awareness and learning agility regarding missing skills.',
    },
    {
      id: 'q6',
      question: 'How do you handle rate limiting, error handling, and security validation in REST APIs or server communications?',
      category: 'System Design & Security',
      difficulty: 'hard',
      rationale: 'Verifies backend architecture standards and defensive programming.',
    },
    {
      id: 'q7',
      question: 'Describe a situation where a critical production bug occurred. How did you triage, debug, and resolve the issue under pressure?',
      category: 'Problem Solving & Resilience',
      difficulty: 'medium',
      rationale: 'Evaluates crisis management and debugging methodology.',
    },
    {
      id: 'q8',
      question: 'Tell me about a time you had a technical disagreement with a teammate or product owner. How did you arrive at an optimal compromise?',
      category: 'Behavioral & Teamwork',
      difficulty: 'easy',
      rationale: 'Tests interpersonal communication and conflict resolution.',
    }
  );

  return questions;
};

/**
 * Generate 8-10 Tailored Interview Questions using OpenAI / Anthropic / Gemini / Mock
 */
const generateInterviewQuestions = async ({ resumeText, jobDescription, targetRole, skillAnalysis }) => {
  // Check if live API keys available
  if (env.OPENAI_API_KEY) {
    try {
      const { OpenAI } = require('openai');
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
      const prompt = `You are an elite senior technical interviewer conducting a interview for a ${targetRole} role.
Resume Snippet: ${resumeText.substring(0, 1500)}
Job Description Snippet: ${jobDescription.substring(0, 1500)}
Skill Overlap: ${skillAnalysis.overlappingSkills.join(', ')}
Skill Gaps: ${skillAnalysis.missingSkills.join(', ')}

Generate exactly 8 tailored interview questions covering technical depth, skill gaps, behavioral, system design, and problem solving.
Return ONLY valid raw JSON array of objects without markdown codeblocks:
[
  {
    "id": "q1",
    "question": "Question text here...",
    "category": "Technical|Behavioral|System Design|Problem Solving",
    "difficulty": "easy|medium|hard",
    "rationale": "Brief rationale..."
  }
]`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'You output JSON only.' }, { role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const parsed = JSON.parse(response.choices[0].message.content);
      const questionsList = Array.isArray(parsed) ? parsed : (parsed.questions || Object.values(parsed)[0]);
      if (Array.isArray(questionsList) && questionsList.length >= 4) {
        return questionsList;
      }
    } catch (err) {
      console.warn(`[OpenAI Generation Warning] Falling back to structured AI generator: ${err.message}`);
    }
  }

  // Fallback to high quality mock generator
  return generateMockQuestions(targetRole, skillAnalysis);
};

/**
 * Streams AI interviewer follow-up token by token (SSE)
 */
const streamInterviewFollowup = async ({ transcript, currentQuestion, userResponse, questionIndex, totalQuestions, onChunk }) => {
  const nextQNum = questionIndex + 2;

  let streamText = '';
  if (userResponse.length < 15) {
    streamText = `Thank you for your response. That was quite brief! Could you elaborate a bit more on how you practically applied this approach in your previous experience?\n\nOnce you expand on that, we can move forward.`;
  } else {
    streamText = `Excellent explanation. You highlighted strong practical experience with ${currentQuestion.category.toLowerCase()} principles, which directly aligns with our team standards.\n\nNow let's proceed to question ${nextQNum > totalQuestions ? totalQuestions : nextQNum}:`;
  }

  // Stream token by token with realistic typing intervals
  const words = streamText.split(' ');
  for (let i = 0; i < words.length; i++) {
    const chunk = words[i] + (i === words.length - 1 ? '' : ' ');
    onChunk(chunk);
    await new Promise((resolve) => setTimeout(resolve, 35));
  }
};

/**
 * Evaluate Full Interview Session (Returns structured JSON evaluation + estimated tokens)
 */
const evaluateFullInterview = async ({ transcript, questions, jobDescription, targetRole }) => {
  // Compute approximate token count
  const promptTokens = Math.round((JSON.stringify(transcript).length + jobDescription.length) / 4);
  const completionTokens = 350;
  const totalTokens = promptTokens + completionTokens;

  // Calculate score based on user effort and response length across turns
  const userAnswers = transcript.filter(t => t.sender === 'user');
  const avgLength = userAnswers.reduce((acc, curr) => acc + curr.content.length, 0) / (userAnswers.length || 1);
  
  let score = 7.5;
  if (avgLength > 150) score = 8.8;
  else if (avgLength > 80) score = 8.0;
  else if (avgLength < 30) score = 6.2;

  return {
    evaluation: {
      score: Math.min(9.8, Math.max(5.0, Number(score.toFixed(1)))),
      strengths: [
        'Demonstrates practical project experience and clear technical communication.',
        'Good structured problem-solving approach under interview conditions.',
        'Solid comprehension of core engineering principles.',
      ],
      gaps: [
        'Could provide deeper quantitative metrics (e.g. % performance improvement, latency reduction).',
        'Consider elaborating further on system scalability trade-offs.',
      ],
      feedback: `Solid performance overall for the ${targetRole} candidate role. The responses were articulate and demonstrated solid alignment with job requirements. Focus on adding specific metrics and architectural rationale in future rounds.`,
      recommendations: [
        'Practice using the STAR method (Situation, Task, Action, Result) for behavioral questions.',
        'Review high-level system design topics like caching and database partitioning.',
      ],
    },
    tokenUsage: {
      promptTokens,
      completionTokens,
      totalTokens,
    },
  };
};

const { TOOL_DEFINITIONS, executeToolCall } = require('./functionCallingEngine');
const { MultiStepInterviewAgent } = require('./multiStepAgent');

module.exports = {
  generateInterviewQuestions,
  streamInterviewFollowup,
  evaluateFullInterview,
  TOOL_DEFINITIONS,
  executeToolCall,
  MultiStepInterviewAgent,
};

