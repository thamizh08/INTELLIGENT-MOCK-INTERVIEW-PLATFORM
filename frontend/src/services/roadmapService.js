// src/services/roadmapService.js
import apiClient from './apiClient';

export async function generateRoadmap(reportId, learningPreference = 'all') {
  const { data } = await apiClient.post(`/roadmap/${reportId}/generate`, { learningPreference });
  return data;
}

export async function getActiveRoadmap() {
  const { data } = await apiClient.get('/roadmap/active');
  return data;
}

export async function updateRoadmapProgress(roadmapId, progressData) {
  const { data } = await apiClient.patch(`/roadmap/${roadmapId}/progress`, progressData);
  return data;
}

export async function completeRoadmap(roadmapId) {
  const { data } = await apiClient.patch(`/roadmap/${roadmapId}/complete`);
  return data;
}

