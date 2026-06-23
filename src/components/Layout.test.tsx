import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { useStore } from '../store/useStore';

beforeEach(() => {
  localStorage.clear();
  useStore.setState({ theme: 'dark', currentRole: 'isp_admin', currentTenantId: 'tenant-001' });
  useStore.getState().resetToMockData();
});

function renderLayoutAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="settings" element={<div />} />
          <Route path="dashboard" element={<div />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('Layout — Settings nav link active state', () => {
  it('Settings link has class "active" when the current route is /settings', () => {
    renderLayoutAt('/settings');

    const settingsLink = screen.getByRole('link', { name: /^settings$/i });
    expect(settingsLink).toHaveClass('active');
  });

  it('Settings link does not have class "active" when the current route is /dashboard', () => {
    renderLayoutAt('/dashboard');

    const settingsLink = screen.getByRole('link', { name: /^settings$/i });
    expect(settingsLink).not.toHaveClass('active');
  });
});
