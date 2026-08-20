const InterviewSession = require('../models/InterviewSession');
const Resume = require('../models/Resume');
const { performRagSkillAnalysis } = require('../utils/ragSkillsExtractor');
const { generateInterviewQuestions, streamInterviewFollowup, evaluateFullInterview } = require('../utils/aiService');
const { memoryResumes } = require('./resume.controller');

// Memory store fallback for interview sessions
const memorySessions = [];

// @desc    Generate tailored interview questions based on Resume & JD (RAG-lite)
// @route   POST /api/interviews/generate-questions
// @access  Private
const generateQuestions = async (req, res, next) => {
  try {
    const { resumeId, resumeText: rawResumeText, jobDescription, targetRole = 'Software Engineer' } = req.body;

    let resumeText = rawResumeText || '';

    // Fetch resume text from DB if resumeId passed
    if (resumeId && !resumeText) {
      try {
        const resumeDoc = await Resume.findById(resumeId);
        if (resumeDoc) resumeText = resumeDoc.extractedText;
      } catch (dbErr) {
        const memRes = memoryResumes.find((r) => r._id === resumeId || String(r._id) === String(resumeId));
        if (memRes) resumeText = memRes.extractedText;
      }
    }

    if (!resumeText) {
      resumeText = 'General Software Engineering experience with React, Node.js, Express, JavaScript, and Databases.';
    }

    // Perform RAG-lite Skill Gap Analysis
    const skillAnalysis = performRagSkillAnalysis(resumeText, jobDescription);

    // Call AI service to generate tailored questions
    const questions = await generateInterviewQuestions({
      resumeText,
      jobDescription,
      targetRole,
      skillAnalysis,
    });

    const firstQuestion = questions[0] ? questions[0].question : 'Can you introduce yourself and describe your technical background?';

    const sessionData = {
      userId: req.user.id,
      resumeId: resumeId || null,
      jobDescription,
      targetRole,
      skillAnalysis,
      questions,
      transcript: [
        {
          sender: 'ai',
          content: `Welcome to your AI Mock Interview for the position of ${targetRole}! Let's get started.\n\nFirst Question: ${firstQuestion}`,
          questionId: questions[0] ? questions[0].id : 'q1',
          timestamp: new Date(),
        },
      ],
      currentQuestionIndex: 0,
      status: 'created',
      createdAt: new Date(),
    };

    let session = null;
    try {
      session = await InterviewSession.create(sessionData);
    } catch (dbErr) {
      console.warn(`[Interview Fallback] Saving interview session to memory: ${dbErr.message}`);
      session = { ...sessionData, _id: 'sess_' + Date.now() };
      memorySessions.push(session);
    }

    res.status(201).json({
      success: true,
      message: 'Tailored interview questions generated successfully',
      session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user interview sessions list
// @route   GET /api/interviews
// @access  Private
const getUserInterviews = async (req, res, next) => {
  try {
    let sessions = [];
    try {
      sessions = await InterviewSession.find({ userId: req.user.id }).sort({ createdAt: -1 });
    } catch (dbErr) {
      sessions = memorySessions.filter((s) => String(s.userId) === String(req.user.id));
    }

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single interview session detail
// @route   GET /api/interviews/:sessionId
// @access  Private
const getInterviewSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    let session = null;

    try {
      session = await InterviewSession.findOne({ _id: sessionId, userId: req.user.id });
    } catch (dbErr) {
      session = memorySessions.find((s) => (s._id === sessionId || String(s._id) === sessionId) && String(s.userId) === String(req.user.id));
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found',
      });
    }

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stream user answer & AI follow-up response (SSE)
// @route   POST /api/interviews/:sessionId/answer-stream
// @access  Private
const answerStream = async (req, res, next) => {
  const { sessionId } = req.params;
  const { answer } = req.body;

  if (!answer || typeof answer !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Please provide a non-empty answer string.',
    });
  }

  let session = null;
  try {
    session = await InterviewSession.findOne({ _id: sessionId, userId: req.user.id });
  } catch (dbErr) {
    session = memorySessions.find((s) => (s._id === sessionId || String(s._id) === sessionId) && String(s.userId) === String(req.user.id));
  }

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Interview session not found',
    });
  }

  // Set SSE Headers for chunked token streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  const currentQIndex = session.currentQuestionIndex || 0;
  const currentQuestion = session.questions[currentQIndex] || { id: 'q1', category: 'General' };

  // Append user answer to transcript
  session.transcript.push({
    sender: 'user',
    content: answer,
    questionId: currentQuestion.id,
    timestamp: new Date(),
  });

  if (session.status === 'created') {
    session.status = 'in-progress';
  }

  let fullAiResponse = '';

  try {
    // Stream AI follow-up token by token
    await streamInterviewFollowup({
      transcript: session.transcript,
      currentQuestion,
      userResponse: answer,
      questionIndex: currentQIndex,
      totalQuestions: session.questions.length,
      onChunk: (chunk) => {
        fullAiResponse += chunk;
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      },
    });

    const nextIndex = currentQIndex + 1;
    session.currentQuestionIndex = nextIndex;

    // Check if next main question exists
    if (nextIndex < session.questions.length) {
      const nextQ = session.questions[nextIndex];
      const nextQText = `\n\nQuestion ${nextIndex + 1}: ${nextQ.question}`;
      fullAiResponse += nextQText;
      res.write(`data: ${JSON.stringify({ chunk: nextQText })}\n\n`);
    }

    // Append AI response to transcript
    session.transcript.push({
      sender: 'ai',
      content: fullAiResponse,
      questionId: session.questions[nextIndex] ? session.questions[nextIndex].id : currentQuestion.id,
      timestamp: new Date(),
    });

    // Save updated session
    if (session.save) {
      await session.save();
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('[SSE Stream Error]', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
};

// @desc    Complete Interview & Generate Structured Evaluation Report
// @route   POST /api/interviews/:sessionId/complete
// @access  Private
const completeInterview = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    let session = null;

    try {
      session = await InterviewSession.findOne({ _id: sessionId, userId: req.user.id });
    } catch (dbErr) {
      session = memorySessions.find((s) => (s._id === sessionId || String(s._id) === sessionId) && String(s.userId) === String(req.user.id));
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found',
      });
    }

    // Call AI evaluator
    const { evaluation, tokenUsage } = await evaluateFullInterview({
      transcript: session.transcript,
      questions: session.questions,
      jobDescription: session.jobDescription,
      targetRole: session.targetRole,
    });

    session.evaluation = evaluation;
    session.tokenUsage = tokenUsage;
    session.status = 'completed';

    if (session.save) {
      await session.save();
    }

    res.status(200).json({
      success: true,
      message: 'Interview completed and evaluated successfully',
      evaluation,
      tokenUsage,
      session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Interview session
// @route   DELETE /api/interviews/:sessionId
// @access  Private
const deleteInterview = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    try {
      await InterviewSession.deleteOne({ _id: sessionId, userId: req.user.id });
    } catch (dbErr) {
      const idx = memorySessions.findIndex((s) => s._id === sessionId && String(s.userId) === String(req.user.id));
      if (idx !== -1) memorySessions.splice(idx, 1);
    }

    res.status(200).json({
      success: true,
      message: 'Interview session deleted.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateQuestions,
  getUserInterviews,
  getInterviewSession,
  answerStream,
  completeInterview,
  deleteInterview,
  memorySessions,
};
