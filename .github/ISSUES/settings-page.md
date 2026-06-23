# [Feature] Implement Settings Page

**Labels:** `enhancement`, `frontend`

---

## Summary

The `/settings` route currently renders a `SettingsPlaceholder` component that just shows "Settings page coming soon…". This needs to be replaced with a fully functional Settings page appropriate for the Zero Trust Portal.

---

## Current State

`App.tsx` defines:

```tsx
<Route path="settings" element={<SettingsPlaceholder />} />
```

Where `SettingsPlaceholder` is a bare-bones stub with no real content.

---

## Proposed Sections

The new `src/pages/Settings/Settings.tsx` page should be broken into the following tabbed or sectioned areas:

### 1. Appearance
- Theme toggle (Dark / Light) — currently only accessible via the header button; expose it here as a proper setting
- Portal display name / branding label (currently hardcoded as `"ISP Managed"` in `Layout.tsx`)

### 2. Identity & Role
- View/switch the active Role (`isp_admin`, `customer_admin`, `security_analyst`, `end_user`) — currently only in the sidebar dropdown, should be surfaced as a formal settings control with descriptions per role
- Active Tenant selector (currently only displayed, not changeable from settings)

### 3. Notifications
- Configure alert severity thresholds for badge visibility
- Notification preferences per source (`iam`, `edr`, `sse`, `siem`)

### 4. Integrations
- IAM Provider connection status (`entra_id`, `okta`, `ping`, `local`, `custom`) per tenant
- EDR Provider status (`crowdstrike`, `symantec`, `defender`, `custom`)
- SIEM integration status (`splunk`, `sentinel`, `qradar`, `elastic`) — types already exist in `SIEMIntegration`

### 5. Data & Storage
- Surface the "Reset Demo Data" action (currently a hidden icon button in the header) as a clearly labeled, destructive action with a confirmation dialog
- Show current `localStorage` key (`zero-trust-portal-storage`) with a "Clear stored data" option

### 6. About
- Portal version, environment, and build info

---

## Acceptance Criteria

- [ ] `SettingsPlaceholder` in `App.tsx` is replaced with a proper `SettingsPage` import from `src/pages/Settings/Settings.tsx`
- [ ] Theme toggle in Settings is kept in sync with `useStore`'s `theme` / `toggleTheme`
- [ ] Role switcher in Settings updates `useStore`'s `currentRole`
- [ ] "Reset Demo Data" confirmation modal is added before calling `resetToMockData()`
- [ ] Page matches the existing dark/light theme and CSS variable system defined in `index.css`
- [ ] Settings nav item in the sidebar footer highlights correctly when on `/settings`

---

## Files to Create / Modify

| File | Action |
|---|---|
| `src/pages/Settings/Settings.tsx` | **Create** |
| `src/pages/Settings/Settings.css` | **Create** |
| `src/App.tsx` | **Modify** — swap `SettingsPlaceholder` for `SettingsPage` import |
