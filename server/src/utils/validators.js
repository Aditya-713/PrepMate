const Joi = require('joi');

const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must be at least 2 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
  }),
  role: Joi.string().valid('user', 'admin').optional(),
  adminCode: Joi.string().optional().allow(''),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const generateQuestionsSchema = Joi.object({
  resumeId: Joi.string().optional().allow('', null),
  resumeText: Joi.string().optional().allow(''),
  jobDescription: Joi.string().min(20).required().messages({
    'string.min': 'Job description must be at least 20 characters long',
    'any.required': 'Job description is required',
  }),
  targetRole: Joi.string().optional().default('Software Engineer'),
});

const submitAnswerSchema = Joi.object({
  answer: Joi.string().min(1).required().messages({
    'string.empty': 'Answer cannot be empty',
  }),
  questionId: Joi.string().optional(),
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Invalid input validation payload',
        errors: errorMessages,
      });
    }
    next();
  };
};

module.exports = {
  signupSchema,
  loginSchema,
  generateQuestionsSchema,
  submitAnswerSchema,
  validateRequest,
};
