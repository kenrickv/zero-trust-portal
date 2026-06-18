## Summary
Suppress the inherited `.tab.active::after` underline on the Monitoring page so active tabs show only the pill-style gradient background.

## Source issues
- #1: bug: Monitoring tabs display both background color and underline simultaneously

## Files to create or modify
- `src/pages/Operations/Operations.css` — add a `.tab.active::after { display: none; }` rule to override the global underline pseudo-element. Place it immediately after the existing `.tab.active` rule (currently lines 43–46) so the scoping intent is obvious.

## Test plan (write these first)
This is a CSS-only cosmetic fix in a Vite/React project with no CSS unit-test harness. "Tests" here are deterministic manual/visual verification steps; do not invent a new test framework for a one-line style override.

1. Verify (valid state): Load `/ops`, click each tab (Alerts, Enforcement Actions, Audit Log). The active tab must render the gradient background pill and NO 2px underline beneath it.
2. Verify (inactive state unchanged): Inactive tabs still show hover background (`--bg-tertiary`) on hover and no underline — confirm the override did not affect non-active tabs.
3. Verify (no regression elsewhere): Load another page that uses the global underline-style `.tab` pattern (the rule in `src/index.css:749`) and confirm those tabs STILL show their underline — the override must be scoped to Operations.css only and must not leak globally.
4. Verify (computed style): In browser devtools, inspect the active Operations tab's `::after` and confirm `display: none` is the winning declaration.

## Implementation steps
1. Open `src/pages/Operations/Operations.css`.
2. After the existing `.tab.active` block (lines 43–46), add:
   ```css
   .tab.active::after {
       display: none;
   }
   ```
   Use 4-space indentation to match the surrounding file style.
3. Do not modify `src/index.css` — the global rule is intentionally shared by underline-style tabs elsewhere.

## Error handling
- N/A (static CSS). No runtime, logging, secrets, or PII involved.

## Constraints
- Do not modify `src/index.css` — its `.tab.active::after` rule is the source of truth for underline-style tabs on other pages and must remain intact.
- Keep the override scoped to `Operations.css`; do not introduce a global suppression.
- No new external dependencies.
- Match existing 4-space indentation in `Operations.css`.

## Risks
- Risk: A reviewer could "fix" this by editing `index.css` instead, breaking underline tabs site-wide. Mitigation: explicit constraint above; the fix belongs only in Operations.css.
- Risk: Specificity — both the global and override rules are `.tab.active::after` (equal specificity), so the override only wins because Operations.css is imported after index.css. Mitigation: confirm via devtools computed-style check (test step 4) that the override actually wins.

## Rollback
- Revert the single added rule in `src/pages/Operations/Operations.css` (delete the 3-line `.tab.active::after { display: none; }` block). No data, migrations, or build artifacts involved.

## Acceptance criteria
- [ ] Active Monitoring tabs show gradient pill only, no underline
- [ ] Inactive/hover tab states unchanged on `/ops`
- [ ] Underline-style tabs on other pages still render their underline (no global regression)
- [ ] Only `src/pages/Operations/Operations.css` is modified
