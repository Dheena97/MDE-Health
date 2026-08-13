import type { HealthCheck, MdeDevice, Severity } from '../types';
import { getAgeInDays, formatDate, formatAge } from '../utils/dateUtils';
import { isScanSuccessful } from '../utils/formatUtils';

export function checkQuickScan(
  mdeDevice: MdeDevice | null,
  maxIntervalDays: number,
  severity: Severity,
  now: Date = new Date()
): HealthCheck {
  const category = 'Scans';

  if (!mdeDevice) {
    return {
      category,
      name: 'Quick Scan',
      status: 'Critical',
      currentValue: 'MDE Data Missing',
      expectedValue: `Within ${maxIntervalDays} days`,
      details: 'No MDE record found for this device.',
      severity: 'Critical',
    };
  }

  const status = mdeDevice.quickScanStatus;
  const startTime = mdeDevice.quickScanStartTime;
  const endTime = mdeDevice.quickScanEndTime;
  const scanDate = endTime || startTime;

  // Check if data is available
  if (!scanDate && !status) {
    return {
      category,
      name: 'Quick Scan',
      status: 'Unknown',
      currentValue: 'No scan data',
      expectedValue: `Within ${maxIntervalDays} days`,
      details: 'Quick Scan data is not available in the report.',
      severity,
    };
  }

  // Check scan status for failures
  if (status) {
    const success = isScanSuccessful(status);
    if (success === false) {
      return {
        category,
        name: 'Quick Scan',
        status: 'Non-Compliant',
        currentValue: `Failed: ${status}`,
        expectedValue: 'Completed successfully',
        details: `Quick Scan failed with status "${status}"${scanDate ? ` at ${formatDate(scanDate)}` : ''}.`,
        severity,
      };
    }
  }

  // Check scan age
  if (!scanDate) {
    return {
      category,
      name: 'Quick Scan',
      status: 'Warning',
      currentValue: status || 'No date available',
      expectedValue: `Within ${maxIntervalDays} days`,
      details: 'Quick Scan date is not available. Cannot determine if scan is overdue.',
      severity,
    };
  }

  const ageDays = getAgeInDays(scanDate, now);

  if (ageDays <= maxIntervalDays) {
    return {
      category,
      name: 'Quick Scan',
      status: 'Healthy',
      currentValue: `${Math.round(ageDays)} day${Math.round(ageDays) !== 1 ? 's' : ''} ago${status ? ` (${status})` : ''}`,
      expectedValue: `Within ${maxIntervalDays} days`,
      details: `Last Quick Scan: ${formatDate(scanDate)}.`,
      severity,
    };
  }

  return {
    category,
    name: 'Quick Scan',
    status: 'Non-Compliant',
    currentValue: `${Math.round(ageDays)} days overdue${status ? ` (${status})` : ''}`,
    expectedValue: `Within ${maxIntervalDays} days`,
    details: `Quick Scan is overdue. Last scan was ${formatAge(scanDate, now)} ago at ${formatDate(scanDate)}. Threshold: ${maxIntervalDays} days.`,
    severity,
  };
}
