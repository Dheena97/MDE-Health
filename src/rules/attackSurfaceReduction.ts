import type { HealthCheck, MdeDevice, Severity } from '../types';

export function checkAttackSurfaceReduction(
  mdeDevice: MdeDevice | null,
  severity: Severity
): HealthCheck {
  const category = 'Security Controls';
  if (!mdeDevice) {
    return { category, name: 'Attack Surface Reduction', status: 'Critical', currentValue: 'MDE Data Missing', expectedValue: 'Configured', details: 'No MDE record found.', severity: 'Critical' };
  }
  const asr = mdeDevice.asrRules;
  if (asr == null || asr === '') {
    return { category, name: 'Attack Surface Reduction', status: 'Not Available', currentValue: 'Not in report', expectedValue: 'Configured in Block mode', details: 'ASR rules data is not available in the report.', severity };
  }
  const lower = asr.toLowerCase().trim();
  if (lower.includes('block') && !lower.includes('audit') && !lower.includes('disabled')) {
    return { category, name: 'Attack Surface Reduction', status: 'Healthy', currentValue: asr, expectedValue: 'Block mode', details: 'ASR rules are configured in Block mode.', severity };
  }
  if (lower.includes('audit')) {
    return { category, name: 'Attack Surface Reduction', status: 'Warning', currentValue: asr, expectedValue: 'Block mode', details: 'ASR rules are in Audit mode. Consider enabling Block mode for stronger protection.', severity };
  }
  if (lower.includes('disabled') || lower.includes('off') || lower === 'false' || lower === 'no') {
    return { category, name: 'Attack Surface Reduction', status: 'Non-Compliant', currentValue: asr, expectedValue: 'Block mode', details: 'ASR rules are disabled.', severity };
  }
  return { category, name: 'Attack Surface Reduction', status: 'Unknown', currentValue: asr, expectedValue: 'Configured', details: `ASR status: "${asr}".`, severity };
}
