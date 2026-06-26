## Summary
Replace the `/settings` placeholder with a real, sectioned `SettingsPage` that wires theme, role, and tenant controls to the zustand store, gates both destructive data actions behind a confirmation dialog, and fixes the sidebar Settings link so it highlights on `/settings`.

## Source issues
- #5: Implement Settings Page

## Files to create or modify
- `src/pages/Settings/Settings.tsx` — NEW. Exports `function SettingsPage()`. Renders six sections (Appearance, Identity & Role, Notifications, Integrations, Data & Storage, About) plus an inline reusable confirmation dialog used by both destructive actions.
- `src/pages/Settings/Settings.css` — NEW. Page styles using only the CSS variables defined in `src/index.css` (e.g. `--bg-card`, `--text-primary`, `--accent-gradient`, `--status-error`, `--radius-md`, `--spacing-*`). No hardcoded theme colors so dark/light both work.
- `src/App.tsx` — Add `import { SettingsPage } from './pages/Settings/Settings';`; change line 27 route element from `<SettingsPlaceholder />` to `<SettingsPage />`; delete the `SettingsPlaceholder` function (lines 34–41).
- `src/components/Layout.tsx` — Change the Settings footer `NavLink` (line 148) so its `className` uses the active-aware function form, matching the other nav items: `className={({ isActive }) => \`nav-item ${isActive ? 'active' : ''}\`}`. No other change to this file.
- `src/pages/Settings/Settings.test.tsx` — NEW. Component tests for the Settings page (see Test plan).
- `src/components/Layout.test.tsx` — NEW. Test that the Settings footer link highlights only on `/settings`.
- `vitest.setup.ts` — NEW. `import '@testing-library/jest-dom/vitest';` plus `afterEach(() => cleanup())` from `@testing-library/react`.
- `vite.config.ts` — Add `/// <reference types="vitest/config" />` at the top and a `test` block: `{ environment: 'jsdom', setupFiles: ['./vitest.setup.ts'], css: false, globals: false }`.
- `package.json` — Add `"test": "vitest run"` and `"test:watch": "vitest"` scripts; add devDependencies (see Constraints for exact list and justification).

## Test plan (write these first)
Test files import explicitly from `vitest` (`import { describe, it, expect, beforeEach, vi } from 'vitest'`) and use `@testing-library/react` + `@testing-library/user-event`. The real zustand store is used — do NOT mock it (the store IS the unit under test for sync behavior). Wrap renders in `<MemoryRouter>` from `react-router-dom`.

Shared `beforeEach` for `Settings.test.tsx`:
```ts
localStorage.clear();
useStore.setState({ theme: 'dark', currentRole: 'isp_admin', currentTenantId: 'tenant-001' });
useStore.getState().resetToMockData();
```

1. Test: renders all six section headings → assert the page shows accessible headings with text `Appearance`, `Identity & Role`, `Notifications`, `Integrations`, `Data & Storage`, and `About` (`screen.getByRole('heading', { name: /appearance/i })`, etc.).
2. Test: theme control reflects and updates the store (valid input) → default store `theme` is `dark`, so the "Dark" option is rendered as selected/active. `await user.click` the "Light" option → `useStore.getState().theme === 'light'`. Click "Dark" again → `useStore.getState().theme === 'dark'`. Clicking the already-selected option is a no-op (theme unchanged). (Implementation calls `toggleTheme()` only when the clicked target differs from current `theme`.)
3. Test: role switcher updates the store and shows descriptions (valid input) → change the role control to `security_analyst` → `useStore.getState().currentRole === 'security_analyst'`. Assert a human-readable description string is present for each of the four roles (`isp_admin`, `customer_admin`, `security_analyst`, `end_user`).
4. Test: tenant selector updates the store (valid input) → with ≥2 mock tenants, select the second tenant's id → `useStore.getState().currentTenantId` equals that id.
5. Test: "Reset Demo Data" requires confirmation before mutating (destructive happy path) → first mutate state: `useStore.setState({ users: [] })`. Click "Reset Demo Data" → a dialog (`getByRole('dialog')`) appears and `useStore.getState().users.length === 0` still (no mutation yet). Click the dialog's "Confirm" (or "Reset") button → `useStore.getState().users.length === mockUsers.length` (data restored) and the dialog is removed from the DOM.
6. Test: "Reset Demo Data" cancel aborts the destructive op (guard / abort path — stands in for the template's "permission failure" slot, since this app has no auth layer) → `useStore.setState({ users: [] })`. Open the reset dialog, click "Cancel" → dialog closes (`queryByRole('dialog')` is null) and `useStore.getState().users.length === 0` (unchanged — confirms the destructive action did not run).
7. Test: "Clear stored data" removes the persistence key only on confirm (destructive happy path) → set `localStorage.setItem('zero-trust-portal-storage', '{"x":1}')`. Click "Clear stored data", confirm in the dialog → `localStorage.getItem('zero-trust-portal-storage') === null`. (Do NOT call `window.location.reload` in the action under test; see Implementation step 7 — reload is intentionally omitted so tests stay deterministic.)
8. Test: "Clear stored data" cancel leaves storage intact (abort path) → set the key as above, open dialog, click "Cancel" → `localStorage.getItem('zero-trust-portal-storage')` is unchanged (`'{"x":1}'`).
9. Test: notification preferences persist to the Settings-owned key (valid input) → toggle the `edr` source off → `JSON.parse(localStorage.getItem('zero-trust-portal-settings')).sources.edr === false`. Re-render the page → the `edr` toggle reads back as off.
10. Test: integrations section is read-only and derived from current tenant (valid input) → assert the IAM provider status text reflects `tenants.find(t => t.id === currentTenantId)` — e.g. shows "Connected" when that tenant's `iamConnected` is true and "Not connected" when false. Assert this section contains no form controls that mutate the store (no `setCurrentTenantId`/`setCurrentRole` here).

`Layout.test.tsx`:
11. Test: Settings link highlights on `/settings` (valid) and not elsewhere → render `<MemoryRouter initialEntries={['/settings']}><Routes><Route path="/" element={<Layout/>}><Route path="settings" element={<div/>} /></Route></Routes></MemoryRouter>`; the footer Settings link has class `active`. Re-render with `initialEntries={['/dashboard']}` (add a matching dashboard route) → the Settings link does NOT have class `active`.

## Implementation steps
1. Scaffold test infra so the failing tests in the Test plan can run:
   - Add devDependencies to `package.json`: `vitest@^3`, `jsdom@^25`, `@testing-library/react@^16.1`, `@testing-library/dom@^10`, `@testing-library/user-event@^14.5`, `@testing-library/jest-dom@^6.6`.
   - Add scripts `"test": "vitest run"` and `"test:watch": "vitest"`.
   - Create `vitest.setup.ts` with `import '@testing-library/jest-dom/vitest';` and `import { afterEach } from 'vitest'; import { cleanup } from '@testing-library/react'; afterEach(() => cleanup());`.
   - Edit `vite.config.ts`: add `/// <reference types="vitest/config" />` as the first line and a `test: { environment: 'jsdom', setupFiles: ['./vitest.setup.ts'], css: false, globals: false }` property on the exported config.
2. Create `src/pages/Settings/Settings.tsx` exporting `function SettingsPage()`. Pull from the store: `const { theme, toggleTheme, currentRole, setCurrentRole, currentTenantId, setCurrentTenantId, tenants, resetToMockData } = useStore();`. Lay out a page header (`<h1>Settings</h1>`) and six `<section>` blocks, each with a `<h2>` heading matching the names in Test 1.
3. Appearance section: render a two-option segmented control "Dark" / "Light". The option equal to `theme` gets an `active`/`aria-pressed` state. On click of a target value `t`: `if (theme !== t) toggleTheme();`. Below it, show the portal display name `ISP Managed` as a read-only labeled field with a small note "Editing the global branding label is tracked separately (requires store support)." Do NOT add store fields for branding in this group (see Constraints).
4. Identity & Role section: a role `<select>` (or radio group) with the four roles; `onChange` calls `setCurrentRole(value as UserRole)`; render a static description string beside/under each role (`isp_admin` → "Full ISP-side administration across all tenants", `customer_admin` → "Manage users, devices, and policies for your tenant", `security_analyst` → "Investigate alerts and security events; read-mostly", `end_user` → "Self-service access and device status only"). Add an Active Tenant `<select>` populated from `tenants` (`value={currentTenantId ?? ''}`, `onChange` → `setCurrentTenantId(e.target.value)`).
5. Notifications section: local state `const [prefs, setPrefs] = useState(loadSettings())` where `loadSettings()` reads/parses `localStorage['zero-trust-portal-settings']` or returns the default `{ severityThreshold: 'low', sources: { iam: true, edr: true, sse: true, siem: true } }`. Render a severity-threshold `<select>` over `AlertSeverity` values (`critical|high|medium|low|info`) and four source toggles (`iam`, `edr`, `sse`, `siem`). Every change updates `prefs` AND writes `localStorage.setItem('zero-trust-portal-settings', JSON.stringify(next))`. These prefs are demo-only and are not consumed elsewhere yet (note in code comment is unnecessary; behavior is self-evident).
6. Integrations section: read-only status. For the current tenant (`tenants.find(t => t.id === currentTenantId)`) show IAM provider (`tenant.iamProvider ?? 'local'`) with status text derived from `tenant.iamConnected` ("Connected" / "Not connected"). Show EDR provider rows for `crowdstrike|symantec|defender|custom` and SIEM rows for `splunk|sentinel|qradar|elastic` using `mockSIEMIntegration` from `src/data/mockData` for the SIEM status. No interactive controls that mutate the store here.
7. Data & Storage section: two destructive buttons styled with `--status-error`. "Reset Demo Data" opens the confirmation dialog (step 8) configured to call `resetToMockData()` on confirm. "Clear stored data" opens the dialog configured to call `localStorage.removeItem('zero-trust-portal-storage')` on confirm. Show the storage key string `zero-trust-portal-storage` as a labeled read-only value. Do not call `window.location.reload()` inside the confirm handler (keeps tests deterministic); instead show an inline note that a manual refresh applies the cleared state.
8. Confirmation dialog: implement a local `confirmState` (`{ open, title, message, confirmLabel, onConfirm } | null`). Render, when open, a `div[role="dialog"][aria-modal="true"]` with the title, message, a "Cancel" button (sets `confirmState` to null), and a confirm button labeled by `confirmLabel` that runs `onConfirm()` then closes. Both destructive actions in step 7 set `confirmState` rather than acting directly.
9. About section: render static `Version 0.0.0`, `Environment: {import.meta.env.MODE}`, and `Build: zero-trust-portal` rows. Define `const APP_VERSION = '0.0.0';` in the file (do not import `package.json`).
10. Create `src/pages/Settings/Settings.css` and `import './Settings.css';` in the page. Use card containers (`--bg-card`, `--border-primary`, `--radius-lg`), section spacing via `--spacing-*`, and the destructive buttons via `--status-error` / `--status-error-bg`. No literal hex theme colors.
11. Edit `src/App.tsx` per Files section: add the import, swap the route element, remove `SettingsPlaceholder`.
12. Edit `src/components/Layout.tsx` line 148 so the Settings `NavLink` uses the `({ isActive }) => \`nav-item ${isActive ? 'active' : ''}\`` className form (identical pattern to lines 137–138).
13. Run `npm run test` and confirm all Test-plan tests pass; run `npm run build` (`tsc -b && vite build`) to confirm type-clean.

## Error handling
- `loadSettings()` wraps `JSON.parse` in try/catch; on parse failure return the default prefs object (corrupt localStorage must not crash the page). Do not log the raw stored value (may contain user-chosen data).
- Destructive actions only mutate after the dialog's confirm button is pressed; the cancel path performs no mutation.
- Tenant `<select>` guards against `currentTenantId === null` by using `value={currentTenantId ?? ''}` with a disabled placeholder option.
- No secrets or PII are read, written, or logged. `localStorage` keys are referenced by name only; their contents are never logged.

## Constraints
- Do NOT modify `src/store/useStore.ts`. It is a hot shared file not owned by this task group; adding `portalName`/notification fields there would widen the change surface and risk conflicts with parallel groups. Branding edit + global propagation and store-backed notification settings are deferred to a follow-up issue.
- Do NOT modify any page other than the files listed. The only edits outside `src/pages/Settings/` are the route swap in `src/App.tsx` and the one-line `NavLink` className fix in `src/components/Layout.tsx`.
- New external dependencies are limited to the test toolchain in step 1 (`vitest`, `jsdom`, `@testing-library/{react,dom,user-event,jest-dom}`), justified because the Nightshift pipeline (CONSTITUTION stages 5–7) requires runnable failing tests before implementation and the repo currently has no test runner. No runtime dependencies are added.
- Settings page styling must use existing CSS variables from `src/index.css`; it must render correctly in both `dark` and `light` `body` classes.
- Exported component name must be `SettingsPage` (matches the AC and the existing `*Page` export convention).

## Risks
- Risk: Adding a test runner touches shared `package.json` and `vite.config.ts`, which could collide with another group also bootstrapping tests. Mitigation: additive-only edits (new scripts, new `test` block, new devDeps); if a runner already exists at implementation time, reuse it and skip step 1's config creation.
- Risk: `@testing-library/react` must be the React 19-compatible major (`^16`); an older major will fail to render. Mitigation: pinned `^16.1` above.
- Risk: `toggleTheme` only flips; a naive segmented control could toggle on every click including the already-active option. Mitigation: the `if (theme !== t)` guard in step 3, covered by Test 2.
- Risk: The Settings `NavLink` shares `nav-item active` styling with main nav; verify the footer link's active style is visually correct in both themes (it reuses the same class, so this is low risk).
- Risk: Notification prefs persist to a separate key and are not yet consumed by alert rendering, which could read as "non-functional." Mitigation: documented as demo-only and deferred; persistence + read-back is still verified (Test 9).

## Rollback
- Revert `src/App.tsx` to render `<SettingsPlaceholder />` (restore the function and route element) — the placeholder is self-contained and immediately restores prior behavior.
- Revert the one-line `NavLink` change in `src/components/Layout.tsx`.
- Delete `src/pages/Settings/` (page, css, test) and `src/components/Layout.test.tsx`.
- Optionally revert the test-infra additions (`vitest.setup.ts`, the `vite.config.ts` `test` block, `package.json` scripts/devDeps); leaving them in place is harmless (no runtime impact).
- No data migrations, no persisted-schema changes (the Settings localStorage key is independent and can be ignored/cleared).

## Acceptance criteria
- [ ] `SettingsPlaceholder` is removed from `src/App.tsx` and `/settings` renders `SettingsPage` imported from `src/pages/Settings/Settings.tsx`.
- [ ] Theme control in Settings reads `theme` and updates it via `toggleTheme` (Test 2).
- [ ] Role switcher updates `currentRole`; tenant selector updates `currentTenantId` (Tests 3–4).
- [ ] "Reset Demo Data" only calls `resetToMockData()` after confirmation; cancel aborts (Tests 5–6).
- [ ] "Clear stored data" removes `zero-trust-portal-storage` only after confirmation; cancel aborts (Tests 7–8).
- [ ] Page renders correctly using `index.css` CSS variables in both dark and light themes; no hardcoded theme hex values.
- [ ] Settings footer nav item shows the `active` class on `/settings` and not on other routes (Test 11).
- [ ] All Test-plan tests pass under `npm run test`; `npm run build` is type-clean with no regressions.
