// src/utils/responseParser.js
// Strips markdown fences, extracts embedded JSON objects/arrays, and safely parses AI outputs.
// Provides safe defaults for every expected field to prevent crashes.

function parseJSONResponse(rawText) {
  if (typeof rawText === 'object' && rawText !== null) {
    return rawText;
  }

  const cleaned = (rawText || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  // Strategy 1: Direct parse
  try {
    return JSON.parse(cleaned);
  } catch (err1) {
    // Strategy 2: Extract JSON block via regex
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (err2) {
        // Strategy 3: Try to fix common JSON issues (trailing commas, single quotes)
        try {
          const fixed = jsonMatch[0]
            .replace(/,\s*([}\]])/g, '$1')          // remove trailing commas
            .replace(/'/g, '"')                       // single quotes to double
            .replace(/(\w+)\s*:/g, '"$1":');          // unquoted keys
          return JSON.parse(fixed);
        } catch (err3) {
          // Fall through to defaults
        }
      }
    }

    // Strategy 4: Return safe defaults rather than crashing
    console.warn('AI response was not valid JSON, returning safe defaults. Raw:', cleaned.slice(0, 200));
    return getDefaultEvaluationResponse();
  }
}

/**
 * Provides safe default evaluation response so the app never crashes on malformed AI output.
 */
function getDefaultEvaluationResponse() {
  return {
    correctnessScore: 3,
    clarityScore: 3,
    structureScore: 3,
    recruiterComment: 'The evaluation system hit a snag processing this response.',
    recruiterVerdict: 'Needs Improvement',
    senioritySignal: 'Junior',
    feedback: 'The AI evaluator encountered a parsing issue and could not fully assess this answer. Your response has been logged. Please ensure you provide a clear, relevant answer to the question.',
    keyStrengths: [],
    missedOpportunities: ['Evaluation unavailable — ensure your answer is relevant and clear'],
    missingKeywords: [],
    sampleStrongAnswer: '',
    // Report-level defaults
    overallScores: { technicalDepth: 3, communication: 3, problemSolving: 3, confidence: 3 },
    summaryText: 'Interview session completed. Some answers could not be fully evaluated due to technical issues.',
    weakAreas: [],
    likelihoodOfPassing: '40% (Low - Several answers could not be assessed)',
    topImprovementTopics: [],
  };
}

module.exports = { parseJSONResponse, getDefaultEvaluationResponse };