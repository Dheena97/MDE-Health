import { useAppState } from '../hooks/useAppState';
import { PageHeader, EmptyState, SeverityBadge } from '../components/common';
import { Database, Upload, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DataQualityPage() {
  const state = useAppState();
  const navigate = useNavigate();

  if (!state.assessmentRun) {
    return (
      <div>
        <PageHeader title="Data Quality" />
        <EmptyState icon={Upload} title="No Data" description="Run an assessment first."
          action={<button onClick={() => navigate('/import')} className="btn-primary">Data Import</button>} />
      </div>
    );
  }

  if (state.dataQualityIssues.length === 0) {
    return (
      <div>
        <PageHeader title="Data Quality" />
        <EmptyState icon={Database} title="No Issues Detected" description="Data quality looks good. No issues found in the uploaded reports." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Data Quality" description={`${state.dataQualityIssues.length} issue${state.dataQualityIssues.length !== 1 ? 's' : ''} detected in uploaded data`} />

      <div className="space-y-4">
        {state.dataQualityIssues.map((issue, i) => (
          <div key={i} className={`glass-card p-5 border-l-4 ${
            issue.severity === 'Critical' ? 'border-l-red-500' :
            issue.severity === 'High' ? 'border-l-orange-500' :
            issue.severity === 'Medium' ? 'border-l-amber-500' :
            'border-l-blue-500'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                issue.severity === 'Critical' ? 'bg-red-500/10' :
                issue.severity === 'High' ? 'bg-orange-500/10' :
                issue.severity === 'Medium' ? 'bg-amber-500/10' :
                'bg-blue-500/10'
              }`}>
                {issue.severity === 'Critical' ? <AlertCircle className="w-4 h-4 text-red-400" /> :
                 issue.severity === 'High' ? <AlertTriangle className="w-4 h-4 text-orange-400" /> :
                 <Info className="w-4 h-4 text-amber-400" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <SeverityBadge severity={issue.severity} />
                  <span className="text-xs text-surface-500 uppercase tracking-wider">{issue.type.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-surface-600">{issue.count} affected</span>
                </div>
                <p className="text-sm text-surface-200 font-medium">{issue.message}</p>
                {issue.affectedDevices.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-surface-500 cursor-pointer hover:text-surface-300">
                      View affected devices ({issue.affectedDevices.length})
                    </summary>
                    <div className="mt-2 max-h-40 overflow-y-auto bg-surface-800/50 rounded-lg p-3">
                      <div className="flex flex-wrap gap-1">
                        {issue.affectedDevices.slice(0, 50).map((name, j) => (
                          <span key={j} className="text-xs bg-surface-700 text-surface-300 px-2 py-0.5 rounded">{name}</span>
                        ))}
                        {issue.affectedDevices.length > 50 && (
                          <span className="text-xs text-surface-500">...and {issue.affectedDevices.length - 50} more</span>
                        )}
                      </div>
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
