import type { HealthCheck, MdeDevice, Severity } from '../types';
import { getSortedUniqueVersions, checkVersionCompliance, type ParsedVersion } from '../utils/versionUtils';

export function checkPlatformVersion(
  mdeDevice: MdeDevice | null,
  allPlatformVersions: ParsedVersion[],
  policy: 'N' | 'N-1' | 'N-2' | 'N-3',
  severity: Severity,
  manualLatest?: string
): HealthCheck {
  const category = 'Defender Platform';

  if (!mdeDevice) {
    return {
      category,
      name: 'Platform Version',
      status: 'Critical',
      currentValue: 'MDE Data Missing',
      expectedValue: `Within ${policy}`,
      details: 'No MDE record found for this device.',
      severity: 'Critical',
    };
  }

  const deviceVersion = mdeDevice.platformVersion;

  if (!deviceVersion) {
    return {
      category,
      name: 'Platform Version',
      status: 'Unknown',
      currentValue: 'Not available',
      expectedValue: `Within ${policy}`,
      details: 'Platform version is not available in the report.',
      severity,
    };
  }

  const result = checkVersionCompliance(deviceVersion, allPlatformVersions, policy, manualLatest);

  if (!result.deviceParsed.valid) {
    return {
      category,
      name: 'Platform Version',
      status: 'Unknown',
      currentValue: deviceVersion,
      expectedValue: `Within ${policy}`,
      details: `Could not parse platform version "${deviceVersion}".`,
      severity,
    };
  }

  if (result.acceptableVersions.length === 0) {
    return {
      category,
      name: 'Platform Version',
      status: 'Unknown',
      currentValue: deviceVersion,
      expectedValue: `Within ${policy}`,
      details: 'No reference versions available to compare against.',
      severity,
    };
  }

  const latestStr = result.latestVersion?.original || 'Unknown';
  const acceptableStr = result.acceptableVersions.map(v => v.original).join(', ');

  if (result.compliant) {
    return {
      category,
      name: 'Platform Version',
      status: 'Healthy',
      currentValue: deviceVersion,
      expectedValue: `${policy} (${acceptableStr})`,
      details: `Platform version ${deviceVersion} is within the ${policy} policy. Latest: ${latestStr}.`,
      severity,
    };
  }

  return {
    category,
    name: 'Platform Version',
    status: 'Non-Compliant',
    currentValue: deviceVersion,
    expectedValue: `${policy} (${acceptableStr})`,
    details: `Platform version ${deviceVersion} is outdated. Latest: ${latestStr}. Policy: ${policy}. Acceptable: ${acceptableStr}.`,
    severity,
  };
}

/**
 * Extract and sort all platform versions from MDE devices.
 */
export function extractPlatformVersions(devices: MdeDevice[]): ParsedVersion[] {
  const versions = devices.map(d => d.platformVersion);
  return getSortedUniqueVersions(versions);
}
