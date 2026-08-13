/**
 * Compliance engine: orchestrates all rule checks for each device.
 */
import type { MergedDevice, MdeDevice, HealthCheck, DeviceIssue, KPISummary, CategoryStats } from '../types';
import type { AppSettings } from '../config/defaults';
import { RECOMMENDED_ACTIONS } from '../config/defaults';
import { checkSensorHealth } from '../rules/sensorHealth';
import { checkSignatureAge } from '../rules/signatureAge';
import { checkPlatformVersion, extractPlatformVersions } from '../rules/platformVersion';
import { checkQuickScan } from '../rules/quickScan';
import { checkFullScan } from '../rules/fullScan';
import { checkAntivirus, checkRealTimeProtection } from '../rules/antivirus';
import { checkTamperProtection } from '../rules/tamperProtection';
import { checkFirewall } from '../rules/firewall';
import { checkNetworkProtection } from '../rules/networkProtection';
import { checkCloudProtection } from '../rules/cloudProtection';
import { checkSampleSubmission } from '../rules/sampleSubmission';
import { checkAttackSurfaceReduction } from '../rules/attackSurfaceReduction';
import { calculateHealthScore } from '../rules/healthScore';

import type { ParsedVersion } from '../utils/versionUtils';

/**
 * Run all compliance checks on merged devices.
 */
export function runComplianceChecks(
  mergedDevices: MergedDevice[],
  mdeDevices: MdeDevice[],
  settings: AppSettings
): MergedDevice[] {
  const now = new Date();
  const allPlatformVersions = extractPlatformVersions(mdeDevices);

  return mergedDevices.map(device => {
    const checks = runDeviceChecks(device, allPlatformVersions, settings, now);
    const scoreResult = calculateHealthScore(checks, settings);
    const issues = generateIssues(device, checks);

    return {
      ...device,
      healthChecks: checks,
      healthScore: scoreResult.score,
      overallStatus: scoreResult.status,
      issues,
    };
  });
}

function runDeviceChecks(
  device: MergedDevice,
  allPlatformVersions: ParsedVersion[],
  settings: AppSettings,
  now: Date
): HealthCheck[] {
  const mde = device.mdeDevice;
  const checks: HealthCheck[] = [];

  // 1. Sensor Health
  checks.push(checkSensorHealth(mde, settings.sensorHealthyHours, settings.sensorWarningHours, settings.sensorSeverity, now));

  // 2. Signature Age
  checks.push(checkSignatureAge(mde, settings.signatureAgeDays, settings.signatureSeverity, now));

  // 3. Platform Version
  checks.push(checkPlatformVersion(mde, allPlatformVersions, settings.platformVersionPolicy, settings.platformSeverity, settings.manualLatestPlatformVersion || undefined));

  // 4. Quick Scan
  checks.push(checkQuickScan(mde, settings.quickScanIntervalDays, settings.quickScanSeverity, now));

  // 5. Full Scan
  checks.push(checkFullScan(mde, settings.fullScanIntervalDays, settings.fullScanSeverity, now));

  // 6. Antivirus
  checks.push(checkAntivirus(mde, settings.avSeverity));

  // 7. Real-Time Protection
  checks.push(checkRealTimeProtection(mde, settings.rtpSeverity));

  // 8. Tamper Protection
  checks.push(checkTamperProtection(mde, settings.tamperSeverity));

  // 9. MDE Onboarding
  checks.push(checkOnboarding(mde, settings.onboardingSeverity));

  // 10. Firewall
  const firewallChecks = checkFirewall(mde, settings.firewallSeverity);
  checks.push(...firewallChecks);

  // 11. Network Protection
  checks.push(checkNetworkProtection(mde, settings.networkProtectionSeverity));

  // 12. Cloud Protection
  checks.push(checkCloudProtection(mde, settings.cloudProtectionSeverity));

  // 13. Sample Submission
  checks.push(checkSampleSubmission(mde, settings.sampleSubmissionSeverity));

  // 14. ASR
  checks.push(checkAttackSurfaceReduction(mde, settings.asrSeverity));

  return checks;
}

function checkOnboarding(mde: MdeDevice | null, severity: import('../types').Severity): HealthCheck {
  const category = 'MDE Onboarding';
  if (!mde) {
    return { category, name: 'MDE Onboarding', status: 'Critical', currentValue: 'MDE Data Missing', expectedValue: 'Onboarded', details: 'No MDE record found for this device.', severity: 'Critical' };
  }
  const status = mde.onboardingStatus;
  if (status == null || status === '') {
    return { category, name: 'MDE Onboarding', status: 'Not Available', currentValue: 'Not in report', expectedValue: 'Onboarded', details: 'Onboarding status is not available in the report.', severity };
  }
  const lower = status.toLowerCase().trim();
  if (lower === 'onboarded' || lower === 'yes' || lower === 'true' || lower === 'active') {
    return { category, name: 'MDE Onboarding', status: 'Healthy', currentValue: status, expectedValue: 'Onboarded', details: 'Device is onboarded to MDE.', severity };
  }
  return { category, name: 'MDE Onboarding', status: 'Critical', currentValue: status, expectedValue: 'Onboarded', details: `Device onboarding status: "${status}". Device may not be fully protected by MDE.`, severity };
}

function generateIssues(device: MergedDevice, checks: HealthCheck[]): DeviceIssue[] {
  const issues: DeviceIssue[] = [];
  const now = new Date();

  // Check match status issues
  if (device.matchStatus === 'Not Found') {
    issues.push({
      deviceName: device.intuneDevice.deviceName,
      issue: 'MDE Data Missing / Sensor Not Reporting',
      category: 'MDE Sensor',
      severity: 'Critical',
      currentState: 'No MDE record',
      expectedState: 'MDE record present',
      recommendedAction: RECOMMENDED_ACTIONS.mdeMissing,
      detectionDate: now,
      complianceState: 'Critical',
    });
  }

  if (device.matchStatus === 'Multiple Matches') {
    issues.push({
      deviceName: device.intuneDevice.deviceName,
      issue: 'Multiple MDE Matches',
      category: 'Data Quality',
      severity: 'Medium',
      currentState: `${device.mdeMatches.length} MDE records`,
      expectedState: '1 MDE record',
      recommendedAction: RECOMMENDED_ACTIONS.multipleMatches,
      detectionDate: now,
      complianceState: 'Warning',
    });
  }

  // Generate issues from non-healthy checks
  for (const check of checks) {
    if (check.status === 'Healthy' || check.status === 'Not Available') continue;

    const actionKey = getActionKey(check);
    issues.push({
      deviceName: device.intuneDevice.deviceName,
      issue: `${check.name}: ${check.status}`,
      category: check.category,
      severity: check.severity,
      currentState: check.currentValue,
      expectedState: check.expectedValue,
      recommendedAction: RECOMMENDED_ACTIONS[actionKey] || check.details,
      detectionDate: now,
      complianceState: check.status,
    });
  }

  return issues;
}

function getActionKey(check: HealthCheck): string {
  const name = check.name.toLowerCase();
  if (name.includes('sensor')) {
    return check.status === 'Warning' ? 'sensorWarning' : 'sensorNotReporting';
  }
  if (name.includes('signature')) return 'signatureOutdated';
  if (name.includes('platform')) return 'platformOutdated';
  if (name.includes('quick scan')) return check.status === 'Non-Compliant' && check.currentValue.includes('Failed') ? 'quickScanFailed' : 'quickScanOverdue';
  if (name.includes('full scan')) return check.status === 'Non-Compliant' && check.currentValue.includes('Failed') ? 'fullScanFailed' : 'fullScanOverdue';
  if (name.includes('antivirus')) return 'avDisabled';
  if (name.includes('real-time')) return 'rtpDisabled';
  if (name.includes('tamper')) return 'tamperDisabled';
  if (name.includes('onboarding')) return 'notOnboarded';
  if (name.includes('firewall')) return 'firewallDisabled';
  if (name.includes('network')) return 'networkProtectionDisabled';
  if (name.includes('cloud')) return 'cloudProtectionDisabled';
  if (name.includes('sample')) return 'sampleSubmissionDisabled';
  if (name.includes('attack') || name.includes('asr')) return 'asrWeak';
  return 'sensorNotReporting';
}

/**
 * Calculate KPI summary from merged devices.
 */
export function calculateKPISummary(
  mergedDevices: MergedDevice[],
  totalIntuneDevices: number
): KPISummary {
  return {
    totalIntuneDevices,
    devicesInScope: mergedDevices.length,
    mdeMatched: mergedDevices.filter(d => d.matchStatus === 'Matched' || d.matchStatus === 'Multiple Matches').length,
    mdeMissing: mergedDevices.filter(d => d.matchStatus === 'Not Found').length,
    healthyDevices: mergedDevices.filter(d => d.overallStatus === 'Healthy').length,
    warningDevices: mergedDevices.filter(d => d.overallStatus === 'Warning').length,
    criticalDevices: mergedDevices.filter(d => d.overallStatus === 'Critical').length,
    sensorIssues: countIssuesByCategory(mergedDevices, 'MDE Sensor'),
    signatureIssues: countIssuesByCategory(mergedDevices, 'Antivirus'),
    platformIssues: countIssuesByCategory(mergedDevices, 'Defender Platform'),
    quickScanIssues: mergedDevices.filter(d => d.healthChecks.some(c => c.name === 'Quick Scan' && c.status !== 'Healthy' && c.status !== 'Not Available')).length,
    fullScanIssues: mergedDevices.filter(d => d.healthChecks.some(c => c.name === 'Full Scan' && c.status !== 'Healthy' && c.status !== 'Not Available')).length,
    securityConfigIssues: countIssuesByCategory(mergedDevices, 'Security Controls'),
  };
}

function countIssuesByCategory(devices: MergedDevice[], category: string): number {
  return devices.filter(d =>
    d.healthChecks.some(c => c.category === category && c.status !== 'Healthy' && c.status !== 'Not Available')
  ).length;
}

/**
 * Calculate category statistics for charts.
 */
export function calculateCategoryStats(mergedDevices: MergedDevice[]): CategoryStats[] {
  const categories = ['MDE Sensor', 'Antivirus', 'Defender Platform', 'Scans', 'Security Controls', 'MDE Onboarding', 'Firewall'];
  return categories.map(category => {
    let healthy = 0, warning = 0, critical = 0, notAvailable = 0;
    for (const device of mergedDevices) {
      const catChecks = device.healthChecks.filter(c => c.category === category);
      if (catChecks.length === 0) { notAvailable++; continue; }
      const allNA = catChecks.every(c => c.status === 'Not Available');
      if (allNA) { notAvailable++; continue; }
      const anyCritical = catChecks.some(c => c.status === 'Critical' || c.status === 'Non-Compliant');
      const anyWarning = catChecks.some(c => c.status === 'Warning' || c.status === 'Unknown');
      if (anyCritical) critical++;
      else if (anyWarning) warning++;
      else healthy++;
    }
    return { category, healthy, warning, critical, notAvailable, total: mergedDevices.length };
  });
}
