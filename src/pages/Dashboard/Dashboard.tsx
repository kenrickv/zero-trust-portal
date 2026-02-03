import { useStore } from '../../store/useStore';
import { Shield, Users, Monitor, FileKey, AlertTriangle, CheckCircle2, XCircle, Activity, Clock, Zap, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export function DashboardPage() {
    const { tenants, users, devices, policies, alerts, accessRequests, currentTenantId, securityEvents } = useStore();

    const currentTenant = tenants.find(t => t.id === currentTenantId);
    const tenantUsers = users.filter(u => u.tenantId === currentTenantId);
    const tenantDevices = devices.filter(d => d.tenantId === currentTenantId);
    const tenantPolicies = policies.filter(p => p.tenantId === currentTenantId);
    const tenantAlerts = alerts.filter(a => a.tenantId === currentTenantId);
    const tenantRequests = accessRequests.filter(r => r.tenantId === currentTenantId);
    const tenantEvents = securityEvents.filter(e => e.tenantId === currentTenantId);

    const compliantDevices = tenantDevices.filter(d => d.complianceStatus === 'compliant').length;
    const mfaEnabledUsers = tenantUsers.filter(u => u.mfaEnabled).length;
    const criticalAlerts = tenantAlerts.filter(a => a.severity === 'critical' && a.status === 'new').length;
    const highAlerts = tenantAlerts.filter(a => a.severity === 'high' && a.status === 'new').length;
    const allowedRequests = tenantRequests.filter(r => r.decision === 'allowed').length;
    const deniedRequests = tenantRequests.filter(r => r.decision === 'denied').length;

    const complianceRate = tenantDevices.length > 0 ? Math.round((compliantDevices / tenantDevices.length) * 100) : 0;
    const mfaRate = tenantUsers.length > 0 ? Math.round((mfaEnabledUsers / tenantUsers.length) * 100) : 0;

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h1>Security Dashboard</h1>
                    <p>Zero Trust posture overview for {currentTenant?.name}</p>
                </div>
                <div className="header-actions">
                    <Link to="/simulation" className="btn btn-primary">
                        <Zap size={16} />
                        Access Simulation
                    </Link>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-header">
                        <div className="metric-icon users">
                            <Users size={20} />
                        </div>
                        <div className="metric-trend up">
                            <ArrowUpRight size={14} />
                            +12%
                        </div>
                    </div>
                    <div className="metric-value">{tenantUsers.length}</div>
                    <div className="metric-label">Total Users</div>
                    <div className="metric-sub">
                        <span className="sub-stat success">{mfaEnabledUsers} MFA enabled</span>
                        <span className="sub-stat">({mfaRate}%)</span>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <div className="metric-icon devices">
                            <Monitor size={20} />
                        </div>
                        <div className="metric-trend up">
                            <ArrowUpRight size={14} />
                            +5
                        </div>
                    </div>
                    <div className="metric-value">{tenantDevices.length}</div>
                    <div className="metric-label">Enrolled Devices</div>
                    <div className="metric-sub">
                        <span className="sub-stat success">{compliantDevices} compliant</span>
                        <span className="sub-stat">({complianceRate}%)</span>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <div className="metric-icon policies">
                            <FileKey size={20} />
                        </div>
                    </div>
                    <div className="metric-value">{tenantPolicies.filter(p => p.enabled).length}</div>
                    <div className="metric-label">Active Policies</div>
                    <div className="metric-sub">
                        <span className="sub-stat">{tenantPolicies.length} total configured</span>
                    </div>
                </div>

                <div className="metric-card alert">
                    <div className="metric-header">
                        <div className="metric-icon alerts">
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <div className="alert-content-wrapper">
                        <div className="metric-details">
                            <div className="metric-value">{tenantAlerts.filter(a => a.status === 'new').length}</div>
                            <div className="metric-label">Active Alerts</div>
                        </div>
                        <div className="alert-severity-breakdown">
                            {criticalAlerts > 0 && (
                                <span className="severity-pill critical">{criticalAlerts} Critical</span>
                            )}
                            {highAlerts > 0 && (
                                <span className="severity-pill high">{highAlerts} High</span>
                            )}
                            {criticalAlerts === 0 && highAlerts === 0 && (
                                <span className="sub-stat success">No critical/high alerts</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Health Indicators */}
            <div className="health-section">
                <h2>Zero Trust Health</h2>
                <div className="health-grid">
                    <div className="health-card">
                        <div className="health-info">
                            <span className="health-label">Device Compliance</span>
                            <span className="health-value">{complianceRate}%</span>
                        </div>
                        <div className="health-bar">
                            <div
                                className={`health-fill ${complianceRate >= 80 ? 'success' : complianceRate >= 50 ? 'warning' : 'error'}`}
                                style={{ width: `${complianceRate}%` }}
                            />
                        </div>
                        <div className="health-legend">
                            <span>{compliantDevices} of {tenantDevices.length} devices compliant</span>
                        </div>
                    </div>

                    <div className="health-card">
                        <div className="health-info">
                            <span className="health-label">MFA Adoption</span>
                            <span className="health-value">{mfaRate}%</span>
                        </div>
                        <div className="health-bar">
                            <div
                                className={`health-fill ${mfaRate >= 80 ? 'success' : mfaRate >= 50 ? 'warning' : 'error'}`}
                                style={{ width: `${mfaRate}%` }}
                            />
                        </div>
                        <div className="health-legend">
                            <span>{mfaEnabledUsers} of {tenantUsers.length} users with MFA</span>
                        </div>
                    </div>

                    <div className="health-card">
                        <div className="health-info">
                            <span className="health-label">Policy Enforcement</span>
                            <span className="health-value">100%</span>
                        </div>
                        <div className="health-bar">
                            <div className="health-fill success" style={{ width: '100%' }} />
                        </div>
                        <div className="health-legend">
                            <span>All policies actively enforced</span>
                        </div>
                    </div>

                    <div className="health-card">
                        <div className="health-info">
                            <span className="health-label">Access Decision Rate</span>
                            <span className="health-value">
                                {tenantRequests.length > 0 ? Math.round((allowedRequests / tenantRequests.length) * 100) : 100}%
                            </span>
                        </div>
                        <div className="health-bar">
                            <div
                                className="health-fill info"
                                style={{ width: `${tenantRequests.length > 0 ? (allowedRequests / tenantRequests.length) * 100 : 100}%` }}
                            />
                        </div>
                        <div className="health-legend">
                            <span>{allowedRequests} allowed / {deniedRequests} denied</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Recent Alerts */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3>
                            <AlertTriangle size={18} />
                            Recent Alerts
                        </h3>
                        <Link to="/ops" className="view-all">
                            View all <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className="alerts-list">
                        {tenantAlerts.slice(0, 5).map(alert => (
                            <div key={alert.id} className={`alert-item ${alert.severity}`}>
                                <div className={`alert-severity ${alert.severity}`}>
                                    {alert.severity === 'critical' || alert.severity === 'high' ? (
                                        <XCircle size={16} />
                                    ) : (
                                        <AlertTriangle size={16} />
                                    )}
                                </div>
                                <div className="alert-content">
                                    <span className="alert-title">{alert.title}</span>
                                    <span className="alert-meta">
                                        {new Date(alert.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <span className={`badge badge-${alert.status === 'new' ? 'error' : alert.status === 'investigating' ? 'warning' : 'success'}`}>
                                    {alert.status}
                                </span>
                            </div>
                        ))}
                        {tenantAlerts.length === 0 && (
                            <div className="empty-list">
                                <CheckCircle2 size={24} />
                                <span>No active alerts</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Security Events */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3>
                            <Activity size={18} />
                            Security Events
                        </h3>
                        <Link to="/siem" className="view-all">
                            View all <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className="events-list">
                        {tenantEvents.slice(0, 5).map(event => (
                            <div key={event.id} className="event-item">
                                <div className={`event-severity ${event.severity}`}>
                                    <Activity size={14} />
                                </div>
                                <div className="event-content">
                                    <span className="event-type">{event.type.replace(/_/g, ' ')}</span>
                                    <span className="event-desc">{event.description}</span>
                                </div>
                                <span className="event-time">
                                    <Clock size={12} />
                                    {new Date(event.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Access Requests */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3>
                            <Shield size={18} />
                            Recent Access Decisions
                        </h3>
                        <Link to="/simulation" className="view-all">
                            Simulate <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className="requests-list">
                        {tenantRequests.slice(0, 5).map(request => {
                            const user = users.find(u => u.id === request.userId);
                            return (
                                <div key={request.id} className={`request-item ${request.decision}`}>
                                    <div className={`request-decision ${request.decision}`}>
                                        {request.decision === 'allowed' ? (
                                            <CheckCircle2 size={16} />
                                        ) : (
                                            <XCircle size={16} />
                                        )}
                                    </div>
                                    <div className="request-content">
                                        <span className="request-user">{user?.displayName || 'Unknown'}</span>
                                        <span className="request-dest">→ {request.destination}</span>
                                    </div>
                                    <span className={`badge ${request.decision === 'allowed' ? 'badge-success' : 'badge-error'}`}>
                                        {request.decision}
                                    </span>
                                </div>
                            );
                        })}
                        {tenantRequests.length === 0 && (
                            <div className="empty-list">
                                <Shield size={24} />
                                <span>No access requests simulated</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3>
                            <Zap size={18} />
                            Quick Actions
                        </h3>
                    </div>
                    <div className="quick-actions">
                        <Link to="/day0" className="action-btn">
                            <Users size={20} />
                            <span>Manage Identity</span>
                        </Link>
                        <Link to="/day1" className="action-btn">
                            <Monitor size={20} />
                            <span>Device Compliance</span>
                        </Link>
                        <Link to="/day2" className="action-btn">
                            <FileKey size={20} />
                            <span>Create Policy</span>
                        </Link>
                        <Link to="/simulation" className="action-btn highlight">
                            <Shield size={20} />
                            <span>Test Access</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
