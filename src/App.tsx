import { Component, lazy, Suspense, type ErrorInfo, type ReactNode, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppStateProvider } from './hooks/useAppState';
import { useSettings } from './hooks/useSettings';
import { AppLayout } from './components/layout/AppLayout';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const EndpointsPage = lazy(() => import('./pages/EndpointsPage'));
const ActionRequiredPage = lazy(() => import('./pages/ActionRequiredPage'));
const DataImportPage = lazy(() => import('./pages/DataImportPage'));
const DataQualityPage = lazy(() => import('./pages/DataQualityPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

class PageErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) {}
  render() {
    if (this.state.hasError) {
      return <div className="min-h-screen gradient-bg flex items-center justify-center p-6 text-slate-100"><div className="max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl"><h1 className="text-xl font-semibold">Dashboard could not load</h1><p className="mt-2 text-sm text-slate-300">Please refresh the page. Your imported data remains safely stored in this browser.</p></div></div>;
    }
    return this.props.children;
  }
}

function LoadingPage() { return <div className="min-h-screen gradient-bg" />; }

function AppInner() {
  const { settings, updateSettings, updateWeights, resetToDefaults, toggleDarkMode } = useSettings();
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
    document.documentElement.classList.toggle('light', !settings.darkMode);
  }, [settings.darkMode]);
  return <HashRouter><Suspense fallback={<LoadingPage />}><Routes><Route element={<AppLayout darkMode={settings.darkMode} onToggleDarkMode={toggleDarkMode} />}><Route path="/" element={<DashboardPage />} /><Route path="/endpoints" element={<EndpointsPage />} /><Route path="/actions" element={<ActionRequiredPage />} /><Route path="/import" element={<DataImportPage settings={settings} />} /><Route path="/quality" element={<DataQualityPage />} /><Route path="/reports" element={<ReportsPage />} /><Route path="/settings" element={<SettingsPage settings={settings} updateSettings={updateSettings} updateWeights={updateWeights} resetToDefaults={resetToDefaults} />} /></Route></Routes></Suspense></HashRouter>;
}

export default function App() {
  return <PageErrorBoundary><AppStateProvider><AppInner /></AppStateProvider></PageErrorBoundary>;
}
