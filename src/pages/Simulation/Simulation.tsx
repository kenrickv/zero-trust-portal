import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Shield, User, Monitor, Globe, CheckCircle2, XCircle, AlertTriangle, Loader2, Zap, Lock, Unlock, RefreshCw, Sparkles } from 'lucide-react';
import './Simulation.css';

export function SimulationPage() {
    const { users, devices, policies, currentTenantId, simulateAccess, updateDevice, updateUser, accessRequests } = useStore();

    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
    const [selectedDestination, setSelectedDestination] = useState<string>('');
    const [isSimulating, setIsSimulating] = useState(false);
    const [result, setResult] = useState<typeof accessRequests[0] | null>(null);
    const [showRemediation, setShowRemediation] = useState(false);
    const [isRemediating, setIsRemediating] = useState(false);
    const [remediationStep, setRemediationStep] = useState(0);
    const [hasSimulated, setHasSimulated] = useState(false);

    const tenantUsers = users.filter(u => u.tenantId === currentTenantId && u.status !== 'blocked');
    const tenantDevices = devices.filter(d => d.tenantId === currentTenantId);
    const tenantPolicies = policies.filter(p => p.tenantId === currentTenantId && p.enabled);

    const selectedUser = users.find(u => u.id === selectedUserId);
    const selectedDevice = devices.find(d => d.id === selectedDeviceId);
    const userDevices = tenantDevices.filter(d => d.userId === selectedUserId);

    const destinations = [
        { id: 'salesforce', name: 'Salesforce', icon: '📊', category: 'CRM' },
        { id: 'sap', name: 'SAP ERP', icon: '💼', category: 'Finance' },
        { id: 'github', name: 'GitHub Enterprise', icon: '🐱', category: 'Development' },
        { id: 'jira', name: 'Jira', icon: '📋', category: 'Project Management' },
        { id: 'internalwiki', name: 'Internal Wiki', icon: '📚', category: 'Documentation' }
    ];

    const handleSimulate = async () => {
        if (!selectedUserId || !selectedDeviceId || !selectedDestination) return;

        setHasSimulated(true);
        setIsSimulating(true);
        setResult(null);
        setShowRemediation(false);

        try {
            const accessResult = await simulateAccess(selectedUserId, selectedDeviceId, selectedDestination);

            setResult(accessResult);
            setIsSimulating(false);

            if (accessResult.decision === 'denied') {
                setTimeout(() => setShowRemediation(true), 500);
            }
        } catch {
            setIsSimulating(false);
            setResult(null);
            setHasSimulated(false);
        }
    };

    const handleRemediate = async () => {
        if (!result) return;

        setIsRemediating(true);
        setRemediationStep(0);

        const steps = result.remediationSteps || [];

        for (let i = 0; i < steps.length; i++) {
            setRemediationStep(i + 1);
            await new Promise(r => setTimeout(r, 1500));
        }

        // Apply remediation
        if (selectedDevice && selectedDevice.complianceStatus !== 'compliant') {
            updateDevice(selectedDeviceId, {
                complianceStatus: 'compliant',
                posture: {
                    ...selectedDevice.posture,
                    edrInstalled: true,
                    edrHealthy: true,
                    diskEncrypted: true,
                    osCompliant: true,
                    riskScore: 15
                }
            });
        }

        if (selectedUser && !selectedUser.mfaEnabled) {
            updateUser(selectedUserId, { mfaEnabled: true });
        }

        setIsRemediating(false);

        // Re-run simulation after remediation
        await new Promise(r => setTimeout(r, 500));
        await handleSimulate();
    };

    const resetSimulation = () => {
        setResult(null);
        setShowRemediation(false);
        setRemediationStep(0);
        setHasSimulated(false);
    };

    return (
        <div className="simulation-page">
            <div className="page-header">
                <div className="page-header-content">
                    <div className="header-badge">
                        <Sparkles size={16} />
                        <span>Zero Trust Demo</span>
                    </div>
                    <h1>Access Simulation Panel</h1>
                    <p>Simulate user access requests and see Zero Trust policy decisions in real-time</p>
                </div>
            </div>

            <div className="simulation-layout">
                {/* Configuration Panel */}
                <div className="config-panel">
                    <div className="panel-section">
                        <h3>
                            <User size={20} />
                            Select User
                        </h3>
                        <div className="user-grid">
                            {tenantUsers.map(user => (
                                <div
                                    key={user.id}
                                    className={`user-option ${selectedUserId === user.id ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedUserId(user.id);
                                        setSelectedDeviceId('');
                                        resetSimulation();
                                    }}
                                >
                                    <div className="user-avatar-md">{user.displayName[0]}</div>
                                    <div className="user-details">
                                        <span className="user-name">{user.displayName}</span>
                                        <span className="user-meta">{user.department}</span>
                                    </div>
                                    <div className="user-indicators">
                                        {user.mfaEnabled ? (
                                            <span className="badge badge-success">MFA</span>
                                        ) : (
                                            <span className="badge badge-warning">No MFA</span>
                                        )}
                                        <span className={`risk-score ${user.riskScore > 50 ? 'high' : 'low'}`}>
                                            Risk: {user.riskScore}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedUserId && (
                        <div className="panel-section animate-slide-up">
                            <h3>
                                <Monitor size={20} />
                                Select Device
                            </h3>
                            <div className="device-grid">
                                {userDevices.length > 0 ? userDevices.map(device => (
                                    <div
                                        key={device.id}
                                        className={`device-option ${selectedDeviceId === device.id ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedDeviceId(device.id);
                                            resetSimulation();
                                        }}
                                    >
                                        <Monitor size={24} />
                                        <div className="device-details">
                                            <span className="device-name">{device.name}</span>
                                            <span className="device-os">{device.os} {device.osVersion}</span>
                                        </div>
                                        <span className={`compliance-indicator ${device.complianceStatus}`}>
                                            {device.complianceStatus === 'compliant' ? (
                                                <><CheckCircle2 size={14} /> Compliant</>
                                            ) : (
                                                <><XCircle size={14} /> Non-Compliant</>
                                            )}
                                        </span>
                                    </div>
                                )) : (
                                    <div className="no-devices">
                                        <AlertTriangle size={24} />
                                        <span>No devices registered for this user</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {selectedDeviceId && (
                        <div className="panel-section animate-slide-up">
                            <h3>
                                <Globe size={20} />
                                Select Destination
                            </h3>
                            <div className="destination-grid">
                                {destinations.map(dest => (
                                    <div
                                        key={dest.id}
                                        className={`destination-option ${selectedDestination === dest.name ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedDestination(dest.name);
                                            resetSimulation();
                                        }}
                                    >
                                        <span className="dest-icon">{dest.icon}</span>
                                        <div className="dest-details">
                                            <span className="dest-name">{dest.name}</span>
                                            <span className="dest-category">{dest.category}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="simulate-action">
                        <button
                            className="btn btn-primary btn-lg full-width"
                            onClick={handleSimulate}
                            disabled={!selectedUserId || !selectedDeviceId || !selectedDestination || isSimulating}
                        >
                            {isSimulating ? (
                                <>
                                    <Loader2 size={20} className="spin" />
                                    Evaluating Policies...
                                </>
                            ) : (
                                <>
                                    <Zap size={20} />
                                    Simulate Access Request
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="results-panel">
                    {hasSimulated && (
                        <>
                        <h3>
                            <Shield size={20} />
                            Policy Evaluation Result
                        </h3>

                        {isSimulating && (
                            <div className="evaluating">
                                <Loader2 size={48} className="spin" />
                                <h4>Evaluating Access Request</h4>
                                <p>Checking identity, device posture, and security policies...</p>
                                <div className="eval-steps">
                                    <div className="eval-step active">
                                        <CheckCircle2 size={16} />
                                        <span>Verifying Identity</span>
                                    </div>
                                    <div className="eval-step active">
                                        <Loader2 size={16} className="spin" />
                                        <span>Checking Device Compliance</span>
                                    </div>
                                    <div className="eval-step">
                                        <span className="eval-pending" />
                                        <span>Evaluating Policies</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {result && (
                        <div className={`result-card ${result.decision} animate-scale-in`}>
                            <div className="result-header">
                                <div className={`result-icon ${result.decision}`}>
                                    {result.decision === 'allowed' ? (
                                        <Unlock size={32} />
                                    ) : (
                                        <Lock size={32} />
                                    )}
                                </div>
                                <div className="result-summary">
                                    <h2>Access {result.decision === 'allowed' ? 'Granted' : 'Denied'}</h2>
                                    <p>
                                        {result.decision === 'allowed'
                                            ? 'All Zero Trust requirements satisfied'
                                            : 'One or more security requirements not met'
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="result-divider" />

                            <div className="evaluation-details">
                                <h4>Policy Evaluation Details</h4>
                                <div className="eval-checks">
                                    {result.evaluationDetails.map((detail, idx) => (
                                        <div key={idx} className={`eval-check ${detail.passed ? 'passed' : 'failed'}`}>
                                            <div className="eval-check-icon">
                                                {detail.passed ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                            </div>
                                            <div className="eval-check-content">
                                                <span className="eval-check-name">{detail.check}</span>
                                                <span className="eval-check-message">{detail.message}</span>
                                            </div>
                                            <div className="eval-check-value">
                                                <span className="value-label">Value:</span>
                                                <code>{String(detail.value)}</code>
                                                {detail.required && (
                                                    <>
                                                        <span className="value-label">Required:</span>
                                                        <code>{String(detail.required)}</code>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {result.matchedPolicies.length > 0 && (
                                <div className="matched-policies">
                                    <h4>Matched Policies</h4>
                                    <div className="policies-list">
                                        {result.matchedPolicies.map(policyId => {
                                            const policy = tenantPolicies.find(p => p.id === policyId);
                                            return policy ? (
                                                <div key={policyId} className="matched-policy">
                                                    <Shield size={16} />
                                                    <span>{policy.name}</span>
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}

                            {result.decision === 'denied' && showRemediation && result.remediationSteps && (
                                <div className="remediation-section animate-slide-up">
                                    <div className="remediation-header">
                                        <AlertTriangle size={24} />
                                        <div>
                                            <h4>Remediation Required</h4>
                                            <p>Complete the following steps to gain access</p>
                                        </div>
                                    </div>

                                    <div className="remediation-steps">
                                        {result.remediationSteps.map((step, idx) => (
                                            <div
                                                key={idx}
                                                className={`remediation-step ${remediationStep > idx ? 'completed' : ''} ${remediationStep === idx + 1 ? 'active' : ''}`}
                                            >
                                                <div className="step-number">
                                                    {remediationStep > idx ? <CheckCircle2 size={16} /> : idx + 1}
                                                </div>
                                                <span>{step}</span>
                                                {remediationStep === idx + 1 && isRemediating && (
                                                    <Loader2 size={16} className="spin" />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {!isRemediating && (
                                        <button className="btn btn-warning btn-lg full-width" onClick={handleRemediate}>
                                            <RefreshCw size={18} />
                                            Auto-Remediate & Retry
                                        </button>
                                    )}
                                </div>
                            )}

                            {result.decision === 'allowed' && (
                                <div className="success-message">
                                    <Sparkles size={24} />
                                    <span>User can now securely access {result.destination} through the SSE gateway</span>
                                </div>
                            )}
                        </div>
                        )}
                        </>
                    )}

                    {/* Active Policies Context */}
                    <div className="policies-context">
                        <h4>Active Zero Trust Policies</h4>
                        <div className="context-policies">
                            {tenantPolicies.slice(0, 4).map(policy => (
                                <div key={policy.id} className="context-policy">
                                    <Shield size={14} />
                                    <span>{policy.name}</span>
                                </div>
                            ))}
                            {tenantPolicies.length > 4 && (
                                <span className="more-policies">+{tenantPolicies.length - 4} more</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
