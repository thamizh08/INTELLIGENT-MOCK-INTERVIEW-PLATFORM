// src/services/authService.js
import apiClient from './apiClient';

export async function signupRequest(name, email, password) {
  const { data } = await apiClient.post('/auth/signup', { name, email, password });
  return data;
}

export async function loginRequest(email, password) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data;
}

export async function fetchProfile() {
  const { data } = await apiClient.get('/auth/profile');
  return data;
}
