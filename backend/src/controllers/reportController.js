// src/controllers/reportController.js
// Handles turning a completed interview session's Q&A history into a final,
// AI-summarized report with hiring committee verdict, offer probability, and improvement topics.

const InterviewSession = require('../models/InterviewSession');
const QuestionAnswer = require('../models/QuestionAnswer');
const Report = require('../models/Report');

const { generateReportSummary } = require('../services/reportGenerator');

// POST /api/report/:sessionId/generate
async function generateReport(req, res, next) {
  try {
    const { sessionId } = req.params;

    const session = await InterviewSession.findOne({ _id: sessionId, user: req.user.id });
    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    const existingReport = await Report.findOne({ session: sessionId });
    if (existingReport) {
      return res.status(200).json({ report: existingReport, alreadyExisted: true });
    }

    const qaPairs = await QuestionAnswer.find({ session: sessionId }).sort('order');
    if (qaPairs.length === 0) {
      return res.status(400).json({ message: 'No answered questions found for this session' });
    }

    const summary = await generateReportSummary({
      role: session.role,
      qaPairs: qaPairs.map((qa) => ({
        questionText: qa.questionText,
        answerText: qa.answerText,
        evaluation: qa.evaluation,
      })),
    });

    const report = await Report.create({
      session: sessionId,
      user: req.user.id,
      overallScores: summary.overallScores || { technicalDepth: 5, communication: 5, problemSolving: 5, confidence: 5 },
      summaryText: summary.summaryText || 'Interview session completed. Review individual question evaluations for detailed feedback.',
      weakAreas: Array.isArray(summary.weakAreas) ? summary.weakAreas : [],
      likelihoodOfPassing: summary.likelihoodOfPassing || '60% (Moderate)',
      topImprovementTopics: Array.isArray(summary.topImprovementTopics) ? summary.topImprovementTopics : [],
    });

    // Mark the session completed if it wasn't already
    if (session.status !== 'completed') {
      session.status = 'completed';
      session.completedAt = new Date();
      await session.save();
    }

    res.status(201).json({ report, alreadyExisted: false });
  } catch (err) {
    next(err);
  }
}

// GET /api/report/:sessionId
async function getReportBySession(req, res, next) {
  try {
    const { sessionId } = req.params;

    const report = await Report.findOne({ session: sessionId, user: req.user.id });
    if (!report) {
      return res.status(404).json({ message: 'Report not found for this session' });
    }

    res.status(200).json({ report });
  } catch (err) {
    next(err);
  }
}

// GET /api/report/history
async function getUserReports(req, res, next) {
  try {
    const reports = await Report.find({ user: req.user.id })
      .sort('-createdAt')
      .populate('session', 'role experienceLevel round');
    res.status(200).json({ reports });
  } catch (err) {
    next(err);
  }
}

module.exports = { generateReport, getReportBySession, getUserReports };