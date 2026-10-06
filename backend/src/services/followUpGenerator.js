// src/services/followUpGenerator.js
const { askAI } = require('../config/aiClient');
const { followUpPrompt } = require('../utils/promptTemplates');

const SYSTEM_PROMPT =
  'You are an experienced technical interviewer conducting a live, adaptive interview.';

/**
 * @param {object} params - { question, answer }
 * @returns {Promise<string>} - the next question text (follow-up or new topic)
 */
async function generateFollowUp(params) {
  const prompt = followUpPrompt(params);
  const nextQuestion = await askAI(SYSTEM_PROMPT, prompt, 200);
  return nextQuestion.trim();
}

module.exports = { generateFollowUp };