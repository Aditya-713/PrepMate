const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  category: { type: String, default: 'General' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  rationale: { type: String, default: '' },
});

const transcriptItemSchema = new mongoose.Schema({
  sender: { type: String, enum: ['ai', 'user'], required: true },
  content: { type: String, required: true },
  questionId: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const evaluationSchema = new mongoose.Schema({
  score: { type: Number, min: 0, max: 10, default: 0 },
  strengths: { type: [String], default: [] },
  gaps: { type: [String], default: [] },
  feedback: { type: String, default: '' },
  recommendations: { type: [String], default: [] },
});

const tokenUsageSchema = new mongoose.Schema({
  promptTokens: { type: Number, default: 0 },
  completionTokens: { type: Number, default: 0 },
  totalTokens: { type: Number, default: 0 },
});

const skillAnalysisSchema = new mongoose.Schema({
  overlappingSkills: { type: [String], default: [] },
  missingSkills: { type: [String], default: [] },
  matchScore: { type: Number, default: 0 },
});

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    jobDescription: {
      type: String,
      required: true,
    },
    targetRole: {
      type: String,
      default: 'Software Engineer',
    },
    skillAnalysis: {
      type: skillAnalysisSchema,
      default: () => ({}),
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
    transcript: {
      type: [transcriptItemSchema],
      default: [],
    },
    evaluation: {
      type: evaluationSchema,
      default: () => ({}),
    },
    tokenUsage: {
      type: tokenUsageSchema,
      default: () => ({ promptTokens: 0, completionTokens: 0, totalTokens: 0 }),
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['created', 'in-progress', 'completed'],
      default: 'created',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
