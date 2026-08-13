import type { HealthCheck, MdeDevice, Severity } from '../types';
import { isEnabled } from '../utils/formatUtils';

export function checkTamperProtection(
  mdeDevice: MdeDevice | null,
  severity: Severity
): HealthCheck {
  const category = 'Security Controls';

  if (!mdeDevice) {
    return {
      category, name: 'Tamper Protection', status: 'Critical',
      currentValue: 'MDE Data Missing', expectedValue: 'Enabled',
      details: 'No MDE record found for this device.', severity: 'Critical',
    };
  }

  const tp = mdeDevice.tamperProtection;
  if (tp == null || tp === '') {
    return {
      category, name: 'Tamper Protection', status: 'Not Available',
      currentValue: 'Not in report', expectedValue: 'Enabled',
      details: 'Tamper Protection status is not available in the report.', severity,
    };
  }

  const enabled = isEnabled(tp);
  if (enabled === true) {
    return {
      category, name: 'Tamper Protection', status: 'Healthy',
      currentValue: tp, expectedValue: 'Enabled',
      details: 'Tamper Protection is enabled.', severity,
    };
  }
  if (enabled === false) {
    return {
      category, name: 'Tamper Protection', status: 'Non-Compliant',
      currentValue: tp, expectedValue: 'Enabled',
      details: 'Tamper Protection is disabled. Security settings can be modified by attackers.', severity,
    };
  }
  return {
    category, name: 'Tamper Protection', status: 'Unknown',
    currentValue: tp, expectedValue: 'Enabled',
    details: `Unrecognized Tamper Protection status: "${tp}".`, severity,
  };
}
