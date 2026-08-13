/**
 * Data quality validation service.
 */
import type { IntuneDevice, MdeDevice, DataQualityIssue, MergedDevice } from '../types';
import { parseVersion } from '../utils/versionUtils';

export function validateDataQuality(
  intuneDevices: IntuneDevice[],
  mdeDevices: MdeDevice[],
  mergedDevices: MergedDevice[]
): DataQualityIssue[] {
  const issues: DataQualityIssue[] = [];

  // Missing device names - Intune
  const missingIntuneNames = intuneDevices.filter(d => !d.deviceName?.trim());
  if (missingIntuneNames.length > 0) {
    issues.push({
      type: 'missing_field', severity: 'High',
      message: `${missingIntuneNames.length} Intune record(s) have no device name and cannot be matched.`,
      affectedDevices: missingIntuneNames.map((_, i) => `Intune Row ${i + 1}`),
      field: 'Device Name', count: missingIntuneNames.length,
    });
  }

  // Missing device names - MDE
  const missingMdeNames = mdeDevices.filter(d => !d.deviceName?.trim());
  if (missingMdeNames.length > 0) {
    issues.push({
      type: 'missing_field', severity: 'High',
      message: `${missingMdeNames.length} MDE record(s) have no device name.`,
      affectedDevices: missingMdeNames.map((_, i) => `MDE Row ${i + 1}`),
      field: 'Device Name', count: missingMdeNames.length,
    });
  }

  // Duplicate Intune devices
  const intuneNameCount = new Map<string, number>();
  for (const d of intuneDevices) {
    const name = d.deviceName?.toLowerCase().trim() || '';
    if (name) intuneNameCount.set(name, (intuneNameCount.get(name) || 0) + 1);
  }
  const duplicateIntune = [...intuneNameCount.entries()].filter(([, c]) => c > 1);
  if (duplicateIntune.length > 0) {
    issues.push({
      type: 'duplicate', severity: 'Medium',
      message: `${duplicateIntune.length} device name(s) appear multiple times in the Intune report.`,
      affectedDevices: duplicateIntune.map(([name, count]) => `${name} (${count}x)`),
      count: duplicateIntune.reduce((sum, [, c]) => sum + c, 0),
    });
  }

  // Duplicate MDE devices
  const mdeNameCount = new Map<string, number>();
  for (const d of mdeDevices) {
    const name = d.deviceName?.toLowerCase().trim() || '';
    if (name) mdeNameCount.set(name, (mdeNameCount.get(name) || 0) + 1);
  }
  const duplicateMde = [...mdeNameCount.entries()].filter(([, c]) => c > 1);
  if (duplicateMde.length > 0) {
    issues.push({
      type: 'duplicate', severity: 'Medium',
      message: `${duplicateMde.length} device name(s) appear multiple times in the MDE report.`,
      affectedDevices: duplicateMde.map(([name, count]) => `${name} (${count}x)`),
      count: duplicateMde.reduce((sum, [, c]) => sum + c, 0),
    });
  }

  // Devices in Intune but missing from MDE
  const missingMde = mergedDevices.filter(d => d.matchStatus === 'Not Found');
  if (missingMde.length > 0) {
    issues.push({
      type: 'missing_mde', severity: 'Critical',
      message: `${missingMde.length} Intune device(s) have no corresponding MDE health record.`,
      affectedDevices: missingMde.map(d => d.intuneDevice.deviceName),
      count: missingMde.length,
    });
  }

  // Multiple MDE matches
  const multiMatch = mergedDevices.filter(d => d.matchStatus === 'Multiple Matches');
  if (multiMatch.length > 0) {
    issues.push({
      type: 'multiple_matches', severity: 'Medium',
      message: `${multiMatch.length} Intune device(s) matched multiple MDE records.`,
      affectedDevices: multiMatch.map(d => `${d.intuneDevice.deviceName} (${d.mdeMatches.length} matches)`),
      count: multiMatch.length,
    });
  }

  // Missing signature update dates
  const missingSignatureDates = mdeDevices.filter(d => d.deviceName?.trim() && !d.signatureUpdateDate);
  if (missingSignatureDates.length > 0) {
    issues.push({
      type: 'missing_field', severity: 'Medium',
      message: `${missingSignatureDates.length} MDE record(s) are missing Signature Update Date. These devices cannot be evaluated for signature compliance.`,
      affectedDevices: missingSignatureDates.map(d => d.deviceName),
      field: 'Signature Update Date', count: missingSignatureDates.length,
    });
  }

  // Missing sensor last seen
  const missingSensorLastSeen = mdeDevices.filter(d => d.deviceName?.trim() && !d.sensorLastSeen);
  if (missingSensorLastSeen.length > 0) {
    issues.push({
      type: 'missing_field', severity: 'Medium',
      message: `${missingSensorLastSeen.length} MDE record(s) are missing Sensor Last Seen date.`,
      affectedDevices: missingSensorLastSeen.map(d => d.deviceName),
      field: 'Sensor Last Seen', count: missingSensorLastSeen.length,
    });
  }

  // Malformed platform versions
  const malformedVersions = mdeDevices.filter(d => {
    if (!d.platformVersion) return false;
    const parsed = parseVersion(d.platformVersion);
    return !parsed.valid;
  });
  if (malformedVersions.length > 0) {
    issues.push({
      type: 'malformed_version', severity: 'Low',
      message: `${malformedVersions.length} MDE record(s) have malformed platform versions.`,
      affectedDevices: malformedVersions.map(d => `${d.deviceName} (${d.platformVersion})`),
      field: 'Platform Version', count: malformedVersions.length,
    });
  }

  return issues;
}
