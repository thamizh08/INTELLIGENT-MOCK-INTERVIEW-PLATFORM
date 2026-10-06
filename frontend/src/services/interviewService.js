// src/services/interviewService.js
import apiClient from './apiClient';

export async function startInterview({ role, experienceLevel, round }) {
  const { data } = await apiClient.post('/interview/start', { role, experienceLevel, round });
  return data;
}

export async function submitAnswer(sessionId, { questionId, answerText }) {
  const { data } = await apiClient.post(`/interview/${sessionId}/answer`, { questionId, answerText });
  return data;
}

export async function completeInterview(sessionId) {
  const { data } = await apiClient.post(`/interview/${sessionId}/complete`);
  return data;
}

export async function getSession(sessionId) {
  const { data } = await apiClient.get(`/interview/${sessionId}`);
  return data;
}
