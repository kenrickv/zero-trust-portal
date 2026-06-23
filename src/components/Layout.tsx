import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
    Shield, Building2, Monitor, FileKey, AlertTriangle,
    BarChart3, Settings, Activity, Database,
    RefreshCw, LogOut, User, Bell, Menu, X, Sun, Moon
} from 'lucide-react';
import { NotificationsPanel } from './NotificationsPanel';
import './Layout.css';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/day0', label: 'User management', icon: Building2 },
    { path: '/day1', label: 'Device management', icon: Monitor },
    { path: '/day2', label: 'Policy', icon: FileKey },
    { path: '/ops', label: 'Monitoring', icon: Activity },
    { path: '/reports', label: 'Reports', icon: Database },
    { path: '/siem', label: 'SIEM', icon: AlertTriangle },
    { path: '/simulation', label: 'Access Simulation', icon: Shield }
];

const roleLabels: Record<string, string> = {
    isp_admin: 'ISP Administrator',
    customer_admin: 'Customer IT Admin',
    security_analyst: 'Security Analyst',
    end_user: 'End User'
};

export function Layout() {
    const location = useLocation();
    const { currentRole, setCurrentRole, currentTenantId, tenants, alerts, resetToMockData, theme, toggleTheme } = useStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const currentTenant = tenants.find(t => t.id === currentTenantId);
    const newAlerts = alerts.filter(a => a.tenantId === currentTenantId && a.status === 'new').length;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Close mobile menu on route change
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    return (
        <>
        <div className="layout">
            {/* Header */}
            <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="header-left">
                    <button
                        className="mobile-toggle"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <div className="logo" onClick={() => window.location.href = '/'}>
                        <Shield size={28} />
                        <span className="logo-text">Zero Trust Portal</span>
                    </div>
                    <span className="logo-badge">ISP Managed</span>
                </div>

                <div className="header-right">
                    <button className="header-btn" title="Toggle Theme" onClick={toggleTheme}>
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <button className="header-btn" title="Notifications" onClick={() => setIsNotificationsOpen(v => !v)}>
                        <Bell size={18} />
                        {newAlerts > 0 && <span className="notification-badge">{newAlerts}</span>}
                    </button>
                    <button className="header-btn hidden-mobile" onClick={resetToMockData} title="Reset Demo Data">
                        <RefreshCw size={18} />
                    </button>
                    <div className="user-menu hidden-mobile">
                        <div className="user-avatar">
                            <User size={18} />
                        </div>
                        <div className="user-info">
                            <span className="user-name">{roleLabels[currentRole]}</span>
                            <span className="user-tenant">{currentTenant?.name || 'No Tenant'}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="main-container">
                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
                )}
                {/* Sidebar */}
                <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                    <div className="sidebar-section">
                        <div className="sidebar-section-title">Current Tenant</div>
                        <div className="tenant-card">
                            <Building2 size={20} />
                            <div className="tenant-info">
                                <span className="tenant-name">{currentTenant?.name || 'Select Tenant'}</span>
                                <span className="tenant-plan">{currentTenant?.ispPlan}</span>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <div className="sidebar-section-title">Role</div>
                        <select
                            className="role-select"
                            value={currentRole}
                            onChange={(e) => setCurrentRole(e.target.value as any)}
                        >
                            <option value="isp_admin">ISP Administrator</option>
                            <option value="customer_admin">Customer IT Admin</option>
                            <option value="security_analyst">Security Analyst</option>
                            <option value="end_user">End User</option>
                        </select>
                    </div>

                    <nav className="sidebar-nav">
                        <div className="sidebar-section-title">Navigation</div>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                >
                                    <Icon size={18} />
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>

                    <div className="sidebar-footer">
                        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <Settings size={18} />
                            <span>Settings</span>
                        </NavLink>
                        <button className="nav-item logout">
                            <LogOut size={18} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* Page Content */}
                <main className="content">
                    <Outlet />
                </main>
            </div>
        </div>
        <NotificationsPanel open={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        </>
    );
}
