import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function AppLayout({ darkMode, onToggleDarkMode }: AppLayoutProps) {
  return (
    <div className={`min-h-screen gradient-bg ${darkMode ? 'dark' : 'light'}`}>
      <Sidebar darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8 max-w-[1800px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
