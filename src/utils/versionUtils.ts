/**
 * Semantic version parsing and comparison utilities.
 * Handles versions like "4.18.26070.6" properly.
 */

export interface ParsedVersion {
  parts: number[];
  original: string;
  valid: boolean;
}

/**
 * Parse a version string into numeric parts.
 */
export function parseVersion(versionStr: string | null | undefined): ParsedVersion {
  if (!versionStr || typeof versionStr !== 'string') {
    return { parts: [], original: versionStr || '', valid: false };
  }

  const cleaned = versionStr.trim().replace(/^v/i, '');
  const parts = cleaned.split('.').map(p => {
    const num = parseInt(p, 10);
    return isNaN(num) ? -1 : num;
  });

  const valid = parts.length > 0 && parts.every(p => p >= 0);
  return { parts, original: versionStr, valid };
}

/**
 * Compare two versions. Returns:
 * -1 if a < b
 *  0 if a === b
 *  1 if a > b
 */
export function compareVersions(a: ParsedVersion, b: ParsedVersion): number {
  if (!a.valid && !b.valid) return 0;
  if (!a.valid) return -1;
  if (!b.valid) return 1;

  const maxLen = Math.max(a.parts.length, b.parts.length);
  for (let i = 0; i < maxLen; i++) {
    const pa = i < a.parts.length ? a.parts[i] : 0;
    const pb = i < b.parts.length ? b.parts[i] : 0;
    if (pa < pb) return -1;
    if (pa > pb) return 1;
  }
  return 0;
}

/**
 * Given a list of version strings, return unique sorted versions (descending).
 * N = index 0 (latest), N-1 = index 1, etc.
 */
export function getSortedUniqueVersions(versions: (string | undefined | null)[]): ParsedVersion[] {
  const parsed = versions
    .filter((v): v is string => !!v)
    .map(parseVersion)
    .filter(v => v.valid);

  // Deduplicate
  const uniqueMap = new Map<string, ParsedVersion>();
  for (const v of parsed) {
    const key = v.parts.join('.');
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, v);
    }
  }

  // Sort descending
  const unique = Array.from(uniqueMap.values());
  unique.sort((a, b) => compareVersions(b, a));
  return unique;
}

/**
 * Check if a device version is compliant given a policy (N, N-1, N-2, N-3).
 * Returns the list of acceptable versions and whether the device is compliant.
 */
export function checkVersionCompliance(
  deviceVersion: string | undefined | null,
  allVersions: ParsedVersion[],
  policy: 'N' | 'N-1' | 'N-2' | 'N-3',
  manualLatest?: string
): {
  compliant: boolean;
  deviceParsed: ParsedVersion;
  acceptableVersions: ParsedVersion[];
  latestVersion: ParsedVersion | null;
} {
  const deviceParsed = parseVersion(deviceVersion);

  let sortedVersions = [...allVersions];

  // If manual latest is specified, use it
  if (manualLatest) {
    const manualParsed = parseVersion(manualLatest);
    if (manualParsed.valid) {
      // Insert manual latest if not already there
      const exists = sortedVersions.some(v => compareVersions(v, manualParsed) === 0);
      if (!exists) {
        sortedVersions.unshift(manualParsed);
        sortedVersions.sort((a, b) => compareVersions(b, a));
      }
    }
  }

  if (sortedVersions.length === 0) {
    return { compliant: true, deviceParsed, acceptableVersions: [], latestVersion: null };
  }

  const latestVersion = sortedVersions[0];
  const policyIndex = { 'N': 0, 'N-1': 1, 'N-2': 2, 'N-3': 3 }[policy];
  const acceptableCount = Math.min(policyIndex + 1, sortedVersions.length);
  const acceptableVersions = sortedVersions.slice(0, acceptableCount);

  if (!deviceParsed.valid) {
    return { compliant: false, deviceParsed, acceptableVersions, latestVersion };
  }

  const compliant = acceptableVersions.some(
    v => compareVersions(v, deviceParsed) === 0
  );

  return { compliant, deviceParsed, acceptableVersions, latestVersion };
}

/**
 * Format a version for display.
 */
export function formatVersion(version: ParsedVersion | null | undefined): string {
  if (!version || !version.valid) return 'Unknown';
  return version.original;
}
