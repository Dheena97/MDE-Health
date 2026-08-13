import type { Severity } from '../types';

// ─── Settings Interface ────────────────────────────
export interface AppSettings {
  // Sensor Health
  sensorHealthyHours: number;
  sensorWarningHours: number;
  sensorSeverity: Severity;

  // Signature Age
  signatureAgeDays: number;
  signatureSeverity: Severity;

  // Platform Version
  platformVersionPolicy: 'N' | 'N-1' | 'N-2' | 'N-3';
  manualLatestPlatformVersion: string;
  platformSeverity: Severity;

  // Quick Scan
  quickScanIntervalDays: number;
  quickScanSeverity: Severity;

  // Full Scan
  fullScanIntervalDays: number;
  fullScanSeverity: Severity;

  // AV / RTP
  avSeverity: Severity;
  rtpSeverity: Severity;

  // Tamper Protection
  tamperSeverity: Severity;

  // MDE Onboarding
  onboardingSeverity: Severity;

  // Firewall
  firewallSeverity: Severity;

  // Network Protection
  networkProtectionSeverity: Severity;

  // Cloud Protection
  cloudProtectionSeverity: Severity;

  // Sample Submission
  sampleSubmissionSeverity: Severity;

  // ASR
  asrSeverity: Severity;

  // Health Score Weights (must sum to 100)
  healthWeights: {
    sensor: number;
    signature: number;
    platform: number;
    quickScan: number;
    fullScan: number;
    antivirus: number;
    tamperProtection: number;
    mdeOnboarding: number;
  };

  // Health Thresholds
  healthyThreshold: number;   // score >= this = Healthy
  warningThreshold: number;   // score >= this = Warning, below = Critical

  // Theme
  darkMode: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  // Sensor Health
  sensorHealthyHours: 24,
  sensorWarningHours: 48,
  sensorSeverity: 'Critical',

  // Signature Age
  signatureAgeDays: 5,
  signatureSeverity: 'High',

  // Platform Version
  platformVersionPolicy: 'N-1',
  manualLatestPlatformVersion: '',
  platformSeverity: 'Medium',

  // Quick Scan
  quickScanIntervalDays: 7,
  quickScanSeverity: 'Medium',

  // Full Scan
  fullScanIntervalDays: 30,
  fullScanSeverity: 'Medium',

  // AV / RTP
  avSeverity: 'Critical',
  rtpSeverity: 'Critical',

  // Tamper Protection
  tamperSeverity: 'High',

  // MDE Onboarding
  onboardingSeverity: 'Critical',

  // Firewall
  firewallSeverity: 'Medium',

  // Network Protection
  networkProtectionSeverity: 'Low',

  // Cloud Protection
  cloudProtectionSeverity: 'Medium',

  // Sample Submission
  sampleSubmissionSeverity: 'Low',

  // ASR
  asrSeverity: 'Low',

  // Health Score Weights
  healthWeights: {
    sensor: 20,
    signature: 15,
    platform: 15,
    quickScan: 10,
    fullScan: 10,
    antivirus: 10,
    tamperProtection: 10,
    mdeOnboarding: 10,
  },

  // Health Thresholds
  healthyThreshold: 90,
  warningThreshold: 70,

  // Theme
  darkMode: true,
};

// ─── Recommended Actions ───────────────────────────
export const RECOMMENDED_ACTIONS: Record<string, string> = {
  sensorNotReporting: 'Check MDE sensor service (MsSense) status, verify network connectivity to Microsoft Defender for Endpoint cloud services, and restart the sensor service if needed.',
  sensorWarning: 'Investigate delayed sensor communication. Check network connectivity and verify the MDE service is running.',
  signatureOutdated: 'Update Microsoft Defender security intelligence/signatures. Verify Windows Update connectivity and check the Update Health dashboard.',
  platformOutdated: 'Update Microsoft Defender Antivirus platform through the supported Microsoft update mechanism (Windows Update, WSUS, or ConfigMgr) and verify update health.',
  quickScanOverdue: 'Run a Quick Scan on the device via Microsoft Defender Antivirus. Check scheduled scan policies in Intune/GPO.',
  quickScanFailed: 'Investigate the Quick Scan failure. Check for Defender service issues, exclusion conflicts, or disk errors.',
  fullScanOverdue: 'Run a Full Scan on the device via Microsoft Defender Antivirus. Check scheduled scan policies and ensure adequate scan windows.',
  fullScanFailed: 'Investigate the Full Scan failure. Check for Defender service issues, resource constraints, or disk errors.',
  avDisabled: 'Enable Microsoft Defender Antivirus immediately. Investigate why it was disabled and check for third-party AV conflicts.',
  rtpDisabled: 'Enable Real-Time Protection in Microsoft Defender Antivirus settings. Check Intune/GPO policy configuration.',
  tamperDisabled: 'Enable Tamper Protection through the Microsoft 365 Defender portal. This requires cloud management.',
  notOnboarded: 'Onboard the device to Microsoft Defender for Endpoint using the appropriate onboarding package for the OS.',
  mdeMissing: 'Device is active in Intune but has no corresponding MDE health data. Verify MDE sensor installation and onboarding status.',
  firewallDisabled: 'Enable Windows Defender Firewall for all profiles (Domain, Private, Public). Check Intune/GPO firewall policies.',
  networkProtectionDisabled: 'Enable Network Protection through Intune or Group Policy. Set to Block mode for maximum protection.',
  cloudProtectionDisabled: 'Enable Cloud-Delivered Protection (MAPS) in Microsoft Defender Antivirus settings.',
  sampleSubmissionDisabled: 'Configure Automatic Sample Submission in Microsoft Defender Antivirus to send safe samples automatically.',
  asrWeak: 'Review Attack Surface Reduction rules. Enable recommended rules in Block mode instead of Audit/Disabled.',
  multipleMatches: 'Multiple MDE records match this device name. Investigate duplicate device records in MDE and clean up stale entries.',
};
