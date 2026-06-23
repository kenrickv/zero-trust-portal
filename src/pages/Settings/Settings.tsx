import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { UserRole } from '../../types';
import { mockSIEMIntegration } from '../../data/mockData';
import './Settings.css';

const APP_VERSION = '0.0.0';

type NotifSources = { iam: boolean; edr: boolean; sse: boolean; siem: boolean };
type NotifSettings = { severityThreshold: string; sources: NotifSources };

function loadSettings(): NotifSettings {
  try {
    const raw = localStorage.getItem('zero-trust-portal-settings');
    if (raw) return JSON.parse(raw) as NotifSettings;
  } catch {
    // fall through to defaults
  }
  return { severityThreshold: 'low', sources: { iam: true, edr: true, sse: true, siem: true } };
}

function saveSettings(s: NotifSettings) {
  localStorage.setItem('zero-trust-portal-settings', JSON.stringify(s));
}

type ConfirmState = {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
} | null;

export function SettingsPage() {
  const {
    theme, toggleTheme,
    currentRole, setCurrentRole,
    currentTenantId, setCurrentTenantId,
    tenants,
    resetToMockData,
  } = useStore();

  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [prefs, setPrefs] = useState<NotifSettings>(loadSettings);

  const currentTenant = tenants.find(t => t.id === currentTenantId);

  function openConfirm(state: NonNullable<ConfirmState>) {
    setConfirmState(state);
  }

  function closeConfirm() {
    setConfirmState(null);
  }

  function handleConfirm() {
    confirmState?.onConfirm();
    closeConfirm();
  }

  function updateSource(key: keyof NotifSources, value: boolean) {
    const next = { ...prefs, sources: { ...prefs.sources, [key]: value } };
    setPrefs(next);
    saveSettings(next);
  }

  return (
    <div className="settings-page">
      <h1 className="settings-title">Settings</h1>

      <section className="settings-section">
        <h2>Appearance</h2>
        <div className="settings-card">
          <div className="settings-row">
            <span className="settings-label">Theme</span>
            <div className="theme-toggle-group" role="group" aria-label="Theme">
              <button
                aria-pressed={theme === 'dark'}
                onClick={() => { if (theme !== 'dark') toggleTheme(); }}
              >
                Dark
              </button>
              <button
                aria-pressed={theme === 'light'}
                onClick={() => { if (theme !== 'light') toggleTheme(); }}
              >
                Light
              </button>
            </div>
          </div>
          <div className="settings-row">
            <span className="settings-label">Portal Branding</span>
            <span className="settings-value">ISP Managed</span>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2>Identity &amp; Role</h2>
        <div className="settings-card">
          <div className="settings-row">
            <label htmlFor="role-select" className="settings-label">Role</label>
            <select
              id="role-select"
              value={currentRole}
              onChange={e => setCurrentRole(e.target.value as UserRole)}
            >
              <option value="isp_admin">ISP Administrator</option>
              <option value="customer_admin">Customer IT Admin</option>
              <option value="security_analyst">Security Analyst</option>
              <option value="end_user">End User</option>
            </select>
          </div>
          <div className="settings-row">
            <label htmlFor="tenant-select" className="settings-label">Tenant</label>
            <select
              id="tenant-select"
              value={currentTenantId ?? ''}
              onChange={e => setCurrentTenantId(e.target.value)}
            >
              {!currentTenantId && <option value="" disabled>Select tenant</option>}
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2>Notifications</h2>
        <div className="settings-card">
          <div className="settings-row">
            <label htmlFor="severity-threshold" className="settings-label">Alert Severity Threshold</label>
            <select
              id="severity-threshold"
              value={prefs.severityThreshold}
              onChange={e => {
                const next = { ...prefs, severityThreshold: e.target.value };
                setPrefs(next);
                saveSettings(next);
              }}
            >
              <option value="info">Info</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="settings-row notification-sources">
            <span className="settings-label">Sources</span>
            <div className="source-toggles">
              {(['iam', 'edr', 'sse', 'siem'] as const).map(src => (
                <label key={src} className="source-toggle-label">
                  <input
                    type="checkbox"
                    checked={prefs.sources[src]}
                    onChange={e => updateSource(src, e.target.checked)}
                  />
                  {src.toUpperCase()}
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2>Integrations</h2>
        <div className="settings-card">
          <div className="settings-row">
            <span className="settings-label">IAM Provider</span>
            <span className="settings-value">
              {currentTenant?.iamProvider?.replace('_', ' ') ?? '—'}
            </span>
          </div>
          <div className="settings-row">
            <span className="settings-label">IAM Status</span>
            <span className="settings-value">
              {currentTenant?.iamConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="settings-row">
            <span className="settings-label">SIEM</span>
            <span className="settings-value">
              {mockSIEMIntegration.name} ({mockSIEMIntegration.type})
            </span>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2>Data &amp; Storage</h2>
        <div className="settings-card">
          <div className="settings-row">
            <div>
              <div className="settings-label">Reset Demo Data</div>
              <div className="settings-hint">Restores all data to mock defaults</div>
            </div>
            <button
              className="btn-destructive"
              onClick={() => openConfirm({
                title: 'Reset Demo Data',
                message: 'This will restore all data to the mock defaults. Continue?',
                confirmLabel: 'Confirm',
                onConfirm: resetToMockData,
              })}
            >
              Reset Demo Data
            </button>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-label">Storage Key</div>
              <code className="settings-hint">zero-trust-portal-storage</code>
            </div>
            <button
              className="btn-destructive"
              onClick={() => openConfirm({
                title: 'Clear Stored Data',
                message: 'This will remove persisted data from your browser. Continue?',
                confirmLabel: 'Confirm',
                onConfirm: () => localStorage.removeItem('zero-trust-portal-storage'),
              })}
            >
              Clear Stored Data
            </button>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2>About</h2>
        <div className="settings-card">
          <div className="settings-row">
            <span className="settings-label">Version</span>
            <span className="settings-value">{APP_VERSION}</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Environment</span>
            <span className="settings-value">{import.meta.env.MODE}</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Build</span>
            <span className="settings-value">zero-trust-portal</span>
          </div>
        </div>
      </section>

      {confirmState && (
        <div className="dialog-overlay" onClick={closeConfirm}>
          <div
            role="dialog"
            aria-modal="true"
            className="dialog"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="dialog-title">{confirmState.title}</h3>
            <p className="dialog-message">{confirmState.message}</p>
            <div className="dialog-actions">
              <button onClick={closeConfirm}>Cancel</button>
              <button className="btn-destructive" onClick={handleConfirm}>
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
