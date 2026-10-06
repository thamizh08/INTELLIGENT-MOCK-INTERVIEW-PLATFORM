// src/services/roadmapGenerator.js
const { askAI } = require('../config/aiClient');
const { roadmapPrompt } = require('../utils/promptTemplates');
const { parseJSONResponse } = require('../utils/responseParser');

const SYSTEM_PROMPT =
  'You are a premier senior engineering career mentor and tech educator who builds structured 7-day mastery roadmaps with curated self-learning and mentor-based video resources. You always respond with valid JSON only.';

/**
 * Normalizes a single resource item into a full, consistent structured object.
 */
function normalizeResourceItem(res, defaultTopic = '', defaultRole = '', index = 0) {
  if (typeof res === 'string') {
    const text = res.trim();
    const isYouTubeOrVideo = /youtube|video|lecture|masterclass|channel|watch/i.test(text);
    const isGeeks = /geeksforgeeks|gfg/i.test(text);
    const isPaid = /udemy|paid|subscription|coursera specialization|certificate|masterclass/i.test(text);
    const isCoursera = /coursera/i.test(text);
    const isDocs = /documentation|docs|guide|article|rfc|manual/i.test(text);

    let platform = 'GeeksforGeeks';
    let category = 'self_learning';
    let type = 'Article & Documentation';
    let subscriptionStatus = 'Free';
    let channelOrAuthor = 'GeeksforGeeks Editorial';
    let duration = '25 mins';
    let url = `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(text + ' ' + defaultTopic)}`;

    if (isYouTubeOrVideo) {
      platform = 'YouTube';
      category = 'mentor_based';
      type = 'YouTube Video Lecture';
      subscriptionStatus = 'Free';
      channelOrAuthor = 'Curated Tech Mentor';
      duration = '45 mins';
      url = `https://www.youtube.com/results?search_query=${encodeURIComponent(text + ' ' + defaultRole + ' tutorial')}`;
    } else if (isGeeks) {
      platform = 'GeeksforGeeks';
      category = 'self_learning';
      type = 'Article & Documentation';
      subscriptionStatus = 'Free';
      channelOrAuthor = 'GeeksforGeeks';
      duration = '20 mins';
      url = `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(text)}`;
    } else if (isPaid) {
      platform = isCoursera ? 'Coursera' : 'Udemy';
      category = isYouTubeOrVideo ? 'mentor_based' : 'self_learning';
      type = 'Paid Course';
      subscriptionStatus = 'Paid';
      channelOrAuthor = 'Industry Expert Instructor';
      duration = '2.5 hours';
      url = isCoursera
        ? `https://www.coursera.org/search?query=${encodeURIComponent(text)}`
        : `https://www.udemy.com/courses/search/?q=${encodeURIComponent(text)}`;
    } else if (isDocs) {
      platform = 'Official Docs';
      category = 'self_learning';
      type = 'Documentation';
      subscriptionStatus = 'Free';
      channelOrAuthor = 'Core Tech Maintainers';
      duration = '30 mins';
      url = `https://www.google.com/search?q=${encodeURIComponent(text + ' documentation')}`;
    }

    return {
      title: text,
      platform,
      url,
      category,
      type,
      subscriptionStatus,
      duration,
      channelOrAuthor,
      description: `Comprehensive study material on ${text} designed for ${defaultRole} preparation.`,
    };
  }

  // If already an object, ensure all required fields are well-formed
  const category = res.category === 'mentor_based' ? 'mentor_based' : 'self_learning';
  const platform = res.platform || (category === 'mentor_based' ? 'YouTube' : 'GeeksforGeeks');
  const title = res.title || res.name || `${defaultTopic} Resource #${index + 1}`;
  let subStatus = res.subscriptionStatus || (res.isPaid ? 'Paid' : 'Free');
  if (!['Free', 'Paid', 'Freemium', 'Free Audit Available'].includes(subStatus)) {
    subStatus = /paid/i.test(subStatus) ? 'Paid' : /freemium|audit/i.test(subStatus) ? 'Freemium' : 'Free';
  }

  let url = res.url || '';
  if (!url || !url.startsWith('http')) {
    if (category === 'mentor_based' || platform.toLowerCase().includes('youtube')) {
      url = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' ' + defaultRole + ' tutorial lecture')}`;
    } else if (platform.toLowerCase().includes('geeksforgeeks')) {
      url = `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(title + ' ' + defaultTopic)}`;
    } else if (platform.toLowerCase().includes('udemy')) {
      url = `https://www.udemy.com/courses/search/?q=${encodeURIComponent(title)}`;
    } else if (platform.toLowerCase().includes('coursera')) {
      url = `https://www.coursera.org/search?query=${encodeURIComponent(title)}`;
    } else {
      url = `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(title)}`;
    }
  }

  return {
    title,
    platform,
    url,
    category,
    type: res.type || (category === 'mentor_based' ? 'YouTube Video Lecture' : 'Article & Documentation'),
    subscriptionStatus: subStatus,
    duration: res.duration || (category === 'mentor_based' ? '45 mins' : '25 mins'),
    channelOrAuthor: res.channelOrAuthor || res.author || res.channel || (category === 'mentor_based' ? 'Curated Tech Mentor' : platform),
    description: res.description || `Targeted preparation resource for ${defaultTopic}.`,
  };
}

/**
 * Ensures that each day in the plan contains both Self-Learning and Mentor-Based tracks.
 */
function enrichDayResources(day, role = 'Software Engineer') {
  const topic = day.topic || `Day ${day.day} Mastery Focus`;
  let resources = Array.isArray(day.resources) ? day.resources : [];

  let normalized = resources.map((r, i) => normalizeResourceItem(r, topic, role, i));

  // Check if we have both self_learning and mentor_based
  const hasSelfLearning = normalized.some((r) => r.category === 'self_learning');
  const hasMentorBased = normalized.some((r) => r.category === 'mentor_based');

  // If missing self-learning, add GeeksforGeeks + free course + paid course
  if (!hasSelfLearning) {
    normalized.push(
      {
        title: `${topic} Concepts & Interview Q&A`,
        platform: 'GeeksforGeeks',
        url: `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(topic + ' ' + role)}`,
        category: 'self_learning',
        type: 'Article & Documentation',
        subscriptionStatus: 'Free',
        duration: '25 mins',
        channelOrAuthor: 'GeeksforGeeks Editorial',
        description: `In-depth technical breakdown and conceptual explanation of ${topic} with code snippets.`,
      },
      {
        title: `Complete ${topic} Deep-Dive Guide`,
        platform: 'freeCodeCamp',
        url: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(topic)}`,
        category: 'self_learning',
        type: 'Unpaid Course',
        subscriptionStatus: 'Free',
        duration: '1 hour',
        channelOrAuthor: 'freeCodeCamp Community',
        description: `Comprehensive open-source walkthrough and hands-on implementation guide.`,
      },
      {
        title: `Mastering ${topic} - Production Ready`,
        platform: 'Udemy',
        url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(topic + ' ' + role)}`,
        category: 'self_learning',
        type: 'Paid Course',
        subscriptionStatus: 'Paid',
        duration: '3.5 hours',
        channelOrAuthor: 'Industry Expert Instructor',
        description: `Professional certified deep-dive with industry real-world case studies.`,
      }
    );
  }

  // If missing mentor-based, add YouTube video lecture + mentor masterclass
  if (!hasMentorBased) {
    normalized.push(
      {
        title: `${topic} - Complete Video Masterclass`,
        platform: 'YouTube',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' ' + role + ' crash course tutorial')}`,
        category: 'mentor_based',
        type: 'YouTube Video Lecture',
        subscriptionStatus: 'Free',
        duration: '50 mins',
        channelOrAuthor: 'Curated Senior Tech Mentor',
        description: `Step-by-step whiteboard and live coding walkthrough explaining architectural trade-offs.`,
      },
      {
        title: `${topic} Interactive Guided Project & Mentorship`,
        platform: 'Coursera',
        url: `https://www.coursera.org/search?query=${encodeURIComponent(topic)}`,
        category: 'mentor_based',
        type: 'Mentor Masterclass',
        subscriptionStatus: 'Paid',
        duration: '2 hours',
        channelOrAuthor: 'Top University / Industry Partner',
        description: `Mentor-evaluated hands-on project with direct feedback and certification.`,
      }
    );
  }

  // Ensure tasks are an array of strings
  const tasks = Array.isArray(day.tasks) && day.tasks.length > 0
    ? day.tasks
    : [
        `Study foundational concepts and terminology for ${topic}`,
        `Solve 3 practical scenario problems or design exercises on ${topic}`,
        `Review common edge cases and production failure modes`,
      ];

  return {
    day: day.day,
    topic,
    tasks,
    resources: normalized,
  };
}

/**
 * Normalizes the full roadmap plan response.
 */
function normalizeRoadmapPlan(rawResponse, role = 'Software Engineer', weakAreas = []) {
  const parsed = parseJSONResponse(rawResponse);
  let plan = parsed?.plan;

  if (!Array.isArray(plan) || plan.length === 0) {
    // If AI failed or returned empty, construct 7-day plan from weak areas or default
    const topics = Array.isArray(weakAreas) && weakAreas.length > 0
      ? weakAreas
      : ['Domain Terminology & Core Mechanics', 'System Architecture & Trade-offs', 'Algorithmic Optimization', 'Production Resiliency & Edge Cases', 'API & Data Modeling', 'Mock Simulation & Delivery', 'Final Polish & Behavioral STAR'];

    plan = Array.from({ length: 7 }, (_, i) => {
      const topic = topics[i % topics.length] || `Core Competency Review Part ${i + 1}`;
      return {
        day: i + 1,
        topic,
        tasks: [
          `Master core definitions and keywords for ${topic}`,
          `Implement a reference design or solution addressing ${topic}`,
          `Review recruiter evaluation criteria and practice out-loud articulation`,
        ],
        resources: [],
      };
    });
  }

  const enrichedPlan = plan.map((day, idx) => {
    const dayObj = {
      ...day,
      day: day.day || idx + 1,
    };
    return enrichDayResources(dayObj, role);
  });

  return { plan: enrichedPlan };
}

/**
 * @param {object} params - { role, weakAreas } where weakAreas is a string array
 * @returns {Promise<{plan: Array}>}
 */
async function generateRoadmapPlan(params) {
  const { role = 'Software Engineer', weakAreas = [] } = params || {};
  const prompt = roadmapPrompt({ role, weakAreas });
  try {
    const rawResponse = await askAI(SYSTEM_PROMPT, prompt, 2000);
    return normalizeRoadmapPlan(rawResponse, role, weakAreas);
  } catch (err) {
    console.warn('AI Roadmap generation error, using normalized fallback plan:', err.message);
    return normalizeRoadmapPlan(null, role, weakAreas);
  }
}

module.exports = { generateRoadmapPlan, normalizeRoadmapPlan, normalizeResourceItem };