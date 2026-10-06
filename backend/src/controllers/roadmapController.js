// src/controllers/roadmapController.js
// Turns a report's weakAreas into a concrete day-by-day study plan (the
// "bonus feature" from the original spec), and lets the user fetch it later.

const Report = require('../models/Report');
const Roadmap = require('../models/Roadmap');
const { generateRoadmapPlan, normalizeRoadmapPlan } = require('../services/roadmapGenerator');

// POST /api/roadmap/:reportId/generate
async function generateRoadmap(req, res, next) {
  try {
    const { reportId } = req.params;
    const { learningPreference = 'all' } = req.body || {};

    const report = await Report.findOne({ _id: reportId, user: req.user.id });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (!report.weakAreas || report.weakAreas.length === 0) {
      return res.status(400).json({ message: 'This report has no weak areas to build a roadmap from' });
    }

    const session = await report.populate('session');
    const role = session.session?.role || 'Software Engineer';

    const { plan } = await generateRoadmapPlan({
      role,
      weakAreas: report.weakAreas,
    });

    const roadmap = await Roadmap.create({
      user: req.user.id,
      sourceReport: report._id,
      learningPreference,
      plan,
      completedTasks: [],
      completedResources: [],
      status: 'active',
    });

    res.status(201).json({ roadmap });
  } catch (err) {
    next(err);
  }
}

// GET /api/roadmap/active
// Returns the user's most recent active roadmap with normalized rich structured resources.
async function getActiveRoadmap(req, res, next) {
  try {
    let roadmap = await Roadmap.findOne({ user: req.user.id, status: 'active' })
      .populate({ path: 'sourceReport', populate: { path: 'session' } })
      .sort('-createdAt');

    if (!roadmap) {
      // If no active roadmap, check for completed ones
      roadmap = await Roadmap.findOne({ user: req.user.id })
        .populate({ path: 'sourceReport', populate: { path: 'session' } })
        .sort('-createdAt');
    }

    if (!roadmap) {
      return res.status(404).json({ message: 'No active roadmap found' });
    }

    // Check if plan needs normalization (for backwards compatibility with legacy strings)
    const role = roadmap.sourceReport?.session?.role || 'Software Engineer';
    const isLegacy = roadmap.plan?.some(
      (d) => !Array.isArray(d.resources) || d.resources.some((r) => typeof r === 'string' || !r.category)
    );

    if (isLegacy) {
      const normalized = normalizeRoadmapPlan({ plan: roadmap.plan }, role, roadmap.sourceReport?.weakAreas);
      roadmap.plan = normalized.plan;
      await roadmap.save().catch(() => {}); // best effort save
    }

    res.status(200).json({ roadmap });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/roadmap/:roadmapId/progress
// Updates learning preference or marks tasks / resources as completed
async function updateRoadmapProgress(req, res, next) {
  try {
    const { roadmapId } = req.params;
    const { learningPreference, completedTasks, completedResources } = req.body || {};

    const updateFields = {};
    if (learningPreference) updateFields.learningPreference = learningPreference;
    if (Array.isArray(completedTasks)) updateFields.completedTasks = completedTasks;
    if (Array.isArray(completedResources)) updateFields.completedResources = completedResources;

    const roadmap = await Roadmap.findOneAndUpdate(
      { _id: roadmapId, user: req.user.id },
      { $set: updateFields },
      { new: true }
    );

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    res.status(200).json({ roadmap });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/roadmap/:roadmapId/complete
// Marks a roadmap as completed, e.g. once the user has worked through it -
// this is the trigger point for offering a follow-up mock interview.
async function completeRoadmap(req, res, next) {
  try {
    const { roadmapId } = req.params;

    const roadmap = await Roadmap.findOneAndUpdate(
      { _id: roadmapId, user: req.user.id },
      { status: 'completed' },
      { new: true }
    );

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    res.status(200).json({ roadmap });
  } catch (err) {
    next(err);
  }
}

module.exports = { generateRoadmap, getActiveRoadmap, updateRoadmapProgress, completeRoadmap };