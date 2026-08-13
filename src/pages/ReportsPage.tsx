import { useAppState } from '../hooks/useAppState';
import { PageHeader, EmptyState } from '../components/common';
import { FileBarChart, Upload, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportFullReport, exportActionList } from '../services/exportService';
import { formatNumber } from '../utils/formatUtils';
import { formatDate } from '../utils/dateUtils';

export default function ReportsPage() {
  const state = useAppState();
  const navigate = useNavigate();

  if (!state.assessmentRun || !state.kpiSummary) {
    return (
      <div>
        <PageHeader title="Reports" />
        <EmptyState icon={Upload} title="No Data" description="Run an assessment first."
          action={<button onClick={() => navigate('/import')} className="btn-primary">Data Import</button>} />
      </div>
    );
  }

  const kpi = state.kpiSummary;
  const issueDevices = state.mergedDevices.filter(d => d.issues.length > 0);
  const totalIssues = state.mergedDevices.reduce((s, d) => s + d.issues.length, 0);

  return (
    <div>
      <PageHeader title="Reports" description="Export health reports and review the executive summary." />

      {/* Executive Summary */}
      <div className="glass-card p-8 mb-8">
        <h2 className="text-xl font-bold text-surface-100 mb-6 flex items-center gap-2">
          <FileBarChart className="w-6 h-6 text-primary-400" />
          Daily Endpoint Security Health Summary
        </h2>
        <div className="text-sm text-surface-300 leading-relaxed space-y-3">
          <p><span className="font-semibold text-surface-100">{formatNumber(kpi.totalIntuneDevices)}</span> endpoints were reported by Intune during the selected period.</p>
          <p><span className="font-semibold text-surface-100">{formatNumber(kpi.devicesInScope)}</span> endpoints were in scope based on the selected reporting window.</p>
          <p><span className="font-semibold text-emerald-400">{formatNumber(kpi.mdeMatched)}</span> endpoints were successfully matched with MDE.</p>
          {kpi.mdeMissing > 0 && (
            <p className="text-red-400"><span className="font-semibold">{formatNumber(kpi.mdeMissing)}</span> endpoints have no corresponding MDE health record.</p>
          )}
          <p>
            <span className="font-semibold text-emerald-400">{formatNumber(kpi.healthyDevices)}</span> endpoints are healthy.{' '}
            <span className="font-semibold text-amber-400">{formatNumber(kpi.warningDevices)}</span> endpoints require attention.{' '}
            <span className="font-semibold text-red-400">{formatNumber(kpi.criticalDevices)}</span> endpoints are critical.
          </p>
          {state.assessmentDate && (
            <p className="text-surface-500 text-xs mt-4">Assessment run: {formatDate(state.assessmentDate)}</p>
          )}
        </div>

        {/* Top Issues */}
        {totalIssues > 0 && (
          <div className="mt-6 pt-6 border-t border-surface-700/50">
            <h3 className="text-sm font-semibold text-surface-300 mb-3">Top Issues Requiring Attention</h3>
            <div className="space-y-2">
              {getTopIssues(state.mergedDevices).map((issue, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className={`w-2 h-2 rounded-full ${
                    issue.severity === 'Critical' ? 'bg-red-400' :
                    issue.severity === 'High' ? 'bg-orange-400' :
                    issue.severity === 'Medium' ? 'bg-amber-400' : 'bg-blue-400'
                  }`} />
                  <span className="text-surface-300">{issue.issue}</span>
                  <span className="text-surface-600 text-xs">({issue.count} device{issue.count !== 1 ? 's' : ''})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card-hover p-6">
          <h3 className="text-lg font-semibold text-surface-100 mb-2">Full Health Report</h3>
          <p className="text-sm text-surface-400 mb-4">
            Export all {formatNumber(state.mergedDevices.length)} devices with complete health data, scores, issues, and recommendations.
          </p>
          <div className="flex gap-3">
            <button onClick={() => exportFullReport(state.mergedDevices, 'xlsx')} className="btn-primary flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" /> Export XLSX
            </button>
            <button onClick={() => exportFullReport(state.mergedDevices, 'csv')} className="btn-secondary flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        <div className="glass-card-hover p-6">
          <h3 className="text-lg font-semibold text-surface-100 mb-2">Action List</h3>
          <p className="text-sm text-surface-400 mb-4">
            Export {formatNumber(issueDevices.length)} devices requiring remediation with {totalIssues} total issues.
          </p>
          <div className="flex gap-3">
            <button onClick={() => exportActionList(state.mergedDevices, 'xlsx')} className="btn-primary flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" /> Export XLSX
            </button>
            <button onClick={() => exportActionList(state.mergedDevices, 'csv')} className="btn-secondary flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTopIssues(devices: import('../types').MergedDevice[]): { issue: string; severity: string; count: number }[] {
  const map = new Map<string, { severity: string; count: number }>();
  for (const d of devices) {
    for (const issue of d.issues) {
      const key = issue.issue;
      const existing = map.get(key);
      if (existing) { existing.count++; }
      else { map.set(key, { severity: issue.severity, count: 1 }); }
    }
  }
  return Array.from(map.entries())
    .map(([issue, data]) => ({ issue, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}
