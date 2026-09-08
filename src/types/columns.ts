// Column mapping types
export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  confidence: number; // 0-1 from auto-detection
  isManual: boolean;
}

export interface ColumnMappingSet {
  intune: ColumnMapping[];
  mde: ColumnMapping[];
}

// Target field definitions
export interface FieldDefinition {
  key: string;
  label: string;
  required: boolean;
  type: 'string' | 'date' | 'version' | 'boolean' | 'number';
  aliases: string[];
  description: string;
}

export const INTUNE_FIELDS: FieldDefinition[] = [
  {
    key: 'deviceName',
    label: 'Device Name',
    required: true,
    type: 'string',
    aliases: [
      'device name', 'devicename', 'computer name', 'computername',
      'device', 'hostname', 'host name', 'machine name', 'machinename',
      'name', 'managed device name', 'device_name', 'computer_name',
      'host_name', 'machine_name', 'endpoint name', 'endpoint',
    ],
    description: 'The device/computer name',
  },
  {
    key: 'deviceId',
    label: 'Device ID',
    required: false,
    type: 'string',
    aliases: [
      'device id', 'deviceid', 'device_id', 'intune device id',
      'azure ad device id', 'aad device id', 'id',
    ],
    description: 'Unique device identifier',
  },
  {
    key: 'lastCheckIn',
    label: 'Last Check-in',
    required: true,
    type: 'date',
    aliases: [
      'last check-in', 'last checkin', 'last check in', 'lastcheckin',
      'last contact', 'lastcontact', 'last sync', 'lastsync',
      'last seen', 'lastseen', 'last activity', 'last_check_in',
      'last_checkin', 'last_contact', 'last_sync', 'last_seen',
      'last communication', 'last report', 'last reported',
      'management date', 'last management date',
    ],
    description: 'Last Intune check-in/sync date',
  },
  {
    key: 'compliance',
    label: 'Compliance',
    required: false,
    type: 'string',
    aliases: [
      'compliance', 'compliance state', 'compliance status',
      'compliancestate', 'device compliance', 'is compliant',
    ],
    description: 'Intune compliance state',
  },
  {
    key: 'operatingSystem',
    label: 'Operating System',
    required: false,
    type: 'string',
    aliases: [
      'operating system', 'os', 'os name', 'platform', 'os type',
      'operating_system', 'device type',
    ],
    description: 'Operating system name',
  },
  {
    key: 'osVersion',
    label: 'OS Version',
    required: false,
    type: 'string',
    aliases: [
      'os version', 'osversion', 'os_version', 'operating system version',
      'windows version', 'build', 'build number',
    ],
    description: 'Operating system version',
  },
  {
    key: 'primaryUser',
    label: 'Primary User',
    required: false,
    type: 'string',
    aliases: [
      'primary user', 'primaryuser', 'primary_user', 'user',
      'user name', 'username', 'enrolled by', 'enrolled user',
      'user principal name', 'upn', 'email', 'primary user upn',
      'primary user email address',
    ],
    description: 'Primary user of the device',
  },
];

export const MDE_FIELDS: FieldDefinition[] = [
  {
    key: 'deviceName',
    label: 'Device Name',
    required: true,
    type: 'string',
    aliases: [
      'device name', 'devicename', 'computer name', 'computername',
      'device', 'hostname', 'host name', 'machine name', 'machinename',
      'name', 'machine', 'computer', 'device_name', 'computer_name',
      'host_name', 'machine_name', 'endpoint name', 'endpoint',
    ],
    description: 'The device/computer name',
  },
  {
    key: 'deviceId',
    label: 'Device ID',
    required: false,
    type: 'string',
    aliases: [
      'device id', 'deviceid', 'device_id', 'mde device id',
      'machine id', 'machineid',
    ],
    description: 'MDE device identifier',
  },
  {
    key: 'sensorHealthState',
    label: 'Sensor Health State',
    required: false,
    type: 'string',
    aliases: [
      'sensor health state', 'sensor health', 'sensorhealth',
      'sensor status', 'sensor_health_state', 'sensor_health',
      'health state', 'health status',
    ],
    description: 'MDE sensor health state',
  },
  {
    key: 'antivirusSignatureVersion',
    label: 'Antivirus Signature Version',
    required: false,
    type: 'version',
    aliases: [
      'antivirus signature version', 'signature version',
      'antivirus security intelligence version',
      'security intelligence version', 'av signature version',
      'av signature', 'signature', 'definition version',
      'antivirus_signature_version', 'security_intelligence_version',
    ],
    description: 'Antivirus signature/security intelligence version',
  },
  {
    key: 'signatureUpdateDate',
    label: 'Signature Update Date',
    required: false,
    type: 'date',
    aliases: [
      'signature update date', 'signature date', 'signature updated',
      'definition update date', 'security intelligence update',
      'last signature update', 'signature_update_date',
      'av signature update', 'last definition update',
    ],
    description: 'Date when AV signatures were last updated',
  },
  {
    key: 'platformVersion',
    label: 'Platform Version',
    required: false,
    type: 'version',
    aliases: [
      'platform version', 'antivirus platform version',
      'av platform version', 'engine version', 'defender version',
      'platform_version', 'antivirus_platform_version',
    ],
    description: 'Microsoft Defender antivirus platform version',
  },
  {
    key: 'quickScanStatus',
    label: 'Quick Scan Status',
    required: false,
    type: 'string',
    aliases: [
      'quick scan status', 'quickscanstatus', 'quick_scan_status',
      'quick scan result', 'quick scan state',
    ],
    description: 'Status of the last quick scan',
  },
  {
    key: 'quickScanStartTime',
    label: 'Quick Scan Start Time',
    required: false,
    type: 'date',
    aliases: [
      'quick scan start time', 'quick scan start', 'quick scan date',
      'last quick scan', 'last quick scan date', 'quick_scan_start_time',
      'quick scan time',
    ],
    description: 'Start time of the last quick scan',
  },
  {
    key: 'quickScanEndTime',
    label: 'Quick Scan End Time',
    required: false,
    type: 'date',
    aliases: [
      'quick scan end time', 'quick scan end', 'quick scan completed',
      'quick_scan_end_time',
    ],
    description: 'End time of the last quick scan',
  },
  {
    key: 'fullScanStatus',
    label: 'Full Scan Status',
    required: false,
    type: 'string',
    aliases: [
      'full scan status', 'fullscanstatus', 'full_scan_status',
      'full scan result', 'full scan state',
    ],
    description: 'Status of the last full scan',
  },
  {
    key: 'fullScanStartTime',
    label: 'Full Scan Start Time',
    required: false,
    type: 'date',
    aliases: [
      'full scan start time', 'full scan start', 'full scan date',
      'last full scan', 'last full scan date', 'full_scan_start_time',
      'full scan time',
    ],
    description: 'Start time of the last full scan',
  },
  {
    key: 'fullScanEndTime',
    label: 'Full Scan End Time',
    required: false,
    type: 'date',
    aliases: [
      'full scan end time', 'full scan end', 'full scan completed',
      'full_scan_end_time',
    ],
    description: 'End time of the last full scan',
  },
  {
    key: 'sensorLastSeen',
    label: 'Sensor Last Seen',
    required: false,
    type: 'date',
    aliases: [
      'sensor last seen', 'last seen', 'last communication',
      'last heartbeat', 'last contact', 'sensor_last_seen',
      'last_communication', 'last active', 'last reported',
    ],
    description: 'Last time the MDE sensor communicated',
  },
  {
    key: 'realTimeProtection',
    label: 'Real-time Protection',
    required: false,
    type: 'string',
    aliases: [
      'real-time protection', 'real time protection', 'realtime protection',
      'rtp', 'real_time_protection', 'realtimeprotection',
      'real-time protection status',
    ],
    description: 'Real-time protection state',
  },
  {
    key: 'tamperProtection',
    label: 'Tamper Protection',
    required: false,
    type: 'string',
    aliases: [
      'tamper protection', 'tamperprotection', 'tamper_protection',
      'tamper protection status', 'tamper protection state',
    ],
    description: 'Tamper protection state',
  },
  {
    key: 'antivirusEnabled',
    label: 'Antivirus Enabled',
    required: false,
    type: 'string',
    aliases: [
      'antivirus enabled', 'av enabled', 'antivirus status',
      'av status', 'antivirus_enabled', 'defender enabled',
      'antivirus state', 'microsoft defender antivirus',
    ],
    description: 'Whether antivirus is enabled',
  },
  {
    key: 'edrSensor',
    label: 'EDR Sensor',
    required: false,
    type: 'string',
    aliases: [
      'edr sensor', 'edr', 'edr sensor health', 'edr status',
      'edr_sensor', 'endpoint detection', 'edr sensor state',
    ],
    description: 'EDR sensor health state',
  },
  {
    key: 'onboardingStatus',
    label: 'Onboarding Status',
    required: false,
    type: 'string',
    aliases: [
      'onboarding status', 'onboarding', 'onboarding state',
      'onboarded', 'mde onboarding', 'onboarding_status',
      'defender for endpoint onboarding status',
    ],
    description: 'MDE onboarding status',
  },
  {
    key: 'deviceRisk',
    label: 'Device Risk',
    required: false,
    type: 'string',
    aliases: [
      'device risk', 'risk', 'risk level', 'risk score',
      'exposure level', 'device_risk', 'machine risk',
    ],
    description: 'Device risk/exposure level',
  },
  {
    key: 'osVersion',
    label: 'OS Version',
    required: false,
    type: 'string',
    aliases: [
      'os version', 'osversion', 'os_version', 'operating system version',
    ],
    description: 'Operating system version',
  },
  {
    key: 'firewallEnabled',
    label: 'Firewall Enabled',
    required: false,
    type: 'string',
    aliases: [
      'firewall enabled', 'firewall', 'firewall status', 'firewall state',
      'firewall_enabled', 'windows firewall',
    ],
    description: 'Firewall enabled state',
  },
  {
    key: 'firewallDomainProfile',
    label: 'Firewall Domain Profile',
    required: false,
    type: 'string',
    aliases: [
      'firewall domain profile', 'domain profile', 'firewall domain',
      'firewall_domain_profile',
    ],
    description: 'Firewall domain profile state',
  },
  {
    key: 'firewallPrivateProfile',
    label: 'Firewall Private Profile',
    required: false,
    type: 'string',
    aliases: [
      'firewall private profile', 'private profile', 'firewall private',
      'firewall_private_profile',
    ],
    description: 'Firewall private profile state',
  },
  {
    key: 'firewallPublicProfile',
    label: 'Firewall Public Profile',
    required: false,
    type: 'string',
    aliases: [
      'firewall public profile', 'public profile', 'firewall public',
      'firewall_public_profile',
    ],
    description: 'Firewall public profile state',
  },
  {
    key: 'networkProtectionEnabled',
    label: 'Network Protection',
    required: false,
    type: 'string',
    aliases: [
      'network protection enabled', 'network protection',
      'network_protection_enabled', 'network protection status',
    ],
    description: 'Network protection state',
  },
  {
    key: 'networkProtectionMode',
    label: 'Network Protection Mode',
    required: false,
    type: 'string',
    aliases: [
      'network protection mode', 'network_protection_mode',
      'np mode',
    ],
    description: 'Network protection mode',
  },
  {
    key: 'cloudDeliveredProtection',
    label: 'Cloud-Delivered Protection',
    required: false,
    type: 'string',
    aliases: [
      'cloud-delivered protection', 'cloud delivered protection',
      'cloud protection', 'maps', 'cloud_delivered_protection',
      'cloud-delivered protection status',
    ],
    description: 'Cloud-delivered protection state',
  },
  {
    key: 'automaticSampleSubmission',
    label: 'Automatic Sample Submission',
    required: false,
    type: 'string',
    aliases: [
      'automatic sample submission', 'sample submission',
      'auto sample submission', 'automatic_sample_submission',
      'sample submission status',
    ],
    description: 'Automatic sample submission state',
  },
  {
    key: 'asrRules',
    label: 'ASR Rules',
    required: false,
    type: 'string',
    aliases: [
      'asr rules', 'attack surface reduction', 'asr',
      'asr_rules', 'attack surface reduction rules',
    ],
    description: 'Attack surface reduction rules state',
  },
];
