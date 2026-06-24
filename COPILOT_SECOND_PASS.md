# Copilot Second-Pass Handoff

## Tomorrow's Objective

Finish the interaction refinement without changing the five-screen product concept or visual direction.

The current prototype is already functional and visually complete enough for this stage. Tomorrow's work is specifically about **state coherence, partner consistency, keyboard behavior, and final verification**.

Do not restart the implementation or redesign the screens.

## Read These Files First

1. `COPILOT_SECOND_PASS.md`
2. `COPILOT_HANDOFF.md`
3. `HANDOFF.md`
4. `index.html`
5. `script.js`
6. `styles.css`

## Product Direction To Preserve

The five-screen flow is:

`Groups > Club > Challenge pairing > Club Activity Feed > Activity detail`

Core thesis:

**A paired club challenge creates voluntary accountability, advances shared club progress through real activity, and gives existing activity posts more social meaning.**

Preserve:

- One Strava-style mobile prototype
- Existing Groups, club, challenge, feed, and activity-detail screens
- Generic `North Quad Run Club` identity
- Incentives based on accountability, contribution, recognition, and belonging
- Normal intentional kudos, not automatic or bonus kudos
- No dependencies, backend, framework migration, or additional full screens

## Current Implementation State

Copilot's first pass added:

- A delegated `data-action` interaction system
- A prototype state object
- Responses for all 53 visible buttons
- Follow, kudos, route-save, alternate-partner, and restart states
- A reusable toast for out-of-scope controls
- `aria-pressed` and accessible-label updates
- Revised challenge language centered on club progress

The main flow still works, but several states do not tell a logically consistent story.

## Required Fixes

### 1. Joining Must Not Complete Progress

Current problem:

- Clicking `Join challenge` immediately changes progress from 61% to 68%.
- It also says the user committed to a run with Maya before a partner is selected.

Expected behavior:

- `Join challenge` sets only `joined = true`.
- Club progress remains at 61% after joining.
- Joined copy should say the user is ready to select a clubmate.
- Progress changes to 68% only when the demo reaches the completed-run outcome.

Suggested joined copy:

> You're in. Choose a clubmate to start the challenge.

### 2. Store The Selected Partner

Current problem:

- Partner state is a boolean.
- Selecting Samir changes some visible text, but the CTA still says `Pair with Maya`.
- The avatar, kudos label, feed copy, and activity completion copy remain hard-coded to Maya.

Expected behavior:

- Replace the boolean partner state with a selected-partner value or object.
- Suggested shape:

```js
selectedPartner: null
```

Partner data may be stored in a small object keyed by `maya` and `samir`.

When the alternate is displayed, update consistently:

- Name and initials
- Availability and matching reasons
- Pair CTA
- Feed completion copy
- Challenge context
- Kudos accessible label
- Activity completion copy

The primary action should be generic in code, such as `pair-with-partner`, rather than `pair-with-maya`.

### 3. Render Three Challenge States

The club challenge module needs distinct states:

| State | CTA | Progress | Supporting copy |
| --- | --- | --- | --- |
| Not joined | `Join challenge` | 61% | Explain the two shared-run goal. |
| Joined | `Choose a clubmate` or `Joined` | 61% | Prompt the user to choose a clubmate. |
| Completed | `Challenge complete` | 68% | Confirm the selected pair completed 2 of 2 runs. |

`View club progress` from activity detail must return to the club screen showing the completed state.

### 4. Keep The Demo Time Jump Clear

The prototype intentionally jumps from pairing to a later completed activity outcome.

Keep the five screens, but make the transition understandable. On the Club Activity Feed, use a lightweight time marker such as:

> Later this week

Do not add another screen.

### 5. Prevent Keyboard Navigation From Bypassing State

Current problem:

- Right-arrow navigation can move directly to completion screens without joining or pairing.

Choose one clean solution:

- Preferred: route forward keyboard navigation through the same actions and state transitions as visible CTAs.
- Acceptable: allow left-arrow back navigation but remove right-arrow forward navigation.

Do not let keyboard navigation produce impossible states.

### 6. Put The Toast Inside The Phone

Current problem:

- `.prototype-toast` is attached outside the phone and fixed to the browser viewport.

Expected behavior:

- Move the toast inside `.phone-screen`.
- Position it near the bottom of the phone but above the bottom navigation.
- Keep `role="status"`, `aria-live="polite"`, and `aria-atomic="true"`.
- On desktop, it must appear inside the mock phone rather than at the browser's bottom-right.

### 7. Clean Up Minor Code Issues

- Remove the unused `progressButton` variable.
- Select the route-save button using its `data-action` attribute instead of relying on it being the first `.circle-button`.
- Keep source text ASCII where practical; use HTML entities in markup when needed.

## State Model Recommendation

A small explicit state model is enough:

```js
const state = {
  joined: false,
  selectedPartner: null,
  challengeComplete: false,
  following: false,
  kudos: false,
  routeSaved: false,
  showingAlternate: false,
};
```

Create one render function for each state area and one `render()` function that calls them. Avoid duplicating partner names across independent conditionals.

## Verification Requirements

Test the default path:

1. Open North Quad Run Club.
2. Join the challenge.
3. Confirm progress remains 61% and no partner is assumed.
4. Pair with Maya.
5. Confirm the feed and activity detail consistently name Maya.
6. Give kudos, follow, and save the route.
7. Return through `View club progress`.
8. Confirm the club challenge shows 68% and `Challenge complete`.

Test the alternate path:

1. Restart the prototype.
2. Join the challenge.
3. Select the alternate clubmate.
4. Confirm the CTA changes to `Pair with Samir`.
5. Pair with Samir.
6. Confirm every downstream name, initials, label, and completion message uses Samir.

Also verify:

- Repeated kudos clicks toggle between 8 and 9 rather than continually increasing.
- Follow and route-save states toggle correctly.
- Every peripheral button shows the toast inside the phone.
- Active Clubs and Groups controls do not show a misleading failure message.
- Back navigation preserves state.
- Restart clears all state.
- No hidden elements are used to fake interaction tests.
- No console errors occur.

Browser tests must query visible controls and assert resulting text, classes, `aria-pressed`, and active-screen state. Calling `.click()` without assertions is not sufficient verification.

## Definition Of Done

The second pass is complete when both Maya and Samir paths remain internally consistent, progress changes only after completed activity, completed state survives navigation back to the club, keyboard controls cannot bypass required state, and every toast appears inside the phone.

## Prompt To Paste Into Copilot

> Read `COPILOT_SECOND_PASS.md`, `COPILOT_HANDOFF.md`, `index.html`, `script.js`, and `styles.css` before editing. Implement every required fix in `COPILOT_SECOND_PASS.md` without redesigning the five-screen flow. Correct challenge progress timing, store and render the selected partner consistently across both Maya and Samir paths, add distinct not-joined/joined/completed states, prevent keyboard navigation from bypassing state, move the toast inside the phone, and remove the noted code issues. Then test both partner paths using visible controls and explicit assertions. Do not stop at recommendations; make and verify the changes.
