# Phase 6 acceptance captures

Use the signed-in workspace dashboard and save screenshots in this directory. The console blocks automated browser control, so these are manual checks. The expected values below are data checks and do not represent a completed visual pass.

1. **01-date-filter.png** — On Pit Boss, set April 1–June 30, 2025. The live floor coin-in counter should show about $124.0M. The bridge and live ratios should update. Labeled Jan–Jun ranks and July decisions remain snapshots.
2. **02-bank-filter.png** — Keep those dates and select Hotel Corridor · Bank 40. Confirm the filtered total and the bank name. Check that the bank name and filter chip are readable. Clear both filters before continuing.
3. **03-tier-gold.png** — On High-Roller Ladder, choose Tier = Gold and verify the player-month table updates. Clear the tier filter afterward.
4. **04-model-validation.png** — Open Model Room. Confirm the May–June shading, 61 scored days, and MAE of approximately $218K and $55K.
5. **05-inspection-evidence.png** — Open Cashier’s Cage and follow the M-1158 inspection to Evidence Vault. Capture the evidence row with its source and assumptions. Luck Funnel should show adjusted p = 0.0015 and the separate 34% fixability estimate.

Check each capture for overlapping or clipped content, unexpected blanks, and legible text and mark colors on the dark theme.

Local Playwright captured the shell and the token refusal in [00-local-embed-blocked.png](00-local-embed-blocked.png). The iframe never rendered, so the seven dashboard page captures are pending.
