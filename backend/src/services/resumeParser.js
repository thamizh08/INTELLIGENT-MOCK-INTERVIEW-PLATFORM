// src/services/resumeParser.js
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { askAI } = require('../config/aiClient');
const { resumeExtractionPrompt } = require('../utils/promptTemplates');
const { parseJSONResponse } = require('../utils/responseParser');

const SYSTEM_PROMPT =
  'You extract structured information from resumes. You always respond with valid JSON only.';

/**
 * Pulls raw text out of an uploaded resume file buffer, based on its mimetype.
 * @param {Buffer} fileBuffer
 * @param {string} mimetype
 * @returns {Promise<string>} - plain extracted text
 */
async function extractTextFromFile(fileBuffer, mimetype) {
  if (mimetype === 'application/pdf') {
    const data = await pdfParse(fileBuffer);
    return data.text;
  }

  if (
    mimetype ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  }

  throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
}

/**
 * Sends extracted resume text to the AI to pull out skills/projects.
 * @param {string} resumeText
 * @returns {Promise<{skills: string[], projects: string[]}>}
 */
async function extractSkillsAndProjects(resumeText) {
  const prompt = resumeExtractionPrompt({ resumeText });
  const rawResponse = await askAI(SYSTEM_PROMPT, prompt, 600);
  return parseJSONResponse(rawResponse);
}

module.exports = { extractTextFromFile, extractSkillsAndProjects };