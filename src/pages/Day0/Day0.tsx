import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Building2, Users, Link2, CheckCircle2, XCircle, Loader2, ChevronRight, RefreshCw, Shield, Globe } from 'lucide-react';
import './Day0.css';

type IAMProvider = 'entra_id' | 'okta' | 'ping' | 'local' | 'custom';

const iamProviders: { id: IAMProvider; name: string; logo: string }[] = [
    { id: 'entra_id', name: 'Microsoft Entra ID', logo: '🔷' },
    { id: 'okta', name: 'Okta', logo: '🟦' },
    { id: 'ping', name: 'Ping Identity', logo: '🔶' },
    { id: 'local', name: 'Local Authentication', logo: '👤' },
    { id: 'custom', name: 'Custom SAML/LDAP', logo: '⚙️' }
];

const ispPlans = [
    { id: 'enterprise_plus', name: 'Enterprise Plus', description: 'Full SSE + IAM + EDR integration' },
    { id: 'business_standard', name: 'Business Standard', description: 'SSE Essentials with basic IAM' },
    { id: 'starter', name: 'Starter', description: 'Basic web filtering and VPN' }
];

export function Day0Page() {
    const { tenants, users, groups, currentTenantId, createTenant, updateTenant } = useStore();
    const currentTenant = tenants.find(t => t.id === currentTenantId);
    const [searchParams] = useSearchParams();
    const highlightId = searchParams.get('highlight');

    const [activeStep, setActiveStep] = useState(currentTenant?.iamConnected ? 3 : 0);
    const [isCreating, setIsCreating] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);

    // Form states
    const [tenantName, setTenantName] = useState('');
    const [tenantDomain, setTenantDomain] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('enterprise_plus');
    const [selectedIAM, setSelectedIAM] = useState<IAMProvider | null>(null);

    const allTenantUsers = users.filter(u => u.tenantId === currentTenantId);
    const tenantGroups = groups.filter(g => g.tenantId === currentTenantId);

    // Place highlighted user first so it's always visible even if beyond slice(0,5)
    const tenantUsers = highlightId
        ? [
            ...allTenantUsers.filter(u => u.id === highlightId),
            ...allTenantUsers.filter(u => u.id !== highlightId)
          ]
        : allTenantUsers;

    useEffect(() => {
        if (!highlightId) return;
        const el = document.getElementById(`user-row-${highlightId}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [highlightId]);

    const steps = [
        { id: 0, title: 'Tenant Name', icon: Building2 },
        { id: 1, title: 'Connect IAM', icon: Link2 },
        { id: 2, title: 'Import Users', icon: Users },
        { id: 3, title: 'Verify Setup', icon: CheckCircle2 }
    ];

    const handleCreateTenant = async () => {
        if (!tenantName || !tenantDomain) return;
        setIsCreating(true);

        await createTenant({
            name: tenantName,
            domain: tenantDomain,
            status: 'provisioning',
            ispPlan: ispPlans.find(p => p.id === selectedPlan)?.name || 'Enterprise Plus',
            serviceBundle: 'Zero Trust Complete',
            iamConnected: false,
            domainVerified: false,
            usersImported: false
        });

        setIsCreating(false);
        setActiveStep(1);
    };

    const handleConnectIAM = async () => {
        if (!selectedIAM || !currentTenant) return;
        setIsConnecting(true);

        // Simulate connection process
        await new Promise(r => setTimeout(r, 2000));

        updateTenant(currentTenant.id, {
            iamProvider: selectedIAM,
            iamConnected: true,
            domainVerified: true,
            status: 'active'
        });

        setIsConnecting(false);
        setActiveStep(2);
    };

    const handleImportUsers = async () => {
        if (!currentTenant) return;
        setIsSyncing(true);
        setSyncProgress(0);

        // Simulate sync progress
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(r => setTimeout(r, 200));
            setSyncProgress(i);
        }

        updateTenant(currentTenant.id, { usersImported: true });
        setIsSyncing(false);
        setActiveStep(3);
    };

    const getChecklistStatus = () => {
        if (!currentTenant) return [];
        return [
            { label: 'Tenant Provisioned', completed: true, icon: Building2 },
            { label: 'Domain Verified', completed: currentTenant.domainVerified, icon: Globe },
            { label: 'IAM Connected', completed: currentTenant.iamConnected, icon: Link2 },
            { label: 'Users Imported', completed: currentTenant.usersImported, icon: Users },
            { label: 'Ready for Device Onboarding', completed: currentTenant.usersImported && currentTenant.iamConnected, icon: Shield }
        ];
    };

    return (
        <div className="day0-page">
            <div className="page-header">
                <div className="page-header-content">
                    <h1>User Management</h1>
                    <p>Create your tenant, connect identity providers, and import users to begin Zero Trust deployment</p>
                </div>
            </div>

            {/* Progress Stepper */}
            <div className="stepper-container">
                {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isCompleted = idx < activeStep;
                    const isActive = idx === activeStep;

                    return (
                        <div key={step.id} className="stepper-wrapper">
                            <div
                                className={`stepper-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                                onClick={() => isCompleted && setActiveStep(idx)}
                            >
                                <div className="stepper-circle">
                                    {isCompleted ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                                </div>
                                <span className="stepper-label">{step.title}</span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`stepper-line ${isCompleted ? 'completed' : ''}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="day0-content">
                {/* Step 0: Create Tenant */}
                {activeStep === 0 && (
                    <div className="step-panel animate-fade-in">
                        <div className="panel-header">
                            <Building2 size={24} />
                            <div>
                                <h2>Tenant Name</h2>
                                <p>Set up your organization name and primary domain</p>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label">Organization Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Acme Corporation"
                                    value={tenantName}
                                    onChange={(e) => setTenantName(e.target.value)}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Primary Domain</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="acme.com"
                                    value={tenantDomain}
                                    onChange={(e) => setTenantDomain(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="plan-selection">
                            <label className="input-label">Select ISP Service Plan</label>
                            <div className="plan-grid">
                                {ispPlans.map(plan => (
                                    <div
                                        key={plan.id}
                                        className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedPlan(plan.id)}
                                    >
                                        <div className="plan-radio">
                                            {selectedPlan === plan.id && <div className="plan-radio-dot" />}
                                        </div>
                                        <div className="plan-info">
                                            <span className="plan-name">{plan.name}</span>
                                            <span className="plan-desc">{plan.description}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="panel-actions">
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleCreateTenant}
                                disabled={!tenantName || !tenantDomain || isCreating}
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 size={18} className="spin" />
                                        Provisioning Tenant...
                                    </>
                                ) : (
                                    <>
                                        <ChevronRight size={18} />
                                        Continue to Identity Integration
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 1: Connect IAM */}
                {activeStep === 1 && (
                    <div className="step-panel animate-fade-in">
                        <div className="panel-header">
                            <Link2 size={24} />
                            <div>
                                <h2>Connect Identity Provider</h2>
                                <p>Integrate with your enterprise IAM system</p>
                            </div>
                        </div>

                        <div className="iam-grid">
                            {iamProviders.map(provider => (
                                <div
                                    key={provider.id}
                                    className={`iam-card ${selectedIAM === provider.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedIAM(provider.id)}
                                >
                                    <div className="iam-logo">{provider.logo}</div>
                                    <span className="iam-name">{provider.name}</span>
                                    {selectedIAM === provider.id && (
                                        <CheckCircle2 size={20} className="iam-check" />
                                    )}
                                </div>
                            ))}
                        </div>

                        {selectedIAM && (
                            <div className="iam-config animate-slide-up">
                                <h3>Configuration</h3>
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label className="input-label">Tenant ID / Issuer URL</label>
                                        <input type="text" className="input" placeholder="https://login.microsoftonline.com/..." />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Client ID</label>
                                        <input type="text" className="input" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                                    </div>
                                    <div className="input-group full-width">
                                        <label className="input-label">Client Secret</label>
                                        <input type="password" className="input" placeholder="••••••••••••••••" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="panel-actions">
                            <button className="btn btn-secondary" onClick={() => setActiveStep(0)}>
                                Back
                            </button>
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleConnectIAM}
                                disabled={!selectedIAM || isConnecting}
                            >
                                {isConnecting ? (
                                    <>
                                        <Loader2 size={18} className="spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <Link2 size={18} />
                                        Connect & Verify
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Import Users */}
                {activeStep === 2 && (
                    <div className="step-panel animate-fade-in">
                        <div className="panel-header">
                            <Users size={24} />
                            <div>
                                <h2>Import Users & Groups</h2>
                                <p>Sync your directory to import users and groups</p>
                            </div>
                        </div>

                        {!isSyncing && !currentTenant?.usersImported && (
                            <div className="sync-preview">
                                <div className="sync-info-card">
                                    <div className="sync-icon success">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div className="sync-details">
                                        <h4>Connected to {iamProviders.find(p => p.id === currentTenant?.iamProvider)?.name}</h4>
                                        <p>Ready to sync users and groups from your directory</p>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={handleImportUsers}
                                >
                                    <RefreshCw size={18} />
                                    Start Directory Sync
                                </button>
                            </div>
                        )}

                        {isSyncing && (
                            <div className="sync-progress">
                                <div className="sync-progress-header">
                                    <Loader2 size={24} className="spin" />
                                    <span>Syncing directory...</span>
                                </div>
                                <div className="progress-bar large">
                                    <div className="progress-fill" style={{ width: `${syncProgress}%` }} />
                                </div>
                                <span className="sync-status">{syncProgress}% complete</span>
                            </div>
                        )}

                        {currentTenant?.usersImported && (
                            <div className="sync-results animate-slide-up">
                                <div className="sync-success">
                                    <CheckCircle2 size={48} />
                                    <h3>Directory Sync Complete!</h3>
                                </div>

                                <div className="sync-stats">
                                    <div className="stat-card">
                                        <Users size={24} />
                                        <div className="stat-content">
                                            <span className="stat-value">{tenantUsers.length}</span>
                                            <span className="stat-label">Users Imported</span>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <Shield size={24} />
                                        <div className="stat-content">
                                            <span className="stat-value">{tenantGroups.length}</span>
                                            <span className="stat-label">Groups Synced</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={() => setActiveStep(3)}
                                >
                                    Continue to Verification
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Verify Setup */}
                {activeStep === 3 && (
                    <div className="step-panel animate-fade-in">
                        <div className="panel-header">
                            <CheckCircle2 size={24} />
                            <div>
                                <h2>Tenant Readiness Checklist</h2>
                                <p>Review your configuration before proceeding to device onboarding</p>
                            </div>
                        </div>

                        <div className="checklist">
                            {getChecklistStatus().map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div key={idx} className={`checklist-item ${item.completed ? 'completed' : ''}`}>
                                        <div className="checklist-icon">
                                            {item.completed ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                                        </div>
                                        <Icon size={18} />
                                        <span>{item.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {currentTenant?.usersImported && currentTenant?.iamConnected && (
                            <div className="success-banner">
                                <div className="success-icon">
                                    <CheckCircle2 size={32} />
                                </div>
                                <div className="success-content">
                                    <h3>User Management Ready!</h3>
                                    <p>Your tenant is ready. Proceed to Device management to begin onboarding.</p>
                                </div>
                                <a href="/day1" className="btn btn-primary btn-lg">
                                    Continue to Device management
                                    <ChevronRight size={18} />
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {/* Directory Preview Panel */}
                {tenantUsers.length > 0 && (
                    <div className="directory-panel">
                        <h3>Directory Preview</h3>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Department</th>
                                        <th>Groups</th>
                                        <th>MFA</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tenantUsers.slice(0, 5).map(user => (
                                        <tr
                                            key={user.id}
                                            id={`user-row-${user.id}`}
                                            className={highlightId === user.id ? 'row-highlight' : ''}
                                        >
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar-sm">{user.displayName[0]}</div>
                                                    <div>
                                                        <div className="user-name-sm">{user.displayName}</div>
                                                        <div className="user-email-sm">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{user.department || '-'}</td>
                                            <td>{user.groups.length} groups</td>
                                            <td>
                                                <span className={`badge ${user.mfaEnabled ? 'badge-success' : 'badge-warning'}`}>
                                                    {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${user.status === 'active' ? 'success' : user.status === 'blocked' ? 'error' : 'neutral'}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
