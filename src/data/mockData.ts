import { v4 as uuidv4 } from 'uuid';
import type { Tenant, User, Device, DevicePosture, Policy, Alert, Group, Application, SecurityEvent, Report, EnforcementRecord, AuditLog, SIEMIntegration } from '../types';

const now = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();
const lastWeek = new Date(Date.now() - 604800000).toISOString();

// Mock Tenants
export const mockTenants: Tenant[] = [
    {
        id: 'tenant-001',
        name: 'Acme Corporation',
        domain: 'acme.com',
        status: 'active',
        ispPlan: 'Enterprise Plus',
        serviceBundle: 'Zero Trust Complete',
        iamProvider: 'entra_id',
        iamConnected: true,
        domainVerified: true,
        usersImported: true,
        createdAt: lastWeek,
        updatedAt: now
    },
    {
        id: 'tenant-002',
        name: 'TechStart Inc',
        domain: 'techstart.io',
        status: 'provisioning',
        ispPlan: 'Business Standard',
        serviceBundle: 'SSE Essentials',
        iamProvider: 'okta',
        iamConnected: false,
        domainVerified: true,
        usersImported: false,
        createdAt: yesterday,
        updatedAt: now
    }
];

// Mock Users
export const mockUsers: User[] = [
    { id: 'user-001', tenantId: 'tenant-001', email: 'john.smith@acme.com', displayName: 'John Smith', role: 'customer_admin', department: 'IT', groups: ['IT Admins', 'All Employees'], mfaEnabled: true, riskScore: 15, status: 'active', lastLogin: now, createdAt: lastWeek },
    { id: 'user-002', tenantId: 'tenant-001', email: 'sarah.jones@acme.com', displayName: 'Sarah Jones', role: 'security_analyst', department: 'Security', groups: ['Security Team', 'All Employees'], mfaEnabled: true, riskScore: 10, status: 'active', lastLogin: yesterday, createdAt: lastWeek },
    { id: 'user-003', tenantId: 'tenant-001', email: 'mike.wilson@acme.com', displayName: 'Mike Wilson', role: 'end_user', department: 'Engineering', groups: ['Engineering', 'All Employees'], mfaEnabled: true, riskScore: 25, status: 'active', lastLogin: yesterday, createdAt: lastWeek },
    { id: 'user-004', tenantId: 'tenant-001', email: 'emily.brown@acme.com', displayName: 'Emily Brown', role: 'end_user', department: 'Sales', groups: ['Sales', 'All Employees'], mfaEnabled: false, riskScore: 45, status: 'active', lastLogin: lastWeek, createdAt: lastWeek },
    { id: 'user-005', tenantId: 'tenant-001', email: 'david.lee@acme.com', displayName: 'David Lee', role: 'end_user', department: 'Finance', groups: ['Finance', 'All Employees'], mfaEnabled: true, riskScore: 5, status: 'active', lastLogin: now, createdAt: lastWeek },
    { id: 'user-006', tenantId: 'tenant-001', email: 'lisa.chen@acme.com', displayName: 'Lisa Chen', role: 'end_user', department: 'HR', groups: ['HR', 'All Employees'], mfaEnabled: true, riskScore: 60, status: 'blocked', lastLogin: lastWeek, createdAt: lastWeek }
];

const createPosture = (compliant: boolean): DevicePosture => ({
    edrInstalled: compliant,
    edrHealthy: compliant,
    edrProvider: 'crowdstrike',
    diskEncrypted: compliant,
    osCompliant: compliant,
    firewallEnabled: compliant,
    antivirusEnabled: compliant,
    riskScore: compliant ? 10 : 75,
    lastChecked: now
});

// Mock Devices
export const mockDevices: Device[] = [
    { id: 'dev-001', userId: 'user-001', tenantId: 'tenant-001', name: 'ACME-DESKTOP-001', type: 'windows', os: 'Windows', osVersion: '11 Pro 23H2', agentInstalled: true, agentVersion: '3.2.1', complianceStatus: 'compliant', posture: createPosture(true), lastSeen: now, enrolledAt: lastWeek },
    { id: 'dev-002', userId: 'user-002', tenantId: 'tenant-001', name: 'ACME-MBP-002', type: 'macos', os: 'macOS', osVersion: 'Sonoma 14.3', agentInstalled: true, agentVersion: '3.2.1', complianceStatus: 'compliant', posture: createPosture(true), lastSeen: now, enrolledAt: lastWeek },
    { id: 'dev-003', userId: 'user-003', tenantId: 'tenant-001', name: 'ACME-LAPTOP-003', type: 'windows', os: 'Windows', osVersion: '10 Pro 22H2', agentInstalled: true, agentVersion: '3.1.0', complianceStatus: 'non_compliant', posture: { ...createPosture(false), diskEncrypted: false, osCompliant: false }, lastSeen: yesterday, enrolledAt: lastWeek },
    { id: 'dev-004', userId: 'user-004', tenantId: 'tenant-001', name: 'ACME-MBP-004', type: 'macos', os: 'macOS', osVersion: 'Ventura 13.6', agentInstalled: false, complianceStatus: 'non_compliant', posture: { ...createPosture(false), edrInstalled: false, edrHealthy: false }, lastSeen: lastWeek, enrolledAt: lastWeek },
    { id: 'dev-005', userId: 'user-005', tenantId: 'tenant-001', name: 'ACME-DESKTOP-005', type: 'windows', os: 'Windows', osVersion: '11 Pro 23H2', agentInstalled: true, agentVersion: '3.2.1', complianceStatus: 'compliant', posture: createPosture(true), lastSeen: now, enrolledAt: lastWeek }
];

// Mock Groups
export const mockGroups: Group[] = [
    { id: 'grp-001', tenantId: 'tenant-001', name: 'IT Admins', description: 'IT administrators with elevated access', memberCount: 5, source: 'iam' },
    { id: 'grp-002', tenantId: 'tenant-001', name: 'Security Team', description: 'Security operations and analysts', memberCount: 8, source: 'iam' },
    { id: 'grp-003', tenantId: 'tenant-001', name: 'Engineering', description: 'Engineering department', memberCount: 45, source: 'iam' },
    { id: 'grp-004', tenantId: 'tenant-001', name: 'Sales', description: 'Sales department', memberCount: 32, source: 'iam' },
    { id: 'grp-005', tenantId: 'tenant-001', name: 'Finance', description: 'Finance department', memberCount: 12, source: 'iam' },
    { id: 'grp-006', tenantId: 'tenant-001', name: 'All Employees', description: 'All company employees', memberCount: 150, source: 'iam' }
];

// Mock Policies
export const mockPolicies: Policy[] = [
    { id: 'pol-001', tenantId: 'tenant-001', name: 'Block Malicious URLs', description: 'Block access to known malicious websites', type: 'url_filter', enabled: true, priority: 1, conditions: [{ field: 'url_category', operator: 'in', value: ['malware', 'phishing', 'command_control'] }], actions: [{ type: 'deny' }, { type: 'log' }], createdBy: 'user-001', createdAt: lastWeek, updatedAt: now },
    { id: 'pol-002', tenantId: 'tenant-001', name: 'Require MFA for Finance Apps', description: 'Enforce MFA for all finance applications', type: 'ztna', enabled: true, priority: 2, conditions: [{ field: 'app_category', operator: 'equals', value: 'finance' }, { field: 'mfa_status', operator: 'equals', value: false }], actions: [{ type: 'deny' }], createdBy: 'user-001', createdAt: lastWeek, updatedAt: now },
    { id: 'pol-003', tenantId: 'tenant-001', name: 'Block Non-Compliant Devices', description: 'Deny access from devices that fail compliance checks', type: 'ztna', enabled: true, priority: 1, conditions: [{ field: 'device_compliance', operator: 'equals', value: false }], actions: [{ type: 'deny' }], createdBy: 'user-002', createdAt: lastWeek, updatedAt: now },
    { id: 'pol-004', tenantId: 'tenant-001', name: 'High Risk User Block', description: 'Block users with risk score above 70', type: 'ztna', enabled: true, priority: 1, conditions: [{ field: 'user_risk_score', operator: 'greater_than', value: 70 }], actions: [{ type: 'deny' }, { type: 'alert' }], createdBy: 'user-002', createdAt: lastWeek, updatedAt: now },
    { id: 'pol-005', tenantId: 'tenant-001', name: 'TLS Inspection', description: 'Decrypt and inspect TLS traffic', type: 'tls', enabled: true, priority: 5, conditions: [], actions: [{ type: 'log' }], createdBy: 'user-001', createdAt: lastWeek, updatedAt: now },
    { id: 'pol-006', tenantId: 'tenant-001', name: 'CASB Shadow IT Detection', description: 'Monitor and alert on unauthorized SaaS usage', type: 'casb', enabled: true, priority: 3, conditions: [{ field: 'app_sanctioned', operator: 'equals', value: false }], actions: [{ type: 'alert' }, { type: 'log' }], createdBy: 'user-002', createdAt: lastWeek, updatedAt: now }
];

// Mock Applications
export const mockApplications: Application[] = [
    { id: 'app-001', name: 'Salesforce', url: 'https://acme.salesforce.com', category: 'CRM', riskLevel: 'low', requiresMFA: true, certPinned: true },
    { id: 'app-002', name: 'SAP ERP', url: 'https://erp.acme.com', category: 'finance', riskLevel: 'low', requiresMFA: true, certPinned: true },
    { id: 'app-003', name: 'GitHub Enterprise', url: 'https://github.acme.com', category: 'Development', riskLevel: 'medium', requiresMFA: true, certPinned: false },
    { id: 'app-004', name: 'Jira', url: 'https://jira.acme.com', category: 'Project Management', riskLevel: 'low', requiresMFA: false, certPinned: false },
    { id: 'app-005', name: 'Internal Wiki', url: 'https://wiki.acme.com', category: 'Documentation', riskLevel: 'low', requiresMFA: false, certPinned: false }
];

// Mock Alerts
export const mockAlerts: Alert[] = [
    { id: 'alert-001', tenantId: 'tenant-001', severity: 'critical', title: 'Ransomware Detected', description: 'CrowdStrike detected ransomware behavior on device ACME-LAPTOP-003', source: 'edr', affectedUserId: 'user-003', affectedDeviceId: 'dev-003', ioc: { type: 'hash', value: 'a1b2c3d4e5f6...', threat: 'Ryuk Ransomware', confidence: 95 }, status: 'new', createdAt: now, updatedAt: now },
    { id: 'alert-002', tenantId: 'tenant-001', severity: 'high', title: 'Impossible Travel Detected', description: 'User login from multiple geographic locations within 1 hour', source: 'iam', affectedUserId: 'user-006', status: 'investigating', createdAt: yesterday, updatedAt: now },
    { id: 'alert-003', tenantId: 'tenant-001', severity: 'high', title: 'Command & Control Communication', description: 'Device attempted connection to known C2 server', source: 'sse', affectedDeviceId: 'dev-003', ioc: { type: 'ip', value: '185.234.72.14', threat: 'Cobalt Strike C2', confidence: 88 }, status: 'new', createdAt: now, updatedAt: now },
    { id: 'alert-004', tenantId: 'tenant-001', severity: 'medium', title: 'Multiple Failed MFA Attempts', description: 'User experienced 5 failed MFA attempts in 10 minutes', source: 'iam', affectedUserId: 'user-004', status: 'resolved', createdAt: yesterday, updatedAt: yesterday },
    { id: 'alert-005', tenantId: 'tenant-001', severity: 'low', title: 'Shadow IT Application Detected', description: 'Unauthorized SaaS application usage detected', source: 'sse', affectedUserId: 'user-003', status: 'dismissed', createdAt: lastWeek, updatedAt: lastWeek },
    { id: 'alert-006', tenantId: 'tenant-001', severity: 'medium', title: 'Unusual Data Exfiltration Pattern', description: 'Large volume of data transferred to external storage in off-hours window', source: 'sse', affectedUserId: 'user-004', affectedDeviceId: 'dev-004', status: 'new', createdAt: now, updatedAt: now },
    { id: 'alert-007', tenantId: 'tenant-001', severity: 'high', title: 'Blocked User Access Attempt', description: 'Blocked user account attempted to authenticate via legacy protocol', source: 'iam', affectedUserId: 'user-006', status: 'new', createdAt: yesterday, updatedAt: yesterday }
];

// Mock Security Events
export const mockSecurityEvents: SecurityEvent[] = [
    { id: 'evt-001', tenantId: 'tenant-001', type: 'LOGIN_SUCCESS', source: 'iam', severity: 'info', description: 'User logged in successfully', userId: 'user-001', metadata: { ip: '192.168.1.100', location: 'San Francisco, CA' }, timestamp: now },
    { id: 'evt-002', tenantId: 'tenant-001', type: 'MALWARE_BLOCKED', source: 'edr', severity: 'high', description: 'Malware execution blocked', deviceId: 'dev-003', metadata: { malwareType: 'Trojan', action: 'Quarantined' }, timestamp: now },
    { id: 'evt-003', tenantId: 'tenant-001', type: 'URL_BLOCKED', source: 'sse', severity: 'medium', description: 'Blocked access to malicious URL', userId: 'user-003', metadata: { url: 'http://malware.example.com', category: 'Phishing' }, timestamp: yesterday },
    { id: 'evt-004', tenantId: 'tenant-001', type: 'POLICY_VIOLATION', source: 'sse', severity: 'medium', description: 'Access denied due to policy violation', userId: 'user-004', deviceId: 'dev-004', metadata: { policy: 'Block Non-Compliant Devices' }, timestamp: yesterday },
    { id: 'evt-005', tenantId: 'tenant-001', type: 'MFA_FAILED', source: 'iam', severity: 'medium', description: 'MFA verification failed', userId: 'user-004', metadata: { attempts: 3 }, timestamp: yesterday }
];

// More mock data generators
export const generateId = () => uuidv4();

export const mockReports: Report[] = [
    { id: 'rpt-001', tenantId: 'tenant-001', name: 'Monthly Security Posture', type: 'posture', period: 'monthly', generatedAt: now, data: { compliantDevices: 85, totalDevices: 100, riskScore: 22 } },
    { id: 'rpt-002', tenantId: 'tenant-001', name: 'Access Decision Summary', type: 'access', period: 'monthly', generatedAt: now, data: { allowed: 15420, denied: 234, totalRequests: 15654 } },
    { id: 'rpt-003', tenantId: 'tenant-001', name: 'Policy Enforcement Report', type: 'policy', period: 'weekly', generatedAt: now, data: { activePolicy: 6, policyHits: 892, topPolicy: 'Block Malicious URLs' } }
];

export const mockEnforcementRecords: EnforcementRecord[] = [
    { id: 'enf-001', tenantId: 'tenant-001', action: 'quarantine', targetType: 'device', targetId: 'dev-003', reason: 'Ransomware detected', performedBy: 'user-002', performedAt: now, status: 'executed' },
    { id: 'enf-002', tenantId: 'tenant-001', action: 'block_user', targetType: 'user', targetId: 'user-006', reason: 'Impossible travel detected', performedBy: 'user-002', performedAt: yesterday, status: 'executed' }
];

export const mockAuditLogs: AuditLog[] = [
    { id: 'aud-001', tenantId: 'tenant-001', action: 'POLICY_CREATED', actor: 'user-001', actorRole: 'customer_admin', target: 'pol-001', targetType: 'policy', details: 'Created policy: Block Malicious URLs', timestamp: lastWeek, ipAddress: '192.168.1.100' },
    { id: 'aud-002', tenantId: 'tenant-001', action: 'DEVICE_QUARANTINED', actor: 'user-002', actorRole: 'security_analyst', target: 'dev-003', targetType: 'device', details: 'Device quarantined due to ransomware detection', timestamp: now, ipAddress: '192.168.1.101' }
];

export const mockSIEMIntegration: SIEMIntegration = {
    id: 'siem-001',
    tenantId: 'tenant-001',
    name: 'Microsoft Sentinel',
    type: 'sentinel',
    status: 'connected',
    lastSync: now,
    eventsForwarded: 125847
};
