import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SimulationPage } from './Simulation';
import { useStore } from '../../store/useStore';

beforeEach(() => {
  localStorage.clear();
  useStore.setState({ theme: 'dark', currentRole: 'isp_admin', currentTenantId: 'tenant-001' });
  useStore.getState().resetToMockData();
});

function renderSimulation() {
  return render(
    <MemoryRouter>
      <SimulationPage />
    </MemoryRouter>
  );
}

describe('SimulationPage result tile visibility', () => {
  it('hides the result tile on initial load', () => {
    renderSimulation();

    expect(screen.queryByRole('heading', { name: 'Policy Evaluation Result' })).not.toBeInTheDocument();
    expect(screen.queryByText('Configure Access Request')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Active Zero Trust Policies' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Select User' })).toBeInTheDocument();
  });

  it('shows the result tile after clicking Simulate Access Request', async () => {
    const user = userEvent.setup();
    renderSimulation();

    const user0 = useStore.getState().users.find(
      u => u.tenantId === 'tenant-001' && u.status !== 'blocked'
    )!;
    await user.click(screen.getByText(user0.displayName));

    const dev0 = useStore.getState().devices.find(
      d => d.tenantId === 'tenant-001' && d.userId === user0.id
    )!;
    await user.click(screen.getByText(dev0.name));

    await user.click(screen.getByText('Salesforce'));

    await user.click(screen.getByRole('button', { name: /Simulate Access Request/i }));

    expect(
      await screen.findByRole('heading', { name: 'Policy Evaluation Result' }, { timeout: 3000 })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /Access (Granted|Denied)/ }, { timeout: 3000 })
    ).toBeInTheDocument();
  });

  it('hides the result tile again after reset (selecting a different user)', async () => {
    const user = userEvent.setup();
    renderSimulation();

    const store = useStore.getState();
    const user0 = store.users.find(
      u => u.tenantId === 'tenant-001' && u.status !== 'blocked'
    )!;
    await user.click(screen.getByText(user0.displayName));

    const dev0 = store.devices.find(
      d => d.tenantId === 'tenant-001' && d.userId === user0.id
    )!;
    await user.click(screen.getByText(dev0.name));

    await user.click(screen.getByText('Salesforce'));
    await user.click(screen.getByRole('button', { name: /Simulate Access Request/i }));
    await screen.findByRole('heading', { name: /Access (Granted|Denied)/ }, { timeout: 3000 });

    const user1 = useStore.getState().users.find(
      u => u.tenantId === 'tenant-001' && u.status !== 'blocked' && u.id !== user0.id
    )!;
    await user.click(screen.getByText(user1.displayName));

    expect(screen.queryByRole('heading', { name: 'Policy Evaluation Result' })).not.toBeInTheDocument();
  });

  it('does not show a blank result tile when no result is available', () => {
    renderSimulation();

    expect(document.querySelector('.result-card')).toBeNull();
    expect(document.querySelector('.empty-result')).toBeNull();
  });
});
