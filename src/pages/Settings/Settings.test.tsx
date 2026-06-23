import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SettingsPage } from './Settings';
import { useStore } from '../../store/useStore';
import { mockUsers } from '../../data/mockData';

beforeEach(() => {
  localStorage.clear();
  useStore.setState({ theme: 'dark', currentRole: 'isp_admin', currentTenantId: 'tenant-001' });
  useStore.getState().resetToMockData();
});

function renderSettings() {
  return render(
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>
  );
}

describe('SettingsPage', () => {
  it('renders all six section headings', () => {
    renderSettings();

    expect(screen.getByRole('heading', { name: 'Appearance' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Identity & Role' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Integrations' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Data & Storage' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();
  });

  it('theme control reflects store theme and toggles correctly', async () => {
    const user = userEvent.setup();
    renderSettings();

    const darkBtn = screen.getByRole('button', { name: /^dark$/i });
    const lightBtn = screen.getByRole('button', { name: /^light$/i });

    // dark is the default — Dark button should be marked as pressed/active
    expect(darkBtn).toHaveAttribute('aria-pressed', 'true');
    expect(lightBtn).toHaveAttribute('aria-pressed', 'false');

    // click Light → store theme becomes light
    await user.click(lightBtn);
    expect(useStore.getState().theme).toBe('light');

    // click Dark → store theme becomes dark
    await user.click(darkBtn);
    expect(useStore.getState().theme).toBe('dark');

    // clicking the already-selected option is a no-op (theme unchanged)
    await user.click(darkBtn);
    expect(useStore.getState().theme).toBe('dark');
  });

  it('role switcher updates store currentRole and shows labels for all four roles', async () => {
    const user = userEvent.setup();
    renderSettings();

    const roleSelect = screen.getByRole('combobox', { name: /role/i });
    await user.selectOptions(roleSelect, 'security_analyst');
    expect(useStore.getState().currentRole).toBe('security_analyst');

    // All four role option labels should be present in the select
    expect(screen.getByRole('option', { name: /isp administrator/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /customer it admin/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /security analyst/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /end user/i })).toBeInTheDocument();
  });

  it('tenant selector updates store currentTenantId', async () => {
    const user = userEvent.setup();
    renderSettings();

    // Current tenant is Acme Corporation (tenant-001); select the second tenant
    const tenantSelect = screen.getByRole('combobox', { name: /tenant/i });
    await user.selectOptions(tenantSelect, 'tenant-002');
    expect(useStore.getState().currentTenantId).toBe('tenant-002');
  });

  it('Reset Demo Data: confirm dialog calls resetToMockData and closes', async () => {
    const user = userEvent.setup();
    useStore.setState({ users: [] });
    renderSettings();

    expect(useStore.getState().users).toHaveLength(0);

    const resetBtn = screen.getByRole('button', { name: /reset demo data/i });
    await user.click(resetBtn);

    // Dialog must appear before any mutation
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(useStore.getState().users).toHaveLength(0);

    // Confirm → data is restored and dialog closes
    const confirmBtn = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmBtn);

    expect(useStore.getState().users).toHaveLength(mockUsers.length);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Reset Demo Data: cancel closes dialog without calling resetToMockData', async () => {
    const user = userEvent.setup();
    useStore.setState({ users: [] });
    renderSettings();

    const resetBtn = screen.getByRole('button', { name: /reset demo data/i });
    await user.click(resetBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelBtn);

    expect(useStore.getState().users).toHaveLength(0);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Clear stored data: confirm removes the zero-trust-portal-storage key', async () => {
    const user = userEvent.setup();
    localStorage.setItem('zero-trust-portal-storage', JSON.stringify({ demo: true }));
    renderSettings();

    const clearBtn = screen.getByRole('button', { name: /clear stored data/i });
    await user.click(clearBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmBtn);

    expect(localStorage.getItem('zero-trust-portal-storage')).toBeNull();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Clear stored data: cancel leaves the zero-trust-portal-storage key unchanged', async () => {
    const user = userEvent.setup();
    localStorage.setItem('zero-trust-portal-storage', JSON.stringify({ demo: true }));
    renderSettings();

    const clearBtn = screen.getByRole('button', { name: /clear stored data/i });
    await user.click(clearBtn);

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelBtn);

    expect(localStorage.getItem('zero-trust-portal-storage')).not.toBeNull();
  });

  it('notification source toggle persists to zero-trust-portal-settings and is read back on remount', async () => {
    const user = userEvent.setup();
    const { unmount } = renderSettings();

    // EDR source is on by default
    const edrToggle = screen.getByRole('checkbox', { name: /edr/i });
    expect(edrToggle).toBeChecked();

    await user.click(edrToggle);

    // Persisted to its own localStorage key
    const stored = JSON.parse(localStorage.getItem('zero-trust-portal-settings') ?? '{}');
    expect(stored.sources.edr).toBe(false);

    // Re-render reads the persisted pref back
    unmount();
    renderSettings();

    const edrToggleAfter = screen.getByRole('checkbox', { name: /edr/i });
    expect(edrToggleAfter).not.toBeChecked();
  });

  it('integrations section shows IAM provider and connection status from current tenant (read-only)', () => {
    renderSettings();

    // tenant-001 has iamProvider: 'entra_id' and iamConnected: true
    expect(screen.getByText(/entra.?id/i)).toBeInTheDocument();
    expect(screen.getByText(/connected/i)).toBeInTheDocument();
  });
});
