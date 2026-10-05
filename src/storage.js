// Persistence layer. Today it's localStorage; later you can swap these
// functions for fetch() calls to an API (Node + MongoDB, Supabase, etc.)
// without touching the rest of the app.
import { defaultSites } from './defaultSites.js';
import { ensureIds } from './ids.js';

const KEY = 'dynamic-site:sites';

export function loadSites() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return ensureIds(JSON.parse(saved));
  } catch {
    // Corrupted or unavailable storage: fall back to defaults.
  }
  return ensureIds(defaultSites);
}

export function saveSites(sites) {
  try {
    localStorage.setItem(KEY, JSON.stringify(sites));
  } catch {
    // Storage full or blocked: ignore for this demo.
  }
}

export function resetSites() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  return ensureIds(defaultSites);
}
