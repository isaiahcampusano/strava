# Copilot Third-Pass Handoff

## Objective

Polish the prototype's content so the five-screen flow feels presentable in a stakeholder demo, without changing the product concept, screen order, or implementation model.

This is a content-and-realism pass, not a redesign or architecture pass.

## Current Baseline And Prerequisites

- This workspace is still a static prototype built from `index.html`, `styles.css`, `script.js`, and local assets with no build step.
- The UI flow still runs through five `.app-screen` sections and delegated `data-action` interactions in `script.js`.
- The current `script.js` in this workspace still shows earlier second-pass state gaps. Before content polish starts, confirm the second-pass baseline is already present in the working tree or restore it first.
- The repo now includes `verify.js` as the second-pass baseline harness. Use it as the starting verification target before extending it for the presentation-polish pass.
- Start execution by reading `COPILOT_THIRD_PASS.md`, `COPILOT_SECOND_PASS.md`, `HANDOFF.md`, `index.html`, `script.js`, and `styles.css`.

## Locked Constraints

- Keep the existing five-screen flow and screen order:
  `Groups > Club > Challenge > Club Activity Feed > Activity`
- Do not change the core state model, delegated interaction pattern, or static dependency-free setup beyond what is required to restore the second-pass baseline.
- Keep the toast inside its current product role and preserve its accessibility attributes.
- Keep the partner structure centered on Maya and Samir, with challenge states for not joined, joined, and completed.
- Do not add a new screen, backend behavior, framework migration, package manager, or external API dependency.
- Keep the `.time-marker` / "Later this week" concept if it already exists or is added during execution.

## Ordered Workstreams

### 1. Restore Or Confirm Baseline

- Verify the second-pass state fixes are present before starting polish.
- Confirm challenge progress does not advance on join, partner selection is stored consistently, keyboard navigation cannot bypass required state, and the toast behavior matches the second-pass expectations.
- Confirm `verify.js` still passes its baseline `55/55` checks before adding new checks.

### 2. Activity Detail Realism

- Make the activity detail screen read like a real Strava activity, not a placeholder.
- Add a short first-person runner note that mentions the partner, route, and effort or weather.
- Add a heart-rate or effort indicator that fits the current metrics layout.
- Add realistic comments and keep kudos naming/counts consistent with the feed.
- Preserve the activity-first hierarchy, with challenge completion as a secondary layer.

### 3. Partner Profile Realism

- Expand the suggested partner area so Maya and Samir feel like distinct real clubmates.
- Add a one-sentence bio and a small recent-activity summary for each partner.
- Rewrite the three match reasons so they are clearly different dimensions, such as pace, timing, and route or goal overlap.
- Keep the alternate-partner switch within the existing challenge screen.

### 4. Feed Expansion And Social Proof

- Make the club activity feed feel populated and current.
- Add one or two additional club activities or posts within the existing feed structure.
- Improve the kudos line so at least one kudo-giver is named, and add lightweight comment-count context.
- Make the challenge-context copy specific to the paired run instead of generic weekly-progress filler.

### 5. Challenge Copy Polish

- Tighten the challenge copy so each state sounds product-ready and motivating without sounding like a spec.
- Keep the completed state grounded in weekly club progress, not points or invented rewards.
- Preserve the club-progress framing and the "Ends Sunday" style of deadline cue.

### 6. Club-Post Realism

- Replace stub-like club posts with short, believable campus run-club content.
- Keep the existing club surface recognizable and avoid turning it into a broader content redesign.
- The composer row can stay as-is unless a small copy polish is needed for consistency.

### 7. Toast Voice Cleanup

- Replace blunt developer-note toast wording with one consistent demo-safe voice.
- Keep the response short and clearly scoped so peripheral controls feel intentional without pulling focus from the main story.

### 8. Timestamp And Small-Number Consistency

- Audit visible times, kudos counts, dates, route labels, weather, and other small numbers so they feel coherent across screens.
- Differentiate adjacent timestamps where repeated values currently make the prototype feel fabricated.
- Keep numbers plausible and avoid unnecessary metric inflation.

## Verification

- Confirm every file named in this handoff exists locally, including `verify.js`.
- Confirm the second-pass baseline or equivalent state fixes are present before content polish assertions begin.
- Confirm `verify.js` still passes its baseline `55/55` checks, then extend it to roughly `60-65` focused checks for the new realism content.
- Add checks for the runner note, heart-rate or effort detail, distinct partner bios, feed expansion, visible social proof, removal of placeholder-facing copy, and timestamp differentiation.
- Re-run manual walkthroughs for both Maya and Samir paths to make sure the polish pass does not regress state coherence.

## Definition Of Done

- The five-screen flow feels presentation-ready without narration compensating for placeholder content.
- Maya and Samir read as distinct, believable partner choices.
- The feed and activity detail carry realistic social and activity context.
- No visible placeholder or developer-note copy remains in the main UI.
- The second-pass behavior remains intact.
- The `verify.js` baseline is preserved and the extended polish checks pass.

## Prompt To Paste Into Copilot

> Read `COPILOT_THIRD_PASS.md`, `COPILOT_SECOND_PASS.md`, `HANDOFF.md`, `index.html`, `script.js`, `styles.css`, and `verify.js` before editing. Work from the current static prototype in this repo, but first confirm the second-pass baseline state fixes are already present by running `verify.js` and restoring anything it catches before doing presentation polish. Then implement the third pass as a compact realism-and-content polish: improve activity-detail realism, make Maya and Samir feel like distinct real partners, expand the feed with believable social proof, tighten challenge copy, replace stub club posts, clean up toast voice, and make timestamps and small numbers coherent. Preserve the five `.app-screen` flow, delegated `data-action` interaction model, dependency-free setup, and activity-first hierarchy. When finished, verify both partner paths manually and extend `verify.js` from `55/55` to roughly `60-65` focused checks without regressing second-pass behavior.
