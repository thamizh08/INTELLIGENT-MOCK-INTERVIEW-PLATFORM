// src/services/questionGenerator.js
const { askAI } = require('../config/aiClient');
const { questionGenerationPrompt } = require('../utils/promptTemplates');

const SYSTEM_PROMPT =
  'You are an experienced technical interviewer. You ask clear, realistic interview questions one at a time.';

/**
 * @param {object} params - { role, experienceLevel, round, previousTopics }
 * @returns {Promise<string>} - the generated question text
 */
async function generateQuestion(params) {
  const prompt = questionGenerationPrompt(params);
  const question = await askAI(SYSTEM_PROMPT, prompt, 200);
  return question.trim();
}

module.exports = { generateQuestion };