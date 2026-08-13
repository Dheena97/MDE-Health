import type { HealthCheck, ComplianceStatus } from '../types';
import type { AppSettings } from '../config/defaults';

interface HealthScoreResult {
  score: number;
  status: ComplianceStatus;
  breakdown: { category: string; weight: number; passed: boolean; status: ComplianceStatus }[];
}

/**
 * Calculate overall health score for a device based on its health checks.
 * Excludes "Not Available" checks from the denominator.
 * Critical overrides: certain conditions force Critical regardless of score.
 */
export function calculateHealthScore(
  checks: HealthCheck[],
  settings: AppSettings
): HealthScoreResult {
  const weightMap: Record<string, number> = {
    'MDE Sensor': settings.healthWeights.sensor,
    'Antivirus': settings.healthWeights.signature + settings.healthWeights.antivirus,
    'Defender Platform': settings.healthWeights.platform,
    'Scans': settings.healthWeights.quickScan + settings.healthWeights.fullScan,
    'Security Controls': settings.healthWeights.tamperProtection,
    'MDE Onboarding': settings.healthWeights.mdeOnboarding,
    'Firewall': 0, // Bonus checks, not in core weights
  };

  // Group checks by category
  const categoryChecks = new Map<string, HealthCheck[]>();
  for (const check of checks) {
    const existing = categoryChecks.get(check.category) || [];
    existing.push(check);
    categoryChecks.set(check.category, existing);
  }

  let totalWeight = 0;
  let earnedWeight = 0;
  const breakdown: HealthScoreResult['breakdown'] = [];
  let hasCriticalOverride = false;

  for (const [category, catChecks] of categoryChecks) {
    const weight = weightMap[category] || 0;
    if (weight === 0) continue; // Skip categories without weight

    // Check if all checks in this category are "Not Available"
    const availableChecks = catChecks.filter(c => c.status !== 'Not Available');
    if (availableChecks.length === 0) {
      // Don't penalize for missing data
      breakdown.push({ category, weight, passed: true, status: 'Not Available' });
      continue;
    }

    totalWeight += weight;

    // Category passes if all available checks are Healthy
    const allHealthy = availableChecks.every(c => c.status === 'Healthy');
    const anyWarning = availableChecks.some(c => c.status === 'Warning');
    const anyCritical = availableChecks.some(c => c.status === 'Critical' || c.status === 'Non-Compliant');

    if (allHealthy) {
      earnedWeight += weight;
      breakdown.push({ category, weight, passed: true, status: 'Healthy' });
    } else if (anyWarning && !anyCritical) {
      earnedWeight += weight * 0.5; // Partial credit for warning
      breakdown.push({ category, weight, passed: false, status: 'Warning' });
    } else {
      breakdown.push({ category, weight, passed: false, status: anyCritical ? 'Critical' : 'Non-Compliant' });
    }

    // Critical overrides
    for (const check of availableChecks) {
      if (check.status === 'Critical') {
        if (
          check.name === 'Antivirus Enabled' ||
          check.name === 'Real-Time Protection' ||
          check.name === 'Sensor Health' ||
          check.name === 'Sensor Communication' ||
          check.name === 'Sensor Health State' ||
          check.category === 'MDE Onboarding'
        ) {
          hasCriticalOverride = true;
        }
      }
    }
  }

  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

  let status: ComplianceStatus;
  if (hasCriticalOverride) {
    status = 'Critical';
  } else if (score >= settings.healthyThreshold) {
    status = 'Healthy';
  } else if (score >= settings.warningThreshold) {
    status = 'Warning';
  } else {
    status = 'Critical';
  }

  return { score, status, breakdown };
}
