// Verification harness for North Quad Run Club second pass
// Loads index.html + script.js into jsdom, walks both partner paths,
// and asserts every check from the second-pass handoff.

const fs = require("fs");
const path = require("path");

let JSDOM;
let VirtualConsole;

try {
  ({ JSDOM, VirtualConsole } = require("jsdom"));
} catch (error) {
  console.error('Missing dependency: "jsdom". Install it in your Node environment, then rerun `node verify.js`.');
  process.exit(1);
}

const projectDir = __dirname;
const html = fs.readFileSync(path.join(projectDir, "index.html"), "utf8");
const js = fs.readFileSync(path.join(projectDir, "script.js"), "utf8");

const consoleErrors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on("jsdomError", (error) => {
  consoleErrors.push("jsdomError: " + (error.detail || error.message || error));
});
virtualConsole.on("error", (message) => {
  consoleErrors.push("console.error: " + message);
});
virtualConsole.on("warn", (message) => {
  consoleErrors.push("console.warn: " + message);
});

const dom = new JSDOM(html, {
  runScripts: "outside-only",
  pretendToBeVisual: true,
  url: "file://" + projectDir + "/",
  virtualConsole,
});

const { window } = dom;
const { document } = window;

window.eval(js);

const results = [];
function assert(name, condition, detail) {
  results.push({ name, pass: !!condition, detail: detail || "" });
}

function clickByAction(action, scope) {
  const root = scope || document;
  const button = root.querySelector(`[data-action="${action}"]`);
  if (!button) return null;
  button.click();
  return button;
}

function clickByNext(nextScreen, scope) {
  const root = scope || document;
  const button = root.querySelector(`[data-next="${nextScreen}"]`);
  if (!button) return null;
  button.click();
  return button;
}

function activeScreen() {
  return document.querySelector(".app-screen.is-active");
}

function restart() {
  const button = document.querySelector(".restart-button");
  if (button) button.click();
  const toast = document.querySelector(".prototype-toast");
  if (toast) {
    toast.textContent = "";
    toast.classList.remove("is-visible");
  }
}

function fireKey(key) {
  const event = new window.KeyboardEvent("keydown", { key, bubbles: true });
  document.dispatchEvent(event);
}

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
  document.querySelector(".partner-name").textContent.trim() === "Maya L."
);
assert(
  "start: pair CTA defaults to 'Pair with Maya'",
  document.querySelector('[data-action="pair-with-partner"]').textContent.trim() === "Pair with Maya",
  `actual="${document.querySelector('[data-action="pair-with-partner"]').textContent}"`
);

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
  /Choose a clubmate|choose a clubmate/i.test(document.querySelector(".challenge-copy").textContent),
  `actual="${document.querySelector(".challenge-copy").textContent}"`
);

const joinedCta = document.querySelector('.weekly-challenge .primary-button').textContent.trim();
assert(
  "Maya path: joined CTA reads 'Joined' or 'Choose a clubmate' (not 'Join challenge')",
  /^(Joined|Choose a clubmate)$/.test(joinedCta),
  `actual="${joinedCta}"`
);

clickByAction("pair-with-partner");
assert("Maya path: Club activity feed after pair", activeScreen().dataset.screen === "3");
assert(
  "Maya path: feed progress copy names Maya",
  /Maya/.test(document.querySelector(".progress-copy").textContent),
  `actual="${document.querySelector(".progress-copy").textContent}"`
);
assert(
  "Maya path: feed kudos count starts at 8",
  document.querySelector(".kudos-count").textContent.trim() === "8 gave kudos"
);
assert(
  "Maya path: feed has 'Later this week' time marker",
  !!document.querySelector("[data-time-marker]") &&
    /Later this week/i.test(document.querySelector("[data-time-marker]").textContent)
);

clickByAction("toggle-feed-kudos");
assert(
  "Maya path: feed kudos toggles to 9 after first click",
  document.querySelector(".kudos-count").textContent.trim() === "9 gave kudos"
);
clickByAction("toggle-feed-kudos");
assert(
  "Maya path: feed kudos toggles back to 8 on second click (no continuous increase)",
  document.querySelector(".kudos-count").textContent.trim() === "8 gave kudos"
);

clickByAction("toggle-feed-kudos");

clickByNext(4);
assert("Maya path: Activity screen after next=4", activeScreen().dataset.screen === "4");
const mayaActivityCopy = document.querySelector(".activity-challenge [data-partner-detail]").textContent;
assert(
  "Maya path: activity detail names Maya in completion copy",
  /Maya/.test(mayaActivityCopy),
  `actual="${mayaActivityCopy}"`
);
assert(
  "Maya path: activity detail does NOT name Samir",
  !/Samir/.test(mayaActivityCopy)
);

clickByAction("toggle-follow");
assert(
  "Maya path: follow toggles (label + class)",
  document.querySelector(".activity-owner > button").textContent.trim() === "Following" &&
    document.querySelector(".activity-owner > button").classList.contains("is-following")
);
clickByAction("toggle-follow");
assert(
  "Maya path: follow toggles back",
  document.querySelector(".activity-owner > button").textContent.trim() === "Follow"
);

clickByAction("toggle-save-route");
const saveButton = document.querySelector('[data-action="toggle-save-route"]');
assert(
  "Maya path: route-save toggles (aria-pressed + is-saved)",
  saveButton.getAttribute("aria-pressed") === "true" && saveButton.classList.contains("is-saved")
);
clickByAction("toggle-save-route");
assert(
  "Maya path: route-save toggles back",
  saveButton.getAttribute("aria-pressed") === "false" && !saveButton.classList.contains("is-saved")
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
  /2 of 2/.test(document.querySelector(".challenge-copy").textContent)
);

restart();
assert("KB: restart clears state (Groups active)", activeScreen().dataset.screen === "0");
fireKey("ArrowRight");
assert("KB: ArrowRight from Groups opens Club", activeScreen().dataset.screen === "1");
fireKey("ArrowLeft");
assert("KB: ArrowLeft from Groups stays at Groups (no underflow)", activeScreen().dataset.screen === "0");

clickByAction("open-club");
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

restart();
clickByAction("open-club");
clickByAction("join-challenge");
fireKey("ArrowRight");
assert(
  "KB: ArrowRight from Challenge with no partner selected auto-pairs Maya",
  activeScreen().dataset.screen === "3"
);
assert(
  "KB: partner auto-selected is Maya (no Samir default)",
  document.querySelector(".partner-name").textContent.trim() === "Maya L."
);

restart();
clickByAction("open-club");
clickByAction("join-challenge");
clickByAction("toggle-alternate");
assert(
  "Samir path: alternate toggle flips partner name to Samir P.",
  document.querySelector(".partner-name").textContent.trim() === "Samir P."
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
const samirFeedCopy = document.querySelector(".progress-copy").textContent;
assert(
  "Samir path: feed completion copy names Samir (not Maya)",
  /Samir/.test(samirFeedCopy) && !/Maya/.test(samirFeedCopy),
  `actual="${samirFeedCopy}"`
);
assert(
  "Samir path: avatar stack reflects Samir (ML replaced by SP)",
  document.querySelector(".avatar-stack i:nth-child(2)").textContent.trim() === "SP"
);
assert(
  "Samir path: feed kudos aria-label uses Samir",
  /Samir/.test(document.querySelector('[data-action="toggle-feed-kudos"]').getAttribute("aria-label"))
);

clickByNext(4);
const samirActivityCopy = document.querySelector(".activity-challenge [data-partner-detail]").textContent;
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
    document.querySelector('.weekly-challenge .primary-button').textContent.trim() === "Challenge complete"
);
assert(
  "Samir path: completed copy names Samir",
  /Samir/.test(document.querySelector(".challenge-copy").textContent)
);

const toast = document.querySelector(".prototype-toast");
const phoneScreen = document.querySelector(".phone-screen");
assert("Toast: lives inside .phone-screen", phoneScreen.contains(toast));
assert("Toast: is NOT a direct child of body or main", toast.parentElement === phoneScreen);
assert(
  "Toast: role/aria-live/aria-atomic intact",
  toast.getAttribute("role") === "status" &&
    toast.getAttribute("aria-live") === "polite" &&
    toast.getAttribute("aria-atomic") === "true"
);

restart();
clickByAction("open-club");
document.querySelector(".cover-settings").click();
assert("Toast: appears with is-visible class after click", toast.classList.contains("is-visible"));
assert("Toast: has text content from the button's data-toast", toast.textContent.length > 0);

restart();
document.querySelectorAll('[data-action="select-tab"]')[0].click();
assert(
  "Tabs: clicking Active does NOT show a misleading failure toast",
  !document.querySelector(".prototype-toast").classList.contains("is-visible")
);

assert(
  "Console: no console errors during full walkthrough",
  consoleErrors.length === 0,
  consoleErrors.length ? consoleErrors.join(" | ") : ""
);

let passed = 0;
let failed = 0;
for (const result of results) {
  if (result.pass) {
    passed++;
  } else {
    failed++;
    console.log("FAIL:", result.name, result.detail ? "- " + result.detail : "");
  }
}

console.log(`\n${passed}/${results.length} checks passed.`);
if (consoleErrors.length) {
  console.log("\nConsole errors captured:");
  for (const error of consoleErrors) console.log("  ", error);
}
console.log("\nFinal state dump: window.state=" + JSON.stringify(window.state || window.__state || null));

if (failed) process.exit(1);
