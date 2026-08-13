import { useAppState } from '../hooks/useAppState';
import { KPICard, EmptyState, PageHeader } from '../components/common';
import { HealthDonutChart, HealthGaugeChart, CategoryBarChart, ComplianceRadarChart } from '../components/charts';
import { Monitor, ShieldCheck, ShieldAlert, ShieldX, Wifi, WifiOff, Bug, Cpu, ScanLine, HardDrive, Settings, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';
import { formatNumber } from '../utils/formatUtils';

export default function DashboardPage() {
  const state = useAppState();
  const navigate = useNavigate();
  const kpi = state.kpiSummary;
  const cats = state.categoryStats;

  if (!state.assessmentRun || !kpi) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Endpoint Security Daily Health Overview" />
        <EmptyState
          icon={Upload}
          title="No Assessment Data"
          description="Upload Intune and MDE reports from the Data Import page to view the health dashboard."
          action={<button onClick={() => navigate('/import')} className="btn-primary">Go to Data Import</button>}
        />
      </div>
    );
  }

  const avgScore = state.mergedDevices.length > 0
    ? Math.round(state.mergedDevices.reduce((s, d) => s + d.healthScore, 0) / state.mergedDevices.length)
    : 0;

  // Radar data
  const radarData = cats.map(c => ({
    category: c.category,
    score: c.total > 0 ? Math.round((c.healthy / Math.max(1, c.healthy + c.warning + c.critical)) * 100) : 100,
  }));

  return (
    <div>
      <PageHeader title="Dashboard" description={`Assessment run on ${formatDate(state.assessmentDate)}`}
        actions={<button onClick={() => navigate('/import')} className="btn-secondary text-sm">New Assessment</button>}
      />

      {/* Executive Summary */}
      <div className="glass-card p-6 mb-8 border-l-4 border-l-primary-500">
        <h2 className="text-lg font-bold text-surface-100 mb-3">Daily Endpoint Security Health Summary</h2>
        <div className="space-y-1 text-sm text-surface-400">
          <p><span className="text-surface-200 font-semibold">{formatNumber(kpi.totalIntuneDevices)}</span> total endpoints reported by Intune.</p>
          <p><span className="text-surface-200 font-semibold">{formatNumber(kpi.devicesInScope)}</span> endpoints are in scope based on the selected reporting window.</p>
          <p><span className="text-emerald-400 font-semibold">{formatNumber(kpi.mdeMatched)}</span> endpoints successfully matched with MDE.</p>
          {kpi.mdeMissing > 0 && <p><span className="text-red-400 font-semibold">{formatNumber(kpi.mdeMissing)}</span> endpoints have no corresponding MDE health record.</p>}
          <p>
            <span className="text-emerald-400 font-semibold">{formatNumber(kpi.healthyDevices)}</span> healthy,{' '}
            <span className="text-amber-400 font-semibold">{formatNumber(kpi.warningDevices)}</span> require attention,{' '}
            <span className="text-red-400 font-semibold">{formatNumber(kpi.criticalDevices)}</span> critical.
          </p>
        </div>
        {kpi.criticalDevices > 0 && (
          <button onClick={() => navigate('/actions')} className="btn-danger mt-4 text-sm">
            View {kpi.criticalDevices} Critical Endpoint{kpi.criticalDevices !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
        <KPICard title="Devices In Scope" value={formatNumber(kpi.devicesInScope)} icon={Monitor} color="text-primary-400" />
        <KPICard title="MDE Matched" value={formatNumber(kpi.mdeMatched)} icon={ShieldCheck} color="text-emerald-400" />
        <KPICard title="MDE Missing" value={formatNumber(kpi.mdeMissing)} icon={WifiOff} color="text-red-400" />
        <KPICard title="Healthy" value={formatNumber(kpi.healthyDevices)} icon={ShieldCheck} color="text-emerald-400" />
        <KPICard title="Warning" value={formatNumber(kpi.warningDevices)} icon={ShieldAlert} color="text-amber-400" />
        <KPICard title="Critical" value={formatNumber(kpi.criticalDevices)} icon={ShieldX} color="text-red-400" />
      </div>

      {/* Issue KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <KPICard title="Sensor Issues" value={kpi.sensorIssues} icon={Wifi} color="text-orange-400" />
        <KPICard title="Signature Issues" value={kpi.signatureIssues} icon={Bug} color="text-purple-400" />
        <KPICard title="Platform Issues" value={kpi.platformIssues} icon={Cpu} color="text-cyan-400" />
        <KPICard title="Quick Scan Issues" value={kpi.quickScanIssues} icon={ScanLine} color="text-pink-400" />
        <KPICard title="Full Scan Issues" value={kpi.fullScanIssues} icon={HardDrive} color="text-teal-400" />
        <KPICard title="Config Issues" value={kpi.securityConfigIssues} icon={Settings} color="text-indigo-400" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-surface-300 mb-4">Overall Health Distribution</h3>
          <HealthDonutChart healthy={kpi.healthyDevices} warning={kpi.warningDevices} critical={kpi.criticalDevices} />
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-surface-300 mb-4">Average Health Score</h3>
          <HealthGaugeChart score={avgScore} />
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-surface-300 mb-4">Compliance Radar</h3>
          <ComplianceRadarChart data={radarData} />
        </div>
      </div>

      {/* Category Bar Chart */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-surface-300 mb-4">Issues by Category</h3>
        <CategoryBarChart data={cats} />
      </div>
    </div>
  );
}
