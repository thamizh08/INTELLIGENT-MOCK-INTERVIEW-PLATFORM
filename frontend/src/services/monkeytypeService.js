// src/services/monkeytypeService.js
// Fetches live status from the Monkeytype instatus API and provides a React hook.

import { useState, useEffect, useCallback } from 'react';

const MONKEYTYPE_STATUS_URL = 'https://monkeytype.instatus.com/v3/summary.json';

/**
 * Fetch current Monkeytype service status.
 * Returns { name, url, status } on success or throws on failure.
 */
export async function fetchMonkeytypeStatus() {
  const response = await fetch(MONKEYTYPE_STATUS_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Monkeytype status API returned ${response.status}`);
  }

  const data = await response.json();

  if (!data?.page) {
    throw new Error('Unexpected API response structure');
  }

  return {
    name: data.page.name || 'Monkeytype',
    url: data.page.url || 'https://monkeytype.com',
    status: data.page.status || 'UNKNOWN',
  };
}

/**
 * React hook that polls Monkeytype status on mount and every `intervalMs`.
 * @param {number} intervalMs — polling interval (default 60 000 ms = 1 min)
 */
export function useMonkeytypeStatus(intervalMs = 60_000) {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMonkeytypeStatus();
      setStatusData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  return { statusData, loading, error, refresh };
}
