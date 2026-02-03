import { useStore } from '../../store/useStore';
import { BarChart3, FileText, Download, Calendar, TrendingUp, Shield, Users, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import './Reports.css';

export function ReportsPage() {
    const { users, devices, policies, alerts, accessRequests, currentTenantId } = useStore();

    const tenantUsers = users.filter(u => u.tenantId === currentTenantId);
    const tenantDevices = devices.filter(d => d.tenantId === currentTenantId);
    const tenantPolicies = policies.filter(p => p.tenantId === currentTenantId);
    const tenantAlerts = alerts.filter(a => a.tenantId === currentTenantId);
    const tenantRequests = accessRequests.filter(r => r.tenantId === currentTenantId);

    const compliantDevices = tenantDevices.filter(d => d.complianceStatus === 'compliant').length;
    const allowedRequests = tenantRequests.filter(r => r.decision === 'allowed').length;
    const deniedRequests = tenantRequests.filter(r => r.decision === 'denied').length;

    const reports = [
        {
            id: 'monthly-posture',
            title: 'Monthly Security Posture Report',
            description: 'Comprehensive overview of device compliance, user risk scores, and security posture trends',
            type: 'Posture',
            period: 'Monthly',
            lastGenerated: 'Feb 1, 2026',
            icon: Shield
        },
        {
            id: 'access-decisions',
            title: 'Access Decision Summary',
            description: 'Analysis of Zero Trust access decisions, policy matches, and remediation activities',
            type: 'Access',
            period: 'Weekly',
            lastGenerated: 'Jan 31, 2026',
            icon: CheckCircle2
        },
        {
            id: 'policy-enforcement',
            title: 'Policy Enforcement Report',
            description: 'Policy hit counts, effectiveness metrics, and optimization recommendations',
            type: 'Policy',
            period: 'Weekly',
            lastGenerated: 'Jan 31, 2026',
            icon: FileText
        },
        {
            id: 'executive-summary',
            title: 'Executive Summary',
            description: 'High-level security metrics and KPIs for executive stakeholders',
            type: 'Executive',
            period: 'Monthly',
            lastGenerated: 'Feb 1, 2026',
            icon: BarChart3
        }
    ];

    return (
        <div className="reports-page">
            <div className="page-header">
                <div className="page-header-content">
                    <h1>Reports & Analytics</h1>
                    <p>Generate periodic reports on security posture, access decisions, and policy enforcement</p>
                </div>
            </div>

            {/* Report Summary Cards */}
            <div className="summary-grid">
                <div className="summary-card">
                    <div className="summary-header">
                        <Shield size={24} />
                        <span>Security Posture</span>
                    </div>
                    <div className="summary-value">
                        {tenantDevices.length > 0 ? Math.round((compliantDevices / tenantDevices.length) * 100) : 0}%
                    </div>
                    <div className="summary-label">Device Compliance Rate</div>
                    <div className="summary-trend up">
                        <TrendingUp size={14} />
                        +5% from last month
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-header">
                        <Activity size={24} />
                        <span>Access Decisions</span>
                    </div>
                    <div className="summary-value">{tenantRequests.length}</div>
                    <div className="summary-label">Total Requests</div>
                    <div className="summary-breakdown">
                        <span className="allowed">{allowedRequests} allowed</span>
                        <span className="denied">{deniedRequests} denied</span>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-header">
                        <AlertTriangle size={24} />
                        <span>Security Alerts</span>
                    </div>
                    <div className="summary-value">{tenantAlerts.length}</div>
                    <div className="summary-label">Total Alerts</div>
                    <div className="summary-breakdown">
                        <span className="critical">{tenantAlerts.filter(a => a.severity === 'critical').length} critical</span>
                        <span className="high">{tenantAlerts.filter(a => a.severity === 'high').length} high</span>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-header">
                        <Users size={24} />
                        <span>Identity Health</span>
                    </div>
                    <div className="summary-value">
                        {tenantUsers.length > 0 ? Math.round((tenantUsers.filter(u => u.mfaEnabled).length / tenantUsers.length) * 100) : 0}%
                    </div>
                    <div className="summary-label">MFA Adoption</div>
                    <div className="summary-trend up">
                        <TrendingUp size={14} />
                        +12% from last month
                    </div>
                </div>
            </div>

            {/* Available Reports */}
            <div className="reports-section">
                <h2>Available Reports</h2>
                <div className="reports-grid">
                    {reports.map(report => {
                        const Icon = report.icon;
                        return (
                            <div key={report.id} className="report-card">
                                <div className="report-icon">
                                    <Icon size={24} />
                                </div>
                                <div className="report-content">
                                    <h3>{report.title}</h3>
                                    <p>{report.description}</p>
                                    <div className="report-meta">
                                        <span className="report-type">{report.type}</span>
                                        <span className="report-period">
                                            <Calendar size={12} />
                                            {report.period}
                                        </span>
                                        <span className="report-date">Last: {report.lastGenerated}</span>
                                    </div>
                                </div>
                                <div className="report-actions">
                                    <button className="btn btn-secondary">
                                        <Download size={16} />
                                        Export PDF
                                    </button>
                                    <button className="btn btn-primary">
                                        Generate
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sample Report Preview */}
            <div className="report-preview">
                <div className="preview-header">
                    <h2>Monthly Security Posture Report - Preview</h2>
                    <div className="preview-actions">
                        <button className="btn btn-secondary">
                            <Download size={16} />
                            Export
                        </button>
                    </div>
                </div>

                <div className="preview-content">
                    <div className="preview-section">
                        <h3>Executive Summary</h3>
                        <div className="kpi-grid">
                            <div className="kpi-card">
                                <span className="kpi-label">Total Users</span>
                                <span className="kpi-value">{tenantUsers.length}</span>
                            </div>
                            <div className="kpi-card">
                                <span className="kpi-label">Total Devices</span>
                                <span className="kpi-value">{tenantDevices.length}</span>
                            </div>
                            <div className="kpi-card">
                                <span className="kpi-label">Compliant Devices</span>
                                <span className="kpi-value success">{compliantDevices}</span>
                            </div>
                            <div className="kpi-card">
                                <span className="kpi-label">Active Policies</span>
                                <span className="kpi-value">{tenantPolicies.filter(p => p.enabled).length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="preview-section">
                        <h3>Device Compliance Breakdown</h3>
                        <div className="compliance-chart">
                            <div className="chart-bar">
                                <div className="chart-segment compliant" style={{ width: `${tenantDevices.length > 0 ? (compliantDevices / tenantDevices.length) * 100 : 0}%` }}>
                                    <span>Compliant ({compliantDevices})</span>
                                </div>
                                <div className="chart-segment non-compliant" style={{ width: `${tenantDevices.length > 0 ? ((tenantDevices.length - compliantDevices) / tenantDevices.length) * 100 : 0}%` }}>
                                    <span>Non-Compliant ({tenantDevices.length - compliantDevices})</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="preview-section">
                        <h3>Top Policy Violations</h3>
                        <div className="violations-list">
                            <div className="violation-item">
                                <span className="violation-rank">1</span>
                                <span className="violation-name">Block Non-Compliant Devices</span>
                                <span className="violation-count">45 hits</span>
                            </div>
                            <div className="violation-item">
                                <span className="violation-rank">2</span>
                                <span className="violation-name">Require MFA for Finance Apps</span>
                                <span className="violation-count">23 hits</span>
                            </div>
                            <div className="violation-item">
                                <span className="violation-rank">3</span>
                                <span className="violation-name">Block Malicious URLs</span>
                                <span className="violation-count">18 hits</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
