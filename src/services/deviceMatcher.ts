/**
 * Device matcher: cross-references Intune devices against MDE records.
 * Uses normalized device names for matching.
 */
import type { IntuneDevice, MdeDevice, MergedDevice, MatchStatus } from '../types';
import { normalizeDeviceName } from '../utils/nameNormalizer';

export interface MatchResult {
  mergedDevices: MergedDevice[];
  unmatchedIntune: IntuneDevice[];
  unmatchedMde: MdeDevice[];
  multipleMatches: { intuneDevice: IntuneDevice; mdeMatches: MdeDevice[] }[];
}

/**
 * Match Intune devices (in scope) against MDE devices.
 */
export function matchDevices(
  intuneDevices: IntuneDevice[],
  mdeDevices: MdeDevice[]
): MatchResult {
  // Build MDE lookup map: normalized name → MDE device(s)
  const mdeMap = new Map<string, MdeDevice[]>();
  for (const mde of mdeDevices) {
    const normalized = normalizeDeviceName(mde.deviceName);
    if (!normalized) continue;
    const existing = mdeMap.get(normalized) || [];
    existing.push(mde);
    mdeMap.set(normalized, existing);
  }

  const mergedDevices: MergedDevice[] = [];
  const unmatchedIntune: IntuneDevice[] = [];
  const multipleMatches: MatchResult['multipleMatches'] = [];
  const matchedMdeNames = new Set<string>();

  for (const intuneDevice of intuneDevices) {
    const normalizedName = normalizeDeviceName(intuneDevice.deviceName);
    if (!normalizedName) {
      // Device with no name — still include but mark as unmatched
      mergedDevices.push(createMergedDevice(intuneDevice, null, 'Not Found', []));
      unmatchedIntune.push(intuneDevice);
      continue;
    }

    const mdeMatches = mdeMap.get(normalizedName) || [];

    if (mdeMatches.length === 0) {
      mergedDevices.push(createMergedDevice(intuneDevice, null, 'Not Found', []));
      unmatchedIntune.push(intuneDevice);
    } else if (mdeMatches.length === 1) {
      mergedDevices.push(createMergedDevice(intuneDevice, mdeMatches[0], 'Matched', mdeMatches));
      matchedMdeNames.add(normalizedName);
    } else {
      // Multiple matches - flag it
      mergedDevices.push(createMergedDevice(intuneDevice, mdeMatches[0], 'Multiple Matches', mdeMatches));
      multipleMatches.push({ intuneDevice, mdeMatches });
      matchedMdeNames.add(normalizedName);
    }
  }

  // Find MDE devices not matched to any Intune device
  const unmatchedMde: MdeDevice[] = [];
  for (const mde of mdeDevices) {
    const normalized = normalizeDeviceName(mde.deviceName);
    if (!matchedMdeNames.has(normalized)) {
      unmatchedMde.push(mde);
    }
  }

  return { mergedDevices, unmatchedIntune, unmatchedMde, multipleMatches };
}

function createMergedDevice(
  intuneDevice: IntuneDevice,
  mdeDevice: MdeDevice | null,
  matchStatus: MatchStatus,
  mdeMatches: MdeDevice[]
): MergedDevice {
  return {
    id: `${intuneDevice.deviceName || 'unknown'}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    intuneDevice,
    mdeDevice,
    matchStatus,
    mdeMatches,
    healthChecks: [],
    healthScore: 0,
    overallStatus: 'Unknown',
    issues: [],
  };
}
