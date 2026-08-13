import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppStateProvider } from './hooks/useAppState';
import { useSettings } from './hooks/useSettings';
import { AppLayout } from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import EndpointsPage from './pages/EndpointsPage';
import ActionRequiredPage from './pages/ActionRequiredPage';
import DataImportPage from './pages/DataImportPage';
import DataQualityPage from './pages/DataQualityPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import { useEffect } from 'react';

function AppInner() {
  const { settings, updateSettings, updateWeights, resetToDefaults, toggleDarkMode } = useSettings();

  // Apply dark mode class to root
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
    document.documentElement.classList.toggle('light', !settings.darkMode);
  }, [settings.darkMode]);

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout darkMode={settings.darkMode} onToggleDarkMode={toggleDarkMode} />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/endpoints" element={<EndpointsPage />} />
          <Route path="/actions" element={<ActionRequiredPage />} />
          <Route path="/import" element={<DataImportPage settings={settings} />} />
          <Route path="/quality" element={<DataQualityPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={
            <SettingsPage settings={settings} updateSettings={updateSettings}
              updateWeights={updateWeights} resetToDefaults={resetToDefaults} />
          } />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <AppInner />
    </AppStateProvider>
  );
}
