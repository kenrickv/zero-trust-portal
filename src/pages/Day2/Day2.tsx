import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { FileKey, Shield, Plus, Edit, Trash2, ToggleLeft, ToggleRight, CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronRight, Filter, Globe, Lock, Unlock, Zap, Eye } from 'lucide-react';
import './Day2.css';

const policyTypes = [
    { id: 'ip_filter', name: 'IP Filtering', icon: Filter, description: 'Block or allow traffic by IP address' },
    { id: 'url_filter', name: 'URL Filtering', icon: Globe, description: 'Filter web access by URL category' },
    { id: 'malware', name: 'Malware Protection', icon: Shield, description: 'Block malware and ransomware' },
    { id: 'atp', name: 'Advanced Threat Protection', icon: Zap, description: 'Detect and prevent advanced threats' },
    { id: 'casb', name: 'CASB Inline', icon: Eye, description: 'Monitor cloud application usage' },
    { id: 'tls', name: 'TLS Decryption', icon: Lock, description: 'Inspect encrypted traffic' },
    { id: 'ztna', name: 'Zero Trust Access', icon: Unlock, description: 'Identity-based access control' }
];

const CASB_APPS = [
    'Microsoft 365', 'eBay', 'Twitter', 'LinkedIn', 'Gmail', 'Google Drive',
    'Google Workspace', 'Facebook', 'Microsoft Teams', 'SharePoint',
    'Slack', 'Salesforce', 'AWS', 'Dropbox', 'Zoom', 'GitHub', 'Box',
    'ServiceNow', 'Workday', 'Jira', 'Confluence', 'Zendesk', 'HubSpot',
    'Trello', 'Asana', 'Bitbucket', 'GitLab', 'Adobe CC', 'Okta', 'DocuSign'
];

const CASB_ACTIVITIES = ['Login', 'Logout', 'Upload', 'Download', 'Search', 'Like', 'Post', 'Delete', 'Share'];

const MALWARE_EXTENSIONS = ['.doc', '.docx', '.xls', '.xlsx', '.pdf', '.exe', '.dll', '.img', '.iso', '.zip', '.rar', '.js', '.vbs', '.ps1', '.jpeg', '.png', '.gif'];

export function Day2Page() {
    const { policies, currentTenantId, togglePolicy, deletePolicy, createPolicy, users } = useStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);
    const [newPolicyName, setNewPolicyName] = useState('');
    const [newPolicyDesc, setNewPolicyDesc] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // IP Filter State
    const [ipConfig, setIpConfig] = useState({ sourceIp: '', destIp: '', sourcePort: '', destPort: '' });

    // URL Filter State
    const [urlConfig, setUrlConfig] = useState({ domains: '' });

    // Malware State
    const [malwareConfig, setMalwareConfig] = useState({
        signatures: [] as string[],
        inbound: true,
        outbound: true
    });

    // ATP State
    const [atpEnabled, setAtpEnabled] = useState(false);

    // CASB State
    const [casbSelections, setCasbSelections] = useState<Record<string, string[]>>({});

    // TLS State
    const [tlsMode, setTlsMode] = useState<'Dynamic Bypass' | 'TLS Decrypt' | 'TLS Bypass'>('TLS Decrypt');

    const tenantPolicies = policies.filter(p => p.tenantId === currentTenantId);
    const enabledCount = tenantPolicies.filter(p => p.enabled).length;

    const handleCreatePolicy = async () => {
        if (!selectedType || !newPolicyName) return;
        setIsCreating(true);

        let finalDesc = newPolicyDesc;
        const conditions: any[] = [];

        // Add type-specific info to conditions or description for demo purposes
        if (selectedType === 'ip_filter') {
            conditions.push({ field: 'source_ip', operator: 'equals', value: ipConfig.sourceIp || 'Any' });
            conditions.push({ field: 'dest_ip', operator: 'equals', value: ipConfig.destIp || 'Any' });
            conditions.push({ field: 'dest_port', operator: 'equals', value: ipConfig.destPort || 'Any' });
        } else if (selectedType === 'url_filter') {
            conditions.push({ field: 'url', operator: 'matches', value: urlConfig.domains.split('\n').filter(u => u.trim()) });
        } else if (selectedType === 'malware') {
            conditions.push({ field: 'extensions', operator: 'contains', value: malwareConfig.signatures });
            finalDesc += ` (Direction: ${malwareConfig.inbound ? 'Inbound' : ''} ${malwareConfig.outbound ? 'Outbound' : ''})`;
        } else if (selectedType === 'atp') {
            finalDesc += ` (ATP Enabled: ${atpEnabled ? 'Yes' : 'No'})`;
        } else if (selectedType === 'casb') {
            const apps = Object.keys(casbSelections);
            if (apps.length > 0) {
                conditions.push({ field: 'applications', operator: 'in', value: apps });
                finalDesc += ` (Activities: ${apps.map(a => `${a}:${casbSelections[a].join(',')}`).join('; ')})`;
            }
        } else if (selectedType === 'tls') {
            finalDesc += ` (Mode: ${tlsMode})`;
        }

        await createPolicy({
            tenantId: currentTenantId!,
            name: newPolicyName,
            description: finalDesc,
            type: selectedType as any,
            enabled: true,
            priority: tenantPolicies.length + 1,
            conditions,
            actions: [{ type: 'deny' }],
            createdBy: 'user-001'
        });

        setIsCreating(false);
        setShowCreateModal(false);
        // Reset states
        setNewPolicyName('');
        setNewPolicyDesc('');
        setSelectedType(null);
        setIpConfig({ sourceIp: '', destIp: '', sourcePort: '', destPort: '' });
        setUrlConfig({ domains: '' });
        setMalwareConfig({ signatures: [], inbound: true, outbound: true });
        setAtpEnabled(false);
        setCasbSelections({});
        setTlsMode('TLS Decrypt');
    };

    const getTypeInfo = (typeId: string) => {
        return policyTypes.find(t => t.id === typeId) || { name: typeId, icon: FileKey };
    };

    const toggleCasbActivity = (appName: string, activity: string) => {
        setCasbSelections(prev => {
            const current = prev[appName] || [];
            const updated = current.includes(activity)
                ? current.filter(a => a !== activity)
                : [...current, activity];

            if (updated.length === 0) {
                const { [appName]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [appName]: updated };
        });
    };

    const renderTypeSpecificFields = () => {
        switch (selectedType) {
            case 'ip_filter':
                return (
                    <div className="type-specific-fields animate-fade-in">
                        <div className="grid-2-col">
                            <div className="input-group">
                                <label className="input-label">Source IP</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., 10.0.0.0/24"
                                    value={ipConfig.sourceIp}
                                    onChange={e => setIpConfig(prev => ({ ...prev, sourceIp: e.target.value }))}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Destination IP</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., 8.8.8.8"
                                    value={ipConfig.destIp}
                                    onChange={e => setIpConfig(prev => ({ ...prev, destIp: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="grid-2-col">
                            <div className="input-group">
                                <label className="input-label">Source Port</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., Any"
                                    value={ipConfig.sourcePort}
                                    onChange={e => setIpConfig(prev => ({ ...prev, sourcePort: e.target.value }))}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Destination Port</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., 443"
                                    value={ipConfig.destPort}
                                    onChange={e => setIpConfig(prev => ({ ...prev, destPort: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'url_filter':
                return (
                    <div className="type-specific-fields animate-fade-in">
                        <div className="input-group">
                            <label className="input-label">Domains / URLs</label>
                            <textarea
                                className="input textarea"
                                placeholder="Enter one URL per line (e.g., facebook.com)"
                                value={urlConfig.domains}
                                onChange={e => setUrlConfig({ domains: e.target.value })}
                            />
                        </div>
                    </div>
                );
            case 'malware':
                return (
                    <div className="type-specific-fields animate-fade-in">
                        <div className="input-group">
                            <label className="input-label">Direction</label>
                            <div className="checkbox-group">
                                <label className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={malwareConfig.inbound}
                                        onChange={e => setMalwareConfig(prev => ({ ...prev, inbound: e.target.checked }))}
                                    />
                                    <span>Inbound</span>
                                </label>
                                <label className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={malwareConfig.outbound}
                                        onChange={e => setMalwareConfig(prev => ({ ...prev, outbound: e.target.checked }))}
                                    />
                                    <span>Outbound</span>
                                </label>
                            </div>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Malware Signatures (Extensions)</label>
                            <div className="extension-grid">
                                {MALWARE_EXTENSIONS.map(ext => (
                                    <label key={ext} className={`extension-chip ${malwareConfig.signatures.includes(ext) ? 'active' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={malwareConfig.signatures.includes(ext)}
                                            onChange={() => setMalwareConfig(prev => ({
                                                ...prev,
                                                signatures: prev.signatures.includes(ext)
                                                    ? prev.signatures.filter(s => s !== ext)
                                                    : [...prev.signatures, ext]
                                            }))}
                                        />
                                        <span>{ext}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'atp':
                return (
                    <div className="type-specific-fields animate-fade-in">
                        <div className="atp-status-card">
                            <div className="atp-info">
                                <Zap className="atp-icon" size={24} />
                                <div>
                                    <div className="atp-title">Cloud Subscription Scaling</div>
                                    <div className="atp-subtitle">Advanced threat detection & sandboxing enabled</div>
                                </div>
                            </div>
                            <button
                                className={`btn ${atpEnabled ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setAtpEnabled(!atpEnabled)}
                            >
                                {atpEnabled ? 'Enabled' : 'Enable ATP'}
                            </button>
                        </div>
                    </div>
                );
            case 'casb':
                return (
                    <div className="type-specific-fields animate-fade-in">
                        <label className="input-label">Configure Application Activities</label>
                        <div className="casb-container">
                            {CASB_APPS.map(app => (
                                <div key={app} className="casb-app-row">
                                    <div className="casb-app-name">{app}</div>
                                    <div className="casb-activities">
                                        {CASB_ACTIVITIES.map(activity => (
                                            <label key={`${app}-${activity}`} className="activity-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={(casbSelections[app] || []).includes(activity)}
                                                    onChange={() => toggleCasbActivity(app, activity)}
                                                />
                                                <span>{activity}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'tls':
                return (
                    <div className="type-specific-fields animate-fade-in">
                        <label className="input-label">TLS Inspection Mode</label>
                        <div className="tls-button-group">
                            {(['Dynamic Bypass', 'TLS Decrypt', 'TLS Bypass'] as const).map(mode => (
                                <button
                                    key={mode}
                                    className={`tls-btn ${tlsMode === mode ? 'active' : ''}`}
                                    onClick={() => setTlsMode(mode)}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="day2-page">
            <div className="page-header">
                <div className="page-header-content">
                    <h1>Policy</h1>
                    <p>Configure security policies and validate Zero Trust access decisions</p>
                </div>
            </div>

            {/* Policy Stats */}
            <div className="policy-stats">
                <div className="stat-card-large">
                    <div className="stat-icon">
                        <FileKey size={24} />
                    </div>
                    <div className="stat-details">
                        <span className="stat-value-lg">{tenantPolicies.length}</span>
                        <span className="stat-label-lg">Total Policies</span>
                    </div>
                </div>

                <div className="stat-card-large success">
                    <div className="stat-icon">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="stat-details">
                        <span className="stat-value-lg">{enabledCount}</span>
                        <span className="stat-label-lg">Active</span>
                    </div>
                </div>

                <div className="stat-card-large info">
                    <div className="stat-icon">
                        <Shield size={24} />
                    </div>
                    <div className="stat-details">
                        <span className="stat-value-lg">{policyTypes.length}</span>
                        <span className="stat-label-lg">Policy Types Available</span>
                    </div>
                </div>
            </div>

            {/* Policy Type Cards */}
            <div className="policy-types-section">
                <h3>Available Policy Types</h3>
                <div className="policy-types-grid">
                    {policyTypes.map(type => {
                        const Icon = type.icon;
                        const count = tenantPolicies.filter(p => p.type === type.id).length;

                        return (
                            <div
                                key={type.id}
                                className="policy-type-card"
                                onClick={() => {
                                    setSelectedType(type.id);
                                    setShowCreateModal(true);
                                }}
                            >
                                <div className="policy-type-icon">
                                    <Icon size={24} />
                                </div>
                                <div className="policy-type-info">
                                    <span className="policy-type-name">{type.name}</span>
                                    <span className="policy-type-desc">{type.description}</span>
                                </div>
                                <div className="policy-type-count">{count}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Policy List */}
            <div className="policy-list-section">
                <div className="section-header">
                    <h3>Active Policies</h3>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        <Plus size={16} />
                        Create Policy
                    </button>
                </div>

                <div className="policy-list">
                    {tenantPolicies.map((policy, idx) => {
                        const typeInfo = getTypeInfo(policy.type);
                        const Icon = typeInfo.icon;
                        const isExpanded = expandedPolicy === policy.id;

                        return (
                            <div key={policy.id} className={`policy-card ${policy.enabled ? 'enabled' : 'disabled'}`}>
                                <div className="policy-main" onClick={() => setExpandedPolicy(isExpanded ? null : policy.id)}>
                                    <div className="policy-priority">{idx + 1}</div>

                                    <div className="policy-icon-wrapper">
                                        <Icon size={20} />
                                    </div>

                                    <div className="policy-info">
                                        <div className="policy-name">{policy.name}</div>
                                        <div className="policy-meta">
                                            <span className="badge badge-neutral">{typeInfo.name}</span>
                                            <span>•</span>
                                            <span>{policy.conditions.length} conditions</span>
                                            <span>•</span>
                                            <span>{policy.actions.map(a => a.type).join(', ')}</span>
                                        </div>
                                    </div>

                                    <div className="policy-status">
                                        <button
                                            className={`toggle-btn ${policy.enabled ? 'on' : 'off'}`}
                                            onClick={(e) => { e.stopPropagation(); togglePolicy(policy.id); }}
                                        >
                                            {policy.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                        </button>
                                    </div>

                                    <div className="policy-actions">
                                        <button className="btn btn-sm btn-ghost">
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-ghost danger"
                                            onClick={(e) => { e.stopPropagation(); deletePolicy(policy.id); }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <ChevronDown size={16} className={`expand-icon ${isExpanded ? 'expanded' : ''}`} />
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="policy-details animate-slide-up">
                                        <div className="policy-section">
                                            <h4>Description</h4>
                                            <p>{policy.description}</p>
                                        </div>

                                        <div className="policy-section">
                                            <h4>Conditions</h4>
                                            {policy.conditions.length > 0 ? (
                                                <div className="conditions-list">
                                                    {policy.conditions.map((cond, i) => (
                                                        <div key={i} className="condition-item">
                                                            <code>{cond.field}</code>
                                                            <span>{cond.operator}</span>
                                                            <code>{JSON.stringify(cond.value)}</code>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted">No conditions (applies to all traffic)</span>
                                            )}
                                        </div>

                                        <div className="policy-section">
                                            <h4>Actions</h4>
                                            <div className="actions-list">
                                                {policy.actions.map((action, i) => (
                                                    <span key={i} className={`action-badge ${action.type}`}>
                                                        {action.type === 'deny' && <XCircle size={14} />}
                                                        {action.type === 'allow' && <CheckCircle2 size={14} />}
                                                        {action.type === 'log' && <Eye size={14} />}
                                                        {action.type === 'alert' && <AlertTriangle size={14} />}
                                                        {action.type}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="policy-meta-grid">
                                            <div className="meta-item">
                                                <span className="meta-label">Created By</span>
                                                <span className="meta-value">{users.find(u => u.id === policy.createdBy)?.displayName || policy.createdBy}</span>
                                            </div>
                                            <div className="meta-item">
                                                <span className="meta-label">Created</span>
                                                <span className="meta-value">{new Date(policy.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="meta-item">
                                                <span className="meta-label">Last Updated</span>
                                                <span className="meta-value">{new Date(policy.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Continue Banner */}
            <div className="continue-banner">
                <div className="banner-icon">
                    <Shield size={32} />
                </div>
                <div className="banner-content">
                    <h3>Ready to Test Access?</h3>
                    <p>Use the Access Simulation panel to test Zero Trust policy decisions in real-time.</p>
                </div>
                <a href="/simulation" className="btn btn-primary btn-lg">
                    Open Access Simulation
                    <ChevronRight size={18} />
                </a>
            </div>

            {/* Create Policy Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content large" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Policy</h2>
                            <button className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="input-group">
                                <label className="input-label">Policy Type</label>
                                <div className="type-selector">
                                    {policyTypes.map(type => {
                                        const Icon = type.icon;
                                        return (
                                            <div
                                                key={type.id}
                                                className={`type-option ${selectedType === type.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedType(type.id)}
                                            >
                                                <Icon size={20} />
                                                <span>{type.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Policy Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., Block Social Media"
                                    value={newPolicyName}
                                    onChange={e => setNewPolicyName(e.target.value)}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Description</label>
                                <textarea
                                    className="input textarea"
                                    placeholder="Describe the policy purpose..."
                                    value={newPolicyDesc}
                                    onChange={e => setNewPolicyDesc(e.target.value)}
                                />
                            </div>

                            {/* Type Specific Fields */}
                            {renderTypeSpecificFields()}
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreatePolicy}
                                disabled={!selectedType || !newPolicyName || isCreating}
                            >
                                {isCreating ? 'Creating...' : 'Create Policy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
