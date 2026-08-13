import type { ComplianceStatus, Severity } from '../types';

/**
 * Format a number with commas.
 */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/**
 * Format a percentage.
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get CSS class for compliance status.
 */
export function getStatusColor(status: ComplianceStatus): string {
  switch (status) {
    case 'Healthy': return 'text-emerald-400';
    case 'Warning': return 'text-amber-400';
    case 'Non-Compliant': return 'text-red-400';
    case 'Critical': return 'text-red-500';
    case 'Unknown': return 'text-gray-400';
    case 'Not Available': return 'text-gray-500';
    default: return 'text-gray-400';
  }
}

/**
 * Get background CSS class for compliance status.
 */
export function getStatusBgColor(status: ComplianceStatus): string {
  switch (status) {
    case 'Healthy': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'Warning': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'Non-Compliant': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'Critical': return 'bg-red-600/20 text-red-500 border-red-600/30';
    case 'Unknown': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    case 'Not Available': return 'bg-gray-600/20 text-gray-500 border-gray-600/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

/**
 * Get CSS class for severity.
 */
export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'Critical': return 'text-red-500';
    case 'High': return 'text-orange-400';
    case 'Medium': return 'text-amber-400';
    case 'Low': return 'text-blue-400';
    case 'Info': return 'text-gray-400';
    default: return 'text-gray-400';
  }
}

export function getSeverityBgColor(severity: Severity): string {
  switch (severity) {
    case 'Critical': return 'bg-red-600/20 text-red-500 border-red-600/30';
    case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'Medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'Low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'Info': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Check if a string value represents "enabled" / "true".
 */
export function isEnabled(value: string | null | undefined): boolean | null {
  if (value == null || value === '') return null;
  const v = value.toLowerCase().trim();
  const enabledValues = ['enabled', 'true', 'yes', 'on', 'active', '1', 'running'];
  const disabledValues = ['disabled', 'false', 'no', 'off', 'inactive', '0', 'stopped', 'not configured'];
  if (enabledValues.includes(v)) return true;
  if (disabledValues.includes(v)) return false;
  return null;
}

/**
 * Check if a scan status represents success.
 */
export function isScanSuccessful(status: string | null | undefined): boolean | null {
  if (status == null || status === '') return null;
  const v = status.toLowerCase().trim();
  const successValues = ['completed', 'succeeded', 'success', 'clean', 'no threats found', 'passed'];
  const failValues = ['failed', 'error', 'aborted', 'cancelled', 'canceled', 'timeout', 'timed out'];
  if (successValues.includes(v)) return true;
  if (failValues.includes(v)) return false;
  return null; // Unknown status
}

/**
 * Convert a status string to a display-friendly format.
 */
export function humanizeStatus(status: ComplianceStatus): string {
  return status;
}
