/**
 * Provisional session adapter.
 * All session logic is isolated here so it can be replaced
 * (e.g. with cryptographic tokens) without touching page components.
 */

const LS_KEY = "gr_session";
const SS_KEY = "gr_session";

export interface SessionData {
  panel_user_id: string;
  profile_id: string;
  username: string;
  role: string;
}

export function saveSession(data: SessionData, remember: boolean): void {
  const json = JSON.stringify(data);
  if (remember) {
    localStorage.setItem(LS_KEY, json);
    // Clean sessionStorage to avoid stale duplicates
    sessionStorage.removeItem(SS_KEY);
  } else {
    sessionStorage.setItem(SS_KEY, json);
    localStorage.removeItem(LS_KEY);
  }
}

export function getSession(): SessionData | null {
  // localStorage takes priority (remember me)
  const ls = localStorage.getItem(LS_KEY);
  if (ls) {
    try { return JSON.parse(ls); } catch { localStorage.removeItem(LS_KEY); }
  }
  const ss = sessionStorage.getItem(SS_KEY);
  if (ss) {
    try { return JSON.parse(ss); } catch { sessionStorage.removeItem(SS_KEY); }
  }
  return null;
}

export function clearSession(): void {
  localStorage.removeItem(LS_KEY);
  sessionStorage.removeItem(SS_KEY);
  // Clean legacy keys
  localStorage.removeItem("gr_access_key");
  localStorage.removeItem("gr_panel_activated");
}

export function getProfileId(): string | null {
  return getSession()?.profile_id ?? null;
}
