import { useStore } from '../../store/useStore';
import { Database, CheckCircle2, Activity, AlertTriangle, Clock, Target, ChevronRight, Zap, Globe, User, Monitor } from 'lucide-react';
import { mockSIEMIntegration } from '../../data/mockData';
import './SIEM.css';

export function SIEMPage() {
    const { securityEvents, alerts, users, devices, currentTenantId } = useStore();

    const tenantEvents = securityEvents.filter(e => e.tenantId === currentTenantId);
    const tenantAlerts = alerts.filter(a => a.tenantId === currentTenantId);

    const correlatedIncidents = [
        {
            id: 'inc-001',
            title: 'Coordinated Ransomware Attack',
            severity: 'critical',
            sources: ['EDR', 'SSE', 'IAM'],
            affectedAssets: 3,
            iocs: [
                { type: 'IP', value: '185.234.72.14', threat: 'C2 Server' },
                { type: 'Hash', value: 'a1b2c3d4e5...', threat: 'Ryuk Payload' }
            ],
            timestamp: new Date().toISOString()
        },
        {
            id: 'inc-002',
            title: 'Account Takeover Attempt',
            severity: 'high',
            sources: ['IAM', 'SSE'],
            affectedAssets: 1,
            iocs: [
                { type: 'IP', value: '203.0.113.45', threat: 'Suspicious Login Source' }
            ],
            timestamp: new Date(Date.now() - 3600000).toISOString()
        }
    ];

    return (
        <div className="siem-page">
            <div className="page-header">
                <div className="page-header-content">
                    <h1>SIEM Integration</h1>
                    <p>Unified security event correlation and threat intelligence</p>
                </div>
            </div>

            {/* Integration Status */}
            <div className="integration-panel">
                <div className="integration-header">
                    <div className="integration-info">
                        <div className="integration-icon connected">
                            <Database size={24} />
                        </div>
                        <div className="integration-details">
                            <h2>{mockSIEMIntegration.name}</h2>
                            <span className="integration-type">{mockSIEMIntegration.type.toUpperCase()}</span>
                        </div>
                    </div>
                    <div className="integration-status">
                        <span className="status-indicator connected">
                            <CheckCircle2 size={16} />
                            Connected
                        </span>
                        <span className="last-sync">
                            <Clock size={14} />
                            Last sync: {new Date(mockSIEMIntegration.lastSync).toLocaleTimeString()}
                        </span>
                    </div>
                </div>

                <div className="integration-stats">
                    <div className="int-stat">
                        <span className="int-stat-value">{mockSIEMIntegration.eventsForwarded.toLocaleString()}</span>
                        <span className="int-stat-label">Events Forwarded</span>
                    </div>
                    <div className="int-stat">
                        <span className="int-stat-value">{tenantAlerts.filter(a => a.ioc).length}</span>
                        <span className="int-stat-label">IOCs Detected</span>
                    </div>
                    <div className="int-stat">
                        <span className="int-stat-value">{correlatedIncidents.length}</span>
                        <span className="int-stat-label">Correlated Incidents</span>
                    </div>
                    <div className="int-stat">
                        <span className="int-stat-value">3</span>
                        <span className="int-stat-label">Data Sources</span>
                    </div>
                </div>

                <div className="data-sources">
                    <h3>Connected Data Sources</h3>
                    <div className="sources-grid">
                        <div className="source-card active">
                            <User size={20} />
                            <div className="source-info">
                                <span className="source-name">IAM</span>
                                <span className="source-status">Active</span>
                            </div>
                            <span className="source-events">12,458 events</span>
                        </div>
                        <div className="source-card active">
                            <Monitor size={20} />
                            <div className="source-info">
                                <span className="source-name">EDR</span>
                                <span className="source-status">Active</span>
                            </div>
                            <span className="source-events">45,892 events</span>
                        </div>
                        <div className="source-card active">
                            <Globe size={20} />
                            <div className="source-info">
                                <span className="source-name">SSE</span>
                                <span className="source-status">Active</span>
                            </div>
                            <span className="source-events">67,497 events</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Correlated Incidents */}
            <div className="incidents-section">
                <h2>
                    <Target size={20} />
                    Correlated Incidents
                </h2>
                <p className="section-desc">AI-powered threat correlation across IAM, EDR, and SSE data sources</p>

                <div className="incidents-list">
                    {correlatedIncidents.map(incident => (
                        <div key={incident.id} className={`incident-card ${incident.severity}`}>
                            <div className="incident-header">
                                <div className={`incident-severity ${incident.severity}`}>
                                    <AlertTriangle size={20} />
                                </div>
                                <div className="incident-info">
                                    <h3>{incident.title}</h3>
                                    <div className="incident-meta">
                                        <span className={`severity-badge ${incident.severity}`}>{incident.severity}</span>
                                        <span className="meta-item">
                                            <Clock size={12} />
                                            {new Date(incident.timestamp).toLocaleString()}
                                        </span>
                                        <span className="meta-item">
                                            {incident.affectedAssets} assets affected
                                        </span>
                                    </div>
                                </div>
                                <div className="incident-actions">
                                    <button className="btn btn-primary">
                                        Investigate
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="incident-body">
                                <div className="correlation-sources">
                                    <span className="label">Correlated From:</span>
                                    <div className="source-tags">
                                        {incident.sources.map(source => (
                                            <span key={source} className="source-tag">{source}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="incident-iocs">
                                    <span className="label">Indicators of Compromise:</span>
                                    <div className="iocs-list">
                                        {incident.iocs.map((ioc, idx) => (
                                            <div key={idx} className="ioc-item">
                                                <span className="ioc-type">{ioc.type}</span>
                                                <code className="ioc-value">{ioc.value}</code>
                                                <span className="ioc-threat">{ioc.threat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Security Event Timeline */}
            <div className="timeline-section">
                <h2>
                    <Activity size={20} />
                    Unified Security Event Timeline
                </h2>

                <div className="timeline">
                    {tenantEvents.slice(0, 10).map((event, idx) => {
                        const user = users.find(u => u.id === event.userId);
                        const device = devices.find(d => d.id === event.deviceId);

                        return (
                            <div key={event.id} className="timeline-item">
                                <div className="timeline-marker">
                                    <div className={`marker-dot ${event.severity}`} />
                                    {idx < tenantEvents.length - 1 && <div className="marker-line" />}
                                </div>

                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <span className={`event-source ${event.source}`}>{event.source.toUpperCase()}</span>
                                        <span className="event-type">{event.type.replace(/_/g, ' ')}</span>
                                        <span className={`event-severity ${event.severity}`}>{event.severity}</span>
                                    </div>
                                    <p className="event-description">{event.description}</p>
                                    <div className="event-meta">
                                        {user && <span><User size={12} /> {user.displayName}</span>}
                                        {device && <span><Monitor size={12} /> {device.name}</span>}
                                        <span><Clock size={12} /> {new Date(event.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* IOC Dashboard */}
            <div className="ioc-section">
                <h2>
                    <Zap size={20} />
                    Active Threat Intelligence
                </h2>

                <div className="ioc-dashboard">
                    <div className="ioc-category">
                        <h4>Malicious IPs</h4>
                        <div className="ioc-count">3</div>
                        <div className="ioc-items">
                            <code>185.234.72.14</code>
                            <code>203.0.113.45</code>
                            <code>198.51.100.23</code>
                        </div>
                    </div>

                    <div className="ioc-category">
                        <h4>Malware Hashes</h4>
                        <div className="ioc-count">2</div>
                        <div className="ioc-items">
                            <code>a1b2c3d4e5f6...</code>
                            <code>7f8e9d0c1b2a...</code>
                        </div>
                    </div>

                    <div className="ioc-category">
                        <h4>Suspicious Domains</h4>
                        <div className="ioc-count">1</div>
                        <div className="ioc-items">
                            <code>malware.example.com</code>
                        </div>
                    </div>

                    <div className="ioc-category">
                        <h4>Attack Vectors</h4>
                        <div className="ioc-count">2</div>
                        <div className="ioc-items">
                            <span className="vector-tag">Ransomware</span>
                            <span className="vector-tag">Account Takeover</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
