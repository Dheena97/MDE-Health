import { useState, useMemo } from 'react';
import { useAppState } from '../hooks/useAppState';
import { PageHeader, SearchBar, StatusBadge, EmptyState } from '../components/common';
import { Upload, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';
import type { MergedDevice, ComplianceStatus } from '../types';

export default function EndpointsPage() {
  const state = useAppState();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus | 'All'>('All');
  const [matchFilter, setMatchFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<string>('overallStatus');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState<MergedDevice | null>(null);
  const pageSize = 25;

  const filtered = useMemo(() => {
    let devices = state.mergedDevices;

    if (search) {
      const q = search.toLowerCase();
      devices = devices.filter(d =>
        d.intuneDevice.deviceName?.toLowerCase().includes(q) ||
        d.intuneDevice.primaryUser?.toLowerCase().includes(q) ||
        d.mdeDevice?.deviceName?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'All') {
      devices = devices.filter(d => d.overallStatus === statusFilter);
    }

    if (matchFilter !== 'All') {
      devices = devices.filter(d => d.matchStatus === matchFilter);
    }

    // Sort
    const dir = sortDir === 'asc' ? 1 : -1;
    devices = [...devices].sort((a, b) => {
      switch (sortField) {
        case 'deviceName': return (a.intuneDevice.deviceName || '').localeCompare(b.intuneDevice.deviceName || '') * dir;
        case 'overallStatus': {
          const order: Record<string, number> = { 'Critical': 0, 'Non-Compliant': 1, 'Warning': 2, 'Unknown': 3, 'Not Available': 4, 'Healthy': 5 };
          return ((order[a.overallStatus] ?? 3) - (order[b.overallStatus] ?? 3)) * dir;
        }
        case 'healthScore': return (a.healthScore - b.healthScore) * dir;
        case 'matchStatus': return a.matchStatus.localeCompare(b.matchStatus) * dir;
        default: return 0;
      }
    });

    return devices;
  }, [state.mergedDevices, search, statusFilter, matchFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (!state.assessmentRun) {
    return (
      <div>
        <PageHeader title="Endpoints" />
        <EmptyState icon={Upload} title="No Data" description="Run an assessment from Data Import first."
          action={<button onClick={() => navigate('/import')} className="btn-primary">Data Import</button>} />
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
      <PageHeader title="Endpoints" description={`${filtered.length} of ${state.mergedDevices.length} devices`} />

      {/* Filters */}
      <div className="glass-card p-4 mb-6 flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search device or user..." />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); setPage(1); }}
                className="select-field w-auto">
          <option value="All">All Status</option>
          <option value="Healthy">Healthy</option>
          <option value="Warning">Warning</option>
          <option value="Critical">Critical</option>
          <option value="Non-Compliant">Non-Compliant</option>
          <option value="Unknown">Unknown</option>
        </select>
        <select value={matchFilter} onChange={e => { setMatchFilter(e.target.value); setPage(1); }}
                className="select-field w-auto">
          <option value="All">All Match</option>
          <option value="Matched">Matched</option>
          <option value="Not Found">Not Found</option>
          <option value="Multiple Matches">Multiple Matches</option>
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
                <th className="table-header">User</th>
                <th className="table-header">OS</th>
                <th className="table-header cursor-pointer" onClick={() => toggleSort('matchStatus')}>
                  <div className="flex items-center gap-1">MDE Match <SortIcon field="matchStatus" /></div>
                </th>
                <th className="table-header cursor-pointer" onClick={() => toggleSort('overallStatus')}>
                  <div className="flex items-center gap-1">Health <SortIcon field="overallStatus" /></div>
                </th>
                <th className="table-header cursor-pointer" onClick={() => toggleSort('healthScore')}>
                  <div className="flex items-center gap-1">Score <SortIcon field="healthScore" /></div>
                </th>
                <th className="table-header">Intune Last Seen</th>
                <th className="table-header">MDE Last Seen</th>
                <th className="table-header">Issues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/50">
              {paged.map(device => (
                <tr key={device.id}
                    className="hover:bg-surface-800/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedDevice(device)}>
                  <td className="table-cell font-medium text-surface-200">{device.intuneDevice.deviceName || '—'}</td>
                  <td className="table-cell">{device.intuneDevice.primaryUser || '—'}</td>
                  <td className="table-cell text-xs">{device.intuneDevice.operatingSystem || '—'}</td>
                  <td className="table-cell">
                    <span className={`text-xs font-medium ${
                      device.matchStatus === 'Matched' ? 'text-emerald-400' :
                      device.matchStatus === 'Not Found' ? 'text-red-400' : 'text-amber-400'
                    }`}>{device.matchStatus}</span>
                  </td>
                  <td className="table-cell"><StatusBadge status={device.overallStatus} /></td>
                  <td className="table-cell">
                    <span className={`font-mono text-sm font-bold ${
                      device.healthScore >= 90 ? 'text-emerald-400' :
                      device.healthScore >= 70 ? 'text-amber-400' : 'text-red-400'
                    }`}>{device.healthScore}%</span>
                  </td>
                  <td className="table-cell text-xs">{formatDate(device.intuneDevice.lastCheckIn)}</td>
                  <td className="table-cell text-xs">{device.mdeDevice?.sensorLastSeen ? formatDate(device.mdeDevice.sensorLastSeen) : '—'}</td>
                  <td className="table-cell">
                    {device.issues.length > 0 && (
                      <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                        {device.issues.length}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-surface-800/50">
            <p className="text-xs text-surface-500">Page {page} of {totalPages} ({filtered.length} devices)</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-30">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Device Detail Slide-over */}
      {selectedDevice && (
        <DeviceDetailPanel device={selectedDevice} onClose={() => setSelectedDevice(null)} />
      )}
    </div>
  );
}

// ─── Device Detail Panel ───────────────────────────
function DeviceDetailPanel({ device, onClose }: { device: MergedDevice; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-surface-900 border-l border-surface-700 overflow-y-auto animate-slide-in-left">
        <div className="sticky top-0 bg-surface-900/95 backdrop-blur-xl p-6 border-b border-surface-700/50 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-surface-100">{device.intuneDevice.deviceName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={device.overallStatus} />
              <span className={`text-sm font-mono font-bold ${
                device.healthScore >= 90 ? 'text-emerald-400' : device.healthScore >= 70 ? 'text-amber-400' : 'text-red-400'
              }`}>{device.healthScore}%</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-800 text-surface-400"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Device Info */}
          <Section title="Device Information">
            <InfoRow label="Device Name" value={device.intuneDevice.deviceName} />
            <InfoRow label="Device ID" value={device.intuneDevice.deviceId} />
            <InfoRow label="OS" value={device.intuneDevice.operatingSystem} />
            <InfoRow label="OS Version" value={device.intuneDevice.osVersion} />
            <InfoRow label="Primary User" value={device.intuneDevice.primaryUser} />
            <InfoRow label="Intune Last Check-in" value={formatDate(device.intuneDevice.lastCheckIn)} />
            <InfoRow label="MDE Match" value={device.matchStatus} />
            {device.mdeDevice && <InfoRow label="MDE Last Seen" value={formatDate(device.mdeDevice.sensorLastSeen)} />}
          </Section>

          {/* Health Checks */}
          <Section title="Health Checks">
            {device.healthChecks.map((check, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-surface-800/50 last:border-0">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  check.status === 'Healthy' ? 'bg-emerald-400' :
                  check.status === 'Warning' ? 'bg-amber-400' :
                  check.status === 'Critical' || check.status === 'Non-Compliant' ? 'bg-red-400' :
                  'bg-surface-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-surface-200">{check.name}</p>
                    <StatusBadge status={check.status} className="text-[10px]" />
                  </div>
                  <p className="text-xs text-surface-500 mt-0.5">{check.currentValue}</p>
                  {check.status !== 'Healthy' && check.status !== 'Not Available' && (
                    <p className="text-xs text-surface-600 mt-1">Expected: {check.expectedValue}</p>
                  )}
                </div>
              </div>
            ))}
          </Section>

          {/* Issues & Actions */}
          {device.issues.length > 0 && (
            <Section title="Recommended Actions">
              {device.issues.map((issue, i) => (
                <div key={i} className="p-3 rounded-xl bg-surface-800/50 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      issue.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                      issue.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                      issue.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>{issue.severity}</span>
                    <span className="text-sm font-medium text-surface-200">{issue.issue}</span>
                  </div>
                  <p className="text-xs text-surface-400">{issue.recommendedAction}</p>
                </div>
              ))}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-0">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between py-1.5 text-sm border-b border-surface-800/30">
      <span className="text-surface-500">{label}</span>
      <span className="text-surface-200 font-medium">{value || '—'}</span>
    </div>
  );
}
