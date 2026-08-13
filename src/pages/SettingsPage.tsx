import { PageHeader } from '../components/common';
import { RotateCcw, Trash2 } from 'lucide-react';
import type { AppSettings } from '../config/defaults';
import type { Severity } from '../types';

interface SettingsPageProps {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateWeights: (weights: Partial<AppSettings['healthWeights']>) => void;
  resetToDefaults: () => void;
}

export default function SettingsPage({ settings, updateSettings, updateWeights, resetToDefaults }: SettingsPageProps) {
  const clearAllData = () => {
    if (confirm('Clear all stored data including settings and column mappings?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div>
      <PageHeader title="Settings" description="Configure compliance thresholds, weights, and preferences."
        actions={
          <div className="flex gap-3">
            <button onClick={resetToDefaults} className="btn-secondary flex items-center gap-2 text-sm">
              <RotateCcw className="w-4 h-4" /> Reset to Defaults
            </button>
            <button onClick={clearAllData} className="btn-danger flex items-center gap-2 text-sm">
              <Trash2 className="w-4 h-4" /> Clear All Data
            </button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Sensor Health */}
        <SettingSection title="MDE Sensor Communication" icon="🛡️">
          <NumberSetting label="Healthy threshold (hours)" value={settings.sensorHealthyHours}
            onChange={v => updateSettings({ sensorHealthyHours: v })} min={1} max={168} presets={[12, 24, 48]} />
          <NumberSetting label="Warning threshold (hours)" value={settings.sensorWarningHours}
            onChange={v => updateSettings({ sensorWarningHours: v })} min={1} max={336} presets={[24, 48, 72]} />
          <SeveritySetting label="Severity" value={settings.sensorSeverity}
            onChange={v => updateSettings({ sensorSeverity: v })} />
        </SettingSection>

        {/* Signature Age */}
        <SettingSection title="Signature / Security Intelligence Age" icon="🦠">
          <NumberSetting label="Maximum age (days)" value={settings.signatureAgeDays}
            onChange={v => updateSettings({ signatureAgeDays: v })} min={1} max={30} presets={[1,2,3,4,5,6,7,8,9,10]} />
          <SeveritySetting label="Severity" value={settings.signatureSeverity}
            onChange={v => updateSettings({ signatureSeverity: v })} />
        </SettingSection>

        {/* Platform Version */}
        <SettingSection title="Defender Platform Version" icon="⚙️">
          <div>
            <label className="text-sm text-surface-400 mb-2 block">Version Policy</label>
            <div className="flex gap-2">
              {(['N', 'N-1', 'N-2', 'N-3'] as const).map(p => (
                <button key={p} onClick={() => updateSettings({ platformVersionPolicy: p })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          settings.platformVersionPolicy === p
                            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                            : 'bg-surface-800 text-surface-400 border border-surface-700 hover:border-surface-500'
                        }`}>{p}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-surface-400 mb-1 block">Manual latest version (optional)</label>
            <input type="text" value={settings.manualLatestPlatformVersion} placeholder="e.g., 4.18.26070.6"
              onChange={e => updateSettings({ manualLatestPlatformVersion: e.target.value })}
              className="input-field" />
          </div>
          <SeveritySetting label="Severity" value={settings.platformSeverity}
            onChange={v => updateSettings({ platformSeverity: v })} />
        </SettingSection>

        {/* Quick Scan */}
        <SettingSection title="Quick Scan Interval" icon="🔍">
          <NumberSetting label="Maximum interval (days)" value={settings.quickScanIntervalDays}
            onChange={v => updateSettings({ quickScanIntervalDays: v })} min={1} max={90} presets={[1,3,7,14,30]} />
          <SeveritySetting label="Severity" value={settings.quickScanSeverity}
            onChange={v => updateSettings({ quickScanSeverity: v })} />
        </SettingSection>

        {/* Full Scan */}
        <SettingSection title="Full Scan Interval" icon="🔬">
          <NumberSetting label="Maximum interval (days)" value={settings.fullScanIntervalDays}
            onChange={v => updateSettings({ fullScanIntervalDays: v })} min={1} max={180} presets={[7,14,30,60]} />
          <SeveritySetting label="Severity" value={settings.fullScanSeverity}
            onChange={v => updateSettings({ fullScanSeverity: v })} />
        </SettingSection>

        {/* Security Controls Severity */}
        <SettingSection title="Security Controls Severity" icon="🔐">
          <SeveritySetting label="Antivirus Enabled" value={settings.avSeverity} onChange={v => updateSettings({ avSeverity: v })} />
          <SeveritySetting label="Real-Time Protection" value={settings.rtpSeverity} onChange={v => updateSettings({ rtpSeverity: v })} />
          <SeveritySetting label="Tamper Protection" value={settings.tamperSeverity} onChange={v => updateSettings({ tamperSeverity: v })} />
          <SeveritySetting label="MDE Onboarding" value={settings.onboardingSeverity} onChange={v => updateSettings({ onboardingSeverity: v })} />
          <SeveritySetting label="Firewall" value={settings.firewallSeverity} onChange={v => updateSettings({ firewallSeverity: v })} />
          <SeveritySetting label="Network Protection" value={settings.networkProtectionSeverity} onChange={v => updateSettings({ networkProtectionSeverity: v })} />
          <SeveritySetting label="Cloud Protection" value={settings.cloudProtectionSeverity} onChange={v => updateSettings({ cloudProtectionSeverity: v })} />
          <SeveritySetting label="Sample Submission" value={settings.sampleSubmissionSeverity} onChange={v => updateSettings({ sampleSubmissionSeverity: v })} />
          <SeveritySetting label="ASR Rules" value={settings.asrSeverity} onChange={v => updateSettings({ asrSeverity: v })} />
        </SettingSection>

        {/* Health Score */}
        <SettingSection title="Health Score Configuration" icon="📊">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(settings.healthWeights).map(([key, val]) => (
              <div key={key}>
                <label className="text-xs text-surface-500 capitalize mb-1 block">{key.replace(/([A-Z])/g, ' $1')}</label>
                <input type="number" value={val as number} min={0} max={100}
                  onChange={e => updateWeights({ [key]: parseInt(e.target.value) || 0 })}
                  className="input-field text-sm" />
              </div>
            ))}
          </div>
          <p className="text-xs text-surface-500 mt-2">
            Total: {(Object.values(settings.healthWeights) as number[]).reduce((a, b) => a + b, 0)}% (should be 100%)
          </p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <NumberSetting label="Healthy threshold (%)" value={settings.healthyThreshold}
              onChange={v => updateSettings({ healthyThreshold: v })} min={0} max={100} presets={[80,85,90,95]} />
            <NumberSetting label="Warning threshold (%)" value={settings.warningThreshold}
              onChange={v => updateSettings({ warningThreshold: v })} min={0} max={100} presets={[60,65,70,75]} />
          </div>
        </SettingSection>
      </div>
    </div>
  );
}

function SettingSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-base font-semibold text-surface-100 mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function NumberSetting({ label, value, onChange, min, max, presets }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; presets?: number[];
}) {
  return (
    <div>
      <label className="text-sm text-surface-400 mb-2 block">{label}</label>
      <div className="flex items-center gap-3">
        {presets && (
          <div className="flex gap-1 flex-wrap">
            {presets.map(p => (
              <button key={p} onClick={() => onChange(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        value === p
                          ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                          : 'bg-surface-800 text-surface-500 border border-surface-700 hover:border-surface-500'
                      }`}>{p}</button>
            ))}
          </div>
        )}
        <input type="number" value={value} min={min} max={max}
          onChange={e => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
          className="input-field w-24 text-sm" />
      </div>
    </div>
  );
}

function SeveritySetting({ label, value, onChange }: { label: string; value: Severity; onChange: (v: Severity) => void }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-surface-400">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value as Severity)} className="select-field w-auto text-sm">
        <option value="Critical">Critical</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
        <option value="Info">Info</option>
      </select>
    </div>
  );
}
