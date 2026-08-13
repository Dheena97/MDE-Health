import type { HealthCheck, MdeDevice, Severity } from '../types';
import { isEnabled } from '../utils/formatUtils';

export function checkSampleSubmission(
  mdeDevice: MdeDevice | null,
  severity: Severity
): HealthCheck {
  const category = 'Security Controls';
  if (!mdeDevice) {
    return { category, name: 'Automatic Sample Submission', status: 'Critical', currentValue: 'MDE Data Missing', expectedValue: 'Enabled', details: 'No MDE record found.', severity: 'Critical' };
  }
  const ss = mdeDevice.automaticSampleSubmission;
  if (ss == null || ss === '') {
    return { category, name: 'Automatic Sample Submission', status: 'Not Available', currentValue: 'Not in report', expectedValue: 'Enabled', details: 'Automatic Sample Submission data is not available in the report.', severity };
  }
  const enabled = isEnabled(ss);
  if (enabled === true) return { category, name: 'Automatic Sample Submission', status: 'Healthy', currentValue: ss, expectedValue: 'Enabled', details: 'Automatic Sample Submission is enabled.', severity };
  if (enabled === false) return { category, name: 'Automatic Sample Submission', status: 'Non-Compliant', currentValue: ss, expectedValue: 'Enabled', details: 'Automatic Sample Submission is disabled.', severity };
  return { category, name: 'Automatic Sample Submission', status: 'Unknown', currentValue: ss, expectedValue: 'Enabled', details: `Unrecognized status: "${ss}".`, severity };
}
