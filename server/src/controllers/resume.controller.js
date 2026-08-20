const Resume = require('../models/Resume');
const { extractTextFromPDF } = require('../utils/pdfParser');
const { extractSkills } = require('../utils/ragSkillsExtractor');

// Memory store fallback for resumes
const memoryResumes = [];

// @desc    Upload PDF Resume & Extract Text & Skills
// @route   POST /api/resumes/upload
// @access  Private
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF or text file resume.',
      });
    }

    const filePath = req.file.path;
    const extractedText = await extractTextFromPDF(filePath);
    const parsedSkills = extractSkills(extractedText);

    let resumeObj = {
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      extractedText,
      parsedSkills,
      fileSize: req.file.size,
      createdAt: new Date(),
    };

    try {
      const savedResume = await Resume.create(resumeObj);
      resumeObj = savedResume;
    } catch (dbErr) {
      console.warn(`[Resume Fallback] Saving resume to memory cache: ${dbErr.message}`);
      resumeObj._id = 'res_' + Date.now();
      memoryResumes.push(resumeObj);
    }

    res.status(201).json({
      success: true,
      message: 'Resume processed and saved successfully',
      resume: resumeObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's uploaded resumes
// @route   GET /api/resumes
// @access  Private
const getUserResumes = async (req, res, next) => {
  try {
    let resumes = [];
    try {
      resumes = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
    } catch (dbErr) {
      resumes = memoryResumes.filter((r) => String(r.userId) === String(req.user.id));
    }

    res.status(200).json({
      success: true,
      count: resumes.length,
      resumes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resume by ID
// @route   GET /api/resumes/:id
// @access  Private
const getResumeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let resume = null;

    try {
      resume = await Resume.findOne({ _id: id, userId: req.user.id });
    } catch (dbErr) {
      resume = memoryResumes.find((r) => (r._id === id || String(r._id) === id) && String(r.userId) === String(req.user.id));
    }

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume document not found.',
      });
    }

    res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
const deleteResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    try {
      await Resume.deleteOne({ _id: id, userId: req.user.id });
    } catch (dbErr) {
      const idx = memoryResumes.findIndex((r) => r._id === id && String(r.userId) === String(req.user.id));
      if (idx !== -1) memoryResumes.splice(idx, 1);
    }

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getUserResumes,
  getResumeById,
  deleteResume,
  memoryResumes,
};
