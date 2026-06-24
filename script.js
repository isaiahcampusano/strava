const screens = [...document.querySelectorAll(".app-screen")];
const indicatorLabel = document.querySelector(".indicator-label");
const indicatorDots = [...document.querySelectorAll(".indicator-dots i")];
const toast = document.querySelector(".prototype-toast");
const groupTabs = [...document.querySelectorAll('.group-tabs button[data-action="select-tab"]')];
const weeklyChallenge = document.querySelector(".weekly-challenge");
const challengeButton = document.querySelector('.weekly-challenge .primary-button');
const challengeCopy = document.querySelector('.weekly-challenge .challenge-copy');
const challengeProgressValue = document.querySelector('.weekly-challenge .progress-value b');
const challengeProgressTrack = document.querySelector('.weekly-challenge .progress-track span');
const progressValue = challengeProgressValue.closest(".progress-value");
const pairButton = document.querySelector('[data-action="pair-with-partner"]');
const partnerName = document.querySelector('.partner-section .partner-name');
const partnerNameInline = document.querySelector('.partner-section .partner-name-inline');
const partnerMeta = document.querySelector('.partner-section .partner-meta');
const partnerPhoto = document.querySelector('.partner-section .partner-photo');
const partnerBio = document.querySelector('.partner-section .partner-bio');
const partnerRecent = document.querySelector('.partner-section .partner-recent');
const matchSummary = document.querySelector('.partner-section .match-summary');
const partnerPlan = document.querySelector('.partner-section .partner-plan');
const pairingStatus = document.querySelector('[data-pairing-status]');
const pairingStatusTitle = document.querySelector('.pairing-status-title');
const pairingStatusCopy = document.querySelector('.pairing-status-copy');
const alternateButton = document.querySelector('.partner-section .text-button');
const matchReasonLabels = [...document.querySelectorAll(".match-reasons li span")];
const feedProgressTitle = document.querySelector(".progress-title");
const feedProgressCopy = document.querySelector(".progress-copy");
const challengeContextCopy = document.querySelector(".challenge-context-copy");
const feedKudosCount = document.querySelector(".kudos-count");
const avatarStack = [...document.querySelectorAll(".avatar-stack i")];
const followButton = document.querySelector('.activity-owner > button');
const saveRouteButton = document.querySelector('[data-action="toggle-save-route"]');
const feedKudosButton = document.querySelector('.feed-actions button[data-action="toggle-feed-kudos"]');
const bothKudosButton = document.querySelector('.club-social-actions button[data-action="toggle-both-kudos"]');
const activityPartnerDetail = document.querySelector("[data-partner-detail]");
const restartButton = document.querySelector(".restart-button");

const PARTNERS = {
  maya: {
    key: "maya",
    firstName: "Maya",
    shortName: "Maya L.",
    initials: "ML",
    meta: "Runs with North Quad · 18 club activities",
    bio: "Architecture senior building toward her first half marathon.",
    recent: "Yesterday · Easy 4.6 mi at 8:51 /mi",
    matchSummary: "Maya matches your pace, Tuesday and Thursday availability, and preferred campus route.",
    reasons: [
      "Your easy paces are within 10 sec /mi",
      "Both free Tuesday and Thursday evenings",
      "Both regularly run the North Quad loop",
    ],
    plan: "Thu, 6:15 PM · North Quad loop · Easy 5 mi",
    acceptedPlan: "Thursday at 6:15 PM · North Quad loop",
    photoClass: "partner-photo avatar-maya",
  },
  samir: {
    key: "samir",
    firstName: "Samir",
    shortName: "Samir P.",
    initials: "SP",
    meta: "Runs with North Quad · 24 club activities",
    bio: "Engineering grad student who keeps campus miles social and steady.",
    recent: "Monday · Steady 5.2 mi at 8:58 /mi",
    matchSummary: "Samir is close to your pace, shares your Wednesday window, and trains on familiar campus routes.",
    reasons: [
      "Your easy paces are within 15 sec /mi",
      "Both free Wednesday after 5:30 PM",
      "Both train on the campus perimeter",
    ],
    plan: "Wed, 5:45 PM · Campus perimeter · Steady 5 mi",
    acceptedPlan: "Wednesday at 5:45 PM · Campus perimeter",
    photoClass: "partner-photo avatar-samir",
  },
};

const initialState = {
  joined: false,
  selectedPartner: null,
  pairingAccepted: false,
  challengeComplete: false,
  following: false,
  kudos: false,
  routeSaved: false,
  showingAlternate: false,
  activeTab: "clubs",
};

let currentScreen = 0;
const state = { ...initialState };
window.state = state;

function getSuggestedPartnerKey() {
  return state.showingAlternate ? "samir" : "maya";
}

function getSuggestedPartner() {
  return PARTNERS[getSuggestedPartnerKey()];
}

function getSelectedPartner() {
  return PARTNERS[state.selectedPartner || "maya"];
}

function resetToast() {
  toast.textContent = "";
  toast.classList.remove("is-visible");
  window.clearTimeout(showToast.timeoutId);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1600);
}

function updateTabsUI() {
  groupTabs.forEach((button) => {
    const isActive = button.dataset.tab === state.activeTab;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function updateChallengeUI() {
  let progress = "61%";
  let copy = "Complete two runs with the same clubmate by Sunday. Each shared run adds to the club's weekly progress.";
  let buttonLabel = "Join challenge";
  let stateName = "not-joined";

  if (state.challengeComplete) {
    const partner = getSelectedPartner();
    progress = "68%";
    copy = `You and ${partner.firstName} completed 2 of 2 shared runs. North Quad Run Club is now 68% complete this week.`;
    buttonLabel = "Challenge complete";
    stateName = "complete";
  } else if (state.pairingAccepted) {
    const partner = getSelectedPartner();
    copy = `You're paired with ${partner.firstName}. Progress stays at 61% until both shared runs are uploaded.`;
    buttonLabel = "Pairing confirmed";
    stateName = "paired";
  } else if (state.joined) {
    copy = "You're in. Choose a clubmate to start the challenge.";
    buttonLabel = "Choose a clubmate";
    stateName = "joined";
  }

  weeklyChallenge.dataset.challengeState = stateName;
  challengeButton.textContent = buttonLabel;
  challengeButton.classList.toggle("is-joined", state.joined && !state.challengeComplete);
  challengeButton.classList.toggle("is-complete", state.challengeComplete);
  challengeButton.setAttribute("aria-pressed", String(state.joined || state.challengeComplete));
  challengeCopy.textContent = copy;
  challengeProgressValue.textContent = progress;
  challengeProgressTrack.style.width = progress;
  progressValue.dataset.state = stateName;
}

function updatePartnerUI() {
  const partner = getSuggestedPartner();

  partnerName.textContent = partner.shortName;
  partnerNameInline.textContent = partner.shortName;
  partnerMeta.textContent = partner.meta;
  partnerBio.textContent = partner.bio;
  partnerRecent.textContent = partner.recent;
  matchSummary.textContent = partner.matchSummary;
  partnerPlan.textContent = partner.plan;
  partnerPhoto.className = partner.photoClass;
  partnerPhoto.setAttribute("aria-label", `${partner.shortName} profile photo`);
  pairingStatus.hidden = !state.pairingAccepted;
  pairingStatusTitle.textContent = `${partner.firstName} accepted`;
  pairingStatusCopy.textContent = partner.acceptedPlan;
  pairButton.textContent = state.pairingAccepted ? "See shared run result" : `Send invite to ${partner.firstName}`;
  pairButton.setAttribute(
    "aria-label",
    state.pairingAccepted
      ? `See shared run result with ${partner.shortName}`
      : `Send pairing invite to ${partner.shortName}`
  );
  pairButton.classList.toggle("is-accepted", state.pairingAccepted);
  alternateButton.textContent = state.showingAlternate ? "Show suggested partner" : "See other clubmates";
  alternateButton.setAttribute("aria-pressed", String(state.showingAlternate));
  alternateButton.hidden = state.pairingAccepted;

  matchReasonLabels.forEach((label, index) => {
    label.textContent = partner.reasons[index];
  });
}

function updateFeedUI() {
  const partner = getSelectedPartner();

  feedProgressTitle.textContent = "Shared run progress";
  feedProgressCopy.textContent = state.challengeComplete
    ? `Ellen and ${partner.firstName} completed 2 of 2 shared runs. North Quad Run Club is now 68% complete.`
    : "Complete both runs to add to this week's club progress.";
  challengeContextCopy.textContent = state.challengeComplete
    ? `This shared run with ${partner.firstName} counts toward the weekly challenge.`
    : "Shared runs add to this week's club progress.";

  if (avatarStack[1]) {
    avatarStack[1].textContent = state.challengeComplete ? partner.initials : PARTNERS.maya.initials;
  }

  const kudosCount = state.kudos ? 9 : 8;
  const kudosLabel = state.kudos
    ? `Kudos sent to Ellen and ${partner.firstName}`
    : `Give kudos to Ellen and ${partner.firstName}`;

  feedKudosCount.textContent = `${kudosCount} gave kudos`;
  feedKudosButton.setAttribute("aria-label", kudosLabel);
  feedKudosButton.setAttribute("aria-pressed", String(state.kudos));
  feedKudosButton.classList.toggle("is-active", state.kudos);
  bothKudosButton.setAttribute("aria-pressed", String(state.kudos));
  bothKudosButton.classList.toggle("is-active", state.kudos);
  bothKudosButton.querySelector("span").textContent = state.kudos ? "Kudos sent" : "Give kudos to both";
}

function updateActivityUI() {
  const partner = getSelectedPartner();

  activityPartnerDetail.textContent = `Ellen and ${partner.firstName} completed 2 of 2 shared runs. North Quad Run Club is now 68% complete.`;
  followButton.textContent = state.following ? "Following" : "Follow";
  followButton.classList.toggle("is-following", state.following);
  followButton.setAttribute("aria-pressed", String(state.following));

  const saveLabel = state.routeSaved ? "Route saved" : "Save route";
  saveRouteButton.setAttribute("aria-label", saveLabel);
  saveRouteButton.setAttribute("aria-pressed", String(state.routeSaved));
  saveRouteButton.classList.toggle("is-saved", state.routeSaved);
  saveRouteButton.querySelector("svg").setAttribute("data-saved", String(state.routeSaved));
}

function render() {
  updateTabsUI();
  updateChallengeUI();
  updatePartnerUI();
  updateFeedUI();
  updateActivityUI();
}

function showScreen(index) {
  const nextIndex = Number(index);
  if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= screens.length) return;

  currentScreen = nextIndex;
  screens.forEach((screen, screenIndex) => {
    const isActive = screenIndex === currentScreen;
    screen.classList.toggle("is-active", isActive);
    screen.setAttribute("aria-hidden", String(!isActive));

    if (isActive) {
      const scroller = screen.querySelector(".screen-scroll");
      if (scroller) scroller.scrollTop = 0;
      indicatorLabel.textContent = screen.dataset.screenName;
    }
  });

  indicatorDots.forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === currentScreen);
  });
}

function resetState() {
  Object.assign(state, initialState);
  render();
  showScreen(0);
  resetToast();
}

function handleAction(trigger) {
  const action = trigger.dataset.action;
  if (!action) return false;

  if (action === "toast") {
    showToast(trigger.dataset.toast || "This feature is not part of the prototype.");
    return true;
  }

  if (action === "select-tab") {
    state.activeTab = trigger.dataset.tab || "clubs";
    render();
    return true;
  }

  if (action === "open-club") {
    state.activeTab = "clubs";
    showScreen(trigger.dataset.next);
    return true;
  }

  if (action === "join-challenge") {
    state.joined = true;
    render();
    showScreen(trigger.dataset.next);
    return true;
  }

  if (action === "pair-with-partner") {
    if (!state.pairingAccepted) {
      const partner = getSuggestedPartner();
      state.joined = true;
      state.selectedPartner = partner.key;
      state.pairingAccepted = true;
      render();
      return true;
    }

    state.challengeComplete = true;
    render();
    showScreen(trigger.dataset.next);
    return true;
  }

  if (action === "toggle-alternate") {
    if (state.pairingAccepted) return true;
    state.showingAlternate = !state.showingAlternate;
    render();
    return true;
  }

  if (action === "toggle-follow") {
    state.following = !state.following;
    render();
    return true;
  }

  if (action === "toggle-feed-kudos" || action === "toggle-both-kudos") {
    state.kudos = !state.kudos;
    render();
    return true;
  }

  if (action === "toggle-save-route") {
    state.routeSaved = !state.routeSaved;
    render();
    return true;
  }

  if (action === "view-club-progress") {
    showScreen(trigger.dataset.next);
    return true;
  }

  return false;
}

function routeForwardKey() {
  if (currentScreen === 0) {
    handleAction(document.querySelector('[data-action="open-club"]'));
    return;
  }

  if (currentScreen === 1) {
    handleAction(challengeButton);
    return;
  }

  if (currentScreen === 2) {
    handleAction(pairButton);
    return;
  }

  if (currentScreen === 3) {
    showScreen(4);
  }
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-next], [data-action]");
  if (!trigger) return;

  if (trigger.dataset.next && !trigger.dataset.action) {
    showScreen(trigger.dataset.next);
    return;
  }

  handleAction(trigger);
});

restartButton.addEventListener("click", resetState);

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    routeForwardKey();
  }

  if (event.key === "ArrowLeft" && currentScreen > 0) {
    showScreen(currentScreen - 1);
  }

  if (event.key === "Home") {
    resetState();
  }
});

render();
showScreen(0);
