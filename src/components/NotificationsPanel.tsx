import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { AlertTriangle, AlertOctagon, Info, CheckCircle, X, Bell } from 'lucide-react';
import type { Alert } from '../types';
import './NotificationsPanel.css';

interface Props {
    open: boolean;
    onClose: () => void;
}

function severityIcon(severity: Alert['severity']) {
    switch (severity) {
        case 'critical': return <AlertOctagon size={16} />;
        case 'high': return <AlertTriangle size={16} />;
        case 'medium': return <Info size={16} />;
        case 'low': return <CheckCircle size={16} />;
    }
}

function formatRelative(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export function NotificationsPanel({ open, onClose }: Props) {
    const navigate = useNavigate();
    const { alerts, users, devices, currentTenantId, dismissAlert, markAllAlertsRead } = useStore();

    const tenantAlerts = alerts
        .filter((a) => a.tenantId === currentTenantId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = tenantAlerts.filter((a) => a.status === 'new').length;

    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    const handleCTA = (path: string) => {
        navigate(path);
        onClose();
    };

    return (
        <>
            <div
                className={`notifications-overlay${open ? ' open' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <aside className={`notifications-panel${open ? ' open' : ''}`} aria-label="Notifications">
                <div className="notifications-header">
                    <div className="notifications-title">
                        <Bell size={18} />
                        <h2>Notifications</h2>
                        {unreadCount > 0 && (
                            <span className="notifications-unread-count">{unreadCount}</span>
                        )}
                    </div>
                    <div className="notifications-header-actions">
                        {unreadCount > 0 && (
                            <button className="btn-mark-all" onClick={markAllAlertsRead}>
                                Mark all read
                            </button>
                        )}
                        <button className="btn-close-panel" onClick={onClose} aria-label="Close">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="notifications-list">
                    {tenantAlerts.length === 0 ? (
                        <div className="notifications-empty">
                            <Bell size={32} />
                            <span>No notifications</span>
                        </div>
                    ) : (
                        tenantAlerts.map((alert) => {
                            const user = alert.affectedUserId
                                ? users.find((u) => u.id === alert.affectedUserId)
                                : undefined;
                            const device = alert.affectedDeviceId
                                ? devices.find((d) => d.id === alert.affectedDeviceId)
                                : undefined;

                            return (
                                <div
                                    key={alert.id}
                                    className={`notification-card severity-${alert.severity}${alert.status === 'dismissed' ? ' status-dismissed' : ''}`}
                                >
                                    <div className={`notification-severity-icon ${alert.severity}`}>
                                        {severityIcon(alert.severity)}
                                    </div>
                                    <div className="notification-body">
                                        <div className="notification-top">
                                            <span className="notification-title">{alert.title}</span>
                                            {alert.status !== 'dismissed' && (
                                                <button
                                                    className="btn-dismiss"
                                                    onClick={() => dismissAlert(alert.id)}
                                                    aria-label="Dismiss"
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="notification-description">{alert.description}</p>
                                        <div className="notification-meta">
                                            <span className="notification-source">{alert.source.toUpperCase()}</span>
                                            <span className="notification-time">{formatRelative(alert.createdAt)}</span>
                                        </div>
                                        {(user || device) && (
                                            <div className="notification-ctas">
                                                {user && (
                                                    <button
                                                        className="btn-cta"
                                                        onClick={() => handleCTA(`/day0?highlight=${user.id}`)}
                                                    >
                                                        → Go to User Management
                                                    </button>
                                                )}
                                                {device && (
                                                    <button
                                                        className="btn-cta"
                                                        onClick={() => handleCTA(`/day1?highlight=${device.id}`)}
                                                    >
                                                        → Go to Device Management
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </aside>
        </>
    );
}
