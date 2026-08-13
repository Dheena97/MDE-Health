import { useState, useCallback, useRef, type ChangeEvent } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ChevronDown, Play, Clock } from 'lucide-react';
import { useAppState, useAppDispatch } from '../hooks/useAppState';
import { parseFile } from '../parsers/fileParser';
import { detectIntuneColumns, detectMdeColumns, applyMappings, saveMappings } from '../parsers/columnDetector';
import { matchDevices } from '../services/deviceMatcher';
import { runComplianceChecks, calculateKPISummary, calculateCategoryStats } from '../services/complianceEngine';
import { validateDataQuality } from '../services/dataQuality';
import { parseDate } from '../utils/dateUtils';
import { getActivityWindowDates } from '../utils/dateUtils';
import { PageHeader, LoadingState } from '../components/common';
import type { ColumnMapping } from '../types/columns';
import type { IntuneDevice, MdeDevice, ActivityWindow } from '../types';
import type { AppSettings } from '../config/defaults';

interface DataImportPageProps {
  settings: AppSettings;
}

export default function DataImportPage({ settings }: DataImportPageProps) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [intuneMappings, setIntuneMappings] = useState<ColumnMapping[]>([]);
  const [mdeMappings, setMdeMappings] = useState<ColumnMapping[]>([]);
  const [intuneHeaders, setIntuneHeaders] = useState<string[]>([]);
  const [mdeHeaders, setMdeHeaders] = useState<string[]>([]);
  const [intuneRawRows, setIntuneRawRows] = useState<Record<string, unknown>[]>([]);
  const [mdeRawRows, setMdeRawRows] = useState<Record<string, unknown>[]>([]);
  const [showIntuneMappings, setShowIntuneMappings] = useState(false);
  const [showMdeMappings, setShowMdeMappings] = useState(false);
  const [activityWindow, setActivityWindow] = useState<ActivityWindow>({ preset: '24h' });
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const intuneRef = useRef<HTMLInputElement>(null);
  const mdeRef = useRef<HTMLInputElement>(null);

  const handleIntuneUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch({ type: 'SET_INTUNE_UPLOAD', payload: { file, fileName: file.name, status: 'uploading' } });
    const result = await parseFile(file);
    if (result.error) {
      dispatch({ type: 'SET_INTUNE_UPLOAD', payload: { status: 'error', error: result.error } });
      return;
    }
    const mappings = detectIntuneColumns(result.headers);
    setIntuneMappings(mappings);
    setIntuneHeaders(result.headers);
    setIntuneRawRows(result.rows);
    dispatch({
      type: 'SET_INTUNE_UPLOAD',
      payload: { status: 'parsed', recordCount: result.rows.length, detectedColumns: result.headers },
    });
  }, [dispatch]);

  const handleMdeUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch({ type: 'SET_MDE_UPLOAD', payload: { file, fileName: file.name, status: 'uploading' } });
    const result = await parseFile(file);
    if (result.error) {
      dispatch({ type: 'SET_MDE_UPLOAD', payload: { status: 'error', error: result.error } });
      return;
    }
    const mappings = detectMdeColumns(result.headers);
    setMdeMappings(mappings);
    setMdeHeaders(result.headers);
    setMdeRawRows(result.rows);
    dispatch({
      type: 'SET_MDE_UPLOAD',
      payload: { status: 'parsed', recordCount: result.rows.length, detectedColumns: result.headers },
    });
  }, [dispatch]);

  const runAssessment = useCallback(() => {
    dispatch({ type: 'SET_PROCESSING', payload: true });

    // Use setTimeout to let the UI show loading state
    setTimeout(() => {
      try {
        // 1. Apply mappings to create typed devices
        const intuneDevices: IntuneDevice[] = intuneRawRows.map(row => {
          const mapped = applyMappings(row, intuneMappings);
          return {
            deviceName: String(mapped.deviceName || ''),
            deviceId: mapped.deviceId ? String(mapped.deviceId) : undefined,
            lastCheckIn: parseDate(mapped.lastCheckIn),
            compliance: mapped.compliance ? String(mapped.compliance) : undefined,
            operatingSystem: mapped.operatingSystem ? String(mapped.operatingSystem) : undefined,
            osVersion: mapped.osVersion ? String(mapped.osVersion) : undefined,
            primaryUser: mapped.primaryUser ? String(mapped.primaryUser) : undefined,
          };
        });

        const mdeDevices: MdeDevice[] = mdeRawRows.map(row => {
          const mapped = applyMappings(row, mdeMappings);
          return {
            deviceName: String(mapped.deviceName || ''),
            deviceId: mapped.deviceId ? String(mapped.deviceId) : undefined,
            sensorHealthState: mapped.sensorHealthState ? String(mapped.sensorHealthState) : undefined,
            antivirusSignatureVersion: mapped.antivirusSignatureVersion ? String(mapped.antivirusSignatureVersion) : undefined,
            signatureUpdateDate: parseDate(mapped.signatureUpdateDate),
            platformVersion: mapped.platformVersion ? String(mapped.platformVersion) : undefined,
            quickScanStatus: mapped.quickScanStatus ? String(mapped.quickScanStatus) : undefined,
            quickScanStartTime: parseDate(mapped.quickScanStartTime),
            quickScanEndTime: parseDate(mapped.quickScanEndTime),
            fullScanStatus: mapped.fullScanStatus ? String(mapped.fullScanStatus) : undefined,
            fullScanStartTime: parseDate(mapped.fullScanStartTime),
            fullScanEndTime: parseDate(mapped.fullScanEndTime),
            sensorLastSeen: parseDate(mapped.sensorLastSeen),
            realTimeProtection: mapped.realTimeProtection ? String(mapped.realTimeProtection) : undefined,
            tamperProtection: mapped.tamperProtection ? String(mapped.tamperProtection) : undefined,
            antivirusEnabled: mapped.antivirusEnabled ? String(mapped.antivirusEnabled) : undefined,
            edrSensor: mapped.edrSensor ? String(mapped.edrSensor) : undefined,
            onboardingStatus: mapped.onboardingStatus ? String(mapped.onboardingStatus) : undefined,
            deviceRisk: mapped.deviceRisk ? String(mapped.deviceRisk) : undefined,
            osVersion: mapped.osVersion ? String(mapped.osVersion) : undefined,
            firewallEnabled: mapped.firewallEnabled ? String(mapped.firewallEnabled) : undefined,
            firewallDomainProfile: mapped.firewallDomainProfile ? String(mapped.firewallDomainProfile) : undefined,
            firewallPrivateProfile: mapped.firewallPrivateProfile ? String(mapped.firewallPrivateProfile) : undefined,
            firewallPublicProfile: mapped.firewallPublicProfile ? String(mapped.firewallPublicProfile) : undefined,
            networkProtectionEnabled: mapped.networkProtectionEnabled ? String(mapped.networkProtectionEnabled) : undefined,
            networkProtectionMode: mapped.networkProtectionMode ? String(mapped.networkProtectionMode) : undefined,
            cloudDeliveredProtection: mapped.cloudDeliveredProtection ? String(mapped.cloudDeliveredProtection) : undefined,
            automaticSampleSubmission: mapped.automaticSampleSubmission ? String(mapped.automaticSampleSubmission) : undefined,
            asrRules: mapped.asrRules ? String(mapped.asrRules) : undefined,
          };
        });

        // 2. Filter Intune devices by activity window
        const { start, end } = getActivityWindowDates(
          activityWindow.preset,
          customStart ? new Date(customStart) : undefined,
          customEnd ? new Date(customEnd) : undefined
        );
        const inScopeDevices = intuneDevices.filter(d => {
          if (!d.lastCheckIn) return true; // Include devices without dates to avoid silent drops
          return d.lastCheckIn >= start && d.lastCheckIn <= end;
        });

        // 3. Match devices
        const matchResult = matchDevices(inScopeDevices, mdeDevices);

        // 4. Run compliance checks
        const checkedDevices = runComplianceChecks(matchResult.mergedDevices, mdeDevices, settings);

        // 5. Calculate KPIs
        const kpi = calculateKPISummary(checkedDevices, intuneDevices.length);
        const catStats = calculateCategoryStats(checkedDevices);

        // 6. Data quality
        const qualityIssues = validateDataQuality(intuneDevices, mdeDevices, checkedDevices);

        // Save mappings
        saveMappings('intune', intuneMappings);
        saveMappings('mde', mdeMappings);

        // Dispatch results
        dispatch({ type: 'SET_INTUNE_DEVICES', payload: intuneDevices });
        dispatch({ type: 'SET_MDE_DEVICES', payload: mdeDevices });
        dispatch({ type: 'SET_MERGED_DEVICES', payload: checkedDevices });
        dispatch({ type: 'SET_KPI_SUMMARY', payload: kpi });
        dispatch({ type: 'SET_CATEGORY_STATS', payload: catStats });
        dispatch({ type: 'SET_DATA_QUALITY_ISSUES', payload: qualityIssues });
        dispatch({ type: 'SET_ACTIVITY_WINDOW', payload: activityWindow });
        dispatch({ type: 'SET_ASSESSMENT_RUN', payload: { date: new Date() } });
      } catch (err) {
        console.error('Assessment error:', err);
      } finally {
        dispatch({ type: 'SET_PROCESSING', payload: false });
      }
    }, 100);
  }, [intuneRawRows, mdeRawRows, intuneMappings, mdeMappings, activityWindow, customStart, customEnd, settings, dispatch]);

  const canRun = state.intuneUpload.status === 'parsed' && state.mdeUpload.status === 'parsed';

  if (state.isProcessing) {
    return <LoadingState message="Running health assessment... Analyzing all endpoints." />;
  }

  return (
    <div>
      <PageHeader title="Data Import" description="Upload Intune and MDE reports to run a health assessment." />

      {/* Privacy notice */}
      <div className="glass-card p-4 mb-6 flex items-center gap-3 border-primary-500/20">
        <div className="p-2 rounded-lg bg-primary-500/10">
          <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <p className="text-xs text-surface-400">All data is processed locally in your browser. No files are uploaded to any external service.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Intune Upload */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary-400" />
            Intune Device Export
          </h3>
          <UploadZone
            status={state.intuneUpload.status}
            fileName={state.intuneUpload.fileName}
            recordCount={state.intuneUpload.recordCount}
            error={state.intuneUpload.error}
            columns={state.intuneUpload.detectedColumns}
            inputRef={intuneRef}
            onChange={handleIntuneUpload}
            mappings={intuneMappings}
            onMappingsChange={setIntuneMappings}
            headers={intuneHeaders}
            showMappings={showIntuneMappings}
            onToggleMappings={() => setShowIntuneMappings(!showIntuneMappings)}
            mappingType="intune"
          />
        </div>

        {/* MDE Upload */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            MDE Health Report
          </h3>
          <UploadZone
            status={state.mdeUpload.status}
            fileName={state.mdeUpload.fileName}
            recordCount={state.mdeUpload.recordCount}
            error={state.mdeUpload.error}
            columns={state.mdeUpload.detectedColumns}
            inputRef={mdeRef}
            onChange={handleMdeUpload}
            mappings={mdeMappings}
            onMappingsChange={setMdeMappings}
            headers={mdeHeaders}
            showMappings={showMdeMappings}
            onToggleMappings={() => setShowMdeMappings(!showMdeMappings)}
            mappingType="mde"
          />
        </div>
      </div>

      {/* Activity Window Selector */}
      <div className="glass-card p-6 mb-8">
        <h3 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          Devices Reported In
        </h3>
        <div className="flex flex-wrap gap-3 mb-4">
          {(['24h', '7d', '30d', 'custom'] as const).map(preset => (
            <button key={preset}
                    onClick={() => setActivityWindow({ ...activityWindow, preset })}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activityWindow.preset === preset
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                        : 'bg-surface-800 text-surface-400 border border-surface-700 hover:border-surface-500'
                    }`}>
              {preset === '24h' ? 'Last 24 Hours' : preset === '7d' ? 'Last 7 Days' : preset === '30d' ? 'Last 30 Days' : 'Custom'}
            </button>
          ))}
        </div>
        {activityWindow.preset === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-xs text-surface-500 font-medium mb-1 block">Start Date/Time</label>
              <input type="datetime-local" value={customStart} onChange={e => setCustomStart(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-surface-500 font-medium mb-1 block">End Date/Time</label>
              <input type="datetime-local" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="input-field" />
            </div>
          </div>
        )}
      </div>

      {/* Run Assessment */}
      <div className="flex justify-center">
        <button onClick={runAssessment} disabled={!canRun} className="btn-primary flex items-center gap-2 text-lg px-10 py-4">
          <Play className="w-5 h-5" />
          Run Health Assessment
        </button>
      </div>

      {!canRun && (
        <p className="text-center text-sm text-surface-500 mt-4">
          Upload both Intune and MDE reports to enable the assessment.
        </p>
      )}

      {state.assessmentRun && state.kpiSummary && (
        <div className="glass-card p-6 mt-8 border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-emerald-400">Assessment Complete</h3>
          </div>
          <p className="text-sm text-surface-400">
            {state.kpiSummary.devicesInScope} devices in scope.{' '}
            {state.kpiSummary.mdeMatched} matched with MDE.{' '}
            {state.kpiSummary.mdeMissing} missing from MDE.{' '}
            {state.kpiSummary.healthyDevices} healthy, {state.kpiSummary.warningDevices} warnings, {state.kpiSummary.criticalDevices} critical.
          </p>
          <p className="text-xs text-surface-600 mt-2">Navigate to Dashboard or Endpoints to view detailed results.</p>
        </div>
      )}
    </div>
  );
}

// ─── Upload Zone Component ─────────────────────────
function UploadZone({ status, fileName, recordCount, error, columns, inputRef, onChange, mappings, onMappingsChange, headers, showMappings, onToggleMappings, mappingType }: {
  status: string; fileName: string; recordCount: number; error?: string; columns: string[];
  inputRef: React.RefObject<HTMLInputElement | null>; onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  mappings: ColumnMapping[]; onMappingsChange: (m: ColumnMapping[]) => void;
  headers: string[]; showMappings: boolean; onToggleMappings: () => void;
  mappingType: 'intune' | 'mde';
}) {
  return (
    <div>
      {status === 'idle' && (
        <div onClick={() => inputRef.current?.click()}
             className="border-2 border-dashed border-surface-600 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500/50 transition-colors">
          <Upload className="w-8 h-8 text-surface-500 mx-auto mb-3" />
          <p className="text-sm text-surface-400">Click to upload or drag & drop</p>
          <p className="text-xs text-surface-600 mt-1">.xlsx or .csv</p>
        </div>
      )}

      {status === 'uploading' && <LoadingState message="Parsing file..." />}

      {status === 'error' && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-sm font-medium text-red-400">Upload Error</p>
          </div>
          <p className="text-xs text-red-400/80">{error}</p>
          <button onClick={() => inputRef.current?.click()} className="btn-secondary mt-3 text-xs py-1.5 px-3">Try Again</button>
        </div>
      )}

      {status === 'parsed' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-400 truncate">{fileName}</p>
              <p className="text-xs text-surface-400">{recordCount.toLocaleString()} records • {columns.length} columns</p>
            </div>
            <button onClick={() => inputRef.current?.click()} className="text-xs text-surface-400 hover:text-surface-200">Replace</button>
          </div>

          {/* Column mappings toggle */}
          <button onClick={onToggleMappings}
                  className="flex items-center gap-2 text-xs text-surface-400 hover:text-surface-200 transition-colors">
            <ChevronDown className={`w-3 h-3 transition-transform ${showMappings ? 'rotate-180' : ''}`} />
            {mappings.length} columns mapped • Click to {showMappings ? 'hide' : 'view/edit'}
          </button>

          {showMappings && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {mappings.map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-surface-500 w-1/3 truncate">{m.sourceColumn}</span>
                  <span className="text-primary-400">→</span>
                  <span className="text-surface-300 font-medium">{m.targetField}</span>
                  <span className={`ml-auto text-[10px] ${m.confidence >= 0.9 ? 'text-emerald-500' : m.confidence >= 0.6 ? 'text-amber-500' : 'text-red-500'}`}>
                    {Math.round(m.confidence * 100)}%
                  </span>
                </div>
              ))}
              {/* Unmapped columns */}
              {headers.filter(h => !mappings.find(m => m.sourceColumn === h)).map(h => (
                <div key={h} className="flex items-center gap-2 text-xs text-surface-600">
                  <span className="w-1/3 truncate">{h}</span>
                  <span>→</span>
                  <select className="bg-surface-800 border border-surface-700 rounded px-2 py-1 text-xs text-surface-400"
                          onChange={e => {
                            if (e.target.value) {
                              onMappingsChange([...mappings, { sourceColumn: h, targetField: e.target.value, confidence: 1, isManual: true }]);
                            }
                          }}>
                    <option value="">Not mapped</option>
                    {(mappingType === 'intune'
                      ? ['deviceName','deviceId','lastCheckIn','compliance','operatingSystem','osVersion','primaryUser']
                      : ['deviceName','deviceId','sensorHealthState','antivirusSignatureVersion','signatureUpdateDate','platformVersion',
                         'quickScanStatus','quickScanStartTime','quickScanEndTime','fullScanStatus','fullScanStartTime','fullScanEndTime',
                         'sensorLastSeen','realTimeProtection','tamperProtection','antivirusEnabled','edrSensor','onboardingStatus',
                         'deviceRisk','osVersion','firewallEnabled','networkProtectionEnabled','cloudDeliveredProtection',
                         'automaticSampleSubmission','asrRules']
                    ).filter(f => !mappings.find(m => m.targetField === f)).map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" onChange={onChange} className="hidden" />
    </div>
  );
}
