import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Monitor, Shield, CheckCircle2, XCircle, AlertTriangle, Loader2, Laptop, Smartphone, HardDrive, Wifi, WifiOff, RefreshCw, Send, ChevronRight, ChevronDown } from 'lucide-react';
import './Day1.css';

const edrProviders = [
    { id: 'crowdstrike', name: 'CrowdStrike Falcon', logo: '🦅' },
    { id: 'symantec', name: 'Symantec Endpoint', logo: '🛡️' },
    { id: 'defender', name: 'Microsoft Defender', logo: '🔷' }
];

const complianceRules = [
    { id: 'edr', label: 'EDR Agent Installed & Healthy', icon: Shield },
    { id: 'disk', label: 'Disk Encryption Enabled', icon: HardDrive },
    { id: 'os', label: 'OS Version Compliant', icon: Laptop },
    { id: 'risk', label: 'Risk Score Below Threshold (< 50)', icon: AlertTriangle }
];

export function Day1Page() {
    const { devices, users, currentTenantId, updateDevice } = useStore();

    const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
    const [isDeployingAgent, setIsDeployingAgent] = useState(false);
    const [isPullingPosture, setIsPullingPosture] = useState(false);

    const [expandedDevice, setExpandedDevice] = useState<string | null>(null);

    const tenantDevices = devices.filter(d => d.tenantId === currentTenantId);
    const tenantUsers = users.filter(u => u.tenantId === currentTenantId);

    const compliantCount = tenantDevices.filter(d => d.complianceStatus === 'compliant').length;
    const nonCompliantCount = tenantDevices.filter(d => d.complianceStatus === 'non_compliant').length;

    const getDeviceIcon = (type: string) => {
        switch (type) {
            case 'windows':
            case 'macos':
            case 'linux':
                return Laptop;
            case 'ios':
            case 'android':
                return Smartphone;
            default:
                return Monitor;
        }
    };

    const getComplianceChecks = (device: typeof tenantDevices[0]) => {
        return [
            { rule: 'EDR Installed & Healthy', passed: device.posture.edrInstalled && device.posture.edrHealthy, value: device.posture.edrHealthy ? 'Healthy' : 'Not Healthy' },
            { rule: 'Disk Encryption', passed: device.posture.diskEncrypted, value: device.posture.diskEncrypted ? 'Enabled' : 'Disabled' },
            { rule: 'OS Compliance', passed: device.posture.osCompliant, value: device.posture.osCompliant ? 'Compliant' : 'Non-Compliant' },
            { rule: 'Risk Score', passed: device.posture.riskScore < 50, value: `${device.posture.riskScore}/100` },
            { rule: 'Firewall', passed: device.posture.firewallEnabled, value: device.posture.firewallEnabled ? 'Enabled' : 'Disabled' },
            { rule: 'Antivirus', passed: device.posture.antivirusEnabled, value: device.posture.antivirusEnabled ? 'Active' : 'Inactive' }
        ];
    };

    const handleDeployAgent = async (deviceId: string) => {
        setIsDeployingAgent(true);
        await new Promise(r => setTimeout(r, 2000));

        updateDevice(deviceId, {
            agentInstalled: true,
            agentVersion: '3.2.1',
            posture: {
                ...devices.find(d => d.id === deviceId)!.posture,
                edrInstalled: true,
                edrHealthy: true,
                edrProvider: 'crowdstrike'
            }
        });

        setIsDeployingAgent(false);
    };

    const handlePullPosture = async (deviceId: string) => {
        setIsPullingPosture(true);
        setSelectedDevice(deviceId);

        await new Promise(r => setTimeout(r, 1500));

        const device = devices.find(d => d.id === deviceId);
        if (device) {
            const allCompliant = device.posture.edrInstalled &&
                device.posture.edrHealthy &&
                device.posture.diskEncrypted &&
                device.posture.osCompliant &&
                device.posture.riskScore < 50;

            updateDevice(deviceId, {
                complianceStatus: allCompliant ? 'compliant' : 'non_compliant',
                lastSeen: new Date().toISOString(),
                posture: {
                    ...device.posture,
                    lastChecked: new Date().toISOString()
                }
            });
        }

        setIsPullingPosture(false);
        setSelectedDevice(null);
    };

    const handleRemediate = async (deviceId: string) => {
        setSelectedDevice(deviceId);
        await new Promise(r => setTimeout(r, 2000));

        updateDevice(deviceId, {
            complianceStatus: 'compliant',
            posture: {
                edrInstalled: true,
                edrHealthy: true,
                edrProvider: 'crowdstrike',
                diskEncrypted: true,
                osCompliant: true,
                firewallEnabled: true,
                antivirusEnabled: true,
                riskScore: 15,
                lastChecked: new Date().toISOString()
            }
        });

        setSelectedDevice(null);
    };

    return (
        <div className="day1-page">
            <div className="page-header">
                <div className="page-header-content">
                    <h1>Device Management</h1>
                    <p>Discover devices, deploy endpoint agents, and enforce compliance policies</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-grid">
                <div className="stat-card-large">
                    <div className="stat-icon">
                        <Monitor size={24} />
                    </div>
                    <div className="stat-details">
                        <span className="stat-value-lg">{tenantDevices.length}</span>
                        <span className="stat-label-lg">Total Devices</span>
                    </div>
                </div>

                <div className="stat-card-large success">
                    <div className="stat-icon">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="stat-details">
                        <span className="stat-value-lg">{compliantCount}</span>
                        <span className="stat-label-lg">Compliant</span>
                    </div>
                    <div className="stat-percent">
                        {tenantDevices.length > 0 ? Math.round((compliantCount / tenantDevices.length) * 100) : 0}%
                    </div>
                </div>

                <div className="stat-card-large error">
                    <div className="stat-icon">
                        <XCircle size={24} />
                    </div>
                    <div className="stat-details">
                        <span className="stat-value-lg">{nonCompliantCount}</span>
                        <span className="stat-label-lg">Non-Compliant</span>
                    </div>
                    <div className="stat-percent">
                        {tenantDevices.length > 0 ? Math.round((nonCompliantCount / tenantDevices.length) * 100) : 0}%
                    </div>
                </div>

                <div className="stat-card-large info">
                    <div className="stat-icon">
                        <Shield size={24} />
                    </div>
                    <div className="stat-details">
                        <span className="stat-value-lg">{tenantDevices.filter(d => d.agentInstalled).length}</span>
                        <span className="stat-label-lg">Agent Installed</span>
                    </div>
                </div>
            </div>

            {/* Compliance Rules */}
            <div className="compliance-rules-panel">
                <h3>Active Compliance Rules</h3>
                <div className="rules-grid">
                    {complianceRules.map(rule => {
                        const Icon = rule.icon;
                        return (
                            <div key={rule.id} className="rule-card">
                                <Icon size={20} />
                                <span>{rule.label}</span>
                                <span className="badge badge-success">Active</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* EDR Integration Status */}
            <div className="edr-panel">
                <h3>EDR Integration Status</h3>
                <div className="edr-grid">
                    {edrProviders.map(provider => (
                        <div key={provider.id} className="edr-card connected">
                            <div className="edr-logo">{provider.logo}</div>
                            <div className="edr-info">
                                <span className="edr-name">{provider.name}</span>
                                <span className="edr-status">
                                    <span className="status-dot success pulse" />
                                    Connected
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Device Inventory */}
            <div className="device-inventory">
                <div className="inventory-header">
                    <h3>Device Inventory</h3>
                    <div className="inventory-actions">
                        <button className="btn btn-secondary" onClick={() => tenantDevices.forEach(d => handlePullPosture(d.id))}>
                            <RefreshCw size={16} />
                            Sync All Posture
                        </button>

                    </div>
                </div>

                <div className="device-list">
                    {tenantDevices.map(device => {
                        const DeviceIcon = getDeviceIcon(device.type);
                        const user = tenantUsers.find(u => u.id === device.userId);
                        const isExpanded = expandedDevice === device.id;
                        const checks = getComplianceChecks(device);

                        return (
                            <div key={device.id} className={`device-card ${device.complianceStatus}`}>
                                <div className="device-main" onClick={() => setExpandedDevice(isExpanded ? null : device.id)}>
                                    <div className="device-icon-wrapper">
                                        <DeviceIcon size={24} />
                                        {device.complianceStatus === 'compliant' ? (
                                            <span className="device-status-badge success"><CheckCircle2 size={12} /></span>
                                        ) : (
                                            <span className="device-status-badge error"><XCircle size={12} /></span>
                                        )}
                                    </div>

                                    <div className="device-info">
                                        <div className="device-name">{device.name}</div>
                                        <div className="device-meta">
                                            <span>{device.os} {device.osVersion}</span>
                                            <span>•</span>
                                            <span>{user?.displayName || 'Unassigned'}</span>
                                        </div>
                                    </div>

                                    <div className="device-compliance">
                                        <span className={`compliance-badge ${device.complianceStatus}`}>
                                            {device.complianceStatus === 'compliant' ? 'Compliant' : 'Non-Compliant'}
                                        </span>
                                    </div>

                                    <div className="device-data-flow">
                                        {device.complianceStatus === 'compliant' ? (
                                            <div className="data-flow-indicator success">
                                                <Wifi size={16} />
                                                <span>Data Flow Active</span>
                                            </div>
                                        ) : (
                                            <div className="data-flow-indicator blocked">
                                                <WifiOff size={16} />
                                                <span>Data Flow Blocked</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="device-actions">
                                        {!device.agentInstalled && (
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={(e) => { e.stopPropagation(); handleDeployAgent(device.id); }}
                                                disabled={isDeployingAgent}
                                            >
                                                {isDeployingAgent && selectedDevice === device.id ? (
                                                    <Loader2 size={14} className="spin" />
                                                ) : (
                                                    <Send size={14} />
                                                )}
                                                Deploy Agent
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={(e) => { e.stopPropagation(); handlePullPosture(device.id); }}
                                            disabled={isPullingPosture && selectedDevice === device.id}
                                        >
                                            {isPullingPosture && selectedDevice === device.id ? (
                                                <Loader2 size={14} className="spin" />
                                            ) : (
                                                <RefreshCw size={14} />
                                            )}
                                        </button>
                                        <ChevronDown size={16} className={`expand-icon ${isExpanded ? 'expanded' : ''}`} />
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="device-details animate-slide-up">
                                        <div className="posture-checks">
                                            <h4>Posture Assessment</h4>
                                            <div className="checks-grid">
                                                {checks.map((check, idx) => (
                                                    <div key={idx} className={`check-item ${check.passed ? 'passed' : 'failed'}`}>
                                                        {check.passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                                        <span className="check-label">{check.rule}</span>
                                                        <span className="check-value">{check.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {device.complianceStatus === 'non_compliant' && (
                                            <div className="remediation-panel">
                                                <AlertTriangle size={20} />
                                                <div className="remediation-content">
                                                    <h5>Remediation Required</h5>
                                                    <p>This device is blocked from sending security telemetry until compliance issues are resolved.</p>
                                                </div>
                                                <button
                                                    className="btn btn-warning"
                                                    onClick={() => handleRemediate(device.id)}
                                                >
                                                    Auto-Remediate
                                                </button>
                                            </div>
                                        )}

                                        <div className="device-meta-info">
                                            <div className="meta-item">
                                                <span className="meta-label">Agent Version</span>
                                                <span className="meta-value">{device.agentVersion || 'Not Installed'}</span>
                                            </div>
                                            <div className="meta-item">
                                                <span className="meta-label">EDR Provider</span>
                                                <span className="meta-value">{device.posture.edrProvider || 'None'}</span>
                                            </div>
                                            <div className="meta-item">
                                                <span className="meta-label">Last Seen</span>
                                                <span className="meta-value">{device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'Never'}</span>
                                            </div>
                                            <div className="meta-item">
                                                <span className="meta-label">Risk Score</span>
                                                <span className={`meta-value ${device.posture.riskScore >= 50 ? 'high-risk' : ''}`}>
                                                    {device.posture.riskScore}/100
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Day 1 Complete Banner */}
            {compliantCount === tenantDevices.length && tenantDevices.length > 0 && (
                <div className="day-complete-banner">
                    <div className="banner-icon">
                        <CheckCircle2 size={32} />
                    </div>
                    <div className="banner-content">
                        <h3>Device Management Ready!</h3>
                        <p>All devices are compliant. Proceed to Policy to configure access policies.</p>
                    </div>
                    <a href="/day2" className="btn btn-primary btn-lg">
                        Continue to Policy
                        <ChevronRight size={18} />
                    </a>
                </div>
            )}
        </div>
    );
}
