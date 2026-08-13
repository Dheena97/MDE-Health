import { useState, useMemo } from 'react';
import { useAppState } from '../hooks/useAppState';
import { PageHeader, SearchBar, SeverityBadge, EmptyState } from '../components/common';
import { AlertTriangle, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { DeviceIssue, Severity } from '../types';

export default function ActionRequiredPage() {
  const state = useAppState();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<string>('severity');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 30;

  const allIssues = useMemo(() => {
    const issues: DeviceIssue[] = [];
    for (const device of state.mergedDevices) {
      issues.push(...device.issues);
    }
    return issues;
  }, [state.mergedDevices]);

  const categories = useMemo(() => {
    const cats = new Set(allIssues.map(i => i.category));
    return ['All', ...Array.from(cats)];
  }, [allIssues]);

  const filtered = useMemo(() => {
    let issues = allIssues;
    if (search) {
      const q = search.toLowerCase();
      issues = issues.filter(i => i.deviceName.toLowerCase().includes(q) || i.issue.toLowerCase().includes(q) || i.recommendedAction.toLowerCase().includes(q));
    }
    if (severityFilter !== 'All') issues = issues.filter(i => i.severity === severityFilter);
    if (categoryFilter !== 'All') issues = issues.filter(i => i.category === categoryFilter);

    const dir = sortDir === 'asc' ? 1 : -1;
    const sevOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3, Info: 4 };
    issues = [...issues].sort((a, b) => {
      switch (sortField) {
        case 'severity': return ((sevOrder[a.severity] ?? 5) - (sevOrder[b.severity] ?? 5)) * dir;
        case 'deviceName': return a.deviceName.localeCompare(b.deviceName) * dir;
        case 'category': return a.category.localeCompare(b.category) * dir;
        default: return 0;
      }
    });
    return issues;
  }, [allIssues, search, severityFilter, categoryFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (!state.assessmentRun) {
    return (
      <div>
        <PageHeader title="Action Required" />
        <EmptyState icon={Upload} title="No Data" description="Run an assessment first."
          action={<button onClick={() => navigate('/import')} className="btn-primary">Data Import</button>} />
      </div>
    );
  }

  if (allIssues.length === 0) {
    return (
      <div>
        <PageHeader title="Action Required" />
        <EmptyState icon={AlertTriangle} title="No Issues Found" description="All endpoints are healthy! No actions required." />
      </div>
    );
  }

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: string }) =>
    sortField === field ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null;

  return (
    <div>
      <PageHeader title="Action Required" description={`${filtered.length} issue${filtered.length !== 1 ? 's' : ''} requiring remediation`} />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {(['Critical', 'High', 'Medium', 'Low'] as const).map(sev => {
          const count = allIssues.filter(i => i.severity === sev).length;
          return (
            <div key={sev} className={`glass-card p-4 cursor-pointer ${severityFilter === sev ? 'ring-1 ring-primary-500' : ''}`}
                 onClick={() => { setSeverityFilter(severityFilter === sev ? 'All' : sev); setPage(1); }}>
              <SeverityBadge severity={sev} />
              <p className="text-2xl font-bold text-surface-100 mt-2">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6 flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search device, issue, or action..." />
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                className="select-field w-auto">
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-800/50 sticky top-0 z-10">
              <tr>
                <th className="table-header cursor-pointer" onClick={() => toggleSort('deviceName')}>
                  <div className="flex items-center gap-1">Device <SortIcon field="deviceName" /></div>
                </th>
                <th className="table-header">Issue</th>
                <th className="table-header cursor-pointer" onClick={() => toggleSort('severity')}>
                  <div className="flex items-center gap-1">Severity <SortIcon field="severity" /></div>
                </th>
                <th className="table-header cursor-pointer" onClick={() => toggleSort('category')}>
                  <div className="flex items-center gap-1">Category <SortIcon field="category" /></div>
                </th>
                <th className="table-header">Current State</th>
                <th className="table-header">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/50">
              {paged.map((issue, i) => (
                <tr key={i} className="hover:bg-surface-800/30 transition-colors">
                  <td className="table-cell font-medium text-surface-200">{issue.deviceName}</td>
                  <td className="table-cell text-sm">{issue.issue}</td>
                  <td className="table-cell"><SeverityBadge severity={issue.severity} /></td>
                  <td className="table-cell text-xs">{issue.category}</td>
                  <td className="table-cell text-xs text-surface-400">{issue.currentState}</td>
                  <td className="table-cell text-xs text-surface-400 max-w-xs">{issue.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-surface-800/50">
            <p className="text-xs text-surface-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-30">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
