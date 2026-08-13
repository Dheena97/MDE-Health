// ─── Compliance Status ─────────────────────────────
export type ComplianceStatus = 'Healthy' | 'Warning' | 'Non-Compliant' | 'Critical' | 'Unknown' | 'Not Available';
export type MatchStatus = 'Matched' | 'Not Found' | 'Multiple Matches';
export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

// ─── Device Types ──────────────────────────────────
export interface IntuneDevice {
  deviceName: string;
  deviceId?: string;
  lastCheckIn?: Date | null;
  compliance?: string;
  operatingSystem?: string;
  osVersion?: string;
  primaryUser?: string;
  [key: string]: unknown;
}

export interface MdeDevice {
  deviceName: string;
  deviceId?: string;
  sensorHealthState?: string;
  antivirusSignatureVersion?: string;
  signatureUpdateDate?: Date | null;
  platformVersion?: string;
  quickScanStatus?: string;
  quickScanStartTime?: Date | null;
  quickScanEndTime?: Date | null;
  fullScanStatus?: string;
  fullScanStartTime?: Date | null;
  fullScanEndTime?: Date | null;
  sensorLastSeen?: Date | null;
  realTimeProtection?: string;
  tamperProtection?: string;
  antivirusEnabled?: string;
  edrSensor?: string;
  onboardingStatus?: string;
  deviceRisk?: string;
  osVersion?: string;
  firewallEnabled?: string;
  firewallDomainProfile?: string;
  firewallPrivateProfile?: string;
  firewallPublicProfile?: string;
  networkProtectionEnabled?: string;
  networkProtectionMode?: string;
  cloudDeliveredProtection?: string;
  automaticSampleSubmission?: string;
  asrRules?: string;
  [key: string]: unknown;
}

// ─── Merged Device ─────────────────────────────────
export interface MergedDevice {
  id: string;
  intuneDevice: IntuneDevice;
  mdeDevice: MdeDevice | null;
  matchStatus: MatchStatus;
  mdeMatches: MdeDevice[];
  healthChecks: HealthCheck[];
  healthScore: number;
  overallStatus: ComplianceStatus;
  issues: DeviceIssue[];
}

// ─── Health Check ──────────────────────────────────
export interface HealthCheck {
  category: string;
  name: string;
  status: ComplianceStatus;
  currentValue: string;
  expectedValue: string;
  details: string;
  severity: Severity;
}

// ─── Device Issue ──────────────────────────────────
export interface DeviceIssue {
  deviceName: string;
  issue: string;
  category: string;
  severity: Severity;
  currentState: string;
  expectedState: string;
  recommendedAction: string;
  detectionDate: Date;
  complianceState: ComplianceStatus;
}

// ─── Data Quality ──────────────────────────────────
export interface DataQualityIssue {
  type: 'missing_field' | 'duplicate' | 'invalid_date' | 'unknown_status' | 'malformed_version' | 'multiple_matches' | 'missing_mde' | 'missing_intune';
  severity: Severity;
  message: string;
  affectedDevices: string[];
  field?: string;
  count: number;
}

// ─── KPI Summary ───────────────────────────────────
export interface KPISummary {
  totalIntuneDevices: number;
  devicesInScope: number;
  mdeMatched: number;
  mdeMissing: number;
  healthyDevices: number;
  warningDevices: number;
  criticalDevices: number;
  sensorIssues: number;
  signatureIssues: number;
  platformIssues: number;
  quickScanIssues: number;
  fullScanIssues: number;
  securityConfigIssues: number;
}

// ─── Category Stats ────────────────────────────────
export interface CategoryStats {
  category: string;
  healthy: number;
  warning: number;
  critical: number;
  notAvailable: number;
  total: number;
}

// ─── Upload State ──────────────────────────────────
export interface FileUploadState {
  file: File | null;
  fileName: string;
  status: 'idle' | 'uploading' | 'parsed' | 'error';
  recordCount: number;
  detectedColumns: string[];
  error?: string;
}

// ─── Activity Window ───────────────────────────────
export type ActivityWindowPreset = '24h' | '7d' | '30d' | 'custom';
export interface ActivityWindow {
  preset: ActivityWindowPreset;
  startDate?: Date;
  endDate?: Date;
}

// ─── App State ─────────────────────────────────────
export interface AppState {
  intuneUpload: FileUploadState;
  mdeUpload: FileUploadState;
  intuneDevices: IntuneDevice[];
  mdeDevices: MdeDevice[];
  mergedDevices: MergedDevice[];
  activityWindow: ActivityWindow;
  kpiSummary: KPISummary | null;
  categoryStats: CategoryStats[];
  dataQualityIssues: DataQualityIssue[];
  assessmentRun: boolean;
  assessmentDate: Date | null;
  isProcessing: boolean;
}

export type AppAction =
  | { type: 'SET_INTUNE_UPLOAD'; payload: Partial<FileUploadState> }
  | { type: 'SET_MDE_UPLOAD'; payload: Partial<FileUploadState> }
  | { type: 'SET_INTUNE_DEVICES'; payload: IntuneDevice[] }
  | { type: 'SET_MDE_DEVICES'; payload: MdeDevice[] }
  | { type: 'SET_ACTIVITY_WINDOW'; payload: ActivityWindow }
  | { type: 'SET_MERGED_DEVICES'; payload: MergedDevice[] }
  | { type: 'SET_KPI_SUMMARY'; payload: KPISummary }
  | { type: 'SET_CATEGORY_STATS'; payload: CategoryStats[] }
  | { type: 'SET_DATA_QUALITY_ISSUES'; payload: DataQualityIssue[] }
  | { type: 'SET_ASSESSMENT_RUN'; payload: { date: Date } }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'RESET' };
