import type { HealthCheck, MdeDevice, Severity } from '../types';
import { isEnabled } from '../utils/formatUtils';

export function checkCloudProtection(
  mdeDevice: MdeDevice | null,
  severity: Severity
): HealthCheck {
  const category = 'Security Controls';
  if (!mdeDevice) {
    return { category, name: 'Cloud-Delivered Protection', status: 'Critical', currentValue: 'MDE Data Missing', expectedValue: 'Enabled', details: 'No MDE record found.', severity: 'Critical' };
  }
  const cp = mdeDevice.cloudDeliveredProtection;
  if (cp == null || cp === '') {
    return { category, name: 'Cloud-Delivered Protection', status: 'Not Available', currentValue: 'Not in report', expectedValue: 'Enabled', details: 'Cloud-Delivered Protection data is not available in the report.', severity };
  }
  const enabled = isEnabled(cp);
  if (enabled === true) return { category, name: 'Cloud-Delivered Protection', status: 'Healthy', currentValue: cp, expectedValue: 'Enabled', details: 'Cloud-Delivered Protection (MAPS) is enabled.', severity };
  if (enabled === false) return { category, name: 'Cloud-Delivered Protection', status: 'Non-Compliant', currentValue: cp, expectedValue: 'Enabled', details: 'Cloud-Delivered Protection is disabled.', severity };
  return { category, name: 'Cloud-Delivered Protection', status: 'Unknown', currentValue: cp, expectedValue: 'Enabled', details: `Unrecognized status: "${cp}".`, severity };
}
