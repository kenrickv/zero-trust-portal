import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { AlertTriangle, Shield, Monitor, User, XCircle, CheckCircle2, Clock, ChevronDown, Lock, LogOut, Ban, Key, FileText, Loader2 } from 'lucide-react';
import './Operations.css';

export function OperationsPage() {
    const { alerts, users, devices, enforcementRecords, auditLogs, currentTenantId, updateAlert, executeEnforcement, updateDevice, updateUser } = useStore();

    const [activeTab, setActiveTab] = useState<'alerts' | 'enforcement' | 'audit'>('alerts');

    const [isExecuting, setIsExecuting] = useState(false);
    const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

    const tenantAlerts = alerts.filter(a => a.tenantId === currentTenantId);
    const tenantEnforcement = enforcementRecords.filter(e => e.tenantId === currentTenantId);
    const tenantAudit = auditLogs.filter(a => a.tenantId === currentTenantId);

    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    const sortedAlerts = [...tenantAlerts].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    const handleEnforcement = async (action: string, targetType: 'user' | 'device', targetId: string, reason: string) => {
        setIsExecuting(true);

        await executeEnforcement({
            tenantId: currentTenantId!,
            action: action as any,
            targetType,
            targetId,
            reason,
            performedBy: 'user-001'
        });

        if (action === 'quarantine' && targetType === 'device') {
            updateDevice(targetId, { complianceStatus: 'non_compliant' });
        } else if (action === 'block_user' && targetType === 'user') {
            updateUser(targetId, { status: 'blocked' });
        }

        setIsExecuting(false);
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
            case 'high':
                return XCircle;
            default:
                return AlertTriangle;
        }
    };

    return (
        <div className="operations-page">
            <div className="page-header">
                <div className="page-header-content">
                    <h1>Monitoring</h1>
                    <p>Monitor alerts, execute enforcement actions, and review audit trails</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('alerts')}
                    >
                        <AlertTriangle size={16} />
                        Alerts
                        {tenantAlerts.filter(a => a.status === 'new').length > 0 && (
                            <span className="tab-badge">{tenantAlerts.filter(a => a.status === 'new').length}</span>
                        )}
                    </button>
                    <button
                        className={`tab ${activeTab === 'enforcement' ? 'active' : ''}`}
                        onClick={() => setActiveTab('enforcement')}
                    >
                        <Shield size={16} />
                        Enforcement Actions
                    </button>
                    <button
                        className={`tab ${activeTab === 'audit' ? 'active' : ''}`}
                        onClick={() => setActiveTab('audit')}
                    >
                        <FileText size={16} />
                        Audit Log
                    </button>
                </div>
            </div>

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
                <div className="alerts-section">
                    <div className="section-header">
                        <div className="alert-stats">
                            <div className="alert-stat critical">
                                <span className="stat-count">{tenantAlerts.filter(a => a.severity === 'critical').length}</span>
                                <span className="stat-label">Critical</span>
                            </div>
                            <div className="alert-stat high">
                                <span className="stat-count">{tenantAlerts.filter(a => a.severity === 'high').length}</span>
                                <span className="stat-label">High</span>
                            </div>
                            <div className="alert-stat medium">
                                <span className="stat-count">{tenantAlerts.filter(a => a.severity === 'medium').length}</span>
                                <span className="stat-label">Medium</span>
                            </div>
                            <div className="alert-stat low">
                                <span className="stat-count">{tenantAlerts.filter(a => a.severity === 'low').length}</span>
                                <span className="stat-label">Low</span>
                            </div>
                        </div>
                    </div>

                    <div className="alerts-list-full">
                        {sortedAlerts.map(alert => {
                            const SeverityIcon = getSeverityIcon(alert.severity);
                            const affectedUser = users.find(u => u.id === alert.affectedUserId);
                            const affectedDevice = devices.find(d => d.id === alert.affectedDeviceId);
                            const isExpanded = expandedAlert === alert.id;

                            return (
                                <div key={alert.id} className={`alert-card ${alert.severity} ${alert.status}`}>
                                    <div className="alert-main" onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}>
                                        <div className={`alert-severity-icon ${alert.severity}`}>
                                            <SeverityIcon size={20} />
                                        </div>

                                        <div className="alert-info">
                                            <div className="alert-title-row">
                                                <span className="alert-title">{alert.title}</span>
                                                <span className={`severity-badge ${alert.severity}`}>{alert.severity}</span>
                                            </div>
                                            <div className="alert-description">{alert.description}</div>
                                            <div className="alert-meta-row">
                                                <span className="alert-source">Source: {alert.source.toUpperCase()}</span>
                                                <span className="alert-time">
                                                    <Clock size={12} />
                                                    {new Date(alert.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="alert-actions-group">
                                            <span className={`status-badge ${alert.status}`}>{alert.status}</span>
                                            <ChevronDown size={16} className={`expand-icon ${isExpanded ? 'expanded' : ''}`} />
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="alert-details animate-slide-up">
                                            <div className="details-grid">
                                                {affectedUser && (
                                                    <div className="detail-card">
                                                        <User size={20} />
                                                        <div className="detail-info">
                                                            <span className="detail-label">Affected User</span>
                                                            <span className="detail-value">{affectedUser.displayName}</span>
                                                            <span className="detail-sub">{affectedUser.email}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {affectedDevice && (
                                                    <div className="detail-card">
                                                        <Monitor size={20} />
                                                        <div className="detail-info">
                                                            <span className="detail-label">Affected Device</span>
                                                            <span className="detail-value">{affectedDevice.name}</span>
                                                            <span className="detail-sub">{affectedDevice.os} {affectedDevice.osVersion}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {alert.ioc && (
                                                    <div className="detail-card ioc">
                                                        <AlertTriangle size={20} />
                                                        <div className="detail-info">
                                                            <span className="detail-label">Indicator of Compromise</span>
                                                            <span className="detail-value">{alert.ioc.threat}</span>
                                                            <code className="detail-code">{alert.ioc.value}</code>
                                                            <span className="detail-sub">Type: {alert.ioc.type} | Confidence: {alert.ioc.confidence}%</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="alert-actions-section">
                                                <h4>Response Actions</h4>
                                                <div className="action-buttons">
                                                    {affectedDevice && (
                                                        <button
                                                            className="btn btn-danger"
                                                            onClick={() => handleEnforcement('quarantine', 'device', affectedDevice.id, alert.title)}
                                                            disabled={isExecuting}
                                                        >
                                                            {isExecuting ? <Loader2 size={16} className="spin" /> : <Lock size={16} />}
                                                            Quarantine Device
                                                        </button>
                                                    )}
                                                    {affectedUser && (
                                                        <>
                                                            <button
                                                                className="btn btn-warning"
                                                                onClick={() => handleEnforcement('revoke_session', 'user', affectedUser.id, alert.title)}
                                                                disabled={isExecuting}
                                                            >
                                                                <LogOut size={16} />
                                                                Revoke Session
                                                            </button>
                                                            <button
                                                                className="btn btn-secondary"
                                                                onClick={() => handleEnforcement('force_mfa', 'user', affectedUser.id, alert.title)}
                                                                disabled={isExecuting}
                                                            >
                                                                <Key size={16} />
                                                                Force MFA Reset
                                                            </button>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="status-actions">
                                                    {alert.status === 'new' && (
                                                        <button
                                                            className="btn btn-secondary"
                                                            onClick={() => updateAlert(alert.id, { status: 'investigating' })}
                                                        >
                                                            Start Investigation
                                                        </button>
                                                    )}
                                                    {alert.status === 'investigating' && (
                                                        <button
                                                            className="btn btn-success"
                                                            onClick={() => updateAlert(alert.id, { status: 'resolved' })}
                                                        >
                                                            <CheckCircle2 size={16} />
                                                            Mark Resolved
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-ghost"
                                                        onClick={() => updateAlert(alert.id, { status: 'dismissed' })}
                                                    >
                                                        Dismiss
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Enforcement Tab */}
            {activeTab === 'enforcement' && (
                <div className="enforcement-section">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Action</th>
                                    <th>Target</th>
                                    <th>Reason</th>
                                    <th>Performed By</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tenantEnforcement.map(record => {
                                    const target = record.targetType === 'user'
                                        ? users.find(u => u.id === record.targetId)
                                        : devices.find(d => d.id === record.targetId);
                                    const performer = users.find(u => u.id === record.performedBy);

                                    return (
                                        <tr key={record.id}>
                                            <td>
                                                <span className="action-type">
                                                    {record.action === 'quarantine' && <Lock size={14} />}
                                                    {record.action === 'block_user' && <Ban size={14} />}
                                                    {record.action === 'revoke_session' && <LogOut size={14} />}
                                                    {record.action === 'force_mfa' && <Key size={14} />}
                                                    {record.action.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="target-cell">
                                                    {record.targetType === 'user' ? <User size={14} /> : <Monitor size={14} />}
                                                    <span>{target ? ('displayName' in target ? target.displayName : target.name) : record.targetId}</span>
                                                </div>
                                            </td>
                                            <td>{record.reason}</td>
                                            <td>{performer?.displayName || record.performedBy}</td>
                                            <td>{new Date(record.performedAt).toLocaleString()}</td>
                                            <td>
                                                <span className={`badge badge-${record.status === 'executed' ? 'success' : record.status === 'failed' ? 'error' : 'warning'}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Audit Tab */}
            {activeTab === 'audit' && (
                <div className="audit-section">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Action</th>
                                    <th>Actor</th>
                                    <th>Target</th>
                                    <th>Details</th>
                                    <th>Timestamp</th>
                                    <th>IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tenantAudit.map(log => (
                                    <tr key={log.id}>
                                        <td>
                                            <span className="audit-action">{log.action.replace(/_/g, ' ')}</span>
                                        </td>
                                        <td>
                                            <div className="actor-cell">
                                                <span className="actor-name">{log.actor}</span>
                                                <span className="actor-role">{log.actorRole.replace(/_/g, ' ')}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <code className="target-id">{log.target}</code>
                                        </td>
                                        <td className="details-cell">{log.details}</td>
                                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                                        <td><code>{log.ipAddress}</code></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
