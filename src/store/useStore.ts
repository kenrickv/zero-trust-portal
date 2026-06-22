import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tenant, User, Device, Policy, Alert, Group, AccessRequest, EnforcementRecord, AuditLog, SecurityEvent, JourneyPhase, UserRole, Application } from '../types';
import { mockTenants, mockUsers, mockDevices, mockPolicies, mockAlerts, mockGroups, mockSecurityEvents, mockEnforcementRecords, mockAuditLogs, mockApplications, generateId } from '../data/mockData';

interface AppState {
    // Current session
    currentRole: UserRole;
    currentTenantId: string | null;
    currentPhase: JourneyPhase;

    // Data
    tenants: Tenant[];
    users: User[];
    devices: Device[];
    policies: Policy[];
    alerts: Alert[];
    groups: Group[];
    applications: Application[];
    accessRequests: AccessRequest[];
    enforcementRecords: EnforcementRecord[];
    auditLogs: AuditLog[];
    securityEvents: SecurityEvent[];

    // UI State
    isLoading: boolean;
    simulationMode: boolean;
    theme: 'dark' | 'light';

    // Actions
    setCurrentRole: (role: UserRole) => void;
    setCurrentTenantId: (id: string | null) => void;
    setCurrentPhase: (phase: JourneyPhase) => void;
    setLoading: (loading: boolean) => void;
    setSimulationMode: (mode: boolean) => void;
    toggleTheme: () => void;

    // Tenant actions
    createTenant: (tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Tenant>;
    updateTenant: (id: string, updates: Partial<Tenant>) => void;

    // User actions
    importUsers: (tenantId: string, users: Omit<User, 'id' | 'createdAt'>[]) => Promise<void>;
    updateUser: (id: string, updates: Partial<User>) => void;

    // Device actions
    enrollDevice: (device: Omit<Device, 'id' | 'enrolledAt'>) => Promise<Device>;
    updateDevice: (id: string, updates: Partial<Device>) => void;

    // Policy actions
    createPolicy: (policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Policy>;
    updatePolicy: (id: string, updates: Partial<Policy>) => void;
    togglePolicy: (id: string) => void;
    deletePolicy: (id: string) => void;

    // Alert actions
    updateAlert: (id: string, updates: Partial<Alert>) => void;
    dismissAlert: (id: string) => void;
    markAllAlertsRead: () => void;

    // Access simulation
    simulateAccess: (userId: string, deviceId: string, destination: string) => Promise<AccessRequest>;

    // Enforcement actions
    executeEnforcement: (record: Omit<EnforcementRecord, 'id' | 'performedAt' | 'status'>) => Promise<EnforcementRecord>;

    // Audit actions
    addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;

    // Reset
    resetToMockData: () => void;
}

// Simulated API delay
const apiDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Initial state
            currentRole: 'isp_admin',
            currentTenantId: 'tenant-001',
            currentPhase: 'day0',
            tenants: mockTenants,
            users: mockUsers,
            devices: mockDevices,
            policies: mockPolicies,
            alerts: mockAlerts,
            groups: mockGroups,
            applications: mockApplications,
            accessRequests: [],
            enforcementRecords: mockEnforcementRecords,
            auditLogs: mockAuditLogs,
            securityEvents: mockSecurityEvents,
            isLoading: false,
            simulationMode: false,
            theme: 'dark',

            setCurrentRole: (role) => set({ currentRole: role }),
            setCurrentTenantId: (id) => set({ currentTenantId: id }),
            setCurrentPhase: (phase) => set({ currentPhase: phase }),
            setLoading: (loading) => set({ isLoading: loading }),
            setSimulationMode: (mode) => set({ simulationMode: mode }),
            toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

            createTenant: async (tenantData) => {
                await apiDelay(1000);
                const tenant: Tenant = {
                    ...tenantData,
                    id: `tenant-${generateId().slice(0, 8)}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                set((state) => ({ tenants: [...state.tenants, tenant] }));
                return tenant;
            },

            updateTenant: (id, updates) => {
                set((state) => ({
                    tenants: state.tenants.map((t) =>
                        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
                    )
                }));
            },

            importUsers: async (tenantId, newUsers) => {
                await apiDelay(1500);
                const users: User[] = newUsers.map((u) => ({
                    ...u,
                    id: `user-${generateId().slice(0, 8)}`,
                    tenantId,
                    createdAt: new Date().toISOString()
                }));
                set((state) => ({ users: [...state.users, ...users] }));
            },

            updateUser: (id, updates) => {
                set((state) => ({
                    users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u))
                }));
            },

            enrollDevice: async (deviceData) => {
                await apiDelay(800);
                const device: Device = {
                    ...deviceData,
                    id: `dev-${generateId().slice(0, 8)}`,
                    enrolledAt: new Date().toISOString()
                };
                set((state) => ({ devices: [...state.devices, device] }));
                return device;
            },

            updateDevice: (id, updates) => {
                set((state) => ({
                    devices: state.devices.map((d) => (d.id === id ? { ...d, ...updates } : d))
                }));
            },

            createPolicy: async (policyData) => {
                await apiDelay(600);
                const policy: Policy = {
                    ...policyData,
                    id: `pol-${generateId().slice(0, 8)}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                set((state) => ({ policies: [...state.policies, policy] }));
                return policy;
            },

            updatePolicy: (id, updates) => {
                set((state) => ({
                    policies: state.policies.map((p) =>
                        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
                    )
                }));
            },

            togglePolicy: (id) => {
                set((state) => ({
                    policies: state.policies.map((p) =>
                        p.id === id ? { ...p, enabled: !p.enabled, updatedAt: new Date().toISOString() } : p
                    )
                }));
            },

            deletePolicy: (id) => {
                set((state) => ({
                    policies: state.policies.filter((p) => p.id !== id)
                }));
            },

            updateAlert: (id, updates) => {
                set((state) => ({
                    alerts: state.alerts.map((a) =>
                        a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
                    )
                }));
            },

            dismissAlert: (id) => {
                const now = new Date().toISOString();
                set((state) => ({
                    alerts: state.alerts.map((a) =>
                        a.id === id ? { ...a, status: 'dismissed', updatedAt: now } : a
                    )
                }));
            },

            markAllAlertsRead: () => {
                const now = new Date().toISOString();
                set((state) => ({
                    alerts: state.alerts.map((a) =>
                        a.status === 'new' ? { ...a, status: 'dismissed', updatedAt: now } : a
                    )
                }));
            },

            simulateAccess: async (userId, deviceId, destination) => {
                await apiDelay(1000);
                const state = get();
                const user = state.users.find((u) => u.id === userId);
                const device = state.devices.find((d) => d.id === deviceId);

                if (!user || !device) {
                    throw new Error('User or device not found');
                }

                const evaluationDetails = [];
                let decision: 'allowed' | 'denied' = 'allowed';
                const matchedPolicies: string[] = [];
                const remediationSteps: string[] = [];

                // Check device compliance
                const complianceCheck = device.complianceStatus === 'compliant';
                evaluationDetails.push({
                    check: 'Device Compliance',
                    passed: complianceCheck,
                    value: device.complianceStatus,
                    required: 'compliant',
                    message: complianceCheck ? 'Device meets compliance requirements' : 'Device is not compliant'
                });
                if (!complianceCheck) {
                    decision = 'denied';
                    matchedPolicies.push('pol-003');
                    remediationSteps.push('Ensure EDR agent is installed and healthy');
                    remediationSteps.push('Enable disk encryption');
                    remediationSteps.push('Update OS to latest version');
                }

                // Check MFA status
                evaluationDetails.push({
                    check: 'MFA Enabled',
                    passed: user.mfaEnabled,
                    value: user.mfaEnabled,
                    required: true,
                    message: user.mfaEnabled ? 'User has MFA enabled' : 'User does not have MFA enabled'
                });
                if (!user.mfaEnabled) {
                    decision = 'denied';
                    matchedPolicies.push('pol-002');
                    remediationSteps.push('Enable MFA for your account');
                }

                // Check user risk score
                const riskCheck = user.riskScore <= 70;
                evaluationDetails.push({
                    check: 'User Risk Score',
                    passed: riskCheck,
                    value: user.riskScore,
                    required: '≤ 70',
                    message: riskCheck ? 'User risk score is acceptable' : 'User risk score exceeds threshold'
                });
                if (!riskCheck) {
                    decision = 'denied';
                    matchedPolicies.push('pol-004');
                    remediationSteps.push('Contact security team to review risk factors');
                }

                // Check user status
                const statusCheck = user.status === 'active';
                evaluationDetails.push({
                    check: 'User Status',
                    passed: statusCheck,
                    value: user.status,
                    required: 'active',
                    message: statusCheck ? 'User account is active' : 'User account is blocked'
                });
                if (!statusCheck) {
                    decision = 'denied';
                    remediationSteps.push('Contact administrator to restore account access');
                }

                const accessRequest: AccessRequest = {
                    id: `req-${generateId().slice(0, 8)}`,
                    userId,
                    deviceId,
                    tenantId: user.tenantId,
                    destination,
                    destinationType: 'application',
                    timestamp: new Date().toISOString(),
                    decision,
                    matchedPolicies,
                    evaluationDetails,
                    remediationSteps: decision === 'denied' ? remediationSteps : undefined
                };

                set((state) => ({
                    accessRequests: [accessRequest, ...state.accessRequests]
                }));

                return accessRequest;
            },

            executeEnforcement: async (recordData) => {
                await apiDelay(800);
                const record: EnforcementRecord = {
                    ...recordData,
                    id: `enf-${generateId().slice(0, 8)}`,
                    performedAt: new Date().toISOString(),
                    status: 'executed'
                };

                // Apply enforcement effects
                if (record.action === 'quarantine' && record.targetType === 'device') {
                    get().updateDevice(record.targetId, { complianceStatus: 'non_compliant' });
                } else if (record.action === 'block_user' && record.targetType === 'user') {
                    get().updateUser(record.targetId, { status: 'blocked' });
                }

                set((state) => ({
                    enforcementRecords: [record, ...state.enforcementRecords]
                }));

                return record;
            },

            addAuditLog: (logData) => {
                const log: AuditLog = {
                    ...logData,
                    id: `aud-${generateId().slice(0, 8)}`,
                    timestamp: new Date().toISOString()
                };
                set((state) => ({
                    auditLogs: [log, ...state.auditLogs]
                }));
            },

            resetToMockData: () => {
                set({
                    tenants: mockTenants,
                    users: mockUsers,
                    devices: mockDevices,
                    policies: mockPolicies,
                    alerts: mockAlerts,
                    groups: mockGroups,
                    applications: mockApplications,
                    accessRequests: [],
                    enforcementRecords: mockEnforcementRecords,
                    auditLogs: mockAuditLogs,
                    securityEvents: mockSecurityEvents
                });
            }
        }),
        {
            name: 'zero-trust-portal-storage',
            partialize: (state) => ({
                tenants: state.tenants,
                users: state.users,
                devices: state.devices,
                policies: state.policies,
                alerts: state.alerts,
                groups: state.groups,
                applications: state.applications,
                accessRequests: state.accessRequests,
                enforcementRecords: state.enforcementRecords,
                auditLogs: state.auditLogs,
                securityEvents: state.securityEvents,
                currentRole: state.currentRole,
                currentTenantId: state.currentTenantId,
                currentPhase: state.currentPhase,
                theme: state.theme
            })
        }
    )
);
