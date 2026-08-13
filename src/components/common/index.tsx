import type { ReactNode } from 'react';
import type { ComplianceStatus, Severity } from '../../types';
import { getStatusBgColor, getSeverityBgColor } from '../../utils/formatUtils';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';

// ─── KPI Card ──────────────────────────────────────
interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function KPICard({ title, value, icon: Icon, color = 'text-primary-400', subtitle, trend, className = '' }: KPICardProps) {
  return (
    <div className={`glass-card-hover p-5 animate-slide-up ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl bg-surface-800/80 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-surface-500'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
             trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
             <Minus className="w-3 h-3" />}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-surface-100">{value}</p>
      <p className="text-xs text-surface-500 mt-1 font-medium">{title}</p>
      {subtitle && <p className="text-[10px] text-surface-600 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ─── Status Badge ──────────────────────────────────
export function StatusBadge({ status, className = '' }: { status: ComplianceStatus; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusBgColor(status)} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'Healthy' ? 'bg-emerald-400' :
        status === 'Warning' ? 'bg-amber-400' :
        status === 'Critical' || status === 'Non-Compliant' ? 'bg-red-400' :
        'bg-surface-400'
      }`} />
      {status}
    </span>
  );
}

// ─── Severity Badge ────────────────────────────────
export function SeverityBadge({ severity, className = '' }: { severity: Severity; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getSeverityBgColor(severity)} ${className}`}>
      {severity}
    </span>
  );
}

// ─── Empty State ───────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="p-4 rounded-2xl bg-surface-800/50 mb-4">
        <Icon className="w-10 h-10 text-surface-500" />
      </div>
      <h3 className="text-lg font-semibold text-surface-300 mb-2">{title}</h3>
      <p className="text-sm text-surface-500 max-w-md mb-6">{description}</p>
      {action}
    </div>
  );
}

// ─── Loading State ─────────────────────────────────
export function LoadingState({ message = 'Processing...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4" />
      <p className="text-sm text-surface-400 font-medium">{message}</p>
    </div>
  );
}

// ─── Page Header ───────────────────────────────────
export function PageHeader({ title, description, actions }: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-100">{title}</h1>
        {description && <p className="text-sm text-surface-400 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

// ─── Search Bar ────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search...' }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10 pr-4"
      />
      <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  );
}
