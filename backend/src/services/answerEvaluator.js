// src/services/answerEvaluator.js
// Evaluates candidate answers via AI with robust error handling and safe defaults.
const { askAI } = require('../config/aiClient');
const { evaluationPrompt } = require('../utils/promptTemplates');
const { parseJSONResponse, getDefaultEvaluationResponse } = require('../utils/responseParser');

const SYSTEM_PROMPT =
  'You are a real human technical interviewer at a top-tier tech company. You give honest, specific, natural-sounding feedback. You never give unearned praise or compliment gibberish. You always respond with valid JSON only.';

/**
 * @param {object} params - { question, answer, role, experienceLevel }
 * @returns {Promise<{correctnessScore, clarityScore, structureScore, recruiterComment, feedback, recruiterVerdict, senioritySignal, keyStrengths, missedOpportunities, missingKeywords, sampleStrongAnswer}>}
 */
async function evaluateAnswer(params) {
  // Pre-screen: only catch truly obvious garbage before calling AI
  // (pure symbols, zero letters, very short meaningless input)
  const answerTrimmed = (params.answer || '').trim();
  const isObviousGarbage =
    answerTrimmed.length < 4 ||
    !/[a-zA-Z]/.test(answerTrimmed);  // no letters at all

  try {
    const prompt = evaluationPrompt(params);
    const rawResponse = await askAI(SYSTEM_PROMPT, prompt, 900);
    const parsed = parseJSONResponse(rawResponse);

    // If the AI still gave a generous score for obvious garbage input, cap it
    let correctnessScore = parsed.correctnessScore ?? (isObviousGarbage ? 1 : 5);
    let clarityScore = parsed.clarityScore ?? (isObviousGarbage ? 1 : 5);
    let structureScore = parsed.structureScore ?? (isObviousGarbage ? 1 : 5);

    if (isObviousGarbage) {
      correctnessScore = Math.min(correctnessScore, 2);
      clarityScore = Math.min(clarityScore, 2);
      structureScore = Math.min(structureScore, 2);
    }

    const verdict = parsed.recruiterVerdict ||
      (isObviousGarbage ? 'Needs Improvement' : 'Leaning Hire');

    return {
      correctnessScore,
      clarityScore,
      structureScore,
      recruiterComment: parsed.recruiterComment || '',
      feedback: parsed.feedback || (isObviousGarbage
        ? "That response wasn't an answer to the question. I need you to actually engage with what I asked."
        : 'Evaluation received.'),
      recruiterVerdict: verdict,
      senioritySignal: parsed.senioritySignal || (isObviousGarbage ? 'Entry' : 'Junior'),
      keyStrengths: isObviousGarbage ? [] : (Array.isArray(parsed.keyStrengths) ? parsed.keyStrengths : []),
      missedOpportunities: Array.isArray(parsed.missedOpportunities) ? parsed.missedOpportunities : [],
      missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
      sampleStrongAnswer: parsed.sampleStrongAnswer || '',
    };
  } catch (err) {
    console.error('Answer evaluation failed, returning safe defaults:', err.message);
    return getDefaultEvaluationResponse();
  }
}

module.exports = { evaluateAnswer };