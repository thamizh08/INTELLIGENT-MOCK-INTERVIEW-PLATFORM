// src/context/AuthContext.jsx
// Single source of truth for "who is logged in right now", available to
// every component via the useAuth hook. Persists the JWT to localStorage
// so a page refresh doesn't log the user out.

import { createContext, useState, useEffect } from 'react';
import { loginRequest, signupRequest, fetchProfile } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // On first load, if a token exists, verify it's still valid by fetching the profile.
  useEffect(() => {
    async function loadProfile() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user: profile } = await fetchProfile();
        setUser(profile);
      } catch (err) {
        // Token expired/invalid - clear it out
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email, password) {
    const { token: newToken, user: loggedInUser } = await loginRequest(email, password);
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(loggedInUser);
  }

  async function signup(name, email, password) {
    const { token: newToken, user: newUser } = await signupRequest(name, email, password);
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
