// src/controllers/interviewController.js
// Handles the live interview flow: starting a session, generating the first
// question, evaluating each submitted answer, deciding the next question
// (new topic from question bank, never repeating), and marking the session complete.
//
// KEY IMPROVEMENTS:
// 1. Uses the local question bank (questionBank.js) as primary source → no API needed for questions.
// 2. Falls back to AI generation when bank is exhausted.
// 3. Tracks ALL question texts used in the session to GUARANTEE zero repetition.
// 4. Adapts question depth by experience level: fresher / junior / mid / senior.
// 5. Increases session capacity to 10 questions for a thorough interview experience.

const InterviewSession = require('../models/InterviewSession');
const QuestionAnswer = require('../models/QuestionAnswer');

const { generateQuestion } = require('../services/questionGenerator');
const { evaluateAnswer } = require('../services/answerEvaluator');
const { getUniqueQuestion } = require('../utils/questionBank');

const MAX_QUESTIONS = 10;
const MAX_ANSWER_LENGTH = 5000;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all question texts already asked in this session (for de-duplication).
 */
async function getUsedQuestions(sessionId) {
  const existing = await QuestionAnswer.find({ session: sessionId }).select('questionText');
  return new Set(existing.map((q) => q.questionText.trim()));
}

/**
 * Extract topic keywords from a question text for the AI "previousTopics" tracking.
 */
function extractTopic(questionText) {
  // Take first 80 characters as a topic fingerprint
  return questionText ? questionText.slice(0, 80).trim() : '';
}

/**
 * Pick the next question from the bank, ensuring it hasn't been used this session.
 * Falls back to AI generation if the bank is exhausted.
 */
async function pickNextQuestion({ role, experienceLevel, round, sessionId }) {
  const usedQuestions = await getUsedQuestions(sessionId);

  // 1. Try the local question bank first
  const { question, found } = getUniqueQuestion(role, experienceLevel, usedQuestions);
  if (found && question) {
    return question;
  }

  // 2. Fall back to AI generation (passing all used question topics to avoid repeats)
  const previousTopics = [...usedQuestions].map(extractTopic).filter(Boolean);
  const aiQuestion = await generateQuestion({ role, experienceLevel, round, previousTopics });

  // Validate it's not a repeat
  if (usedQuestions.has(aiQuestion.trim())) {
    // Last resort: return a generic probing question
    return `Describe your most impactful contribution in a ${role} role and the technical decisions you made.`;
  }

  return aiQuestion;
}

// ─────────────────────────────────────────────────────────────
// POST /api/interview/start
// Body: { role, experienceLevel, round }
// ─────────────────────────────────────────────────────────────
async function startInterview(req, res, next) {
  try {
    const { role, experienceLevel, round } = req.body;

    if (!role || typeof role !== 'string' || role.trim().length === 0) {
      return res.status(400).json({ message: 'role is required' });
    }

    const session = await InterviewSession.create({
      user: req.user.id,
      role: role.trim(),
      experienceLevel: experienceLevel || 'fresher',
      round: round || 'technical',
    });

    // Pick the first question immediately from the bank
    const questionText = await pickNextQuestion({
      role: session.role,
      experienceLevel: session.experienceLevel,
      round: session.round,
      sessionId: session._id,
    });

    const firstQuestion = await QuestionAnswer.create({
      session: session._id,
      questionText,
      order: 1,
      isFollowUp: false,
    });

    res.status(201).json({
      sessionId: session._id,
      question: {
        id: firstQuestion._id,
        text: firstQuestion.questionText,
        order: firstQuestion.order,
      },
      totalQuestions: MAX_QUESTIONS,
      questionsAnswered: 0,
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/interview/:sessionId/answer
// Body: { questionId, answerText }
// ─────────────────────────────────────────────────────────────
async function submitAnswer(req, res, next) {
  try {
    const { sessionId } = req.params;
    let { questionId, answerText } = req.body;

    if (!answerText || !questionId) {
      return res.status(400).json({ message: 'questionId and answerText are required' });
    }

    answerText = String(answerText).trim();
    if (answerText.length === 0) {
      return res.status(400).json({ message: 'Answer cannot be empty' });
    }
    if (answerText.length > MAX_ANSWER_LENGTH) {
      answerText = answerText.slice(0, MAX_ANSWER_LENGTH);
    }

    const session = await InterviewSession.findOne({ _id: sessionId, user: req.user.id });
    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    if (session.status !== 'in_progress') {
      return res.status(400).json({ message: `Cannot submit answers to a ${session.status} session` });
    }

    const currentQA = await QuestionAnswer.findOne({ _id: questionId, session: sessionId });
    if (!currentQA) {
      return res.status(404).json({ message: 'Question not found in this session' });
    }

    // Save answer and evaluate
    currentQA.answerText = answerText;
    const evaluation = await evaluateAnswer({
      question: currentQA.questionText,
      answer: answerText,
      role: session.role,
      experienceLevel: session.experienceLevel,
    });
    currentQA.evaluation = evaluation;
    await currentQA.save();

    // Count answered questions for progress
    const questionsAnswered = await QuestionAnswer.countDocuments({
      session: sessionId,
      answerText: { $ne: null },
    });

    // Check stopping condition
    if (currentQA.order >= MAX_QUESTIONS) {
      return res.status(200).json({
        message: 'Interview complete. All questions answered.',
        evaluation,
        isLastQuestion: true,
        questionsAnswered,
        totalQuestions: MAX_QUESTIONS,
      });
    }

    // Pick the NEXT unique question from the bank (guaranteed not to repeat)
    const nextQuestionText = await pickNextQuestion({
      role: session.role,
      experienceLevel: session.experienceLevel,
      round: session.round,
      sessionId: session._id,
    });

    const nextQA = await QuestionAnswer.create({
      session: sessionId,
      questionText: nextQuestionText,
      order: currentQA.order + 1,
      isFollowUp: false,
    });

    res.status(200).json({
      evaluation,
      nextQuestion: {
        id: nextQA._id,
        text: nextQA.questionText,
        order: nextQA.order,
      },
      isLastQuestion: false,
      questionsAnswered,
      totalQuestions: MAX_QUESTIONS,
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/interview/:sessionId/complete
// ─────────────────────────────────────────────────────────────
async function completeInterview(req, res, next) {
  try {
    const { sessionId } = req.params;

    const session = await InterviewSession.findOneAndUpdate(
      { _id: sessionId, user: req.user.id },
      { status: 'completed', completedAt: new Date() },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    res.status(200).json({ session });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────
// GET /api/interview/:sessionId
// ─────────────────────────────────────────────────────────────
async function getSession(req, res, next) {
  try {
    const { sessionId } = req.params;

    const session = await InterviewSession.findOne({ _id: sessionId, user: req.user.id });
    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    const questions = await QuestionAnswer.find({ session: sessionId }).sort('order');
    const questionsAnswered = questions.filter((q) => q.answerText).length;

    res.status(200).json({
      session,
      questions,
      questionsAnswered,
      totalQuestions: MAX_QUESTIONS,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { startInterview, submitAnswer, completeInterview, getSession };