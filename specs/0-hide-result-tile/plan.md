## Summary
Hide the Policy Evaluation Result tile on the Access Simulation screen until the user triggers a simulation, gated by a `hasSimulated` state flag.

## Source issues
- #0: Hide policy evaluation result tile until simulation is triggered

## Files to create or modify
- `src/pages/Simulation/Simulation.tsx` — add a `hasSimulated` boolean state; set it `true` when a simulation starts, `false` on reset and on simulation failure; gate the result tile (the `Policy Evaluation Result` heading plus the evaluating/result states) on `hasSimulated`; remove the always-rendered `empty-result` placeholder so no empty tile/placeholder space shows before simulation.
- `src/pages/Simulation/Simulation.test.tsx` — new test file asserting the tile is hidden on load, appears after Simulate, and hides again after reset.

## Test plan (write these first)
Use the same harness as `src/pages/Settings/Settings.test.tsx`: `vitest`, `@testing-library/react`, `userEvent`, wrap in `<MemoryRouter>`. In `beforeEach`, call `localStorage.clear()`, `useStore.setState({ theme: 'dark', currentRole: 'isp_admin', currentTenantId: 'tenant-001' })`, then `useStore.getState().resetToMockData()`. Add a `renderSimulation()` helper that renders `<MemoryRouter><SimulationPage /></MemoryRouter>`.

1. Test: "hides the result tile on initial load" → after `renderSimulation()`, assert the result tile is absent: `expect(screen.queryByRole('heading', { name: 'Policy Evaluation Result' })).not.toBeInTheDocument()` AND `expect(screen.queryByText('Configure Access Request')).not.toBeInTheDocument()`. Also assert the unrelated section still renders: `expect(screen.getByRole('heading', { name: 'Active Zero Trust Policies' })).toBeInTheDocument()` (guards the out-of-scope section is untouched).

2. Test: "shows the result tile after clicking Simulate Access Request" → with `userEvent.setup()`, derive the first tenant user from the store: `const user0 = useStore.getState().users.find(u => u.tenantId === 'tenant-001' && u.status !== 'blocked')!`. Click that user option (`screen.getByText(user0.displayName)`). The device section now renders; derive the first device for that user: `const dev0 = useStore.getState().devices.find(d => d.tenantId === 'tenant-001' && d.userId === user0.id)!` and click `screen.getByText(dev0.name)`. The destination section now renders; click `screen.getByText('Salesforce')`. Click the button `screen.getByRole('button', { name: /Simulate Access Request/i })`. Because `simulateAccess` calls `apiDelay(1000)`, assert with an async query and an extended timeout: `expect(await screen.findByRole('heading', { name: 'Policy Evaluation Result' }, { timeout: 3000 })).toBeInTheDocument()`, then `expect(await screen.findByRole('heading', { name: /Access (Granted|Denied)/ }, { timeout: 3000 })).toBeInTheDocument()`.

3. Test: "hides the result tile again after reset (selecting a different user)" → run the steps from test 2 to produce a result and await the `/Access (Granted|Denied)/` heading. Then select a different tenant user: `const user1 = useStore.getState().users.find(u => u.tenantId === 'tenant-001' && u.status !== 'blocked' && u.id !== user0.id)!`, click `screen.getByText(user1.displayName)` (this fires `resetSimulation`). Assert the tile is gone: `expect(screen.queryByRole('heading', { name: 'Policy Evaluation Result' })).not.toBeInTheDocument()`.

4. Test: "does not show a blank result tile when no result is available" → after `renderSimulation()` with no interaction, assert there is no element with class for the result card and no empty placeholder: `expect(document.querySelector('.result-card')).toBeNull()` AND `expect(document.querySelector('.empty-result')).toBeNull()`.

## Implementation steps
1. In `src/pages/Simulation/Simulation.tsx`, add a new state declaration alongside the existing ones (after line 16): `const [hasSimulated, setHasSimulated] = useState(false);`.
2. In `handleSimulate` (currently lines 34–49), after the early-return guard and before/at the same point as `setIsSimulating(true)`, add `setHasSimulated(true);`. Wrap the `await simulateAccess(...)` call in a `try/catch`: on success keep existing behavior (`setResult(accessResult); setIsSimulating(false);` and the denied-remediation `setTimeout`); in `catch`, call `setIsSimulating(false); setResult(null); setHasSimulated(false);` so the tile reverts to hidden rather than showing a blank/empty tile. Do not change the signature of `simulateAccess` or any store logic.
   Resulting shape:
   ```ts
   const handleSimulate = async () => {
       if (!selectedUserId || !selectedDeviceId || !selectedDestination) return;

       setIsSimulating(true);
       setHasSimulated(true);
       setResult(null);
       setShowRemediation(false);

       try {
           const accessResult = await simulateAccess(selectedUserId, selectedDeviceId, selectedDestination);
           setResult(accessResult);
           setIsSimulating(false);
           if (accessResult.decision === 'denied') {
               setTimeout(() => setShowRemediation(true), 500);
           }
       } catch {
           setIsSimulating(false);
           setResult(null);
           setHasSimulated(false);
       }
   };
   ```
3. In `resetSimulation` (currently lines 90–94), add `setHasSimulated(false);` so reset (triggered by changing user/device/destination) hides the tile.
4. Gate the result tile on `hasSimulated`. In the `results-panel` (lines 236–384), wrap the `Policy Evaluation Result` `<h3>` (lines 237–240), the `isSimulating` evaluating block (lines 252–272), and the `result` block (lines 274–384) inside a single `{hasSimulated && ( ... )}` fragment. Delete the `empty-result` block (lines 242–250) entirely, since the tile is now hidden until `hasSimulated` and that placeholder was the offending always-visible empty state.
5. Leave the `policies-context` "Active Zero Trust Policies" section (lines 386–400) untouched and always rendered — it is out of scope and is a separate section, not part of the result tile.
6. Do not modify `Simulation.css`; hiding is achieved by not rendering, which avoids layout shift and empty placeholder space.

## Error handling
- On `simulateAccess` rejection (it throws `'User or device not found'` per `src/store/useStore.ts:206-208`), the `catch` resets `isSimulating`, `result`, and `hasSimulated` to their pre-simulation values so the tile stays hidden — never a blank result tile.
- Do not log the user, device, destination, or any access-decision payload (no PII / no policy data) in the catch block; swallow silently as the UI already conveys absence of a result by hiding the tile.

## Constraints
- Do not modify `src/store/useStore.ts` or the `simulateAccess` signature/behavior — request logic and policy evaluation backend are out of scope.
- Do not modify other tiles/sections on the screen (config panel, `policies-context`). Only the result tile visibility changes.
- No new external dependencies.
- Preserve existing remediation flow: `handleRemediate` re-runs `handleSimulate`, which will set `hasSimulated` true again — confirm this path still shows the tile.

## Risks
- Risk: The remediation flow calls `handleSimulate` again after applying fixes; if `hasSimulated` were reset incorrectly the tile could flicker. Mitigation: `handleSimulate` sets `hasSimulated = true` at the start, so the tile remains visible across the auto-remediate-and-retry cycle.
- Risk: Test flakiness from the 1000ms `apiDelay` in `simulateAccess`. Mitigation: use `findBy*` queries with a `{ timeout: 3000 }` option rather than fixed waits.

## Rollback
- Revert the single commit touching `src/pages/Simulation/Simulation.tsx` (and remove the new `Simulation.test.tsx`). No data migrations, store changes, or shared state are involved, so reverting fully restores the prior always-visible behavior.

## Acceptance criteria
- [ ] On initial load, the `Policy Evaluation Result` heading and result content are absent from the DOM (test 1, 4).
- [ ] After clicking "Simulate Access Request", the result tile becomes visible and shows the decision (test 2).
- [ ] Selecting a different user/device/destination (reset) returns the tile to hidden (test 3).
- [ ] No `empty-result` placeholder renders before simulation; no layout shift (test 4 — `.empty-result` is null).
- [ ] On simulation failure the tile remains hidden (handled in `catch`; covered by the absence assertions and code review of step 2).
- [ ] No regressions in the config panel, remediation flow, or `Active Zero Trust Policies` section.
