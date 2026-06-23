// North Quad Run Club - prototype interaction layer (second pass)
// Handles screen navigation, the club challenge state machine, partner
// selection (Maya / Samir), follow, kudos, route save, restart, keyboard
// navigation gated by required state transitions, and the toast.

const screens = Array.from(document.querySelectorAll(".app-screen"));
const indicatorLabel = document.querySelector(".indicator-label");
const indicatorDots = Array.from(document.querySelectorAll(".indicator-dots i"));
const toast = document.querySelector(".prototype-toast");
const challengeButton = document.querySelector(".weekly-challenge .primary-button");
const challengeProgressValue = document.querySelector(".weekly-challenge .progress-value b");
const challengeProgressTrack = document.querySelector(".weekly-challenge .progress-track span");
const challengeCopy = document.querySelector(".weekly-challenge .challenge-copy");
const feedProgressTitle = document.querySelector(".progress-update .progress-title");
const feedProgressCopy = document.querySelector(".progress-update .progress-copy");
const feedKudosCount = document.querySelector(".kudos-line .kudos-count");
const feedPartnerInit = document.querySelector(".kudos-line .avatar-stack [data-partner-initial]");
const feedPartnerKudos = document.querySelector('.feed-actions button[data-action="toggle-feed-kudos"]');
const challengeKudos = document.querySelector('.club-social-actions button[data-action="toggle-both-kudos"]');
const partnerSection = document.querySelector(".partner-section");
const partnerName = document.querySelector(".partner-section .partner-name");
const partnerNameInline = document.querySelector(".partner-section .partner-name-inline");
const partnerMeta = document.querySelector(".partner-section .partner-meta");
const matchReasonsList = document.querySelector(".match-reasons");
const alternateButton = document.querySelector('.partner-section [data-action="toggle-alternate"]');
const pairButton = document.querySelector('.partner-section [data-action="pair-with-partner"]');
const followButton = document.querySelector(".activity-owner > button");
const saveRouteButton = document.querySelector('.map-actions [data-action="toggle-save-route"]');
const activityPartnerName = document.querySelector(".activity-challenge [data-partner-display]");
const activityPartnerKicker = document.querySelector(".activity-challenge [data-partner-kicker]");
const activityChallengeCopy = document.querySelector(".activity-challenge [data-partner-detail]");
const feedTimeMarker = document.querySelector("[data-time-marker]");
const activityChallengeWrapper = document.querySelector(".activity-challenge");
const weeklyChallengeWrapper = document.querySelector(".weekly-challenge");

let currentScreen = 0;

// Default partner shown on the Challenge screen is Maya. The user can
// flip to Samir with "See other clubmates" before pairing, which sets
// state.selectedPartner to "samir". After pairing, the choice is
// remembered via state.selectedPartner and rendered consistently across
// the club progress, feed, and activity detail.
const PARTNERS = {
  maya: {
    key: "maya",
    name: "Maya L.",
    firstName: "Maya",
    shortName: "Maya L.",
    initials: "ML",
    avatarClass: "avatar-maya",
    availability: "Usually runs Tue / Thu",
    reasons: [
      "8:40-9:00 /mi pace",
      "Same Tuesday and Thursday availability",
      "Often runs the North Quad loop",
    ],
    activityChallengeKicker: "Weekly challenge complete",
    feedProgressCopy:
      "Ellen and Maya completed 2 of 2 shared runs. North Quad Run Club is now 68% complete.",
    activityChallengeCopyPrefix: "Ellen and ",
    challengeCopy: "You and Maya completed 2 of 2 shared runs. North Quad Run Club is now 68% complete this week.",
    feedKudosAriaLabel: "Give kudos to Ellen and Maya",
  },
  samir: {
    key: "samir",
    name: "Samir P.",
    firstName: "Samir",
    shortName: "Samir P.",
    initials: "SP",
    avatarClass: "avatar-samir",
    availability: "Usually runs Mon / Wed",
    reasons: [
      "8:40-9:05 /mi pace",
      "Similar early evening availability",
      "Often runs the campus perimeter",
    ],
    activityChallengeKicker: "Weekly challenge complete",
    feedProgressCopy:
      "Ellen and Samir completed 2 of 2 shared runs. North Quad Run Club is now 68% complete.",
    activityChallengeCopyPrefix: "Ellen and ",
    challengeCopy: "You and Samir completed 2 of 2 shared runs. North Quad Run Club is now 68% complete this week.",
    feedKudosAriaLabel: "Give kudos to Ellen and Samir",
  },
};

const state = {
  joined: false,
  selectedPartner: null,
  showingAlternate: false,
  challengeComplete: false,
  following: false,
  kudos: false,
  routeSaved: false,
};

// --- Toast ------------------------------------------------------------

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  if (showToast._t) window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => toast.classList.remove("is-visible"), 1600);
}

// --- Helpers ----------------------------------------------------------

function activePartnerKey() {
  // The user can flip to Samir before pairing (state.showingAlternate).
  // Once a partner is paired, state.selectedPartner is the source of truth
  // and we ignore the alternate flag.
  if (state.selectedPartner) return state.selectedPartner;
  return state.showingAlternate ? "samir" : "maya";
}

function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// --- Render: per-state area ------------------------------------------

function renderChallenge() {
  const completed = state.challengeComplete;
  const joined = state.joined;
  const partner = PARTNERS[activePartnerKey()];

  if (completed) {
    challengeButton.textContent = "Challenge complete";
    challengeButton.classList.add("is-joined", "is-complete");
    challengeButton.setAttribute("aria-pressed", "true");
    challengeButton.disabled = true;
    challengeCopy.textContent = partner.challengeCopy;
  } else if (joined) {
    challengeButton.textContent = "Choose a clubmate";
    challengeButton.classList.add("is-joined");
    challengeButton.classList.remove("is-complete");
    challengeButton.setAttribute("aria-pressed", "true");
    challengeButton.disabled = false;
    challengeCopy.textContent =
      "You\u2019re in. Choose a clubmate to start the challenge.";
  } else {
    challengeButton.textContent = "Join challenge";
    challengeButton.classList.remove("is-joined", "is-complete");
    challengeButton.setAttribute("aria-pressed", "false");
    challengeButton.disabled = false;
    challengeCopy.textContent =
      "Complete two runs with the same clubmate by Sunday. Each shared run adds to the club\u2019s weekly progress.";
  }

  const pct = completed ? 68 : 61;
  challengeProgressValue.textContent = pct + "%";
  challengeProgressTrack.style.width = pct + "%";
  const pvWrap = challengeProgressValue.closest(".progress-value");
  if (pvWrap) pvWrap.setAttribute("data-state", completed ? "complete" : joined ? "joined" : "idle");
}

function renderPartner() {
  const key = activePartnerKey();
  const partner = PARTNERS[key];
  if (!partner) return;

  partnerName.textContent = partner.name;
  partnerNameInline.textContent = partner.name;
  partnerMeta.textContent = partner.availability;
  pairButton.textContent = "Pair with " + partner.firstName;
  pairButton.setAttribute("aria-label", "Pair with " + partner.firstName);

  if (alternateButton) {
    const showSamir = key === "samir";
    alternateButton.textContent = showSamir
      ? "Show suggested partner"
      : "See other clubmates";
    alternateButton.setAttribute("aria-pressed", String(showSamir));
  }

  // Avatar in the partner row swaps to the alternate's class.
  const partnerAvatar = document.querySelector(".partner-row .avatar");
  if (partnerAvatar) {
    partnerAvatar.className = "avatar " + partner.avatarClass;
    partnerAvatar.textContent = partner.initials;
  }

  // Match reasons list (3 li > span).
  if (matchReasonsList) {
    const items = matchReasonsList.querySelectorAll("li span");
    partner.reasons.forEach((text, i) => {
      if (items[i]) items[i].textContent = text;
    });
  }

  // "Best match" pill only shows on the default partner.
  const matchPill = document.querySelector(".partner-section .match-pill");
  if (matchPill) matchPill.style.visibility = key === "maya" ? "visible" : "hidden";
}

function renderFeedProgress() {
  const completed = state.challengeComplete;
  const partner = PARTNERS[activePartnerKey()];
  if (!feedProgressTitle || !feedProgressCopy) return;
  feedProgressTitle.textContent = completed
    ? "Shared run complete"
    : "Shared run progress";
  feedProgressCopy.textContent = completed
    ? partner.feedProgressCopy
    : "Complete both runs to add to this week\u2019s club progress.";
}

function renderFeedActivity() {
  // Avatar stack second slot: partner initials.
  if (feedPartnerInit) {
    const partner = PARTNERS[activePartnerKey()];
    feedPartnerInit.textContent = partner.initials;
  }
  if (feedPartnerKudos) {
    const partner = PARTNERS[activePartnerKey()];
    const sentLabel = "Kudos sent to Ellen and " + partner.shortName;
    const idleLabel = partner.feedKudosAriaLabel;
    feedPartnerKudos.setAttribute(
      "aria-label",
      state.kudos ? sentLabel : idleLabel,
    );
    feedPartnerKudos.setAttribute("aria-pressed", String(state.kudos));
    feedPartnerKudos.classList.toggle("is-active", state.kudos);
  }
  if (feedKudosCount) {
    feedKudosCount.textContent = state.kudos ? "9 gave kudos" : "8 gave kudos";
  }
}

function renderActivityDetail() {
  const partner = PARTNERS[activePartnerKey()];
  if (!partner) return;
  if (activityPartnerKicker) {
    activityPartnerKicker.textContent = state.challengeComplete
      ? partner.activityChallengeKicker
      : "Weekly challenge in progress";
  }
  if (activityPartnerName) activityPartnerName.textContent = partner.shortName;
  if (activityChallengeCopy) {
    activityChallengeCopy.innerHTML = "";
    activityChallengeCopy.appendChild(
      document.createTextNode(partner.activityChallengeCopyPrefix),
    );
    const span = document.createElement("span");
    span.setAttribute("data-partner-display", "activity");
    span.textContent = partner.shortName;
    activityChallengeCopy.appendChild(span);
    activityChallengeCopy.appendChild(
      document.createTextNode(
        state.challengeComplete
          ? " completed 2 of 2 shared runs. North Quad Run Club is now 68% complete."
          : " have not yet completed the challenge. North Quad Run Club is at 61%.",
      ),
    );
  }

  // Follow button.
  if (followButton) {
    followButton.textContent = state.following ? "Following" : "Follow";
    followButton.classList.toggle("is-following", state.following);
    followButton.setAttribute("aria-pressed", String(state.following));
  }

  // Save route.
  if (saveRouteButton) {
    saveRouteButton.setAttribute(
      "aria-label",
      state.routeSaved ? "Route saved" : "Save route",
    );
    saveRouteButton.setAttribute("aria-pressed", String(state.routeSaved));
    saveRouteButton.classList.toggle("is-saved", state.routeSaved);
    const svg = saveRouteButton.querySelector("svg");
    if (svg) svg.setAttribute("data-saved", String(state.routeSaved));
  }

  // "Give kudos to both".
  if (challengeKudos) {
    const bothLabel = state.kudos ? "Kudos sent" : "Give kudos to both";
    challengeKudos.setAttribute("aria-pressed", String(state.kudos));
    challengeKudos.classList.toggle("is-active", state.kudos);
    const span = challengeKudos.querySelector("span");
    if (span) span.textContent = bothLabel;
  }
}

function render() {
  renderChallenge();
  renderPartner();
  renderFeedProgress();
  renderFeedActivity();
  renderActivityDetail();
}

// --- Screen navigation -----------------------------------------------

function showScreen(index) {
  const nextIndex = Number(index);
  if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= screens.length) return;
  currentScreen = nextIndex;
  screens.forEach((screen, i) => {
    const active = i === currentScreen;
    screen.classList.toggle("is-active", active);
    screen.setAttribute("aria-hidden", String(!active));
    if (active) {
      const scroller = screen.querySelector(".screen-scroll");
      if (scroller) scroller.scrollTop = 0;
      if (indicatorLabel) indicatorLabel.textContent = screen.dataset.screenName;
    }
  });
  indicatorDots.forEach((dot, i) => dot.classList.toggle("active", i === currentScreen));
}

// --- Action handler ---------------------------------------------------

function handleAction(button) {
  const action = button.dataset.action;
  if (!action) return false;

  switch (action) {
    case "toast":
      showToast(button.dataset.toast || "Not included in this prototype");
      return true;

    case "open-club":
      showScreen(button.dataset.next);
      return true;

    case "join-challenge":
      // Joining only flips the joined flag. Progress stays at 61% until
      // the completed-run outcome is reached.
      state.joined = true;
      state.challengeComplete = false;
      render();
      showScreen(button.dataset.next);
      return true;

    case "pair-with-partner": {
      // Lock the displayed partner as the selected one and mark the
      // challenge complete.
      state.selectedPartner = state.showingAlternate ? "samir" : "maya";
      state.challengeComplete = true;
      state.showingAlternate = false;
      render();
      showScreen(button.dataset.next);
      return true;
    }

    case "toggle-alternate":
      state.showingAlternate = !state.showingAlternate;
      renderPartner();
      return true;

    case "toggle-follow":
      state.following = !state.following;
      render();
      return true;

    case "toggle-feed-kudos":
      state.kudos = !state.kudos;
      render();
      return true;

    case "toggle-both-kudos":
      state.kudos = !state.kudos;
      render();
      return true;

    case "toggle-save-route":
      state.routeSaved = !state.routeSaved;
      render();
      return true;

    case "view-club-progress":
      // Returning to the club screen should show the completed state.
      showScreen(button.dataset.next);
      return true;

    case "select-tab": {
      // The prototype only renders the Clubs tab content, but the
      // Active/Challenges/Clubs row is a real tab control. Clicking
      // any tab in this row is a no-op here — we don't swap content,
      // and we don't want to imply the click failed. Stay silent.
      if (currentScreen !== 0) {
        showToast("");
      }
      return true;
    }

    default:
      return false;
  }
}

// --- Keyboard: forward nav routes through required state actions ----

function forwardViaActions() {
  switch (currentScreen) {
    case 0: {
      const clubRow = document.querySelector('.club-row[data-action="open-club"]');
      if (clubRow) handleAction(clubRow);
      return;
    }
    case 1: {
      if (!state.joined && !state.challengeComplete) {
        handleAction(challengeButton);
      } else {
        showToast("Use the on-screen controls to continue.");
      }
      return;
    }
    case 2: {
      handleAction(pairButton);
      return;
    }
    case 3: {
      const viewActivity = document.querySelector(".view-activity");
      if (viewActivity) showScreen(viewActivity.dataset.next);
      return;
    }
    case 4: {
      showToast("Use the on-screen controls to continue.");
      return;
    }
  }
}

// --- Event wiring ----------------------------------------------------

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-next], [data-action]");
  if (!trigger) return;
  if (trigger.dataset.next && !trigger.dataset.action) {
    showScreen(trigger.dataset.next);
    return;
  }
  handleAction(trigger);
});

document.querySelector(".restart-button").addEventListener("click", () => {
  state.joined = false;
  state.selectedPartner = null;
  state.showingAlternate = false;
  state.challengeComplete = false;
  state.following = false;
  state.kudos = false;
  state.routeSaved = false;
  // Clear any in-flight toast.
  if (toast) {
    toast.textContent = "";
    toast.classList.remove("is-visible");
  }
  render();
  showScreen(0);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    if (currentScreen < screens.length - 1) forwardViaActions();
    return;
  }
  if (event.key === "ArrowLeft") {
    if (currentScreen > 0) showScreen(currentScreen - 1);
    return;
  }
  if (event.key === "Home") showScreen(0);
});

// --- Boot ------------------------------------------------------------

render();
showScreen(0);
