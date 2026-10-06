// src/services/reportGenerator.js
const { askAI } = require('../config/aiClient');
const { reportSummaryPrompt } = require('../utils/promptTemplates');
const { parseJSONResponse } = require('../utils/responseParser');

const SYSTEM_PROMPT =
  'You are a senior hiring manager summarizing a candidate\'s mock interview performance. You always respond with valid JSON only.';

/**
 * @param {object} params - { role, qaPairs } where qaPairs is an array of
 *   { questionText, answerText, evaluation }
 * @returns {Promise<{overallScores, summaryText, weakAreas}>}
 */
async function generateReportSummary(params) {
  const prompt = reportSummaryPrompt(params);
  const rawResponse = await askAI(SYSTEM_PROMPT, prompt, 800);
  return parseJSONResponse(rawResponse);
}

module.exports = { generateReportSummary };