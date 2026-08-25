// Comprehensive technical & soft skills taxonomy for RAG matching
const KNOWN_SKILLS = [
  // Frontend
  'javascript', 'typescript', 'react', 'react.js', 'next.js', 'vue', 'angular', 'html', 'css',
  'tailwind', 'bootstrap', 'redux', 'zustand', 'webpack', 'vite', 'sass', 'responsive design',
  // Backend & Databases
  'node.js', 'express', 'express.js', 'python', 'django', 'fastapi', 'java', 'spring boot', 'c++',
  'c#', '.net', 'golang', 'ruby', 'rails', 'php', 'laravel', 'mongodb', 'mongoose', 'postgresql',
  'mysql', 'sqlite', 'redis', 'elasticsearch', 'prisma', 'typeorm', 'graphql', 'rest api', 'microservices',
  'relational schema design', 'pk/fk', 'primary key', 'foreign key', 'sql joins', 'inner join', 'left join',
  'right join', 'full outer join', 'relational database', 'database normalization',
  // DevOps & Cloud
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'git', 'github', 'gitlab', 'terraform',
  'linux', 'nginx', 'serverless', 'lambda',
  // Testing & Quality
  'jest', 'mocha', 'cypress', 'playwright', 'testing library', 'unit testing', 'integration testing',
  // AI / ML / Data
  'python', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'openai', 'anthropic',
  'langchain', 'rag', 'llm', 'embeddings', 'vector database', 'pinecone', 'chromadb',
  // Core Engineering & Soft Skills
  'data structures', 'algorithms', 'system design', 'object oriented programming', 'agile', 'scrum',
  'problem solving', 'team leadership', 'code review', 'communication'
];

/**
 * Extract skills found in raw text based on taxonomy and keyword regex.
 */
const extractSkills = (text = '') => {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  const found = new Set();

  KNOWN_SKILLS.forEach((skill) => {
    // Escape regex special chars if any
    const regexPattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regexPattern.test(lowerText)) {
      // Capitalize nicely
      found.add(formatSkillName(skill));
    }
  });

  return Array.from(found);
};

/**
 * Capitalizes skill names cleanly
 */
const formatSkillName = (skill) => {
  const map = {
    'react.js': 'React',
    'node.js': 'Node.js',
    'express.js': 'Express.js',
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'mongodb': 'MongoDB',
    'html': 'HTML5',
    'css': 'CSS3',
    'rest api': 'REST API',
    'aws': 'AWS',
    'ci/cd': 'CI/CD',
    'rag': 'RAG (Retrieval-Augmented Gen)',
    'llm': 'LLM',
    'relational schema design': 'Relational Schema Design (PK/FK)',
    'pk/fk': 'Primary Key & Foreign Key (PK/FK)',
    'primary key': 'Primary Key (PK)',
    'foreign key': 'Foreign Key (FK)',
    'sql joins': 'SQL JOINs (INNER/LEFT/RIGHT)',
    'inner join': 'SQL Inner JOIN',
    'left join': 'SQL Left JOIN',
    'database normalization': 'Database Normalization (1NF-3NF)',
    'relational database': 'Relational Database (RDBMS)',
  };
  return map[skill.toLowerCase()] || skill.charAt(0).toUpperCase() + skill.slice(1);
};

/**
 * Calculates Term Frequency (TF) vector representation for similarity matching
 */
const getTFVector = (text = '') => {
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  const tfMap = {};
  words.forEach(word => {
    tfMap[word] = (tfMap[word] || 0) + 1;
  });
  return tfMap;
};

/**
 * Computes Cosine Similarity between two text documents (Resume & Job Description)
 */
const computeCosineSimilarity = (textA, textB) => {
  const tfA = getTFVector(textA);
  const tfB = getTFVector(textB);

  const allWords = new Set([...Object.keys(tfA), ...Object.keys(tfB)]);
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  allWords.forEach(word => {
    const valA = tfA[word] || 0;
    const valB = tfB[word] || 0;
    dotProduct += valA * valB;
    magnitudeA += valA * valA;
    magnitudeB += valB * valB;
  });

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  const similarity = dotProduct / (magnitudeA * magnitudeB);
  return Math.min(100, Math.round(similarity * 100 * 2.5)); // Normalized percentage scale
};

/**
 * Perform RAG-lite Skill Gap & Keyword Analysis between Resume and Job Description
 */
const performRagSkillAnalysis = (resumeText, jobDescriptionText) => {
  const resumeSkills = extractSkills(resumeText);
  const jdSkills = extractSkills(jobDescriptionText);

  const resumeSkillSet = new Set(resumeSkills.map(s => s.toLowerCase()));
  const jdSkillSet = new Set(jdSkills.map(s => s.toLowerCase()));

  const overlappingSkills = [];
  const missingSkills = [];

  jdSkills.forEach(skill => {
    if (resumeSkillSet.has(skill.toLowerCase())) {
      overlappingSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // Calculate Match Score percentage based on skill overlap + cosine text similarity
  let matchScore = 0;
  if (jdSkills.length > 0) {
    const skillRatio = overlappingSkills.length / jdSkills.length;
    const cosineSim = computeCosineSimilarity(resumeText, jobDescriptionText) / 100;
    matchScore = Math.min(100, Math.round((skillRatio * 0.7 + cosineSim * 0.3) * 100));
  } else {
    matchScore = computeCosineSimilarity(resumeText, jobDescriptionText) || 75;
  }

  return {
    resumeSkills,
    jdSkills,
    overlappingSkills,
    missingSkills,
    matchScore: Math.max(25, matchScore), // baseline threshold
  };
};

module.exports = {
  extractSkills,
  performRagSkillAnalysis,
  computeCosineSimilarity,
};
