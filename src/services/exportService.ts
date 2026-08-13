/**
 * Export service for generating CSV/XLSX downloads.
 */
import * as XLSX from 'xlsx';
import type { MergedDevice } from '../types';

/**
 * Export full health report as XLSX.
 */
export function exportFullReport(devices: MergedDevice[], format: 'csv' | 'xlsx' = 'xlsx'): void {
  const rows = devices.map(d => ({
    'Device Name': d.intuneDevice.deviceName,
    'Primary User': d.intuneDevice.primaryUser || '',
    'OS': d.intuneDevice.operatingSystem || '',
    'OS Version': d.intuneDevice.osVersion || '',
    'Intune Last Check-in': d.intuneDevice.lastCheckIn ? d.intuneDevice.lastCheckIn.toISOString() : '',
    'MDE Match Status': d.matchStatus,
    'MDE Device Name': d.mdeDevice?.deviceName || '',
    'Overall Health': d.overallStatus,
    'Health Score': d.healthScore,
    'Sensor Status': getCheckStatus(d, 'Sensor'),
    'Signature Status': getCheckStatus(d, 'Signature'),
    'Signature Age': getCheckValue(d, 'Signature'),
    'Platform Status': getCheckStatus(d, 'Platform'),
    'Platform Version': d.mdeDevice?.platformVersion || '',
    'Quick Scan': getCheckStatus(d, 'Quick Scan'),
    'Full Scan': getCheckStatus(d, 'Full Scan'),
    'AV Enabled': d.mdeDevice?.antivirusEnabled || '',
    'Real-Time Protection': d.mdeDevice?.realTimeProtection || '',
    'Tamper Protection': d.mdeDevice?.tamperProtection || '',
    'MDE Onboarding': d.mdeDevice?.onboardingStatus || '',
    'Issues Count': d.issues.length,
    'Issues': d.issues.map(i => i.issue).join('; '),
    'Recommended Actions': d.issues.map(i => i.recommendedAction).join('; '),
  }));

  downloadWorkbook(rows, 'EndpointHealthReport', format);
}

/**
 * Export action list (devices requiring remediation only).
 */
export function exportActionList(devices: MergedDevice[], format: 'csv' | 'xlsx' = 'xlsx'): void {
  const allIssues: Record<string, unknown>[] = [];

  for (const device of devices) {
    for (const issue of device.issues) {
      allIssues.push({
        'Device Name': issue.deviceName,
        'Issue': issue.issue,
        'Category': issue.category,
        'Severity': issue.severity,
        'Current State': issue.currentState,
        'Expected State': issue.expectedState,
        'Recommended Action': issue.recommendedAction,
        'Compliance State': issue.complianceState,
        'Detection Date': issue.detectionDate.toISOString(),
      });
    }
  }

  downloadWorkbook(allIssues, 'ActionList', format);
}

function downloadWorkbook(data: Record<string, unknown>[], fileName: string, format: 'csv' | 'xlsx'): void {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');

  if (format === 'csv') {
    const csv = XLSX.utils.sheet_to_csv(ws);
    downloadFile(csv, `${fileName}.csv`, 'text/csv');
  } else {
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    downloadFile(buffer, `${fileName}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }
}

function downloadFile(content: string | ArrayBuffer, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getCheckStatus(device: MergedDevice, namePattern: string): string {
  const check = device.healthChecks.find(c => c.name.toLowerCase().includes(namePattern.toLowerCase()));
  return check?.status || 'N/A';
}

function getCheckValue(device: MergedDevice, namePattern: string): string {
  const check = device.healthChecks.find(c => c.name.toLowerCase().includes(namePattern.toLowerCase()));
  return check?.currentValue || 'N/A';
}
