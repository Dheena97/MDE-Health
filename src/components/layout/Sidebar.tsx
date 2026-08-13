import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Monitor, AlertTriangle, Upload, Database,
  FileBarChart, Settings, Shield, Sun, Moon, X, Menu
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/endpoints', icon: Monitor, label: 'Endpoints' },
  { to: '/actions', icon: AlertTriangle, label: 'Action Required' },
  { to: '/import', icon: Upload, label: 'Data Import' },
  { to: '/quality', icon: Database, label: 'Data Quality' },
  { to: '/reports', icon: FileBarChart, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Sidebar({ darkMode, onToggleDarkMode }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      <div className={`fixed inset-0 bg-black/60 z-40 lg:hidden ${collapsed ? 'hidden' : ''}`}
           onClick={() => setCollapsed(true)} />

      <aside className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'} bg-surface-900/95 backdrop-blur-xl border-r border-surface-700/50`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-700/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-sm font-bold gradient-text">MDE Health</h1>
              <p className="text-[10px] text-surface-500 font-medium">Endpoint Security</p>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
                  className="ml-auto p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors">
            {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
                     className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-surface-700/50 space-y-2">
          <button onClick={onToggleDarkMode}
                  className="nav-link w-full justify-center">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {!collapsed && <span className="text-sm">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          {!collapsed && (
            <div className="px-2 py-2">
              <p className="text-[10px] text-surface-600 text-center">
                🔒 All data processed locally
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
