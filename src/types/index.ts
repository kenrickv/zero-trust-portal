// Core Types for Zero Trust Portal

export type UserRole = 'isp_admin' | 'customer_admin' | 'security_analyst' | 'end_user';
export type JourneyPhase = 'phase1' | 'phase2' | 'day0' | 'day1' | 'day2' | 'ops';
export type TenantStatus = 'pending' | 'active' | 'suspended' | 'provisioning';
export type IAMProvider = 'entra_id' | 'okta' | 'ping' | 'custom';
export type EDRProvider = 'crowdstrike' | 'symantec' | 'defender' | 'custom';
export type DeviceType = 'windows' | 'macos' | 'linux' | 'ios' | 'android';
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'pending' | 'unknown';
export type PolicyType = 'ip_filter' | 'url_filter' | 'malware' | 'atp' | 'casb' | 'tls' | 'ztna';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type EnforcementAction = 'quarantine' | 'revoke_session' | 'block_destination' | 'force_mfa' | 'block_user';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: TenantStatus;
  ispPlan: string;
  serviceBundle: string;
  iamProvider?: IAMProvider;
  iamConnected: boolean;
  domainVerified: boolean;
  usersImported: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  displayName: string;
  role: UserRole;
  department?: string;
  groups: string[];
  mfaEnabled: boolean;
  riskScore: number;
  status: 'active' | 'inactive' | 'blocked';
  lastLogin?: string;
  createdAt: string;
}

export interface DevicePosture {
  edrInstalled: boolean;
  edrHealthy: boolean;
  edrProvider?: EDRProvider;
  diskEncrypted: boolean;
  osCompliant: boolean;
  firewallEnabled: boolean;
  antivirusEnabled: boolean;
  riskScore: number;
  lastChecked: string;
}

export interface Device {
  id: string;
  userId: string;
  tenantId: string;
  name: string;
  type: DeviceType;
  os: string;
  osVersion: string;
  agentInstalled: boolean;
  agentVersion?: string;
  complianceStatus: ComplianceStatus;
  posture: DevicePosture;
  lastSeen?: string;
  enrolledAt: string;
}

export interface PolicyCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'greater_than' | 'less_than';
  value: string | string[] | number | boolean;
}

export interface PolicyAction {
  type: 'allow' | 'deny' | 'redirect' | 'log' | 'alert';
  parameters?: Record<string, unknown>;
}

export interface Policy {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  type: PolicyType;
  enabled: boolean;
  priority: number;
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationDetail {
  check: string;
  passed: boolean;
  value?: string | number | boolean;
  required?: string | number | boolean;
  message: string;
}

export interface AccessRequest {
  id: string;
  userId: string;
  deviceId: string;
  tenantId: string;
  destination: string;
  destinationType: 'application' | 'url' | 'ip';
  timestamp: string;
  decision: 'allowed' | 'denied' | 'pending';
  matchedPolicies: string[];
  evaluationDetails: EvaluationDetail[];
  remediationSteps?: string[];
}

export interface IndicatorOfCompromise {
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email';
  value: string;
  threat: string;
  confidence: number;
}

export interface Alert {
  id: string;
  tenantId: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  source: 'iam' | 'edr' | 'sse' | 'siem';
  affectedUserId?: string;
  affectedDeviceId?: string;
  ioc?: IndicatorOfCompromise;
  status: 'new' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  tenantId: string;
  name: string;
  type: 'posture' | 'access' | 'policy' | 'compliance' | 'executive';
  period: 'daily' | 'weekly' | 'monthly';
  generatedAt: string;
  data: Record<string, unknown>;
}

export interface EnforcementRecord {
  id: string;
  tenantId: string;
  action: EnforcementAction;
  targetType: 'user' | 'device' | 'destination';
  targetId: string;
  reason: string;
  performedBy: string;
  performedAt: string;
  status: 'pending' | 'executed' | 'failed' | 'reverted';
}

export interface AuditLog {
  id: string;
  tenantId: string;
  action: string;
  actor: string;
  actorRole: UserRole;
  target: string;
  targetType: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface SIEMIntegration {
  id: string;
  tenantId: string;
  name: string;
  type: 'splunk' | 'sentinel' | 'qradar' | 'elastic';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  eventsForwarded: number;
}

export interface SecurityEvent {
  id: string;
  tenantId: string;
  type: string;
  source: 'iam' | 'edr' | 'sse';
  severity: AlertSeverity;
  description: string;
  userId?: string;
  deviceId?: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export interface URLCategory {
  id: string;
  name: string;
  description: string;
  action: 'allow' | 'block' | 'warn';
}

export interface Application {
  id: string;
  name: string;
  url: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'high';
  requiresMFA: boolean;
  certPinned: boolean;
}

export interface Group {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  memberCount: number;
  source: 'iam' | 'manual';
}
