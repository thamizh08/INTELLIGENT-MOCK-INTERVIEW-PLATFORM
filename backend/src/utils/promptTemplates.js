// src/utils/promptTemplates.js
// Central place for building text prompts for the AI Recruiter & Evaluator Engine.
// Supports experience-level-aware scoring and mixed question types.

function questionGenerationPrompt({ role, experienceLevel, round, previousTopics = [] }) {
  const topicsStr = Array.isArray(previousTopics) && previousTopics.length
    ? previousTopics.join(', ')
    : 'none yet';

  const levelContext = {
    fresher: `The candidate is a FRESHER (0-1 year experience). Ask foundational questions about core concepts, definitions, basic syntax, and simple real-world usage. Do NOT ask about advanced architecture, trade-offs, or production-scale systems. Focus on: understanding of fundamentals, theoretical knowledge, ability to explain concepts simply.`,
    junior: `The candidate is a JUNIOR ENGINEER (1-3 years experience). Ask intermediate-level questions probing hands-on experience: implementation details, common patterns, debugging approaches, and awareness of basic trade-offs. Avoid trivial definitions. Expect practical experience with libraries and frameworks.`,
    mid: `The candidate is a MID-LEVEL ENGINEER (3-6 years experience). Ask advanced technical questions requiring explicit architectural trade-offs, design pattern knowledge, production experience, and ownership of technical decisions. Expect clear reasoning about scalability, reliability, and maintainability.`,
    senior: `The candidate is a SENIOR ENGINEER / TECH LEAD (6+ years experience). Ask expert-level questions demanding deep systems thinking, quantitative trade-off reasoning, failure mode analysis, leadership experience, and production battle scars. Expect architectural decisions at scale, mentorship examples, and cross-team impact.`
  };

  return `You are a Senior Technical Hiring Manager at a top-tier technology company conducting a professional "${round}" interview for a "${role}" position.

CANDIDATE PROFILE: ${levelContext[experienceLevel] || levelContext.junior}

YOUR TASK: Generate exactly ONE high-impact, realistic interview question that:
1. Is specifically tailored for the "${role}" role at ${experienceLevel} level
2. Covers a DIFFERENT topic from these already-covered topics: ${topicsStr}
3. Matches what a real professional recruiter at a top company would ask for this exact experience level
4. Is challenging but fair for the stated experience level
5. Is specific, unambiguous, and answerable in a real interview setting

STRICT RULES:
- Do NOT repeat or rephrase any of the previously covered topics: ${topicsStr}
- Do NOT ask generic questions if role-specific ones exist
- Do NOT ask senior-level architecture questions to a fresher candidate
- Do NOT ask trivial definition questions to a senior candidate
- Return ONLY the question text with no preamble, numbering, or labels.`;
}

function followUpPrompt({ question, answer }) {
  // Detect if the answer is clearly nonsensical/gibberish
  const trimmed = (answer || '').trim();
  const isGibberish = trimmed.length < 15 ||
    /^[^a-zA-Z]*$/.test(trimmed) ||
    trimmed.split(' ').length < 4;

  if (isGibberish) {
    return `You are a real human technical recruiter conducting a live interview. The candidate was asked: "${question}"
They gave this response: "${answer}"

This response is clearly not a real answer — it is either gibberish, random characters, too short, or meaningless.
As a real recruiter would, generate ONE direct follow-up that:
- Expresses mild frustration or skepticism in a professional but honest tone
- Asks the candidate to actually answer the question seriously
- Does NOT rephrase as a hint or give away the answer
Return ONLY the follow-up question text, no preamble.`;
  }

  return `You are a real human technical recruiter & engineering director conducting a live interview.
The candidate was asked: "${question}"
They answered: "${answer}"

Evaluate how well they answered. Then, as a real recruiter would naturally do:
- If the answer is weak, vague, or missing key details: push back with a direct, slightly skeptical follow-up that probes for specifics or calls out what was missing (e.g. "You mentioned X but didn't explain how — can you walk me through that?")
- If the answer was decent but incomplete: ask a probing follow-up on the gap
- If the answer was strong: transition naturally to a related but deeper topic

Your follow-up must sound like a real person talking, not a formal system. Keep it conversational, 1-2 sentences max.
Return ONLY the follow-up question text, no preamble or labels.`;
}

function evaluationPrompt({ question, answer, role = 'Software Engineer', experienceLevel = 'junior' }) {
  const scoringGuide = {
    fresher: `Score 8-10/10 only for clear, accurate foundational answers with correct terminology.
Score 5-7/10 for partial understanding with some correct points.
Score 3-4/10 for very vague or mostly wrong answers.
Score 1-2/10 for gibberish, random text, scribbling, repeating the question, or content unrelated to the question.`,
    junior: `Score 8-10/10 only for practical, keyword-accurate answers showing hands-on experience.
Score 5-7/10 for answers that are directionally correct but missing implementation specifics.
Score 3-4/10 for surface-level answers that show awareness but no depth.
Score 1-2/10 for gibberish, random characters, scribbling, one-word answers, or repeating the question back.`,
    mid: `Score 8-10/10 only for thorough answers with explicit trade-offs, domain keywords, and architectural awareness.
Score 5-7/10 for answers missing essential mechanics or trade-offs.
Score 3-4/10 for superficial answers lacking real technical substance.
Score 1-2/10 for gibberish, random text, scribbling, or content completely irrelevant to the question.`,
    senior: `Score 9-10/10 only for expert-level answers with systems thinking, quantitative reasoning, and real production experience.
Score 6-8/10 for good answers missing critical senior-level nuances.
Score 3-5/10 for mid-level answers that don't demonstrate senior ownership.
Score 1-2/10 for gibberish, random characters, scribbling, or clearly non-serious responses.`
  };

  const humanTone = {
    fresher: `You're a friendly but honest interviewer. Be encouraging when warranted, but do not sugarcoat weak answers. Speak naturally as a real person would.`,
    junior: `You're a direct, professional interviewer. Call out gaps plainly without being rude. Don't give praise if it hasn't been earned.`,
    mid: `You're a senior engineer interviewing a mid-level candidate. Be frank, specific, and a little impatient with vague answers. Real talk, no fluff.`,
    senior: `You're a principal engineer or engineering director. You have high standards and low tolerance for hand-wavy answers. Be direct, a little blunt, and expect depth.`
  };

  return `You are a real human technical interviewer at a top-tier tech company, evaluating a ${experienceLevel}-level candidate for a "${role}" role.

QUESTION ASKED: "${question}"
CANDIDATE RESPONSE: "${answer}"

YOUR PERSONA: ${humanTone[experienceLevel] || humanTone.junior}

SCORING GUIDE FOR ${experienceLevel.toUpperCase()} LEVEL:
${scoringGuide[experienceLevel] || scoringGuide.junior}

CRITICAL RULES — READ CAREFULLY:
1. QUESTION RELEVANCE IS THE #1 PRIORITY: First check — does the answer actually address the SPECIFIC question that was asked? If the answer is about a completely different topic (even if technically correct), score it 1-3/10 and set verdict to "Needs Improvement". In an interview, answering a different question is the same as not answering. Call this out explicitly in feedback.
2. GIBBERISH / SCRIBBLE DETECTION: If the candidate's response is random characters, meaningless text, a single word, pure scribbling, or has nothing to do with the question — score ALL metrics 1 or 2. Set verdict to "Needs Improvement". Set keyStrengths to empty []. Be direct in feedback: tell them plainly this is not an acceptable answer.
3. NO UNEARNED PRAISE: Do NOT say "Good attempt", "That's a great start", or "You're on the right track" if the answer is wrong, irrelevant, or weak. Say what's actually wrong.
4. NATURAL HUMAN FEEDBACK: Write the "feedback" field as if you're talking to the candidate face-to-face. Use phrases like "Your answer didn't address what I asked", "You talked about X, but the question was about Y", "I was hoping to hear about Z here", "That's not quite right — the actual mechanism is...", etc.
5. SPECIFIC GAPS: In "missedOpportunities", be specific about what was missing from THIS question's answer specifically.
6. REALISTIC VERDICTS: "Strong Hire" should be rare. "Needs Improvement" for irrelevant, weak, or wrong answers.

Return ONLY valid JSON in exactly this structure (no extra text before or after):
{
  "correctnessScore": <0-10 integer>,
  "clarityScore": <0-10 integer>,
  "structureScore": <0-10 integer>,
  "recruiterVerdict": "<Strong Hire | Hire | Leaning Hire | Needs Improvement>",
  "senioritySignal": "<Entry | Junior | Mid-Level | Senior | Staff Lead>",
  "recruiterComment": "<1-2 sentence natural spoken reaction — if off-topic, call it out directly>",
  "feedback": "<3-5 sentences of honest, specific feedback — was it relevant to the question? what was wrong? what was missing? No fluff.>",
  "keyStrengths": ["<genuine strength if any, or empty array for irrelevant/gibberish answers>"],
  "missedOpportunities": ["<specific gap tied to this question>", "<specific gap 2>"],
  "missingKeywords": ["<domain term specific to this question that was absent>"],
  "sampleStrongAnswer": "<A concise benchmark answer (2-4 sentences) that directly and correctly answers the specific question asked>"
}`;
}

function reportSummaryPrompt({ role, qaPairs = [] }) {
  const transcript = (qaPairs || [])
    .map((qa, i) => `Q${i + 1}: ${qa.questionText}\nA${i + 1}: ${qa.answerText || '(No answer provided)'}\nEvaluation: Score ${qa.evaluation?.correctnessScore || 'N/A'}/10, Verdict: ${qa.evaluation?.recruiterVerdict || 'N/A'}`)
    .join('\n\n');

  return `You are the Lead Hiring Committee Chair summarizing a completed interview for a "${role}" position.

Review the full interview transcript below and produce a comprehensive hiring committee evaluation:

${transcript}

IMPORTANT RULES:
- Base scores on actual answer quality shown in the transcript, not inflated defaults.
- If most answers scored below 6/10, the overall scores should reflect that.
- Provide actionable, specific improvement topics (not generic advice).

Return ONLY valid JSON in exactly this structure:
{
  "overallScores": {
    "technicalDepth": <0-10>,
    "communication": <0-10>,
    "problemSolving": <0-10>,
    "confidence": <0-10>
  },
  "likelihoodOfPassing": "<e.g. 45% (Low - Needs Significant Preparation) or 85% (High - Strong Offer Candidate)>",
  "summaryText": "<4-6 sentence specific hiring committee summary referencing actual candidate performance from transcript>",
  "topImprovementTopics": ["<Specific topic 1>", "<Specific topic 2>", "<Specific topic 3>"],
  "weakAreas": ["<area 1>", "<area 2>", "<area 3>"]
}`;
}

function roadmapPrompt({ role, weakAreas = [] }) {
  const areasStr = Array.isArray(weakAreas) ? weakAreas.join(', ') : String(weakAreas || '');
  return `You are a Senior Engineering Mentor creating an elite 7-day personalized interview mastery plan for a "${role}" candidate targeting these specific weak areas: ${areasStr}.

CRITICAL RESOURCE REQUIREMENTS:
For EVERY day, you MUST provide BOTH "self_learning" AND "mentor_based" resources with explicit subscription status:
1. Self-Learning Resources ("category": "self_learning"):
   - Include guides & articles from platforms like GeeksforGeeks, MDN, Dev.to, LeetCode, or Official Docs.
   - Include Unpaid / Free courses (e.g., freeCodeCamp, Coursera Free Audit, Harvard CS50, open-source repos).
   - Include Paid courses & deep-dives (e.g., Udemy, Coursera Specializations, Educative.io, Frontend Masters).
   - Set "subscriptionStatus" to "Free", "Paid", or "Freemium".
2. Mentor-Based Learning Resources ("category": "mentor_based"):
   - Include high-yield lecture videos & playlists on YouTube (e.g., freeCodeCamp, Traversy Media, Net Ninja, Hussein Nasser, NeetCode, MIT OpenCourseWare, ByteByteGo).
   - Include mentor-led video masterclasses or guided courses on online learning platforms.
   - Set "subscriptionStatus" to "Free" (for YouTube/free webinars) or "Paid" (for paid mentor subscriptions/masterclasses).

Return ONLY valid JSON in exactly this shape:
{
  "plan": [
    {
      "day": 1,
      "topic": "<weak area topic>",
      "tasks": ["<actionable task 1>", "<actionable task 2>", "<actionable task 3>"],
      "resources": [
        {
          "title": "<Specific Article or Guide Title>",
          "platform": "GeeksforGeeks",
          "url": "https://www.geeksforgeeks.org/<relevant-topic-path>",
          "category": "self_learning",
          "type": "Article & Documentation",
          "subscriptionStatus": "Free",
          "duration": "25 mins",
          "channelOrAuthor": "GeeksforGeeks",
          "description": "<Brief actionable summary of what to learn>"
        },
        {
          "title": "<Specific Course Name>",
          "platform": "freeCodeCamp / Coursera / Udemy",
          "url": "https://www.freecodecamp.org/news/<topic>",
          "category": "self_learning",
          "type": "Unpaid Course",
          "subscriptionStatus": "Free",
          "duration": "1.5 hours",
          "channelOrAuthor": "freeCodeCamp",
          "description": "<What concepts are covered>"
        },
        {
          "title": "<Deep-Dive Paid Masterclass/Course>",
          "platform": "Udemy / Educative",
          "url": "https://www.udemy.com/topic/<topic>/",
          "category": "self_learning",
          "type": "Paid Course",
          "subscriptionStatus": "Paid",
          "duration": "3 hours",
          "channelOrAuthor": "Top Industry Instructor",
          "description": "<In-depth hands-on project and exercises>"
        },
        {
          "title": "<YouTube Video Lecture Title>",
          "platform": "YouTube",
          "url": "https://www.youtube.com/results?search_query=<topic>+tutorial+lecture",
          "category": "mentor_based",
          "type": "YouTube Video Lecture",
          "subscriptionStatus": "Free",
          "duration": "45 mins",
          "channelOrAuthor": "Traversy Media / NeetCode / Hussein Nasser",
          "description": "<Instructor step-by-step lecture walkthrough>"
        },
        {
          "title": "<Mentor-Led Masterclass / Guided Project>",
          "platform": "Coursera / edX / O'Reilly",
          "url": "https://www.coursera.org/search?query=<topic>",
          "category": "mentor_based",
          "type": "Mentor Masterclass",
          "subscriptionStatus": "Paid",
          "duration": "2 hours",
          "channelOrAuthor": "Industry Mentor",
          "description": "<Interactive guided lecture with live coding review>"
        }
      ]
    }
  ]
}
Cover all listed weak areas thoroughly across all 7 days. Ensure each day has a rich mix of self-learning and mentor-based resources with accurate subscription statuses.`;
}

function resumeExtractionPrompt({ resumeText }) {
  return `Extract key technical skills, tools, frameworks, and engineering project highlights from this candidate resume. 
Return ONLY valid JSON in exactly this shape:
{
  "skills": ["<skill1>", "..."],
  "projects": ["<project name/summary>", "..."]
}

Resume text:
"""${resumeText}"""`;
}

module.exports = {
  questionGenerationPrompt,
  followUpPrompt,
  evaluationPrompt,
  reportSummaryPrompt,
  roadmapPrompt,
  resumeExtractionPrompt,
};