## Summary
Make the header Bell icon open a right-aligned slide-in notifications drawer that lists tenant alerts, each with a severity icon, metadata, dismiss control, and CTAs that deep-link to User Management (`/day0`) or Device Management (`/day1`) with the affected entity highlighted.

## Source issues
- #3: feat: Notifications panel — Bell icon opens slide-in drawer with clickable alerts linking to User & Device Management

## Key architecture decision (read first)
The pre-seeded task context suggested a brand-new `Notification` type plus `mockNotifications` and a parallel store slice. **Do NOT do that.** The existing `Alert` model (`src/types/index.ts:127`) already carries every field the acceptance criteria need: `severity`, `title`, `description`, `source`, `affectedUserId`, `affectedDeviceId`, `status`, `createdAt`. The header badge already derives from `alerts` (`Layout.tsx:36`). Introducing a second parallel model would create two sources of truth and a badge that disagrees with the panel.

**Therefore: reuse `Alert` and the existing `alerts` store state.** No new type is introduced; `src/types/index.ts` is NOT modified. "Notification" in the UI == an `Alert` row for the current tenant.

Unread / badge semantics:
- **Unread** = `alert.status === 'new'`. The badge counts tenant alerts with status `'new'`.
- **Dismiss one** = set that alert's `status` to `'dismissed'` (decrements badge).
- **Mark all read** = set every tenant alert currently `'new'` to `'dismissed'` (clears badge), without navigating.
- The panel lists **all** tenant alerts (newest first) regardless of status; only `'new'` ones drive the badge and get the unread accent.

## Files to create or modify
- `src/store/useStore.ts` — add two actions to the interface and implementation: `dismissAlert(id)` and `markAllAlertsRead()`. `alerts` is already in state and already persisted (`partialize`), so no persistence change.
- `src/components/Layout.tsx` — add `isNotificationsOpen` state; wire the existing Bell `<button>` (currently `title="Notifications"`, no handler, `Layout.tsx:78`) to toggle it; tenant-filter the badge count; render `<NotificationsPanel open={isNotificationsOpen} onClose={...} />`.
- `src/components/NotificationsPanel.tsx` — NEW. Slide-in drawer + overlay; consumes `alerts`, `users`, `devices`, `currentTenantId`, `dismissAlert`, `markAllAlertsRead` from the store; navigates via `useNavigate`.
- `src/components/NotificationsPanel.css` — NEW. Drawer/overlay/card styles driven by the existing theme CSS variables; slide+fade entrance.
- `src/pages/Day0/Day0.tsx` — read `?highlight=<userId>` via `useSearchParams`; highlight the matching user row, ensure it is rendered (it may be outside the current `slice(0,5)`), and scroll it into view.
- `src/pages/Day1/Day1.tsx` — read `?highlight=<deviceId>` via `useSearchParams`; highlight + auto-expand + scroll the matching device card into view.
- `src/data/mockData.ts` — (optional, recommended) append 2 extra `'new'` alerts so the drawer is visibly populated and scrollable; existing `alert-001` already has BOTH `affectedUserId` and `affectedDeviceId`, so the two-CTA case is already covered.

## Verification plan (do this first — no automated runner exists)
This repo has **no test framework** (no vitest/jest in `package.json`, no app `*.test.tsx`). Do not add one for a P2 demo feature — that is out of scope (see Constraints). Instead, write down these checks as the definition of done and execute them manually with `npm run dev`, plus `npm run build` (which runs `tsc -b`) and `npm run lint` as the automated gates.

Manual acceptance checks (map 1:1 to issue criteria):
1. Valid case: click Bell → drawer slides in from the right listing current-tenant alerts; each card shows severity icon, title, 2-line description, source tag, relative timestamp, and a "→ Go to …" CTA.
2. User link: a card whose alert has `affectedUserId` shows a "Go to User Management" CTA → navigates to `/day0?highlight=<userId>`, drawer closes, target user row is highlighted and scrolled into view.
3. Device link: a card with `affectedDeviceId` → navigates to `/day1?highlight=<deviceId>`, target device card highlighted, expanded, scrolled into view.
4. Both links: `alert-001` (has user AND device) shows TWO separate CTAs.
5. Dismiss one: clicking a card's dismiss control sets its status to `'dismissed'`; badge count decrements by one.
6. Mark all read: button sets all `'new'` → `'dismissed'`; badge disappears; no navigation occurs.
7. Overlay close: clicking outside the panel (the overlay) closes it; Escape key also closes it.
8. Scroll: with >viewport-worth of alerts the card list scrolls inside the drawer (drawer header/footer stay fixed).
9. Empty state: with zero tenant alerts the drawer shows a friendly empty message, not a blank panel.
10. Theme: toggle dark/light (existing theme button) → drawer, cards, and text remain legible in both (uses CSS variables, no hard-coded colors).
11. Permission/edge: an alert referencing a `affectedUserId`/`affectedDeviceId` that does not exist in the current tenant must NOT crash — render the card without the dead CTA (guard the lookup).

## Implementation steps
1. **Store actions** (`useStore.ts`): in `AppState`, below `updateAlert`, declare:
   - `dismissAlert: (id: string) => void;`
   - `markAllAlertsRead: () => void;`
   Implement near `updateAlert` (line ~192):
   - `dismissAlert: (id) => set((state) => ({ alerts: state.alerts.map(a => a.id === id ? { ...a, status: 'dismissed', updatedAt: new Date().toISOString() } : a) }))`
   - `markAllAlertsRead: () => set((state) => ({ alerts: state.alerts.map(a => a.status === 'new' ? { ...a, status: 'dismissed', updatedAt: new Date().toISOString() } : a) }))`
   (Tenant filtering for the badge happens in the component; keeping the action global is fine because alerts are single-tenant in this mock, but the component MUST filter by `currentTenantId` for display/count.)
2. **NotificationsPanel.tsx**: props `{ open: boolean; onClose: () => void }`. Pull `alerts`, `users`, `devices`, `currentTenantId`, `dismissAlert`, `markAllAlertsRead` from `useStore`. Derive `tenantAlerts = alerts.filter(a => a.tenantId === currentTenantId).sort(by createdAt desc)`.
   - Render nothing (or an unmounted overlay) when `!open`; prefer always rendering the overlay+panel and toggling an `open` class so the CSS transition plays on close too.
   - Overlay `<div className="notif-overlay" onClick={onClose} />`.
   - Panel `<aside className="notif-panel">` with: header (title + unread count + "Mark all read" button), scrollable `<div className="notif-list">`, and an empty state when `tenantAlerts.length === 0`.
   - Card per alert: left border colored by `severity`; a `severityIcon(severity)` (map to lucide icons already imported elsewhere, e.g. `AlertTriangle`/`AlertCircle`/`Info`); title; description with a 2-line CSS clamp; source tag (`alert.source` upper-cased, e.g. `EDR`); relative timestamp via a local `formatRelative(createdAt)` helper (no new dependency); a dismiss `<button aria-label="Dismiss">` with the `X` icon calling `dismissAlert(alert.id)`.
   - CTAs: if `affectedUserId` AND a matching user exists in this tenant → button "Go to User Management" calling `navigate('/day0?highlight=' + affectedUserId)` then `onClose()`. Same for `affectedDeviceId` → `/day1?highlight=...`. Render both when both present. Guard each lookup so a missing entity hides only that CTA.
   - Add an Escape-key listener (in a `useEffect` gated on `open`) that calls `onClose`.
3. **NotificationsPanel.css**: overlay `position: fixed; inset: 0; background: rgba(0,0,0,.4)`; panel `position: fixed; top:0; right:0; height:100vh; width: 420px; max-width: 100vw; z-index: 500;` with `transform: translateX(100%)` by default and `translateX(0)` under `.open`, `transition: transform .2s ease`. List `overflow-y: auto`. Use existing theme variables (inspect `src/index.css` / `Layout.css` for the variable names already in use, e.g. `--bg-*`, `--text-*`, `--border-*`) — do NOT hard-code hex colors so both themes work. Severity colors may reuse the existing badge color variables.
4. **Layout.tsx**: add `const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);`. Change the badge source to tenant-filtered: `const newAlerts = alerts.filter(a => a.tenantId === currentTenantId && a.status === 'new').length;`. Add `onClick={() => setIsNotificationsOpen(o => !o)}` to the existing Bell button. After the `</header>` (or alongside the mobile overlay) render `<NotificationsPanel open={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />`. Import the component at top.
5. **Day0.tsx**: import `useSearchParams` from `react-router-dom`. `const [params] = useSearchParams(); const highlightId = params.get('highlight');`. In the Directory Preview table, give each row `id={\`user-row-${user.id}\`}` and `className={highlightId === user.id ? 'row-highlight' : ''}`. Because the table currently renders `tenantUsers.slice(0,5)`, ensure the highlighted user is included: when `highlightId` is set, render the matched user even if it falls outside the first 5 (e.g. build the display list as the matched user first, then the rest, sliced). Add a `useEffect` on `highlightId` that `document.getElementById(\`user-row-${highlightId}\`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })`. Add a `.row-highlight` pulse style to `Day0.css`.
6. **Day1.tsx**: same `useSearchParams` pattern. Add `id={\`device-card-${device.id}\`}` and conditionally append a `highlighted` class to the `device-card`. In a `useEffect` on `highlightId`: set `expandedDevice` to the highlighted id and scroll its element into view. Add a `.device-card.highlighted` pulse/border style to `Day1.css`.
7. Run `npm run build` and `npm run lint`; fix any type/lint errors. Then walk the manual verification checklist.

## Error handling
- Entity lookups for CTAs (`users.find` / `devices.find`) may return `undefined` for stale alert references — guard and simply omit that CTA; never render a link that would navigate to a non-existent highlight, and never dereference the result.
- `highlight` param may reference an id not present on the page — the `scrollIntoView`/`getElementById` chain must be null-safe (`?.`); absence is a no-op, not an error.
- Do not log alert contents, user emails, device names, or IOC values to the console. No secrets/PII in logs.
- Guard against `currentTenantId === null` (type allows it): treat as zero alerts / empty state.

## Constraints
- Do **not** add a new `Notification` type or `mockNotifications` array; reuse `Alert`/`alerts` (see Key architecture decision). `src/types/index.ts` stays untouched.
- Do **not** add any new runtime or dev dependency. Relative-time formatting and severity-icon mapping must be done with existing code/`lucide-react` icons. (No `date-fns`, no test framework — adding vitest is out of scope unless the user explicitly asks.)
- Do not change the `Alert` status enum or the persistence `partialize` config.
- Keep the drawer at `z-index: 500` and ensure it sits above the header but below nothing critical; verify it does not trap the existing mobile sidebar overlay.
- Maintain backward compatibility with the existing Bell badge consumers (only the count source changes, the `.notification-badge` markup/class stays).

## Risks
- **Badge/panel divergence** if the component forgets tenant filtering — mitigated by filtering by `currentTenantId` in both the badge (step 4) and the panel list (step 2).
- **Highlighted user hidden by `slice(0,5)`** in Day0 — mitigated in step 5 by forcing the matched user into the rendered list.
- **Persisted state**: `alerts` is persisted to localStorage, so a returning user may already have alerts dismissed; demo reset is available via the existing `resetToMockData` button. Acceptable for a demo; note it during verification.
- **CSS variable names**: assumed theme variables exist — confirm actual names in `src/index.css`/`Layout.css` before authoring the CSS to avoid invisible text in one theme.

## Rollback
- Revert is isolated: delete `src/components/NotificationsPanel.tsx` and `.css`, and revert the edits to `useStore.ts`, `Layout.tsx`, `Day0/Day0.tsx`, `Day1/Day1.tsx`, `data/mockData.ts`. No schema, no migration, no persisted-shape change (only alert `status` values mutate, which the existing reset handles), so a single `git revert` of the feature commit fully restores prior behavior.

## Acceptance criteria
- [ ] All 11 manual verification checks pass.
- [ ] `npm run build` (tsc + vite) and `npm run lint` pass with no new errors.
- [ ] Bell opens/closes the right-aligned slide-in drawer; overlay click and Escape close it.
- [ ] Badge counts tenant `'new'` alerts; decrements on dismiss; clears on "Mark all read"; no navigation on mark-all.
- [ ] User/device/both CTAs navigate to `/day0` / `/day1` with `?highlight=` and the target entity is highlighted and scrolled into view.
- [ ] Drawer renders correctly and legibly in both dark and light themes; list scrolls; empty state shown when no alerts.
- [ ] No regression to the existing header, mobile sidebar overlay, or theme toggle.
- [ ] No new dependency added; `src/types/index.ts` unchanged.
