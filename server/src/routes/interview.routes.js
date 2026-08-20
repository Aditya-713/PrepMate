const express = require('express');
const router = express.Router();
const {
  generateQuestions,
  getUserInterviews,
  getInterviewSession,
  answerStream,
  completeInterview,
  deleteInterview,
} = require('../controllers/interview.controller');
const { protect } = require('../middleware/auth.middleware');
const { aiRateLimiter } = require('../middleware/rateLimiter.middleware');
const { generateQuestionsSchema, submitAnswerSchema, validateRequest } = require('../utils/validators');

router.use(protect);

router.post('/generate-questions', aiRateLimiter, validateRequest(generateQuestionsSchema), generateQuestions);
router.get('/', getUserInterviews);
router.get('/:sessionId', getInterviewSession);
router.post('/:sessionId/answer-stream', aiRateLimiter, validateRequest(submitAnswerSchema), answerStream);
router.post('/:sessionId/complete', completeInterview);
router.delete('/:sessionId', deleteInterview);

module.exports = router;
