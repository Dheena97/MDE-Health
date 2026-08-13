import type { HealthCheck, MdeDevice, Severity } from '../types';
import { isEnabled } from '../utils/formatUtils';

export function checkAntivirus(
  mdeDevice: MdeDevice | null,
  severity: Severity
): HealthCheck {
  const category = 'Antivirus';

  if (!mdeDevice) {
    return {
      category,
      name: 'Antivirus Enabled',
      status: 'Critical',
      currentValue: 'MDE Data Missing',
      expectedValue: 'Enabled',
      details: 'No MDE record found for this device.',
      severity: 'Critical',
    };
  }

  const avEnabled = mdeDevice.antivirusEnabled;
  if (avEnabled == null || avEnabled === '') {
    return {
      category,
      name: 'Antivirus Enabled',
      status: 'Not Available',
      currentValue: 'Not in report',
      expectedValue: 'Enabled',
      details: 'Antivirus enabled status is not available in the report.',
      severity,
    };
  }

  const enabled = isEnabled(avEnabled);
  if (enabled === true) {
    return {
      category,
      name: 'Antivirus Enabled',
      status: 'Healthy',
      currentValue: avEnabled,
      expectedValue: 'Enabled',
      details: 'Microsoft Defender Antivirus is enabled.',
      severity,
    };
  }

  if (enabled === false) {
    return {
      category,
      name: 'Antivirus Enabled',
      status: 'Critical',
      currentValue: avEnabled,
      expectedValue: 'Enabled',
      details: 'Microsoft Defender Antivirus is DISABLED. This is a critical security risk.',
      severity,
    };
  }

  return {
    category,
    name: 'Antivirus Enabled',
    status: 'Unknown',
    currentValue: avEnabled,
    expectedValue: 'Enabled',
    details: `Unrecognized antivirus status: "${avEnabled}".`,
    severity,
  };
}

export function checkRealTimeProtection(
  mdeDevice: MdeDevice | null,
  severity: Severity
): HealthCheck {
  const category = 'Antivirus';

  if (!mdeDevice) {
    return {
      category,
      name: 'Real-Time Protection',
      status: 'Critical',
      currentValue: 'MDE Data Missing',
      expectedValue: 'Enabled',
      details: 'No MDE record found for this device.',
      severity: 'Critical',
    };
  }

  const rtp = mdeDevice.realTimeProtection;
  if (rtp == null || rtp === '') {
    return {
      category,
      name: 'Real-Time Protection',
      status: 'Not Available',
      currentValue: 'Not in report',
      expectedValue: 'Enabled',
      details: 'Real-Time Protection status is not available in the report.',
      severity,
    };
  }

  const enabled = isEnabled(rtp);
  if (enabled === true) {
    return {
      category,
      name: 'Real-Time Protection',
      status: 'Healthy',
      currentValue: rtp,
      expectedValue: 'Enabled',
      details: 'Real-Time Protection is enabled.',
      severity,
    };
  }

  if (enabled === false) {
    return {
      category,
      name: 'Real-Time Protection',
      status: 'Critical',
      currentValue: rtp,
      expectedValue: 'Enabled',
      details: 'Real-Time Protection is DISABLED. Endpoints are not being actively protected.',
      severity,
    };
  }

  return {
    category,
    name: 'Real-Time Protection',
    status: 'Unknown',
    currentValue: rtp,
    expectedValue: 'Enabled',
    details: `Unrecognized RTP status: "${rtp}".`,
    severity,
  };
}
