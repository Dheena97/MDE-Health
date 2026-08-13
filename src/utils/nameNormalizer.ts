/**
 * Device name normalization for Intune ↔ MDE matching.
 * Handles: case, whitespace, FQDN stripping (confirmed by user that FQDN happens in Defender reports).
 */

// Common domain suffixes to strip from FQDN device names
const DOMAIN_SUFFIXES = [
  '.local',
  '.corp',
  '.internal',
  '.ad',
  '.domain',
  '.lan',
  '.intra',
  '.company',
  '.net',
  '.com',
  '.org',
];

/**
 * Normalize a device name for matching purposes.
 * - Lowercase
 * - Trim whitespace
 * - Strip FQDN domain suffixes
 * - Remove trailing/leading special characters
 */
export function normalizeDeviceName(name: string | null | undefined): string {
  if (!name || typeof name !== 'string') return '';

  let normalized = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' '); // collapse multiple spaces

  // Strip FQDN: remove everything after the first dot if it matches known domain patterns
  const dotIndex = normalized.indexOf('.');
  if (dotIndex > 0) {
    const suffix = normalized.substring(dotIndex);
    // Check if it's a known domain suffix or multi-part FQDN
    const isKnownSuffix = DOMAIN_SUFFIXES.some(ds =>
      suffix === ds || suffix.startsWith(ds + '.') || suffix.endsWith(ds)
    );
    // Also strip if it looks like a multi-part FQDN (e.g., .domain.corp.com)
    const isDomainLike = suffix.split('.').length >= 2;

    if (isKnownSuffix || isDomainLike) {
      normalized = normalized.substring(0, dotIndex);
    }
  }

  // Remove trailing/leading special characters
  normalized = normalized.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');

  return normalized;
}

/**
 * Check if two device names match after normalization.
 */
export function deviceNamesMatch(name1: string | null | undefined, name2: string | null | undefined): boolean {
  const n1 = normalizeDeviceName(name1);
  const n2 = normalizeDeviceName(name2);
  if (!n1 || !n2) return false;
  return n1 === n2;
}
