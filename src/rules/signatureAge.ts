import type { HealthCheck, MdeDevice, Severity } from '../types';
import { getAgeInDays, formatAge, formatDate } from '../utils/dateUtils';

export function checkSignatureAge(
  mdeDevice: MdeDevice | null,
  maxAgeDays: number,
  severity: Severity,
  now: Date = new Date()
): HealthCheck {
  const category = 'Antivirus';

  if (!mdeDevice) {
    return {
      category,
      name: 'Signature Age',
      status: 'Critical',
      currentValue: 'MDE Data Missing',
      expectedValue: `Within ${maxAgeDays} days`,
      details: 'No MDE record found for this device.',
      severity: 'Critical',
    };
  }

  const updateDate = mdeDevice.signatureUpdateDate;
  const version = mdeDevice.antivirusSignatureVersion;

  if (!updateDate) {
    // If we have no timestamp, we cannot evaluate reliably
    return {
      category,
      name: 'Signature Age',
      status: 'Unknown',
      currentValue: version || 'No data',
      expectedValue: `Updated within ${maxAgeDays} days`,
      details: 'Signature update date is not available in the report. Cannot determine signature age.',
      severity,
    };
  }

  const ageDays = getAgeInDays(updateDate, now);

  if (ageDays <= maxAgeDays) {
    return {
      category,
      name: 'Signature Age',
      status: 'Healthy',
      currentValue: `${Math.round(ageDays)} day${Math.round(ageDays) !== 1 ? 's' : ''} old${version ? ` (${version})` : ''}`,
      expectedValue: `Within ${maxAgeDays} days`,
      details: `Signature last updated at ${formatDate(updateDate)}.`,
      severity,
    };
  }

  // Warning at 80% of threshold, non-compliant above
  const warningThreshold = maxAgeDays * 0.8;
  if (ageDays <= maxAgeDays && ageDays > warningThreshold) {
    return {
      category,
      name: 'Signature Age',
      status: 'Warning',
      currentValue: `${Math.round(ageDays)} days old${version ? ` (${version})` : ''}`,
      expectedValue: `Within ${maxAgeDays} days`,
      details: `Signature is approaching the ${maxAgeDays}-day threshold. Updated at ${formatDate(updateDate)}.`,
      severity: 'Medium',
    };
  }

  return {
    category,
    name: 'Signature Age',
    status: 'Non-Compliant',
    currentValue: `${Math.round(ageDays)} days old${version ? ` (${version})` : ''}`,
    expectedValue: `Within ${maxAgeDays} days`,
    details: `Signature is ${formatAge(updateDate, now)} old (updated at ${formatDate(updateDate)}). Threshold is ${maxAgeDays} days.`,
    severity,
  };
}
