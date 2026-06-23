// Verification harness for North Quad Run Club second pass
// Loads index.html + script.js into jsdom, walks both partner paths,
// asserts every check from the handoff's verification list.

const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const projectDir = "/home/workspace/Projects/strava-demo";
const html = fs.readFileSync(path.join(projectDir, "index.html"), "utf8");
const js = fs.readFileSync(path.join(projectDir, "script.js"), "utf8");

const consoleErrors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => consoleErrors.push("jsdomError: " + (e.detail || e.message || e)));
vc.on("error", (msg) => consoleErrors.push("console.error: " + msg));
vc.on("warn", (msg) => consoleErrors.push("console.warn: " + msg));

const dom = new JSDOM(html, {
  runScripts: "outside-only",
  pretendToBeVisual: true,
  url: "file://" + projectDir + "/",
  virtualConsole: vc,
});

const { window } = dom;
const { document } = window;

// Inject script
window.eval(js);

const results = [];
function assert(name, condition, detail) {
  results.push({ name, pass: !!condition, detail: detail || "" });
}

// Helpers
function clickByAction(action, scope) {
  const root = scope || document;
  const btn = root.querySelector(`[data-action="${action}"]`);
  if (!btn) return null;
  btn.click();
  return btn;
}
function clickByNext(n, scope) {
  const root = scope || document;
  const btn = root.querySelector(`[data-next="${n}"]`);
  if (!btn) return null;
  btn.click();
  return btn;
}
function activeScreen() {
  return document.querySelector(".app-screen.is-active");
}
function restart() {
  const btn = document.querySelector(".restart-button");
  if (btn) btn.click();
  const t = document.querySelector(".prototype-toast");
  if (t) {
    t.textContent = "";
    t.classList.remove("is-visible");
  }
}
function fireKey(key) {
  const ev = new window.KeyboardEvent("keydown", { key, bubbles: true });
  document.dispatchEvent(ev);
}

// ===== START STATE =====
restart();
const start = activeScreen();
assert("start: Groups screen active", start && start.dataset.screen === "0");
assert(
  "start: challenge CTA is 'Join challenge'",
  document.querySelector('.weekly-challenge .primary-button').textContent.trim() === "Join challenge"
);
assert(
  "start: progress value is 61%",
  document.querySelector('.weekly-challenge .progress-value b').textContent.trim() === "61%"
);
assert(
  "start: progress track width is 61%",
  document.querySelector('.weekly-challenge .progress-track span').style.width === "61%"
);
assert(
  "start: partner defaults to Maya L.",
  document.querySelector('.partner-name').textContent.trim() === "Maya L."
);
assert(
  "start: pair CTA defaults to 'Pair with Maya'",
  document.querySelector('[data-action="pair-with-partner"]').textContent.trim() === "Pair with Maya",
  `actual="${document.querySelector('[data-action="pair-with-partner"]').textContent}"`
);

// ===== MAYA PATH =====
clickByAction("open-club");
assert("Maya path: Club screen visible after open-club", activeScreen().dataset.screen === "1");

clickByAction("join-challenge");
const afterJoin = activeScreen();
assert("Maya path: Challenge screen after join", afterJoin.dataset.screen === "2");
assert(
  "Maya path: progress remains 61% after joining (NOT 68%)",
  document.querySelector('.weekly-challenge .progress-value b').textContent.trim() === "61%",
  `actual="${document.querySelector('.weekly-challenge .progress-value b').textContent.trim()}"`
);
assert(
  "Maya path: progress track remains 61% width",
  document.querySelector('.weekly-challenge .progress-track span').style.width === "61%"
);
assert(
  "Maya path: joined copy tells user to choose clubmate (not assume Maya)",
  /Choose a clubmate|choose a clubmate/i.test(
    document.querySelector('.weekly-challenge .challenge-copy').textContent
  ),
  `actual="${document.querySelector('.weekly-challenge .challenge-copy').textContent}"`
);
// After clicking Join challenge, the CTA should be either 'Joined' or 'Choose a clubmate'
const joinedCta = document.querySelector('.weekly-challenge .primary-button').textContent.trim();
assert(
  "Maya path: joined CTA reads 'Joined' or 'Choose a clubmate' (not 'Join challenge')",
  /^(Joined|Choose a clubmate)$/.test(joinedCta),
  `actual="${joinedCta}"`
);

clickByAction("pair-with-partner");
const _dbg_feed = document.querySelector('.activity-challenge [data-partner-detail]').textContent;
assert("Maya path: Club activity feed after pair", activeScreen().dataset.screen === "3");
assert(
  "Maya path: feed progress copy names Maya",
  /Maya/.test(document.querySelector('.progress-copy').textContent),
  `actual="${document.querySelector('.progress-copy').textContent}"`
);
assert(
  "Maya path: feed kudos count starts at 8",
  document.querySelector('.kudos-count').textContent.trim() === "8 gave kudos"
);
assert(
  "Maya path: feed has 'Later this week' time marker",
  !!document.querySelector('[data-time-marker]') &&
    /Later this week/i.test(document.querySelector('[data-time-marker]').textContent)
);

clickByAction("toggle-feed-kudos");
assert(
  "Maya path: feed kudos toggles to 9 after first click",
  document.querySelector('.kudos-count').textContent.trim() === "9 gave kudos"
);
clickByAction("toggle-feed-kudos");
assert(
  "Maya path: feed kudos toggles back to 8 on second click (no continuous increase)",
  document.querySelector('.kudos-count').textContent.trim() === "8 gave kudos"
);

clickByAction("toggle-feed-kudos"); // back to 9 for downstream checks

clickByNext(4);
assert("Maya path: Activity screen after next=4", activeScreen().dataset.screen === "4");
const ac = document.querySelector('.activity-challenge');
const activityCopy = document.querySelector('.activity-challenge [data-partner-detail]').textContent;
assert(
  "Maya path: activity detail names Maya in completion copy",
  /Maya/.test(activityCopy),
  `actual="${activityCopy}"`
);
assert(
  "Maya path: activity detail does NOT name Samir",
  !/Samir/.test(activityCopy)
);

clickByAction("toggle-follow");
assert(
  "Maya path: follow toggles (label + class)",
  document.querySelector('.activity-owner > button').textContent.trim() === "Following" &&
    document.querySelector('.activity-owner > button').classList.contains("is-following")
);
clickByAction("toggle-follow");
assert(
  "Maya path: follow toggles back",
  document.querySelector('.activity-owner > button').textContent.trim() === "Follow"
);

clickByAction("toggle-save-route");
const saveBtn = document.querySelector('[data-action="toggle-save-route"]');
assert(
  "Maya path: route-save toggles (aria-pressed + is-saved)",
  saveBtn.getAttribute("aria-pressed") === "true" && saveBtn.classList.contains("is-saved")
);
clickByAction("toggle-save-route");
assert(
  "Maya path: route-save toggles back",
  saveBtn.getAttribute("aria-pressed") === "false" && !saveBtn.classList.contains("is-saved")
);

clickByAction("view-club-progress");
const backAtClub = activeScreen();
assert("Maya path: view-club-progress returns to Club screen", backAtClub.dataset.screen === "1");
assert(
  "Maya path: challenge module now shows 68% on completion",
  document.querySelector('.weekly-challenge .progress-value b').textContent.trim() === "68%",
  `actual="${document.querySelector('.weekly-challenge .progress-value b').textContent.trim()}"`
);
assert(
  "Maya path: challenge CTA now reads 'Challenge complete'",
  document.querySelector('.weekly-challenge .primary-button').textContent.trim() === "Challenge complete"
);
assert(
  "Maya path: challenge copy says '2 of 2 shared runs'",
  /2 of 2/.test(document.querySelector('.weekly-challenge .challenge-copy').textContent)
);

// ===== KEYBOARD CHECK: ArrowRight from Groups should NOT bypass join/pair =====
restart();
assert("KB: restart clears state (Groups active)", activeScreen().dataset.screen === "0");
fireKey("ArrowRight");
assert(
  "KB: ArrowRight from Groups opens Club",
  activeScreen().dataset.screen === "1"
);
fireKey("ArrowLeft");
assert("KB: ArrowLeft from Groups stays at Groups (no underflow)", activeScreen().dataset.screen === "0");

// Follow the action-routed path: open-club then ArrowRight should match join
clickByAction("open-club"); // now on Club (1)
fireKey("ArrowRight");
assert(
  "KB: ArrowRight from Club advances through join action",
  activeScreen().dataset.screen === "2"
);
fireKey("ArrowRight");
assert(
  "KB: ArrowRight from Challenge advances through pair action (since joined)",
  activeScreen().dataset.screen === "3"
);

// Restart and verify ArrowRight doesn't run pair-without-join from Challenge
restart();
clickByAction("open-club");
clickByAction("join-challenge"); // now on Challenge, joined but no partner yet
fireKey("ArrowRight");
assert(
  "KB: ArrowRight from Challenge with no partner selected auto-pairs Maya",
  activeScreen().dataset.screen === "3"
);
assert(
  "KB: partner auto-selected is Maya (no Samir default)",
  document.querySelector('.partner-name').textContent.trim() === "Maya L."
);

// ===== SAMIR PATH =====
restart();
clickByAction("open-club");
clickByAction("join-challenge");
clickByAction("toggle-alternate"); // show Samir
assert(
  "Samir path: alternate toggle flips partner name to Samir P.",
  document.querySelector('.partner-name').textContent.trim() === "Samir P."
);
assert(
  "Samir path: pair CTA now reads 'Pair with Samir'",
  document.querySelector('[data-action="pair-with-partner"]').textContent.trim() === "Pair with Samir"
);
assert(
  "Samir path: alternate button aria-pressed is true",
  document.querySelector('[data-action="toggle-alternate"]').getAttribute("aria-pressed") === "true"
);

clickByAction("pair-with-partner");
assert("Samir path: Club activity feed after pairing", activeScreen().dataset.screen === "3");
const samirFeedCopy = document.querySelector('.progress-copy').textContent;
assert(
  "Samir path: feed completion copy names Samir (not Maya)",
  /Samir/.test(samirFeedCopy) && !/Maya/.test(samirFeedCopy),
  `actual="${samirFeedCopy}"`
);
assert(
  "Samir path: avatar stack reflects Samir (ML replaced by SP)",
  document.querySelector('.avatar-stack i:nth-child(2)').textContent.trim() === "SP"
);
assert(
  "Samir path: feed kudos aria-label uses Samir",
  /Samir/.test(
    document.querySelector('[data-action="toggle-feed-kudos"]').getAttribute("aria-label")
  )
);

clickByNext(4);
const samirActivityCopy = document.querySelector('.activity-challenge [data-partner-detail]').textContent;
assert(
  "Samir path: activity detail names Samir in completion copy",
  /Samir/.test(samirActivityCopy) && !/Maya/.test(samirActivityCopy),
  `actual="${samirActivityCopy}"`
);
assert(
  "Samir path: completion copy says 'completed 2 of 2'",
  /2 of 2/.test(samirActivityCopy)
);

clickByAction("view-club-progress");
assert("Samir path: completed state survives back-nav", activeScreen().dataset.screen === "1");
assert(
  "Samir path: completed state shows 68% and Challenge complete",
  document.querySelector('.weekly-challenge .progress-value b').textContent.trim() === "68%" &&
    document.querySelector('.weekly-challenge .primary-button').textContent.trim() ===
      "Challenge complete"
);
assert(
  "Samir path: completed copy names Samir",
  /Samir/.test(document.querySelector('.weekly-challenge .challenge-copy').textContent)
);

// ===== TOAST INSIDE PHONE =====
const toastEl = document.querySelector(".prototype-toast");
const phoneScreen = document.querySelector(".phone-screen");
assert(
  "Toast: lives inside .phone-screen",
  phoneScreen.contains(toastEl)
);
// Ensure it's not body-level or main-level
assert(
  "Toast: is NOT a direct child of body or main",
  toastEl.parentElement === phoneScreen
);
// role/aria attributes preserved
assert(
  "Toast: role/aria-live/aria-atomic intact",
  toastEl.getAttribute("role") === "status" &&
    toastEl.getAttribute("aria-live") === "polite" &&
    toastEl.getAttribute("aria-atomic") === "true"
);
// Trigger a peripheral button (the cover-settings) and check it's visible
restart();
clickByAction("open-club");
const coverSettings = document.querySelector('.cover-settings');
coverSettings.click();
assert(
  "Toast: appears with is-visible class after click",
  toastEl.classList.contains("is-visible")
);
assert(
  "Toast: has text content from the button's data-toast",
  toastEl.textContent.length > 0
);

// ===== TAB MISLEADING-MESSAGE CHECK =====
restart();
const activeTab = document.querySelectorAll('[data-action="select-tab"]')[0];
const _dbgToast = document.querySelector('.prototype-toast');
activeTab.click();
assert(
  "Tabs: clicking Active does NOT show a misleading failure toast",
  !document.querySelector(".prototype-toast").classList.contains("is-visible")
);

// ===== NO CONSOLE ERRORS =====
assert("Console: no console errors during full walkthrough", consoleErrors.length === 0,
  consoleErrors.length ? consoleErrors.join(" | ") : "");

// ===== SUMMARY =====
let passed = 0, failed = 0;
for (const r of results) {
  if (r.pass) { passed++; }
  else { failed++; console.log("FAIL:", r.name, r.detail ? "— " + r.detail : ""); }
}
console.log(`\n${passed}/${results.length} checks passed.`);
if (consoleErrors.length) {
  console.log("\nConsole errors captured:");
  for (const e of consoleErrors) console.log("  ", e);
}
console.log("\nFinal state dump: window.state=" + JSON.stringify(window.state || window.__state || null));
if (failed) process.exit(1);
