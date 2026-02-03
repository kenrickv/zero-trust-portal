import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
    Shield, Building2, Monitor, FileKey, AlertTriangle,
    BarChart3, Settings, ChevronRight, Activity, Database,
    RefreshCw, LogOut, User, Bell, Menu, X
} from 'lucide-react';
import './Layout.css';

const journeySteps = [
    { id: 'day0', label: 'Day 0', description: 'Tenant & Identity', path: '/day0', icon: Building2 },
    { id: 'day1', label: 'Day 1', description: 'Device Onboarding', path: '/day1', icon: Monitor },
    { id: 'day2', label: 'Day 2', description: 'Policy & Access', path: '/day2', icon: FileKey },
    { id: 'ops', label: 'Operations', description: 'Monitor & Enforce', path: '/ops', icon: Activity }
];

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
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
    const { currentRole, setCurrentRole, currentTenantId, tenants, alerts, resetToMockData } = useStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const currentTenant = tenants.find(t => t.id === currentTenantId);
    const newAlerts = alerts.filter(a => a.status === 'new').length;

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

    const getCurrentPhase = () => {
        const path = location.pathname;
        if (path.startsWith('/day0')) return 'day0';
        if (path.startsWith('/day1')) return 'day1';
        if (path.startsWith('/day2')) return 'day2';
        if (path.startsWith('/ops')) return 'ops';
        return null;
    };

    const currentPhase = getCurrentPhase();

    return (
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

                <div className="header-center">
                    <div className="journey-nav">
                        {journeySteps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentPhase === step.id;
                            const isPast = journeySteps.findIndex(s => s.id === currentPhase) > index;

                            return (
                                <div key={step.id} className="journey-step-wrapper">
                                    <NavLink
                                        to={step.path}
                                        className={`journey-step ${isActive ? 'active' : ''} ${isPast ? 'completed' : ''}`}
                                    >
                                        <div className="journey-step-icon">
                                            <Icon size={16} />
                                        </div>
                                        <div className="journey-step-content">
                                            <span className="journey-step-label">{step.label}</span>
                                            <span className="journey-step-desc">{step.description}</span>
                                        </div>
                                    </NavLink>
                                    {index < journeySteps.length - 1 && (
                                        <ChevronRight size={16} className="journey-step-arrow" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="header-right">
                    <button className="header-btn" title="Notifications">
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
                        <NavLink to="/settings" className="nav-item">
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
    );
}
