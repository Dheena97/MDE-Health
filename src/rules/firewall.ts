import type { HealthCheck, MdeDevice, Severity } from '../types';
import { isEnabled } from '../utils/formatUtils';

export function checkFirewall(
  mdeDevice: MdeDevice | null,
  severity: Severity
): HealthCheck[] {
  const category = 'Firewall';
  const checks: HealthCheck[] = [];

  if (!mdeDevice) {
    checks.push({
      category, name: 'Firewall', status: 'Critical',
      currentValue: 'MDE Data Missing', expectedValue: 'Enabled',
      details: 'No MDE record found for this device.', severity: 'Critical',
    });
    return checks;
  }

  // Overall firewall
  const fw = mdeDevice.firewallEnabled;
  if (fw != null && fw !== '') {
    const enabled = isEnabled(fw);
    checks.push({
      category, name: 'Firewall',
      status: enabled === true ? 'Healthy' : enabled === false ? 'Non-Compliant' : 'Unknown',
      currentValue: fw, expectedValue: 'Enabled',
      details: enabled === false ? 'Windows Firewall is disabled.' : enabled === true ? 'Windows Firewall is enabled.' : `Unrecognized status: "${fw}".`,
      severity,
    });
  }

  // Domain profile
  const domain = mdeDevice.firewallDomainProfile;
  if (domain != null && domain !== '') {
    const enabled = isEnabled(domain);
    checks.push({
      category, name: 'Firewall Domain Profile',
      status: enabled === true ? 'Healthy' : enabled === false ? 'Non-Compliant' : 'Unknown',
      currentValue: domain, expectedValue: 'Enabled',
      details: enabled === false ? 'Firewall Domain Profile is disabled.' : `Domain Profile: ${domain}`,
      severity,
    });
  }

  // Private profile
  const priv = mdeDevice.firewallPrivateProfile;
  if (priv != null && priv !== '') {
    const enabled = isEnabled(priv);
    checks.push({
      category, name: 'Firewall Private Profile',
      status: enabled === true ? 'Healthy' : enabled === false ? 'Non-Compliant' : 'Unknown',
      currentValue: priv, expectedValue: 'Enabled',
      details: enabled === false ? 'Firewall Private Profile is disabled.' : `Private Profile: ${priv}`,
      severity,
    });
  }

  // Public profile
  const pub = mdeDevice.firewallPublicProfile;
  if (pub != null && pub !== '') {
    const enabled = isEnabled(pub);
    checks.push({
      category, name: 'Firewall Public Profile',
      status: enabled === true ? 'Healthy' : enabled === false ? 'Non-Compliant' : 'Unknown',
      currentValue: pub, expectedValue: 'Enabled',
      details: enabled === false ? 'Firewall Public Profile is disabled.' : `Public Profile: ${pub}`,
      severity,
    });
  }

  // If no firewall data at all
  if (checks.length === 0) {
    checks.push({
      category, name: 'Firewall', status: 'Not Available',
      currentValue: 'Not in report', expectedValue: 'Enabled',
      details: 'Firewall status data is not available in the report.', severity,
    });
  }

  return checks;
}
