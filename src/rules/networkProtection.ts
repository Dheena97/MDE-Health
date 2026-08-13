import type { HealthCheck, MdeDevice, Severity } from '../types';
import { isEnabled } from '../utils/formatUtils';

export function checkNetworkProtection(
  mdeDevice: MdeDevice | null,
  severity: Severity
): HealthCheck {
  const category = 'Security Controls';

  if (!mdeDevice) {
    return {
      category, name: 'Network Protection', status: 'Critical',
      currentValue: 'MDE Data Missing', expectedValue: 'Enabled',
      details: 'No MDE record found.', severity: 'Critical',
    };
  }

  const np = mdeDevice.networkProtectionEnabled;
  const mode = mdeDevice.networkProtectionMode;

  if ((np == null || np === '') && (mode == null || mode === '')) {
    return {
      category, name: 'Network Protection', status: 'Not Available',
      currentValue: 'Not in report', expectedValue: 'Enabled',
      details: 'Network Protection data is not available in the report.', severity,
    };
  }

  const enabled = isEnabled(np || mode);
  const displayValue = mode ? `${np || ''} (${mode})`.trim() : (np || '');

  if (enabled === true) {
    return {
      category, name: 'Network Protection', status: 'Healthy',
      currentValue: displayValue, expectedValue: 'Enabled',
      details: 'Network Protection is enabled.', severity,
    };
  }
  if (enabled === false) {
    return {
      category, name: 'Network Protection', status: 'Non-Compliant',
      currentValue: displayValue, expectedValue: 'Enabled',
      details: 'Network Protection is disabled.', severity,
    };
  }
  // Check if mode is "audit" - treat as Warning
  if (mode?.toLowerCase().includes('audit')) {
    return {
      category, name: 'Network Protection', status: 'Warning',
      currentValue: displayValue, expectedValue: 'Block mode',
      details: 'Network Protection is in Audit mode, not Block mode.', severity,
    };
  }
  return {
    category, name: 'Network Protection', status: 'Unknown',
    currentValue: displayValue, expectedValue: 'Enabled',
    details: `Unrecognized Network Protection status: "${displayValue}".`, severity,
  };
}
