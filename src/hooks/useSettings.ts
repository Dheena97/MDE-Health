import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_SETTINGS, type AppSettings } from '../config/defaults';

const STORAGE_KEY = 'mde-dashboard-settings';

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch { /* ignore */ }
    return { ...DEFAULT_SETTINGS };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch { /* ignore */ }
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettingsState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateWeights = useCallback((weights: Partial<AppSettings['healthWeights']>) => {
    setSettingsState(prev => ({
      ...prev,
      healthWeights: { ...prev.healthWeights, ...weights },
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettingsState({ ...DEFAULT_SETTINGS });
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  const toggleDarkMode = useCallback(() => {
    setSettingsState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  return { settings, updateSettings, updateWeights, resetToDefaults, toggleDarkMode };
}
