import type { HealthCheck, MdeDevice, Severity } from '../types';
import { getAgeInHours, formatAge, formatDate } from '../utils/dateUtils';

export function checkSensorHealth(
  mdeDevice: MdeDevice | null,
  healthyHours: number,
  warningHours: number,
  severity: Severity,
  now: Date = new Date()
): HealthCheck {
  const category = 'MDE Sensor';

  if (!mdeDevice) {
    return {
      category,
      name: 'Sensor Health',
      status: 'Critical',
      currentValue: 'MDE Data Missing',
      expectedValue: 'Active and communicating',
      details: 'No MDE record found for this device.',
      severity: 'Critical',
    };
  }

  // Check sensor health state
  const sensorState = mdeDevice.sensorHealthState?.toLowerCase().trim();
  if (sensorState && sensorState !== 'active' && sensorState !== 'healthy' && sensorState !== 'up to date') {
    return {
      category,
      name: 'Sensor Health State',
      status: 'Critical',
      currentValue: mdeDevice.sensorHealthState || 'Unknown',
      expectedValue: 'Active',
      details: `Sensor health state is "${mdeDevice.sensorHealthState}".`,
      severity,
    };
  }

  // Check last communication
  const lastSeen = mdeDevice.sensorLastSeen;
  if (!lastSeen) {
    return {
      category,
      name: 'Sensor Communication',
      status: 'Unknown',
      currentValue: 'No communication data',
      expectedValue: `Within ${healthyHours} hours`,
      details: 'Sensor last seen date is not available in the report.',
      severity,
    };
  }

  const ageHours = getAgeInHours(lastSeen, now);

  if (ageHours <= healthyHours) {
    return {
      category,
      name: 'Sensor Communication',
      status: 'Healthy',
      currentValue: `Last seen ${formatAge(lastSeen, now)} ago`,
      expectedValue: `Within ${healthyHours} hours`,
      details: `Sensor last communicated at ${formatDate(lastSeen)}.`,
      severity,
    };
  }

  if (ageHours <= warningHours) {
    return {
      category,
      name: 'Sensor Communication',
      status: 'Warning',
      currentValue: `Last seen ${formatAge(lastSeen, now)} ago`,
      expectedValue: `Within ${healthyHours} hours`,
      details: `Sensor communication is delayed. Last seen at ${formatDate(lastSeen)}.`,
      severity: 'Medium',
    };
  }

  return {
    category,
    name: 'Sensor Communication',
    status: 'Critical',
    currentValue: `Last seen ${formatAge(lastSeen, now)} ago`,
    expectedValue: `Within ${healthyHours} hours`,
    details: `Sensor has not communicated for ${formatAge(lastSeen, now)}. Last seen at ${formatDate(lastSeen)}.`,
    severity,
  };
}
