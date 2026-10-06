// src/services/reportService.js
import apiClient from './apiClient';

export async function generateReport(sessionId) {
  const { data } = await apiClient.post(`/report/${sessionId}/generate`);
  return data;
}

export async function getReportBySession(sessionId) {
  const { data } = await apiClient.get(`/report/${sessionId}`);
  return data;
}

export async function getReportHistory() {
  const { data } = await apiClient.get('/report/history');
  return data;
}
