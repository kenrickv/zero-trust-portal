import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { FileKey, Shield, Plus, Edit, Trash2, ToggleLeft, ToggleRight, CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronRight, Filter, Globe, Lock, Unlock, Zap, Eye } from 'lucide-react';
import './Day2.css';

const policyTypes = [
    { id: 'ip_filter', name: 'IP Filtering', icon: Filter, description: 'Block or allow traffic by IP address' },
    { id: 'url_filter', name: 'URL Filtering', icon: Globe, description: 'Filter web access by URL category' },
    { id: 'malware', name: 'Malware Protection', icon: Shield, description: 'Block malware and ransomware' },
    { id: 'atp', name: 'Advanced Threat Protection', icon: Zap, description: 'Detect and prevent advanced threats' },
    { id: 'casb', name: 'CASB / Shadow IT', icon: Eye, description: 'Monitor cloud application usage' },
    { id: 'tls', name: 'TLS Decryption', icon: Lock, description: 'Inspect encrypted traffic' },
    { id: 'ztna', name: 'Zero Trust Access', icon: Unlock, description: 'Identity-based access control' }
];

export function Day2Page() {
    const { policies, currentTenantId, togglePolicy, deletePolicy, createPolicy, users } = useStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);
    const [newPolicyName, setNewPolicyName] = useState('');
    const [newPolicyDesc, setNewPolicyDesc] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const tenantPolicies = policies.filter(p => p.tenantId === currentTenantId);
    const enabledCount = tenantPolicies.filter(p => p.enabled).length;

    const handleCreatePolicy = async () => {
        if (!selectedType || !newPolicyName) return;
        setIsCreating(true);

        await createPolicy({
            tenantId: currentTenantId!,
            name: newPolicyName,
            description: newPolicyDesc,
            type: selectedType as any,
            enabled: true,
            priority: tenantPolicies.length + 1,
            conditions: [],
            actions: [{ type: 'deny' }],
            createdBy: 'user-001'
        });

        setIsCreating(false);
        setShowCreateModal(false);
        setNewPolicyName('');
        setNewPolicyDesc('');
        setSelectedType(null);
    };

    const getTypeInfo = (typeId: string) => {
        return policyTypes.find(t => t.id === typeId) || { name: typeId, icon: FileKey };
    };

    return (
        <div className="day2-page">
            <div className="page-header">
                <div className="page-header-content">
                    <h1>Day 2: Policy Creation & Access Validation</h1>
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
