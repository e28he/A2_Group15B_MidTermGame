const GAME = {
  width: 1280,
  height: 720,
  durationSec: 180,
  targetOrders: 20,
};

const STATES = {
  IDLE: "IDLE",
  HOW_TO_PLAY: "HOW_TO_PLAY",
  PRACTICE_SELECT: "PRACTICE_SELECT",
  TRANSITION: "TRANSITION",
  TUTORIAL_RECOVERY: "TUTORIAL_RECOVERY",
  NEW_ORDER: "NEW_ORDER",
  ARM_SELECTION: "ARM_SELECTION",
  ARM_CONTROL: "ARM_CONTROL",
  STEP_CHALLENGE: "STEP_CHALLENGE",
  STEP_SUCCESS: "STEP_SUCCESS",
  TANGLED: "TANGLED",
  UNTANGLE: "UNTANGLE",
  SERVE_DRINK: "SERVE_DRINK",
  ORDER_COMPLETE: "ORDER_COMPLETE",
  LEVEL_COMPLETE: "LEVEL_COMPLETE",
  GAME_OVER: "GAME_OVER",
};
const TRANSITION_DURATION_MS = 2800;
const RUSH_EVENT_DURATION_MS = 12000;
const COMBO_MILESTONES = [3, 5, 8];

const STATION_TASKS = {
  coffee: { type: "hold", key: "E", keyName: "E", speed: 40 },
  milk: { type: "tap", key: "T", keyName: "T", speed: 18, decay: 8 },
  foam: {
    type: "balance",
    key: "H",
    keyName: "H",
    marker: 50,
    gravity: 20,
    push: 28,
    speed: 26,
  },
  syrup: {
    type: "rhythm",
    key: " ",
    keyName: "SPACE",
    timer: 0,
    beatMs: 800,
    windowMs: 150,
    speed: 28,
  },
  ice: {
    type: "alternate",
    keyName: "X ↔ C",
    lastKey: null,
    speed: 15,
    decay: 5,
  },
};

const RECIPES = {
  Americano: ["coffee"],
  "Milk Sample": ["milk"],
  "Foam Practice": ["foam"],
  "Ice Practice": ["ice"],
  "Syrup Practice": ["syrup"],
  Latte: ["coffee", "milk"],
  "Iced Coffee": ["coffee", "ice"],
  "Syrup Coffee": ["coffee", "syrup"],
  "Iced Latte": ["coffee", "milk", "ice"],
  "Foam Latte": ["coffee", "milk", "foam"],
  "Mocha Latte": ["coffee", "milk", "syrup"],
  "Special Latte": ["coffee", "milk", "foam", "syrup"],
  "Iced Deluxe Latte": ["coffee", "milk", "foam", "ice"],
};

const STAGE_POOLS = {
  0: [
    "Americano",
    "Milk Sample",
    "Foam Practice",
    "Ice Practice",
    "Syrup Practice",
  ],
  1: [
    "Americano",
    "Milk Sample",
    "Foam Practice"
  ],
  2: [
    "Americano",
    "Milk Sample",
    "Foam Practice",
    "Ice Practice",
    "Syrup Practice",
  ],
  3: ["Latte", "Iced Coffee", "Syrup Coffee"],
  4: ["Iced Latte", "Foam Latte", "Mocha Latte"],
  5: ["Special Latte", "Iced Deluxe Latte"],
};

const STAGE_META = {
  0: {
    label: "Level 0",
    title: "Tutorial: Guided Foundations",
    summary: "A no-pressure walkthrough for single-step drinks and recovery basics.",
    completeText: "Tutorial complete. You are ready to enter the main shift.",
    targetOrders: 5,
    nextStage: 1,
    guideLabel: "Tutorial Tip",
  },
  1: {
    label: "Level 1",
    title: "Apprentice: Warm Up",
    summary: "Put the basics together with gentle pressure.",
    completeText: "Great job! You've mastered the basic station controls.",
    targetOrders: 5,
    nextStage: 2,
    guideLabel: "Level 1 Tip",
  },
  2: {
    label: "Level 2",
    title: "Foundations: Single-Step Rush",
    summary: "Former Level 1, now shifted forward into the main run.",
    completeText: "Good start. Basic station control is locked in.",
    targetOrders: 5,
    nextStage: 3,
    guideLabel: "Level 2 Tip",
  },
  3: {
    label: "Level 3",
    title: "Beginner: Two-Step Multitasking",
    summary: "Manage your first real multitask drinks without losing flow.",
    completeText: "You are handling multiple stations much better now.",
    targetOrders: 5,
    nextStage: 4,
    guideLabel: "Level 3 Tip",
  },
  4: {
    label: "Level 4",
    title: "Intermediate: Three-Step Challenges",
    summary: "More timing pressure, more movement, more coordination mistakes to avoid.",
    completeText: "Strong work. Complex coordination is starting to look natural.",
    targetOrders: 5,
    nextStage: 5,
    guideLabel: "Level 4 Tip",
  },
  5: {
    label: "Level 5",
    title: "Expert: Four-Step Mastery",
    summary: "Everything is active now. This is the full barista chaos test.",
    completeText: "Outstanding. You reached the highest level in the shift.",
    targetOrders: null,
    nextStage: null,
    guideLabel: "Level 5 Tip",
  },
};

const CUSTOMER_TRAITS = {
  patient: {
    label: "Patient",
    color: [116, 171, 108],
    scoreMul: 1.0,
    penaltyMul: 0.85,
    speedWindowSec: 34,
    speedBonusMul: 0.9,
    quotes: [
      "No rush, take your time.",
      "A smooth cup is worth the wait.",
      "I can wait for the perfect brew.",
    ],
  },
  picky: {
    label: "Picky",
    color: [194, 120, 92],
    scoreMul: 1.24,
    penaltyMul: 1.45,
    speedWindowSec: 24,
    speedBonusMul: 1.0,
    quotes: [
      "Please make it exactly right.",
      "I want this one perfect.",
      "Careful with the texture, please.",
    ],
  },
  rushed: {
    label: "Rushed",
    color: [199, 154, 76],
    scoreMul: 1.08,
    penaltyMul: 1.1,
    speedWindowSec: 18,
    speedBonusMul: 1.65,
    quotes: [
      "Quick please, I'm late!",
      "Fast cup, I need to run.",
      "Speed over style right now!",
    ],
  },
};

const STATION_NAMES = ["coffee", "milk", "ice", "syrup", "foam", "serve"];
const OCTOPUS_Y_FACTOR = 0.38;
const PROFILE_STORAGE_KEY = "octopus_barista_profile_v1";
const POWERUPS = {
  calm: { key: "1", name: "Calm Brew", cost: 120 },
  focus: { key: "2", name: "Focus Shot", cost: 100 },
  turbo: { key: "3", name: "Turbo Hand", cost: 90 },
};

let game;
let audioEngine = null,
  musicTimer = null,
  musicStep = 0,
  audioUnlocked = false;
let viewportResizeQueued = false;
let startOverlayEl = null,
  openingVideoEl = null,
  startButtonEl = null,
  tutorialButtonEl = null,
  practiceButtonEl = null,
  selHatEl = null,
  selCupEl = null,
  selThemeEl = null,
  selSoundEl = null;
let backgroundImg = null,
  profile = null;

const BG_REFERENCE = {
  width: 1472,
  height: 736,
  anchors: {
    coffee: { x: 0.122, y: 0.79, r: 46, label: "Coffee" },
    milk: { x: 0.3, y: 0.79, r: 46, label: "Milk" },
    ice: { x: 0.489, y: 0.79, r: 48, label: "Ice" },
    syrup: { x: 0.67, y: 0.79, r: 44, label: "Syrup" },
    foam: { x: 0.86, y: 0.79, r: 46, label: "Foam" },
    serve: { x: 0.893, y: 0.5, r: 52, label: "Serve" },
    barista: { x: 0.94, y: 0.44 },
  },
};

const DEFAULT_PROFILE = {
  bestScore: 0,
  bestOrders: 0,
  unlocks: {
    hats: ["chef"],
    cupSkins: ["classic"],
    stationThemes: ["caramel"],
    soundPacks: ["classic"],
  },
  selected: {
    hat: "chef",
    cupSkin: "classic",
    stationTheme: "caramel",
    soundPack: "classic",
  },
};

const COSMETIC_CATALOG = {
  hats: ["chef", "barista", "royal"],
  cupSkins: ["classic", "ceramic", "gold"],
  stationThemes: ["caramel", "latte", "sunset"],
  soundPacks: ["classic", "soft", "retro"],
};

function setShadow(blur, clr) {
  drawingContext.shadowBlur = blur;
  drawingContext.shadowColor = clr;
}
function clearShadow() {
  drawingContext.shadowBlur = 0;
}

function loadProfile() {
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      profile = JSON.parse(JSON.stringify(DEFAULT_PROFILE));
      return;
    }
    const parsed = JSON.parse(raw);
    profile = {
      ...JSON.parse(JSON.stringify(DEFAULT_PROFILE)),
      ...parsed,
      unlocks: { ...DEFAULT_PROFILE.unlocks, ...(parsed.unlocks || {}) },
      selected: { ...DEFAULT_PROFILE.selected, ...(parsed.selected || {}) },
    };
    applyProgressionUnlocks();
  } catch {
    profile = JSON.parse(JSON.stringify(DEFAULT_PROFILE));
  }
}

function saveProfile() {
  if (!profile) return;
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {}
}

function applyProgressionUnlocks() {
  if (!profile) return;
  const unlocks = profile.unlocks;
  const pushUnique = (arr, v) => {
    if (!arr.includes(v)) arr.push(v);
  };
  if (profile.bestScore >= 400) pushUnique(unlocks.hats, "barista");
  if (profile.bestScore >= 800) pushUnique(unlocks.hats, "royal");
  if (profile.bestOrders >= 5) pushUnique(unlocks.cupSkins, "ceramic");
  if (profile.bestOrders >= 10) pushUnique(unlocks.cupSkins, "gold");
  if (profile.bestScore >= 500) pushUnique(unlocks.stationThemes, "latte");
  if (profile.bestScore >= 900) pushUnique(unlocks.stationThemes, "sunset");
  if (profile.bestOrders >= 6) pushUnique(unlocks.soundPacks, "soft");
  if (profile.bestScore >= 700) pushUnique(unlocks.soundPacks, "retro");
  if (!unlocks.hats.includes(profile.selected.hat))
    profile.selected.hat = unlocks.hats[unlocks.hats.length - 1];
  if (!unlocks.cupSkins.includes(profile.selected.cupSkin))
    profile.selected.cupSkin = unlocks.cupSkins[unlocks.cupSkins.length - 1];
  if (!unlocks.stationThemes.includes(profile.selected.stationTheme))
    profile.selected.stationTheme =
      unlocks.stationThemes[unlocks.stationThemes.length - 1];
  if (!unlocks.soundPacks.includes(profile.selected.soundPack))
    profile.selected.soundPack =
      unlocks.soundPacks[unlocks.soundPacks.length - 1];
}

function preload() {
  backgroundImg = loadImage("Assets/background.png");
}

function currentViewportSize() {
  const vv = window.visualViewport;
  if (vv) {
    return {
      width: max(1, floor(vv.width)),
      height: max(1, floor(vv.height)),
    };
  }
  return {
    width: max(1, floor(window.innerWidth || windowWidth || GAME.width)),
    height: max(1, floor(window.innerHeight || windowHeight || GAME.height)),
  };
}

function syncCanvasToViewport() {
  const viewport = currentViewportSize();
  resizeCanvas(viewport.width, viewport.height);
}

function queueViewportSync() {
  if (viewportResizeQueued) return;
  viewportResizeQueued = true;
  requestAnimationFrame(() => {
    viewportResizeQueued = false;
    syncCanvasToViewport();
  });
}

function setup() {
  const viewport = currentViewportSize();
  const cnv = createCanvas(viewport.width, viewport.height);
  cnv.parent("app");
  pixelDensity(1);
  textFont("Avenir Next");
  window.addEventListener("orientationchange", queueViewportSync);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", queueViewportSync);
    window.visualViewport.addEventListener("scroll", queueViewportSync);
  }
  loadProfile();
  bindStartOverlay();
  resetGame();
}

function bindStartOverlay() {
  startOverlayEl = document.getElementById("start-overlay");
  openingVideoEl = document.getElementById("opening-video");
  startButtonEl = document.getElementById("start-button");
  tutorialButtonEl = document.getElementById("tutorial-button");
  practiceButtonEl = document.getElementById("practice-button");
  selHatEl = document.getElementById("sel-hat");
  selCupEl = document.getElementById("sel-cup");
  selThemeEl = document.getElementById("sel-theme");
  selSoundEl = document.getElementById("sel-sound");
  if (startOverlayEl)
    startOverlayEl.addEventListener("pointerdown", () => {
      ensureAudioUnlocked();
      startAudioEngine();
    });
  if (startButtonEl) startButtonEl.addEventListener("click", startShift);
  if (tutorialButtonEl)
    tutorialButtonEl.addEventListener("click", startTutorialShift);
  if (practiceButtonEl)
    practiceButtonEl.addEventListener("click", enterPracticeSelect);
  bindCosmeticSelectors();
  refreshStartCosmeticSelectors();
}

function bindCosmeticSelectors() {
  if (selHatEl)
    selHatEl.addEventListener("change", () => {
      if (!profile) return;
      profile.selected.hat = selHatEl.value;
      saveProfile();
    });
  if (selCupEl)
    selCupEl.addEventListener("change", () => {
      if (!profile) return;
      profile.selected.cupSkin = selCupEl.value;
      saveProfile();
    });
  if (selThemeEl)
    selThemeEl.addEventListener("change", () => {
      if (!profile) return;
      profile.selected.stationTheme = selThemeEl.value;
      saveProfile();
    });
  if (selSoundEl)
    selSoundEl.addEventListener("change", () => {
      if (!profile) return;
      profile.selected.soundPack = selSoundEl.value;
      saveProfile();
    });
}

function fillSelectorOptions(selectEl, allOptions, unlockedOptions, selected) {
  if (!selectEl) return;
  selectEl.innerHTML = "";
  let hasSelected = false;
  const unlocked = new Set(unlockedOptions || []);
  for (const v of allOptions || []) {
    const op = document.createElement("option");
    op.value = v;
    const isUnlocked = unlocked.has(v);
    op.textContent = isUnlocked
      ? labelUnlockValue(v)
      : `${labelUnlockValue(v)} (Locked)`;
    op.disabled = !isUnlocked;
    op.selected = isUnlocked && v === selected;
    if (op.selected) hasSelected = true;
    selectEl.appendChild(op);
  }
  if (!hasSelected) {
    const fallback = (allOptions || []).find((v) => unlocked.has(v));
    if (fallback) selectEl.value = fallback;
  }
}

function refreshStartCosmeticSelectors() {
  if (!profile) return;
  fillSelectorOptions(
    selHatEl,
    COSMETIC_CATALOG.hats,
    profile.unlocks.hats,
    profile.selected.hat,
  );
  fillSelectorOptions(
    selCupEl,
    COSMETIC_CATALOG.cupSkins,
    profile.unlocks.cupSkins,
    profile.selected.cupSkin,
  );
  fillSelectorOptions(
    selThemeEl,
    COSMETIC_CATALOG.stationThemes,
    profile.unlocks.stationThemes,
    profile.selected.stationTheme,
  );
  fillSelectorOptions(
    selSoundEl,
    COSMETIC_CATALOG.soundPacks,
    profile.unlocks.soundPacks,
    profile.selected.soundPack,
  );
}

function windowResized() {
  queueViewportSync();
}

function resetGame() {
  stopAudioEngine();
  game = {
    state: STATES.IDLE,
    stage: 2,
    stateStartMs: millis(),
    roundStartMs: null,
    currentOrder: null,
    stepIndex: 0,
    activeTasks: {},
    arms: {
      topLeft: {
        isDragging: false,
        activeStation: null,
        tip: createVector(0, 0),
      },
      topRight: {
        isDragging: false,
        activeStation: null,
        tip: createVector(0, 0),
      },
      bottomLeft: {
        isDragging: false,
        activeStation: null,
        tip: createVector(0, 0),
      },
      bottomRight: {
        isDragging: false,
        activeStation: null,
        tip: createVector(0, 0),
      },
    },
    draggedArm: null,
    lockedArm: null,
    selectedChanges: [],
    hoverStation: null,
    hoverSince: 0,
    challenge: null,
    tangleMeter: 0,
    stress: 15,
    score: 0,
    mistakes: 0,
    tangles: 0,
    ordersDone: 0,
    ordersThisLevel: 0,
    wrongStationHits: 0,
    armSwitches: 0,
    combo: 0,
    bestCombo: 0,
    noInputSince: millis(),
    untangleProgress: 0,
    lastStation: null,
    lastStationMs: 0,
    particles: [],
    bubbles: [],
    lastDrink: null,
    seenGuides: {},
    guidePopup: { open: false, step: null, openedMs: 0 },
    serveArmChosen: false,
    mode: "normal",
    startChoice: "normal",
    tutorialFinale: { active: false, phase: null },
    practiceStep: "coffee",
    rushEvent: null,
    nextRushEventMs: millis() + random(14000, 22000),
    comboToast: null,
    nextChallengeFocus: false,
    turboUntilMs: 0,
    progressionUpdated: false,
    newUnlocks: [],
    narrativeToast: null,
    nextStage: null,
    level1PendingDrinks: [],
    pendingDrinksByStage: {},
    lastOrderSignature: null,
    levelAtTimeout: null,
  };
  for (let i = 0; i < 20; i++)
    game.bubbles.push({
      x: random(width),
      y: random(height),
      s: random(10, 40),
      speed: random(0.5, 2),
    });
  showStartOverlay();
}

function cycleSelection(group, dir = 1) {
  if (!profile || !profile.unlocks || !profile.selected) return;
  const arr = profile.unlocks[group];
  if (!arr || !arr.length) return;
  const selectedKey = selectedKeyForGroup(group);
  if (!selectedKey) return;
  const current = profile.selected[selectedKey];
  const idx = max(0, arr.indexOf(current));
  const next = (idx + dir + arr.length) % arr.length;
  profile.selected[selectedKey] = arr[next];
  saveProfile();
  game.comboToast = {
    text: `${groupLabel(group)} set: ${labelUnlockValue(arr[next])}`,
    untilMs: millis() + 1200,
  };
}

function selectedKeyForGroup(group) {
  const keyMap = {
    hats: "hat",
    cupSkins: "cupSkin",
    stationThemes: "stationTheme",
    soundPacks: "soundPack",
  };
  return keyMap[group] || null;
}
function groupLabel(group) {
  if (group === "hats") return "Hat";
  if (group === "cupSkins") return "Cup Skin";
  if (group === "stationThemes") return "Station Theme";
  if (group === "soundPacks") return "Sound Pack";
  return group;
}
function labelUnlockValue(v) {
  if (!v) return "";
  return `${v}`.charAt(0).toUpperCase() + `${v}`.slice(1);
}

function stageMeta(stage = game?.stage ?? 2) {
  return STAGE_META[stage] || STAGE_META[2];
}

function isTutorialStage(stage = game?.stage ?? 2) {
  return stage === 0;
}

function startNormalRun() {
  game.mode = "normal";
  game.stage = 2;
  game.roundStartMs = millis();
  game.ordersThisLevel = 0;
  game.state = STATES.NEW_ORDER;
  game.stateStartMs = millis();
  playSfx("start");
}

function startTutorialRun() {
  game.mode = "normal";
  game.stage = 0;
  game.roundStartMs = null;
  game.ordersDone = 0;
  game.ordersThisLevel = 0;
  game.score = 0;
  game.combo = 0;
  game.bestCombo = 0;
  game.state = STATES.NEW_ORDER;
  game.stateStartMs = millis();
  game.narrativeToast = {
    text: "Tutorial loaded: learn the flow, then continue to Level 1.",
    untilMs: millis() + 2600,
  };
  playSfx("success");
}

function startTutorialFinale() {
  releaseAllArms();
  game.currentOrder = null;
  game.challenge = null;
  game.hoverStation = null;
  game.serveArmChosen = false;
  game.lockedArm = null;
  game.tutorialFinale = { active: true, phase: "calm" };
  game.state = STATES.TUTORIAL_RECOVERY;
  game.stateStartMs = millis();
  game.stress = 78;
  game.tangleMeter = 72;
  game.narrativeToast = {
    text: "Tutorial finale: hold R to lower stress and tangle.",
    untilMs: millis() + 2600,
  };
  maybeOpenLevelOneGuide("tutorial_calm");
}

function startTutorialUntangleLesson() {
  game.tutorialFinale = { active: true, phase: "untangle" };
  game.lockedArm = random(["topLeft", "topRight", "bottomLeft", "bottomRight"]);
  game.stress = 90;
  game.tangleMeter = 100;
  game.untangleProgress = 0;
  game.state = STATES.TANGLED;
  game.stateStartMs = millis();
  game.narrativeToast = {
    text: "Now untangle the knot: spam SPACE until the bar fills.",
    untilMs: millis() + 2600,
  };
  maybeOpenLevelOneGuide("tutorial_untangle");
}

function finishTutorialFinale() {
  game.tutorialFinale = { active: false, phase: null };
  game.lockedArm = null;
  game.nextStage = 1;
  game.state = STATES.LEVEL_COMPLETE;
  game.stateStartMs = millis();
  playSfx("start");
}

function updateTutorialFinale() {
  if (!game.tutorialFinale?.active) return;
  if (game.tutorialFinale.phase !== "calm") return;
  const dt = deltaTime / 1000;
  if (keyIsDown(82)) {
    game.stress = max(18, game.stress - 44 * dt);
    game.tangleMeter = max(18, game.tangleMeter - 52 * dt);
    addParticles(width - 200, 50, color(100, 200, 255), 2);
  } else {
    game.stress = min(92, game.stress + 8 * dt);
    game.tangleMeter = min(94, game.tangleMeter + 6 * dt);
  }
  if (game.stress <= 35 && game.tangleMeter <= 35) {
    startTutorialUntangleLesson();
  }
}

function beginSelectedRun() {
  if (game.startChoice === "tutorial") {
    startTutorialRun();
    return;
  }
  startNormalRun();
}

function startShift() {
  game.startChoice = "normal";
  game.state = STATES.TRANSITION;
  game.stateStartMs = millis();

  hideStartOverlay();
  ensureAudioUnlocked();
  startAudioEngine();
  playSfx("start");
}

function startTutorialShift() {
  game.startChoice = "tutorial";
  game.state = STATES.TRANSITION;
  game.stateStartMs = millis();

  hideStartOverlay();
  ensureAudioUnlocked();
  startAudioEngine();
  playSfx("success");
}

function showStartOverlay() {
  if (startOverlayEl) startOverlayEl.classList.remove("hidden");
  refreshStartCosmeticSelectors();
  if (openingVideoEl) {
    openingVideoEl.currentTime = 0;
    openingVideoEl.play().catch(() => {});
  }
}

function hideStartOverlay() {
  if (startOverlayEl) startOverlayEl.classList.add("hidden");
  if (openingVideoEl) openingVideoEl.pause();
}

function ensureAudioUnlocked() {
  if (audioUnlocked) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  if (!audioEngine || !audioEngine.ctx) startAudioEngine();
  if (!audioEngine || !audioEngine.ctx) return;
  audioEngine.ctx
    .resume()
    .then(() => {
      audioUnlocked = true;
      playTone(520, 0.03, "sine", 0.001);
    })
    .catch(() => {});
}

function startAudioEngine() {
  if (audioEngine && audioEngine.ctx && audioEngine.ctx.state === "running")
    return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = audioEngine?.ctx || new AC();
  const master = audioEngine?.master || ctx.createGain();
  const delay = ctx.createDelay();
  const feedback = ctx.createGain();
  if (!audioEngine) {
    master.gain.value = 0.25;
    delay.delayTime.value = 0.25;
    feedback.gain.value = 0.3;
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(master);
    master.connect(ctx.destination);
  }
  audioEngine = { ctx, master, delay };
  if (ctx.state !== "running") ctx.resume();
  if (!musicTimer) {
    musicTimer = setInterval(playMusicStep, 400);
    musicStep = 0;
  }
}

function stopAudioEngine() {
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
}

function playTone(freq, duration = 0.16, type = "sine", gain = 0.06, when = 0) {
  if (!audioEngine || !audioEngine.ctx) return;
  const ctx = audioEngine.ctx;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(audioEngine.master);
  g.connect(audioEngine.delay);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

function playMusicStep() {
  if (!audioEngine || !audioEngine.ctx) return;
  if (game.state === STATES.IDLE) {
    const intro = [261.63, 311.13, 392.0, 311.13, 349.23, 440.0, 392.0, 311.13];
    const bass = [
      130.81, 130.81, 146.83, 146.83, 164.81, 164.81, 146.83, 130.81,
    ];
    const i = musicStep % intro.length;
    playTone(intro[i], 0.22, "sine", 0.028);
    if (i % 2 === 0) playTone(bass[i], 0.35, "triangle", 0.018, 0.02);
    musicStep += 1;
    return;
  }
  const prog = [261.63, 329.63, 392.0, 329.63, 293.66, 349.23, 440.0, 349.23];
  const bass = [130.81, 130.81, 146.83, 146.83, 164.81, 164.81, 146.83, 130.81];
  const i = musicStep % prog.length;
  const stressTone = map(game.stress, 0, 100, 0, 18);
  playTone(prog[i] + stressTone, 0.2, "sine", 0.04);
  if (i % 2 === 0) playTone(bass[i], 0.3, "triangle", 0.03, 0.01);
  musicStep += 1;
}

function playSfx(kind) {
  if (!audioEngine || !audioEngine.ctx) return;
  const mul = getSoundFreqMul();
  if (kind === "start") {
    playTone(392 * mul, 0.15, "triangle", 0.08);
    playTone(523.25 * mul, 0.25, "sine", 0.08, 0.1);
  } else if (kind === "select") {
    playTone(440 * mul, 0.08, "square", 0.02);
  } else if (kind === "success") {
    playTone(523.25 * mul, 0.1, "sine", 0.06);
    playTone(659.25 * mul, 0.15, "triangle", 0.05, 0.05);
  } else if (kind === "fail") {
    playTone(180 * mul, 0.15, "sawtooth", 0.04);
    playTone(130 * mul, 0.25, "sawtooth", 0.05, 0.05);
  } else if (kind === "untangle") {
    playTone((320 + random(-20, 40)) * mul, 0.05, "square", 0.02);
  } else if (kind === "serve") {
    playTone(523.25 * mul, 0.1, "triangle", 0.05);
    playTone(659.25 * mul, 0.1, "triangle", 0.05, 0.06);
    playTone(783.99 * mul, 0.2, "sine", 0.06, 0.12);
  }
}

function getSoundFreqMul() {
  const pack = profile?.selected?.soundPack || "classic";
  if (pack === "soft") return 0.93;
  if (pack === "retro") return 1.07;
  return 1;
}

function draw() {
  push();
  updateGlobalMeters();
  updateState();

  if (game.state === STATES.PRACTICE_SELECT) {
    drawPracticeSelect();
    pop();
    return;
  }
  if (game.state === STATES.LEVEL_COMPLETE) {
    drawLevelComplete();
    pop();
    return;
  }
  if (game.state === STATES.TRANSITION) {
    drawTransitionScene();
    pop();
    return;
  }
  if (game.state === STATES.HOW_TO_PLAY) {
    drawHowToPlay();
    pop();
    return;
  }

  const tutorialNoShake =
    game.mode !== "practice" && isTutorialStage() && game.tutorialFinale?.active;
  let shakeMag = 0;
  if (!tutorialNoShake && (game.stress > 50 || game.tangleMeter > 50)) {
    // 只有超过 50 才计算震动，否则保持 0
    shakeMag = map(max(game.stress, game.tangleMeter), 50, 100, 0.5, 2);
  }

  if (shakeMag > 0) {
    translate(random(-shakeMag, shakeMag), random(-shakeMag, shakeMag));
  }

  drawBackdrop();
  drawScene();
  drawStations();
  drawArms();
  drawOctopus();
  drawHeader();
  drawOrderCard();
  drawGuidePanel();
  drawNarrativeFlavor();
  drawParticles();

  if (game.state === STATES.IDLE) {
    drawStartOverlay();
    return;
  }
  if (game.state === STATES.HOW_TO_PLAY) {
    drawHowToPlay();
    return;
  }
  if (game.state === STATES.ARM_CONTROL) drawTasksUi();
  if (game.guidePopup.open) drawChallengeGuidePopup();
  if (game.state === STATES.UNTANGLE || game.state === STATES.TANGLED)
    drawUntangleUi();
  drawRushEventBanner();
  drawPowerUpBar();
  drawComboToast();
  if (game.state === STATES.GAME_OVER) drawGameOver();
}
updateGlobalMeters();
updateState();

function pickCustomerTrait() {
  const r = random();
  if (r < 0.34) return "patient";
  if (r < 0.67) return "picky";
  return "rushed";
}

function getCustomerMods() {
  const trait = game?.currentOrder?.customer?.trait;
  if (!trait || !CUSTOMER_TRAITS[trait])
    return {
      label: "Regular",
      scoreMul: 1,
      penaltyMul: 1,
      speedWindowSec: 24,
      speedBonusMul: 1,
      color: [150, 130, 110],
      quotes: [],
    };
  return CUSTOMER_TRAITS[trait];
}

function startButtonRect() {
  return { x: width * 0.41, y: height * 0.65, w: width * 0.18, h: 56 };
}

function drawStartOverlay() {
  fill(13, 22, 44, 210);
  rect(0, 0, width, height);
  noStroke();
  for (let b of game.bubbles) {
    b.y -= b.speed;
    if (b.y < -50) b.y = height + 50;
    fill(120, 190, 255, 30);
    circle(b.x + sin(millis() * 0.001 + b.x) * 20, b.y, b.s);
  }
  setShadow(30, "rgba(0,0,0,0.5)");
  fill(255, 255, 255, 240);
  rect(width * 0.25, height * 0.15, width * 0.5, height * 0.7, 24);
  clearShadow();
}

function drawHowToPlay() {
  // 保持背景绘制，让说明书浮在咖啡厅背景上
  drawBackdrop();
  drawStations();
  drawArms();
  drawOctopus();

  fill(0, 0, 0, 160); // 半透明黑色蒙版
  rect(0, 0, width, height);

  const sz = sceneScale();
  const w = 600 * sz,
    h = 480 * sz;
  const x = width * 0.5 - w * 0.5,
    y = height * 0.5 - h * 0.5;

  // 1. 简约卡片底色
  setShadow(25, "rgba(0,0,0,0.3)");
  fill(255, 252, 248);
  stroke(180, 140, 100);
  strokeWeight(4 * sz);
  rect(x, y, w, h, 25 * sz);
  clearShadow();

  // 2. 标题
  noStroke();
  fill(80, 50, 35);
  textAlign(CENTER, TOP);
  textSize(32 * sz);
  textStyle(BOLD);
  text("Barista Quick Guide", width * 0.5, y + 40 * sz);

  // 3. 极简三步法
  textAlign(LEFT, TOP);
  const textX = x + 50 * sz;

  // 第一步
  textSize(22 * sz);
  fill(150, 80, 40);
  text("1. DRAG", textX, y + 100 * sz);
  textSize(18 * sz); // Unified to 18
  fill(100, 70, 50);
  textStyle(NORMAL);
  text("Move tentacles to the required stations.", textX, y + 130 * sz);

  // 第二步
  textSize(22 * sz);
  textStyle(BOLD);
  fill(150, 80, 40);
  text("2. OPERATE", textX, y + 180 * sz);
  textSize(18 * sz); // Unified to 18
  fill(100, 70, 50);
  textStyle(NORMAL);
  text("Press/Hold keys to fill the progress bars.", textX, y + 210 * sz);

  // 第三步
  textSize(22 * sz);
  textStyle(BOLD);
  fill(200, 70, 50);
  text("3. MANAGE STRESS", textX, y + 260 * sz);
  textSize(18 * sz); // Unified to 18
  fill(100, 70, 50);
  textStyle(NORMAL);
  text(
    "Multitasking increases STRESS. If tentacles cross\nor Stress is too high, you will get TANGLED!",
    textX,
    y + 290 * sz,
  );

  // 救命神技
  fill(60, 110, 170);
  textStyle(BOLD);
  text("PRO TIP: Hold [R] key to reduce Tangle & Stress.", textX, y + 360 * sz);

  // 4. 确认按钮
  const btnW = 240 * sz,
    btnH = 55 * sz;
  const btnX = width * 0.5 - btnW * 0.5,
    btnY = y + h - 85 * sz;

  const isHover =
    mouseX > btnX &&
    mouseX < btnX + btnW &&
    mouseY > btnY &&
    mouseY < btnY + btnH;
  fill(isHover ? color(115, 210, 145) : color(90, 170, 110));
  rect(btnX, btnY, btnW, btnH, 999);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20 * sz);
  textStyle(BOLD);
  text("I'M READY!", width * 0.5, btnY + btnH * 0.53);
}

function drawTransitionScene() {
  const elapsed = millis() - game.stateStartMs;
  const t = constrain(elapsed / TRANSITION_DURATION_MS, 0, 1);
  const p = backgroundPlacement();
  if (backgroundImg) {
    const zoom = lerp(1.08, 1.0, t);
    const w = p.w * zoom;
    const h = p.h * zoom;
    const x = (width - w) * 0.5 + sin(millis() * 0.0012) * 8;
    const y = (height - h) * 0.5 + cos(millis() * 0.0011) * 6;
    image(backgroundImg, x, y, w, h);
  } else {
    background(220, 232, 252);
  }
  fill(18, 28, 54, 58);
  rect(0, 0, width, height);
  const bw = min(460, width * 0.44);
  const bh = 16;
  const bx = width * 0.5 - bw * 0.5;
  const by = height * 0.86;
  const ox = lerp(bx - 48, bx + bw * t, easeOutCubic(t));
  const oy = by - 64 + sin(millis() * 0.004) * 4;
  drawMorphTransitionOctopus(ox, oy, t, 0.42);
  const panelW = min(560, width * 0.56);
  const panelH = 132;
  const panelX = width * 0.5 - panelW * 0.5;
  const panelY = height * 0.08;
  setShadow(18, "rgba(0,0,0,0.28)");
  fill(255, 255, 255, 248);
  rect(panelX, panelY, panelW, panelH, 22);
  clearShadow();
  fill(42, 61, 102);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  textSize(36);
  text("Opening Cafe...", width * 0.5, panelY + 24);
  textStyle(NORMAL);
  textSize(16);
  fill(95, 112, 146);
  text("Get ready for the next rush", width * 0.5, panelY + 78);
  fill(226, 234, 248, 240);
  rect(bx, by, bw, bh, 999);
  fill(128, 180, 246);
  rect(bx, by, bw * t, bh, 999);
  fill(246, 252, 255);
  textSize(13);
  text("Press SPACE / ENTER / Click to skip", width * 0.5, by + 26);
}

function easeOutCubic(x) {
  return 1 - pow(1 - x, 3);
}

function enterPracticeSelect() {
  hideStartOverlay();
  ensureAudioUnlocked();
  startAudioEngine();
  playSfx("select");
  game.mode = "practice";
  game.state = STATES.PRACTICE_SELECT;
  game.stateStartMs = millis();
}

function startPracticeMode(step) {
  game.mode = "practice";
  game.practiceStep = step;
  game.roundStartMs = millis();
  game.combo = 0;
  game.score = 0;
  game.ordersDone = 0;
  game.state = STATES.NEW_ORDER;
  game.stateStartMs = millis();
}

function updateRushEvent() {
  if (
    game.mode === "practice" ||
    !game.roundStartMs ||
    game.state === STATES.IDLE ||
    game.state === STATES.TRANSITION ||
    game.state === STATES.PRACTICE_SELECT ||
    game.state === STATES.GAME_OVER
  )
    return;
  const now = millis();
  if (game.rushEvent && now > game.rushEvent.endMs) {
    game.rushEvent = null;
    game.nextRushEventMs = now + random(14000, 23000);
  }
  if (!game.rushEvent && now >= game.nextRushEventMs) {
    const kinds = [
      {
        name: "Power Surge",
        challengeSpeedMul: 1.2,
        scoreMul: 1.15,
        tangleGainMul: 1.15,
        holdNeedMul: 1.05,
      },
      {
        name: "Happy Hour",
        challengeSpeedMul: 1.0,
        scoreMul: 1.4,
        tangleGainMul: 0.95,
        holdNeedMul: 1.0,
      },
      {
        name: "Calm Brew",
        challengeSpeedMul: 0.92,
        scoreMul: 1.05,
        tangleGainMul: 0.75,
        holdNeedMul: 0.9,
      },
    ];
    game.rushEvent = {
      ...random(kinds),
      startMs: now,
      endMs: now + RUSH_EVENT_DURATION_MS + random(-1200, 2200),
    };
  }
}

function handleGameOverProgression() {
  if (game.progressionUpdated || game.mode === "practice") return;
  game.progressionUpdated = true;
  if (!profile) return;
  const before = {
    hats: [...(profile.unlocks.hats || [])],
    cupSkins: [...(profile.unlocks.cupSkins || [])],
    stationThemes: [...(profile.unlocks.stationThemes || [])],
    soundPacks: [...(profile.unlocks.soundPacks || [])],
  };
  profile.bestScore = max(profile.bestScore || 0, floor(game.score));
  profile.bestOrders = max(profile.bestOrders || 0, game.ordersDone);
  applyProgressionUnlocks();
  const unlockedNow = [];
  for (const key of ["hats", "cupSkins", "stationThemes", "soundPacks"]) {
    for (const val of profile.unlocks[key] || []) {
      if (!before[key].includes(val))
        unlockedNow.push(`${groupLabel(key)}: ${labelUnlockValue(val)}`);
    }
  }
  game.newUnlocks = unlockedNow;
  refreshStartCosmeticSelectors();
  saveProfile();
}

function getRushModifiers() {
  if (!game.rushEvent)
    return {
      challengeSpeedMul: 1,
      scoreMul: 1,
      tangleGainMul: 1,
      holdNeedMul: 1,
    };
  return {
    challengeSpeedMul: game.rushEvent.challengeSpeedMul || 1,
    scoreMul: game.rushEvent.scoreMul || 1,
    tangleGainMul: game.rushEvent.tangleGainMul || 1,
    holdNeedMul: game.rushEvent.holdNeedMul || 1,
  };
}

function triggerComboMilestone() {
  if (!COMBO_MILESTONES.includes(game.combo)) return;
  const bonus = game.combo * 8;
  const calm = game.combo >= 8 ? 14 : game.combo >= 5 ? 10 : 6;
  game.score += bonus;
  game.tangleMeter = max(0, game.tangleMeter - calm);
  addParticles(width * 0.5, 122, color(244, 188, 121), 18);
  game.comboToast = {
    text: `Combo x${game.combo}! +${bonus} pts, -${calm}% tangle`,
    untilMs: millis() + 1800,
  };
}

function drawRushEventBanner() {
  if (!game.rushEvent || game.state === STATES.GAME_OVER) return;
  const sz = sceneScale();
  const leftMs = max(0, game.rushEvent.endMs - millis());

  // --- 再次放大尺寸 (450/50 -> 550/60) ---
  const w = 550 * sz,
    h = 60 * sz;
  const x = width * 0.5 - w * 0.5;
  const y = 80 * sz;

  setShadow(10, "rgba(66,42,22,0.25)");
  stroke(220, 180, 100);
  strokeWeight(3 * sz);
  fill(255, 245, 220, 245);
  rect(x, y, w, h, 999);
  clearShadow();

  noStroke();
  fill(120, 70, 30);
  textAlign(CENTER, CENTER);
  textSize(22 * sz);
  textStyle(BOLD);
  text(
    `RUSH: ${game.rushEvent.name} (${(leftMs / 1000).toFixed(1)}s)`,
    width * 0.5,
    y + h * 0.53,
  );
}

function drawComboToast() {
  if (!game.comboToast) return;
  if (millis() > game.comboToast.untilMs) {
    game.comboToast = null;
    return;
  }
  const alpha = map(game.comboToast.untilMs - millis(), 0, 1800, 0, 235, true);
  fill(59, 38, 24, alpha * 0.56);
  rect(width * 0.5 - 220, height * 0.18, 440, 34, 999);
  fill(255, 240, 219, alpha);
  textAlign(CENTER, CENTER);
  textSize(14);
  textStyle(BOLD);
  text(game.comboToast.text, width * 0.5, height * 0.18 + 17);
  textStyle(NORMAL);
}

function activatePowerUp(kind) {
  const p = POWERUPS[kind];
  if (!p) return false;
  if (game.score < p.cost) {
    game.comboToast = {
      text: `Need ${p.cost} score for ${p.name}`,
      untilMs: millis() + 1200,
    };
    return false;
  }
  game.score -= p.cost;
  if (kind === "calm") {
    game.tangleMeter = max(0, game.tangleMeter - 28);
    game.stress = max(0, game.stress - 20);
    game.comboToast = {
      text: "Calm Brew used: -tangle, -stress",
      untilMs: millis() + 1700,
    };
  } else if (kind === "focus") {
    game.nextChallengeFocus = true;
    game.comboToast = {
      text: "Focus Shot ready: next challenge easier",
      untilMs: millis() + 1700,
    };
  } else if (kind === "turbo") {
    game.turboUntilMs = millis() + 9000;
    game.comboToast = {
      text: "Turbo Hand active: faster reach for 9s",
      untilMs: millis() + 1700,
    };
  }
  playSfx("success");
  return false;
}

function drawPowerUpBar() {
  return; // Hidden for now
  // if (
  //   game.state === STATES.IDLE ||
  //   game.state === STATES.TRANSITION ||
  //   game.state === STATES.PRACTICE_SELECT ||
  //   game.state === STATES.GAME_OVER
  // )
  //   return;
  const x = 18,
    y = height - 64,
    w = 560,
    h = 42;
  setShadow(8, "rgba(66,42,22,0.18)");
  fill(252, 245, 232, 220);
  rect(x, y, w, h, 14);
  clearShadow();
  fill(102, 69, 43);
  textAlign(LEFT, CENTER);
  textSize(12);
  textStyle(BOLD);
  text(
    `Power-Ups  [1] Calm ${POWERUPS.calm.cost}  [2] Focus ${POWERUPS.focus.cost}  [3] Turbo ${POWERUPS.turbo.cost}`,
    x + 12,
    y + 14,
  );
  textStyle(NORMAL);
  fill(131, 95, 66);
  const turboLeft = max(0, game.turboUntilMs - millis());
  const turboTxt =
    turboLeft > 0 ? `Turbo ${nf(turboLeft / 1000, 1, 1)}s` : "Turbo off";
  const focusTxt = game.nextChallengeFocus ? "Focus ready" : "Focus off";
  text(
    `Score: ${floor(game.score)}  |  ${focusTxt}  |  ${turboTxt}`,
    x + 12,
    y + 30,
  );
}

function drawPracticeSelect() {
  drawBackdrop();
  fill(8, 13, 20, 178);
  rect(0, 0, width, height);
  const w = min(980, width * 0.84),
    h = min(560, height * 0.78),
    x = width * 0.5 - w * 0.5,
    y = height * 0.5 - h * 0.5;
  const sz = sceneScale();
  setShadow(24, "rgba(0,0,0,0.34)");
  fill(15, 23, 37, 236);
  rect(x, y, w, h, 28);
  clearShadow();
  noStroke();
  fill(246, 177, 92, 32);
  rect(x + 20, y + 20, w - 40, h - 40, 24);

  fill(237, 231, 222);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(13 * sz);
  text("TRAINING MODE", x + 36 * sz, y + 28 * sz);
  textSize(34 * sz);
  text("Practice Lab", x + 36 * sz, y + 52 * sz);

  textStyle(NORMAL);
  fill(213, 202, 190);
  textSize(15 * sz);
  text(
    "Choose a focused station drill. No timer, no rush events, just one mechanic at a time.",
    x + 36 * sz,
    y + 98 * sz,
    w - 72 * sz,
    52 * sz,
  );

  const items = practiceMenuItems();
  const cols = width > 860 ? 2 : 1;
  const gap = 18 * sz;
  const cardW = (w - 72 * sz - gap * (cols - 1)) / cols;
  const cardH = width > 860 ? 132 * sz : 92 * sz;
  const startY = y + 162 * sz;

  for (let i = 0; i < items.length; i++) {
    const col = i % cols;
    const row = floor(i / cols);
    const cardX = x + 36 * sz + col * (cardW + gap);
    const cardY = startY + row * (cardH + gap);
    const isHover =
      mouseX >= cardX &&
      mouseX <= cardX + cardW &&
      mouseY >= cardY &&
      mouseY <= cardY + cardH;

    fill(
      isHover ? items[i].accent[0] : 255,
      isHover ? items[i].accent[1] : 255,
      isHover ? items[i].accent[2] : 255,
      isHover ? 220 : 38,
    );
    rect(cardX, cardY, cardW, cardH, 22);

    fill(247, 241, 232, isHover ? 250 : 236);
    rect(cardX + 1.5, cardY + 1.5, cardW - 3, cardH - 3, 21);

    fill(items[i].accent[0], items[i].accent[1], items[i].accent[2], 208);
    rect(cardX + 16 * sz, cardY + 16 * sz, 72 * sz, 28 * sz, 999);

    fill(23, 18, 14);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    textSize(12 * sz);
    text(`${items[i].key}`, cardX + 36 * sz, cardY + 30 * sz);
    textAlign(LEFT, TOP);
    text(items[i].tag, cardX + 48 * sz, cardY + 21 * sz);

    fill(55, 37, 24);
    textSize(22 * sz);
    text(items[i].title, cardX + 18 * sz, cardY + 56 * sz);

    textStyle(NORMAL);
    fill(101, 74, 54);
    textSize(14 * sz);
    text(items[i].desc, cardX + 18 * sz, cardY + 84 * sz, cardW - 36 * sz, 40 * sz);
  }

  const footerY = y + h - 54 * sz;
  fill(255, 246, 233, 48);
  rect(x + 36 * sz, footerY - 10 * sz, w - 72 * sz, 36 * sz, 999);
  fill(228, 217, 203);
  textAlign(CENTER, CENTER);
  textSize(13 * sz);
  text(
    "Click a drill card or press 1-5 to start. Press ESC to return to the main menu.",
    width * 0.5,
    footerY + 8 * sz,
  );
}

function practiceMenuItems() {
  return [
    {
      key: 1,
      step: "coffee",
      tag: "TIMING",
      title: "Coffee Timing",
      desc: "Hold the espresso flow steady and finish the bar cleanly.",
      accent: [222, 149, 87],
    },
    {
      key: 2,
      step: "milk",
      tag: "CONTROL",
      title: "Milk Hold",
      desc: "Balance long holds without letting the progress decay.",
      accent: [197, 149, 103],
    },
    {
      key: 3,
      step: "ice",
      tag: "RHYTHM",
      title: "Ice Taps",
      desc: "Alternate the keys cleanly to keep the cubes dropping fast.",
      accent: [101, 178, 196],
    },
    {
      key: 4,
      step: "syrup",
      tag: "PRECISION",
      title: "Syrup Precision",
      desc: "Hit the rhythm window on beat and avoid wasted pumps.",
      accent: [241, 179, 96],
    },
    {
      key: 5,
      step: "foam",
      tag: "BALANCE",
      title: "Foam Sequence",
      desc: "Keep the marker centered while the challenge fights back.",
      accent: [145, 196, 163],
    },
  ];
}

function practiceCardRects() {
  const sz = sceneScale();
  const w = min(980, width * 0.84);
  const h = min(560, height * 0.78);
  const x = width * 0.5 - w * 0.5;
  const y = height * 0.5 - h * 0.5;
  const items = practiceMenuItems();
  const cols = width > 860 ? 2 : 1;
  const gap = 18 * sz;
  const cardW = (w - 72 * sz - gap * (cols - 1)) / cols;
  const cardH = width > 860 ? 132 * sz : 92 * sz;
  const startY = y + 162 * sz;
  return items.map((item, i) => {
    const col = i % cols;
    const row = floor(i / cols);
    return {
      ...item,
      x: x + 36 * sz + col * (cardW + gap),
      y: startY + row * (cardH + gap),
      w: cardW,
      h: cardH,
    };
  });
}

function startPracticeStep(step) {
  playSfx("success");
  startPracticeMode(step);
}

function pointInRect(px, py, rectData) {
  return (
    px >= rectData.x &&
    px <= rectData.x + rectData.w &&
    py >= rectData.y &&
    py <= rectData.y + rectData.h
  );
}

function drawLevelComplete() {
  fill(15, 23, 45, 220);
  rect(0, 0, width, height);

  const panelW = min(700, width * 0.8);
  const panelH = 480;
  const panelX = width * 0.5 - panelW * 0.5;
  const panelY = height * 0.5 - panelH * 0.5;

  setShadow(40, "rgba(0,0,0,0.6)");
  fill(255, 255, 255, 248);
  rect(panelX, panelY, panelW, panelH, 24);
  clearShadow();

  // Header background
  fill(235, 242, 255);
  rect(panelX, panelY, panelW, 100, 24, 24, 0, 0);

  // Title
  fill(37, 52, 90);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(48);
  text(
    game.stage === 0
      ? "Tutorial Complete!"
      : `${stageMeta(game.stage).label} Complete!`,
    width * 0.5,
    panelY + 50,
  );

  textStyle(NORMAL);

  // Level info section
  const infoY = panelY + 130;
  fill(246, 250, 255);
  rect(panelX + 30, infoY, panelW - 60, 140, 14);

  fill(37, 52, 90);
  textAlign(CENTER, CENTER);
  textSize(24);
  textStyle(BOLD);
  text(stageMeta(game.stage).title, width * 0.5, infoY + 30);

  textStyle(NORMAL);
  fill(90, 110, 150);
  textSize(20);
  text(stageMeta(game.stage).completeText, width * 0.5, infoY + 70);

  // Progress to next button
  const buttonY = panelY + panelH - 80;
  fill(87, 153, 222);
  rect(panelX + panelW * 0.1, buttonY, panelW * 0.8, 50, 12); 

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20);
  textStyle(BOLD);

  // Dynamically switch instruction text based on stage
  const actionText = game.stage === 0 ? "Press ENTER" : "Press SPACE or ENTER";

  text(
    game.nextStage
      ? `${actionText} to Continue to ${stageMeta(game.nextStage).label}`
      : `${actionText} to Continue`,
    width * 0.5,
    buttonY + 25,
  );
}

function drawMorphTransitionOctopus(x, y, t, scaleMul = 1) {
  const morph = easeOutCubic(t);
  const headW = (lerp(100, 260, morph) + sin(millis() * 0.004) * 6) * scaleMul;
  const headH = (lerp(84, 240, morph) + sin(millis() * 0.0035) * 5) * scaleMul;
  const armScale = lerp(0.45, 1, morph) * scaleMul;
  const bases = {
    topLeft: createVector(x - 75 * armScale, y + 60 * armScale),
    bottomLeft: createVector(x - 25 * armScale, y + 70 * armScale),
    bottomRight: createVector(x + 25 * armScale, y + 70 * armScale),
    topRight: createVector(x + 75 * armScale, y + 60 * armScale),
  };
  const tips = {
    topLeft: createVector(x - 90 * armScale, y + 90 * armScale),
    bottomLeft: createVector(x - 30 * armScale, y + 100 * armScale),
    bottomRight: createVector(x + 30 * armScale, y + 100 * armScale),
    topRight: createVector(x + 90 * armScale, y + 90 * armScale),
  };
  const armColor = color(158, 148, 255);
  const outlineCol = color(75, 77, 135);
  for (const arm of ["topLeft", "topRight", "bottomLeft", "bottomRight"]) {
    const base = bases[arm];
    const tip = tips[arm];
    const kx = (base.x + tip.x) * 0.5;
    const ky =
      (base.y + tip.y) * 0.5 +
      sin(millis() * 0.005 + base.x * 0.01) * (6 + 8 * morph);
    stroke(outlineCol);
    strokeWeight(60 * armScale);
    noFill();
    bezier(base.x, base.y, kx, ky, kx, ky, tip.x, tip.y);
    stroke(armColor);
    strokeWeight(52 * armScale);
    bezier(base.x, base.y, kx, ky, kx, ky, tip.x, tip.y);
    noStroke();
    fill(220, 225, 255, 180);
    circle(base.x - 10 * armScale, base.y + 10 * armScale, 14 * armScale);
    circle(base.x + 10 * armScale, base.y + 5 * armScale, 12 * armScale);
  }
  setShadow(14, "rgba(0,0,0,0.25)");
  const grad = drawingContext.createLinearGradient(0, y - 140, 0, y + 120);
  grad.addColorStop(0, "#B399FF");
  grad.addColorStop(0.5, "#7DD1FF");
  grad.addColorStop(1, "#9E94FF");
  drawingContext.fillStyle = grad;
  drawingContext.strokeStyle = "#4B4D87";
  drawingContext.lineWidth = 4;
  ellipse(x, y, headW, headH);
  clearShadow();
  push();
  translate(x, y - (1 - morph) * 20 * scaleMul);
  scale(scaleMul);
  drawChefHat(0, 0);
  pop();
  if (morph > 0.35) drawFaceScaled(x, y, "normal", scaleMul);
}

function updateGlobalMeters() {
  if (game.state === STATES.GAME_OVER) return;
  const dt = deltaTime / 1000;
<<<<<<< HEAD
  const tutorialStage = game.mode !== "practice" && isTutorialStage();
  const tutorialFinaleActive = tutorialStage && game.tutorialFinale?.active;
=======
>>>>>>> parent of 23cdb8e (Update sketch.js)

  // 1. 压力系统：这是 Tangle 的动力源
  updateStress();

<<<<<<< HEAD
  if (tutorialFinaleActive) {
    updateTutorialFinale();
  } else if (tutorialStage) {
    // Level 0 tutorial: no stress/tangle pressure.
    game.stress = 0;
    game.tangleMeter = 0;
    game.lockedArm = null;
  } else {
    // 2. 只有按住 R (Calm Brew) 才能救命
    if (keyIsDown(82)) {
      game.tangleMeter = max(0, game.tangleMeter - 45 * dt); // 快速下降
      game.stress = max(0, game.stress - 30 * dt);
      // 增加一点视觉反馈：按住 R 时冒蓝光
      addParticles(width - 200, 50, color(100, 200, 255), 2);
    }
=======
  // 2. 只有按住 R (Calm Brew) 才能救命
  if (keyIsDown(82)) {
    game.tangleMeter = max(0, game.tangleMeter - 45 * dt); // 快速下降
    game.stress = max(0, game.stress - 30 * dt);
    // 增加一点视觉反馈：按住 R 时冒蓝光
    addParticles(width - 200, 50, color(100, 200, 255), 2);
  }
>>>>>>> parent of 23cdb8e (Update sketch.js)

  // 3. 惩罚：Tangle > 80% 随机锁死一只手
  if (game.tangleMeter >= 80 && !game.lockedArm) {
    const arms = ["topLeft", "topRight", "bottomLeft", "bottomRight"];
    game.lockedArm = random(arms);
  }
  if (game.tangleMeter < 60) game.lockedArm = null;

  // 4. 爆表：Tangle 到 100% 强制进入打结状态
  if (
    game.tangleMeter >= 100 &&
    game.state !== STATES.TANGLED &&
    game.state !== STATES.UNTANGLE
  ) {
    triggerPhysicalTangle();
  }

  // 5. 倒计时检查
  const elapsed = game.roundStartMs ? (millis() - game.roundStartMs) / 1000 : 0;
  if (
    game.mode !== "practice" &&
    !tutorialStage &&
    game.roundStartMs &&
    elapsed >= GAME.durationSec
  ) {
    game.levelAtTimeout =
      game.state === STATES.LEVEL_COMPLETE && game.nextStage
        ? game.nextStage
        : game.stage;
    game.state = STATES.GAME_OVER;
    handleGameOverProgression();
  }
}

function updateState() {
<<<<<<< HEAD
  if (
    game.mode !== "practice" &&
    isTutorialStage() &&
    !game.guidePopup.open &&
    game.currentOrder
  ) {
    if (game.state === STATES.ARM_CONTROL) maybeOpenLevelOneGuide(currentStep());
    if (game.state === STATES.SERVE_DRINK) maybeOpenLevelOneGuide("serve");
  }

=======
>>>>>>> parent of 23cdb8e (Update sketch.js)
  switch (game.state) {
    case STATES.IDLE:
    case STATES.PRACTICE_SELECT:
    case STATES.HOW_TO_PLAY:
    case STATES.TRANSITION:
      if (millis() - game.stateStartMs >= TRANSITION_DURATION_MS) {
        game.state = STATES.HOW_TO_PLAY; // 动画播完，弹出说明书
        game.stateStartMs = millis();
      }
      break;

    case STATES.NEW_ORDER:
      createOrder();
      game.state = STATES.ARM_CONTROL;
      game.stateStartMs = millis();
      // Start the shift timer once; do not reset between levels/orders.
      if (game.mode !== "practice" && !isTutorialStage() && !game.roundStartMs) {
        game.roundStartMs = millis();
      }
      break;

    case STATES.ARM_CONTROL:
      updateArmReach();
      updateTasks();
      break;
    case STATES.TUTORIAL_RECOVERY:
      updateTutorialFinale();
      break;

    case STATES.TANGLED:
      if (millis() - game.stateStartMs > 250) {
        game.state = STATES.UNTANGLE;
        game.stateStartMs = millis();
      }
      break;
    case STATES.UNTANGLE:
      updateUntangleState();
      break;
    case STATES.SERVE_DRINK:
      updateArmReach();
      break;
    case STATES.ORDER_COMPLETE:
      if (millis() - game.stateStartMs > 400) {
        game.state = STATES.NEW_ORDER;
        game.stateStartMs = millis();
      }
      break;
    case STATES.LEVEL_COMPLETE:
      // Wait for player input to advance
      break;
  }
}

function createOrder() {
  releaseAllArms();
  game.activeTasks = {};
  if (game.mode === "practice") {
    const step = game.practiceStep || "coffee";
    game.currentOrder = {
      drink: `Practice: ${labelStep(step)}`,
      steps: [step],
      createdMs: millis(),
      startTangles: game.tangles,
      startWrongHits: game.wrongStationHits,
      startArmSwitches: game.armSwitches,
      customer: {
        trait: "patient",
        label: "Practice",
        quote: "Practice run, no pressure.",
      },
    };
    game.stepIndex = 0;
    game.serveArmChosen = false;
    game.challenge = null;
    game.hoverStation = null;
    return;
  }
  const pool = STAGE_POOLS[game.stage] || [];
  const stageKey = `${game.stage}`;
  if (!game.pendingDrinksByStage) game.pendingDrinksByStage = {};
  if (!Array.isArray(game.pendingDrinksByStage[stageKey]))
    game.pendingDrinksByStage[stageKey] = [];

  // Keep variety: cycle through a shuffled stage pool before repeating.
  if (game.pendingDrinksByStage[stageKey].length === 0) {
    game.pendingDrinksByStage[stageKey] = shuffle([...pool], true);
  }
  const queue = game.pendingDrinksByStage[stageKey];
  if (queue.length > 1) {
    const firstSignature = orderSignature(queue[0]);
    const swapIndex = queue.findIndex(
      (d) => d !== game.lastDrink && orderSignature(d) !== game.lastOrderSignature,
    );
    const canImproveVariety =
      queue[0] === game.lastDrink || firstSignature === game.lastOrderSignature;
    if (canImproveVariety && swapIndex > 0) {
      const first = queue[0];
      queue[0] = queue[swapIndex];
      queue[swapIndex] = first;
    }
  }
  const drink = queue.shift();
  const trait = pickCustomerTrait();
  const traitDef = CUSTOMER_TRAITS[trait];
  const quote = random(traitDef.quotes);
  game.lastDrink = drink;
  game.lastOrderSignature = orderSignature(drink);
  game.currentOrder = {
    drink,
    steps: [...RECIPES[drink]],
    createdMs: millis(),
    startTangles: game.tangles,
    startWrongHits: game.wrongStationHits,
    startArmSwitches: game.armSwitches,
    customer: { trait, label: traitDef.label, quote },
  };

  const isLevelUpVisible =
    game.narrativeToast &&
    game.narrativeToast.text.includes("STAGE") &&
    millis() < game.narrativeToast.untilMs;
  if (!isLevelUpVisible) {
    game.narrativeToast = {
      text: `Customer says: "${quote}"`,
      untilMs: millis() + 3200,
    };
  }
  game.stepIndex = 0;
  game.serveArmChosen = false;
  game.challenge = null;
  game.hoverStation = null;
}

function orderSignature(drink) {
  const steps = [...(RECIPES[drink] || [])].sort();
  return steps.join("|");
}

function updateTasks() {
  const dt = deltaTime / 1000;
  let allComplete = true;

  // 压力影响系数：从 1.0 (没压力) 到 3.0 (压力爆表)
  const stressPenalty = map(game.stress, 0, 100, 1.0, 3.0);

  const occupiedStations = [];
  for (const key of ["topLeft", "topRight", "bottomLeft", "bottomRight"]) {
    if (game.arms[key].activeStation)
      occupiedStations.push(game.arms[key].activeStation);
  }

  for (const step in game.activeTasks) {
    if (!occupiedStations.includes(step)) delete game.activeTasks[step];
  }

  for (const step of game.currentOrder.steps) {
    const task = game.activeTasks[step];
    if (!task) {
      allComplete = false;
      continue;
    }

    // --- 处理不同任务逻辑 ---
    if (task.type === "hold") {
      const isInputting = keyIsDown(task.key.charCodeAt(0));
      if (isInputting) task.progress += (task.speed / stressPenalty) * dt;
      else
        task.progress = max(
          0,
          task.progress - task.speed * 0.8 * stressPenalty * dt,
        );
    } else if (task.type === "tap" || task.type === "alternate") {
      task.progress = max(0, task.progress - task.decay * stressPenalty * dt);
    } else if (task.type === "balance") {
      const gravityEff = task.gravity * map(game.stress, 0, 100, 1.0, 2.2);
      task.marker = max(0, task.marker - gravityEff * dt);
      if (task.marker >= 20 && task.marker <= 80) {
        task.progress += task.speed * dt;
      } else {
        task.progress = max(
          0,
          task.progress - task.speed * 0.6 * stressPenalty * dt,
        );
      }
    } 
    else if (task.type === "rhythm") {
      // 压力大时，节拍会变得不稳定（稍微加快）
      task.timer += dt * 1000 * map(game.stress, 0, 100, 1.0, 1.4);
      if (task.timer > task.beatMs) {
        task.timer = 0;
        task.progress = max(0, task.progress - 5 * stressPenalty); // 漏拍扣分
      }
    }

    // --- 这一段必须在所有任务类型之外，循环之内 ---
    task.progress = constrain(task.progress, 0, 100);
    if (task.progress < 95) allComplete = false;
  }

  // 检测触角物理交叉
  checkTentacleCrossing();

  if (
    allComplete &&
    game.currentOrder.steps.length > 0 &&
    game.state === STATES.ARM_CONTROL
  ) {
    releaseAllArms();
    game.state = STATES.SERVE_DRINK;
    // 完成订单后，奖励：压力大幅下降
    game.stress = max(0, game.stress - 35);
    playSfx("success");
  }
}

function currentStep() {
  return !game.currentOrder
    ? null
    : game.currentOrder.steps[game.stepIndex] || null;
}
function requiredStation() {
  return game.state === STATES.SERVE_DRINK ? "serve" : currentStep();
}

function updateArmReach() {
  for (const key of ["topLeft", "topRight", "bottomLeft", "bottomRight"]) {
    const arm = game.arms[key];
    if (arm.activeStation) {
      if (arm.activeStation === "serve") {
        if (game.state === STATES.SERVE_DRINK) {
          game.serveArmChosen = true;
          completeServeDrink();
        } else {
          arm.activeStation = null;
          playSfx("fail");
        }
        continue;
      }
      const isNeeded =
        game.currentOrder &&
        game.currentOrder.steps.includes(arm.activeStation);
      if (isNeeded) {
        if (!game.activeTasks[arm.activeStation]) {
          game.activeTasks[arm.activeStation] = {
            progress: 0,
            ...STATION_TASKS[arm.activeStation],
          };
          playSfx("select");
        }
      } else {
        const cmods = getCustomerMods();
        game.mistakes += 1;
        game.wrongStationHits += 1;
        game.score = max(0, game.score - floor(5 * cmods.penaltyMul));
        addTangle(arm.activeStation, 8 * cmods.penaltyMul);
        const s = station(arm.activeStation);
        if (s) addParticles(s.x, s.y, color(246, 149, 128), 8);
        arm.activeStation = null;
        playSfx("fail");
      }
    }
  }
}

function releaseAllArms() {
  for (const key of ["topLeft", "topRight", "bottomLeft", "bottomRight"]) {
    game.arms[key].activeStation = null;
    game.arms[key].isDragging = false;
  }
  game.draggedArm = null;
  game.activeTasks = {};
}

function completeServeDrink() {
  if (!game.serveArmChosen) return;
  const cmods = getCustomerMods();
  const timeTaken = (millis() - game.currentOrder.createdMs) / 1000;
  const tangleDelta = game.tangles - game.currentOrder.startTangles;
  const wrongDelta = game.wrongStationHits - game.currentOrder.startWrongHits;
  const serveScore = floor(
    100 -
      timeTaken * 1.8 -
      tangleDelta * 10 * cmods.penaltyMul -
      wrongDelta * 2 * cmods.penaltyMul,
  );
  const rushBonus =
    timeTaken < cmods.speedWindowSec ? 20 * cmods.speedBonusMul : 0;
  game.score += floor((max(25, serveScore) + rushBonus) * cmods.scoreMul);
  game.ordersDone += 1;
  game.ordersThisLevel += 1;
  game.serveArmChosen = false;
  releaseAllArms();
  game.combo += 1;
  game.bestCombo = max(game.bestCombo, game.combo);
  triggerComboMilestone();
  addParticles(
    station("serve").x,
    station("serve").y,
    color(115, 210, 145),
    18,
  );
  playSfx("serve");
  const currentStageMeta = stageMeta(game.stage);
  if (
    currentStageMeta.targetOrders !== null &&
    currentStageMeta.nextStage !== null &&
    game.ordersThisLevel >= currentStageMeta.targetOrders
  ) {
    if (isTutorialStage()) {
      startTutorialFinale();
    } else {
      game.state = STATES.LEVEL_COMPLETE;
      game.stateStartMs = millis();
      game.nextStage = currentStageMeta.nextStage;
      playSfx("start");
    }
  } else {
    game.state = STATES.ORDER_COMPLETE;
  }
  game.stateStartMs = millis();
}

function failStep() {
<<<<<<< HEAD
  if (game.mode !== "practice" && isTutorialStage()) return;
=======
>>>>>>> parent of 23cdb8e (Update sketch.js)
  const cmods = getCustomerMods();
  game.tangles += 1;
  game.mistakes += 1;
  game.score = max(0, game.score - floor(18 * cmods.penaltyMul));
  game.combo = 0;
  playSfx("fail");
  releaseAllArms();
  game.activeTasks = {};
  game.untangleProgress = 0;
  game.state = STATES.TANGLED;
  game.stateStartMs = millis();
  game.tangleMeter = constrain(
    game.tangleMeter + 20 * cmods.penaltyMul,
    0,
    100,
  );
  game.stress = constrain(game.stress + 14, 0, 100);
}

function addTangle(stationName, base) {
<<<<<<< HEAD
  if (game.mode !== "practice" && isTutorialStage()) return;
=======
>>>>>>> parent of 23cdb8e (Update sketch.js)
  const mods = getRushModifiers();
  let gain = base;
  const now = millis();
  if (stationName === game.lastStation) gain += 6;
  if (
    game.lastStation &&
    stationName !== game.lastStation &&
    now - game.lastStationMs < 2000
  )
    gain += 10;
  if (game.stress > 70) gain *= 1.2;
  gain *= mods.tangleGainMul;
  game.tangleMeter = constrain(game.tangleMeter + gain, 0, 100);
  game.stress = constrain(game.stress + 7, 0, 100);
  game.lastStation = stationName;
  game.lastStationMs = now;
}

function updateUntangleState() {
  const dt = deltaTime / 1000;

  game.untangleProgress = max(0, game.untangleProgress - 15 * dt);

  if (game.untangleProgress >= 100) {

    game.tangleMeter = 30;
    game.lockedArm = null;
    releaseAllArms(); 
    if (game.tutorialFinale?.active && game.tutorialFinale.phase === "untangle") {
      finishTutorialFinale();
    } else {
      game.state = STATES.ARM_CONTROL;
      game.stateStartMs = millis();
      playSfx("success");
    }
  }
}

function updateStress() {
  const dt = deltaTime / 1000;
  if (!game.currentOrder || game.state !== STATES.ARM_CONTROL) return;
<<<<<<< HEAD
  if (game.mode !== "practice" && isTutorialStage()) {
    game.stress = 0;
    return;
  }
=======
>>>>>>> parent of 23cdb8e (Update sketch.js)

  // 1. 基础压力：激活的任务越多，章鱼越慌
  const activeCount = Object.keys(game.activeTasks).length;
  const multitaskFactor = activeCount * 12; // 每个任务每秒提供 12 点压力潜力

  // 2. 订单耗时压力
  const orderElapsed = (millis() - game.currentOrder.createdMs) / 1000;
  const timeFactor = orderElapsed > 12 ? (orderElapsed - 12) * 5 : 0;

  // 3. 更新 Stress 值
  game.stress = constrain(
    game.stress + (multitaskFactor + timeFactor) * dt * 0.4,
    0,
    100,
  );

  // --- 核心逻辑：压力如何转化为 Tangle ---
  // 当 Stress 超过 40，Tangle 进度条会像漏水一样自动上涨
  if (game.stress > 40) {
    const tangleGain = map(game.stress, 40, 100, 5, 20); // 压力满载时每秒涨 20%
    game.tangleMeter = constrain(game.tangleMeter + tangleGain * dt, 0, 100);
  }
}

// 线段交点检测逻辑
function doSegmentsIntersect(p1, p2, p3, p4) {
  const det = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (det === 0) return false;
  const lambda =
    ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y)) / det;
  const gamma =
    ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y)) / det;
  return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
}

function checkTentacleCrossing() {
  if (game.state !== STATES.ARM_CONTROL) return;
<<<<<<< HEAD
  if (game.mode !== "practice" && isTutorialStage()) return;
=======
>>>>>>> parent of 23cdb8e (Update sketch.js)

  const keys = ["topLeft", "topRight", "bottomLeft", "bottomRight"];

  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const armA = game.arms[keys[i]];
      const armB = game.arms[keys[j]];

      // 只有当触角都在工作（拖拽中或锁定在台子上）时才检测
      if (
        (armA.isDragging || armA.activeStation) &&
        (armB.isDragging || armB.activeStation)
      ) {
        const baseA = armBase(keys[i]);
        const baseB = armBase(keys[j]);

        if (doSegmentsIntersect(baseA, armA.tip, baseB, armB.tip)) {
          triggerPhysicalTangle();
          return;
        }
      }
    }
  }
}

function triggerPhysicalTangle() {
<<<<<<< HEAD
  if (game.mode !== "practice" && isTutorialStage()) return;
=======
>>>>>>> parent of 23cdb8e (Update sketch.js)
  game.tangles += 1;
  game.score = max(0, game.score - 15);
  game.stress = constrain(game.stress + 20, 0, 100);
  game.tangleMeter = 100; // 瞬间爆表
  playSfx("fail");

  // 进入缠绕状态
  game.state = STATES.TANGLED;
  game.stateStartMs = millis();
  game.untangleProgress = 0;

  // 震动效果
  addParticles(width / 2, height / 2, color(255, 100, 100), 20);
}

function keyPressed() {
  game.noInputSince = millis();
  ensureAudioUnlocked();
  
  // 全局 ESC 退出处理
  if (keyCode === ESCAPE) {
    if (game.guidePopup && game.guidePopup.open) {
      closeChallengeGuide();
    } else {
      resetGame();
    }
    return false;
  }

  if (game.state === STATES.PRACTICE_SELECT) {
    const map = { 1: "coffee", 2: "milk", 3: "ice", 4: "syrup", 5: "foam" };
    if (map[key]) {
      startPracticeStep(map[key]);
      return false;
    }
    return false;
  }
  
  if (game.state === STATES.LEVEL_COMPLETE) {
    // Prevent accidental spacebar skipping if coming from tutorial untangle
    const isValidKey = game.stage === 0 
      ? (keyCode === ENTER) 
      : (key === " " || keyCode === ENTER || key.toUpperCase() === "C");

    if (isValidKey) {
      if (game.nextStage) {
        game.stage = game.nextStage;
        game.ordersThisLevel = 0;
        game.state = STATES.NEW_ORDER;
        game.stateStartMs = millis();
      }
    }
    return false;
  }
  
  if (game.state === STATES.TRANSITION && (key === " " || keyCode === ENTER)) {
    game.state = STATES.HOW_TO_PLAY;
    game.stateStartMs = millis();
    return false;
  }
  if (game.guidePopup.open) {
    if (keyCode === ENTER || key === " " || key.toUpperCase() === "C") {
      closeChallengeGuide();
    }
    return false;
  }
  if (key.toUpperCase() === "M" && audioEngine?.master) {
    const muted = audioEngine.master.gain.value < 0.01;
    audioEngine.master.gain.value = muted ? 0.25 : 0.0001;
    return false;
  }
  if (
    game.state !== STATES.IDLE &&
    game.state !== STATES.TRANSITION &&
    game.state !== STATES.PRACTICE_SELECT &&
    game.state !== STATES.GAME_OVER
  ) {
    if (key === POWERUPS.calm.key) return activatePowerUp("calm");
    if (key === POWERUPS.focus.key) return activatePowerUp("focus");
    if (key === POWERUPS.turbo.key) return activatePowerUp("turbo");
  }
  if (game.state === STATES.IDLE || game.state === STATES.GAME_OVER) {
    if (key.toUpperCase() === "H") {
      cycleSelection("hats", 1);
      return false;
    }
    if (key.toUpperCase() === "J") {
      cycleSelection("cupSkins", 1);
      return false;
    }
    if (key.toUpperCase() === "K") {
      cycleSelection("stationThemes", 1);
      return false;
    }
    if (key.toUpperCase() === "L") {
      cycleSelection("soundPacks", 1);
      return false;
    }
  }
  if (game.state === STATES.IDLE && (key === " " || keyCode === ENTER)) {
    startShift();
    return false;
  }
  if (game.state === STATES.IDLE && key.toUpperCase() === "T") {
    startTutorialShift();
    return false;
  }
  if (game.state === STATES.IDLE && key.toUpperCase() === "P") {
    enterPracticeSelect();
    return false;
  }
  if (game.state === STATES.GAME_OVER && key === " ") {
    resetGame();
    return false;
  }
  if (game.mode === "practice" && key.toUpperCase() === "Q") {
    resetGame();
    return false;
  }

  if (
    (game.state === STATES.TANGLED || game.state === STATES.UNTANGLE) &&
    key === " "
  ) {
    game.untangleProgress += 14;
    playSfx("untangle");
    return false;
  }

  if (game.state === STATES.ARM_CONTROL) {
    const k = key.toUpperCase();

    for (const step in game.activeTasks) {
      const task = game.activeTasks[step];

      if (task.type === "tap" && k === task.key) {
        task.progress = min(100, task.progress + task.speed); // Milk: Tap T
      } else if (
        task.type === "balance" &&
        (k === task.key || keyCode === 72)
      ) {
        const pushPower = task.push * map(game.stress, 0, 100, 1.0, 1.4);
        task.marker = min(100, task.marker + pushPower);
        playTone(400, 0.05, "sine", 0.01); 
      } else if (task.type === "alternate") {
        if (keyCode === 88 || keyCode === 67) {
          const pressedStr = keyCode === 88 ? "X" : "C";

          if (task.lastKey !== pressedStr) {
            task.progress = min(100, task.progress + task.speed);
            task.lastKey = pressedStr;
          }
        }
      } else if (task.type === "rhythm" && (k === task.key || key === " ")) {
        const diff = min(task.timer, abs(task.beatMs - task.timer)); 
        if (diff <= task.windowMs) {
          task.progress = min(100, task.progress + task.speed);
          task.timer = 0;
        } else {
          task.progress = max(0, task.progress - task.speed * 0.5);
        }
      }
    }
  }
}

function mousePressed() {
  game.noInputSince = millis();
  ensureAudioUnlocked();
<<<<<<< HEAD

  if (game.guidePopup.open) {
    const b = guideCloseButtonRect();
    if (
      mouseX > b.x &&
      mouseX < b.x + b.w &&
      mouseY > b.y &&
      mouseY < b.y + b.h
    ) {
      closeChallengeGuide();
    }
    return false;
  }
=======
>>>>>>> parent of 23cdb8e (Update sketch.js)
  if (game.state === STATES.HOW_TO_PLAY) {
    const sz = sceneScale();
    const w = 600 * sz,
      h = 480 * sz;
    const y = height * 0.5 - h * 0.5;
    const btnW = 240 * sz,
      btnH = 55 * sz;
    const btnX = width * 0.5 - btnW * 0.5;
    const btnY = y + h - 85 * sz;

    if (
      mouseX > btnX &&
      mouseX < btnX + btnW &&
      mouseY > btnY &&
      mouseY < btnY + btnH
    ) {
      beginSelectedRun();
      return false;
    }
    return false;
  }
  if (game.state === STATES.PRACTICE_SELECT) {
    for (const item of practiceCardRects()) {
      if (pointInRect(mouseX, mouseY, item)) {
        startPracticeStep(item.step);
        return false;
      }
    }
    return false;
  }
  if (game.state === STATES.ARM_CONTROL || game.state === STATES.SERVE_DRINK) {
    for (const key of ["topLeft", "topRight", "bottomLeft", "bottomRight"]) {
      const armTip = game.arms[key].tip;
      if (dist(mouseX, mouseY, armTip.x, armTip.y) < 60) {
        game.draggedArm = key;
        game.arms[key].isDragging = true;
        game.arms[key].activeStation = null;
        return false;
      }
    }
  }
  if (game.state === STATES.TRANSITION) {
    game.state = STATES.HOW_TO_PLAY;
    game.stateStartMs = millis();
    return false;
  }
  if (game.state === STATES.GAME_OVER) {
    const cycleButtons = gameOverCycleButtons();
    for (const b of cycleButtons) {
      if (
        mouseX > b.x &&
        mouseX < b.x + b.w &&
        mouseY > b.y &&
        mouseY < b.y + b.h
      ) {
        cycleSelection(b.key, 1);
        return false;
      }
    }
    const restart = gameOverRestartRect();
    if (
      mouseX > restart.x &&
      mouseX < restart.x + restart.w &&
      mouseY > restart.y &&
      mouseY < restart.y + restart.h
    ) {
      resetGame();
      return false;
    }
  }
  if (game.guidePopup.open) {
    const b = guideCloseButtonRect();
    if (
      mouseX > b.x &&
      mouseX < b.x + b.w &&
      mouseY > b.y &&
      mouseY < b.y + b.h
    ) {
      closeChallengeGuide();
    }
    return false;
  }
  if (game.state === STATES.IDLE) {
    const b = startButtonRect();
    if (
      mouseX > b.x &&
      mouseX < b.x + b.w &&
      mouseY > b.y &&
      mouseY < b.y + b.h
    )
      startShift();
  }
}

function mouseDragged() {
  if (game.draggedArm) {
    game.arms[game.draggedArm].isDragging = true;
  }
}

function mouseReleased() {
  if (game.draggedArm) {
    const arm = game.arms[game.draggedArm];
    arm.isDragging = false;
    let droppedOn = null;
    for (const name of STATION_NAMES) {
      const s = station(name);
      if (dist(mouseX, mouseY, s.x, s.y) <= s.r + 20) {
        droppedOn = name;
        break;
      }
    }
    if (droppedOn) {
      for (const key of ["topLeft", "topRight", "bottomLeft", "bottomRight"]) {
        if (
          key !== game.draggedArm &&
          game.arms[key].activeStation === droppedOn
        ) {
          droppedOn = null;
          playSfx("fail");
          break;
        }
      }
    }
    arm.activeStation = droppedOn;
    game.draggedArm = null;
    playSfx("select");
  }
}

function station(name) {
  const anchor = BG_REFERENCE.anchors[name];
  if (!anchor) return null;
  const p = scenePoint(anchor.x, anchor.y);
  const scale = sceneScale();
  return { x: p.x, y: p.y, r: anchor.r * scale, label: anchor.label };
}

function armBase(arm) {
  const bob = sin(millis() * 0.002) * 10;
  const x = width * 0.5;
  const y = height * OCTOPUS_Y_FACTOR + bob;
  const map = {
    topLeft: createVector(x - 75, y + 60),
    bottomLeft: createVector(x - 25, y + 70),
    bottomRight: createVector(x + 25, y + 70),
    topRight: createVector(x + 75, y + 60),
  };
  return map[arm] || createVector(x, y);
}

function drawBackdrop() {
  const p = backgroundPlacement();
  if (backgroundImg) {
    image(backgroundImg, p.x, p.y, p.w, p.h);
  } else {
    background(235, 241, 252);
  }
  noStroke();
  fill(255, 255, 255, 22);
  rect(0, 0, width, height);
  const theme = profile?.selected?.stationTheme || "caramel";
  if (theme === "latte") {
    fill(227, 188, 140, 22);
    rect(0, 0, width, height);
  } else if (theme === "sunset") {
    fill(234, 138, 88, 24);
    rect(0, 0, width, height);
  } else {
    fill(176, 132, 90, 12);
    rect(0, 0, width, height);
  }
  if (game.tangleMeter >= 50) {
    push();
    noFill();
    stroke(
      game.tangleMeter >= 80 ? color(125, 65, 84, 92) : color(233, 149, 85, 75),
    );
    strokeWeight(3);
    for (let i = 0; i < 11; i++) {
      beginShape();
      for (let x = -40; x <= width + 40; x += 28) {
        const yy =
          128 +
          i * 40 +
          sin(0.012 * x + i + millis() * 0.0018) *
            (10 + game.tangleMeter * 0.12);
        curveVertex(x, yy);
      }
      endShape();
    }
    pop();
  }
}

function drawScene() {}

function getStationThemePalette() {
  const theme = profile?.selected?.stationTheme || "caramel";
  if (theme === "latte")
    return {
      shadowReq: "rgba(184, 139, 97, 0.28)",
      shadowBase: "rgba(77, 57, 38, 0.16)",
      cardReq: color(251, 237, 214, 160),
      cardBase: color(245, 232, 214, 145),
      innerReq: color(255, 231, 194, 105),
      innerBase: color(255, 245, 229, 95),
      topStripe: color(255, 252, 246, 110),
      chipServe: color(119, 167, 104, 185),
      chip: color(190, 139, 97, 176),
      textMain: color(89, 60, 40, 230),
      textSub: color(133, 99, 73, 214),
      reqStroke: color(194, 143, 96, 184),
      reqStroke2: color(204, 156, 108, 150),
      badge: color(185, 130, 84, 202),
    };
  if (theme === "sunset")
    return {
      shadowReq: "rgba(199, 116, 79, 0.28)",
      shadowBase: "rgba(84, 43, 29, 0.16)",
      cardReq: color(252, 226, 206, 160),
      cardBase: color(246, 223, 206, 145),
      innerReq: color(255, 212, 179, 108),
      innerBase: color(255, 240, 226, 92),
      topStripe: color(255, 245, 236, 104),
      chipServe: color(149, 180, 98, 180),
      chip: color(207, 125, 82, 174),
      textMain: color(95, 52, 34, 230),
      textSub: color(142, 90, 66, 214),
      reqStroke: color(206, 125, 83, 182),
      reqStroke2: color(220, 145, 98, 150),
      badge: color(203, 116, 72, 200),
    };
  return {
    shadowReq: "rgba(173, 124, 78, 0.3)",
    shadowBase: "rgba(54, 34, 21, 0.14)",
    cardReq: color(250, 234, 206, 155),
    cardBase: color(248, 238, 223, 132),
    innerReq: color(252, 225, 181, 95),
    innerBase: color(255, 248, 238, 86),
    topStripe: color(255, 250, 244, 96),
    chipServe: color(122, 168, 102, 178),
    chip: color(177, 127, 83, 172),
    textMain: color(82, 54, 36, 225),
    textSub: color(127, 92, 64, 210),
    reqStroke: color(186, 132, 85, 178),
    reqStroke2: color(196, 146, 96, 142),
    badge: color(177, 121, 73, 196),
  };
}

function drawStations() {
  const isServePhase = game.state === STATES.SERVE_DRINK;
  const isActiveOrderState =
    game.state === STATES.ARM_CONTROL ||
    game.state === STATES.TANGLED ||
    game.state === STATES.UNTANGLE;
  const requiredSteps = isServePhase
    ? ["serve"]
    : isActiveOrderState
      ? game.currentOrder?.steps || []
      : [];
  const th = getStationThemePalette();

  for (const name of STATION_NAMES) {
    const s = station(name);
    const required = requiredSteps.includes(name);
    const sz = sceneScale();

    const cardW = 185 * sz;
    const cardH = 175 * sz;
    const cardX = s.x - cardW * 0.5;
    const cardY = s.y - cardH * 0.5;

    if (required) {
      setShadow(25, "rgba(255, 235, 180, 0.9)");
      stroke(160, 110, 50);
      strokeWeight(5 * sz);
    } else {
      setShadow(6, "rgba(0,0,0,0.1)");
      noStroke();
    }

    fill(required ? color(255, 253, 245, 250) : color(248, 238, 223, 180));
    rect(cardX, cardY, cardW, cardH, 25 * sz);
    clearShadow();

    // 提高图标背后的白色圆圈对比度
    noStroke();
    fill(255, 255, 255, 235);
    circle(s.x, s.y - 15 * sz, 85 * sz);

    drawIngredientIcon(name, s.x, s.y - 15 * sz, 60 * sz);

    // 标签文字颜色加深，确保不虚
    noStroke();
    textAlign(CENTER, CENTER);
    fill(60, 35, 20);
    textSize(22 * sz);
    textStyle(BOLD);
    text(s.label, s.x, cardY + cardH - 40 * sz);

    fill(100, 80, 60);
    textSize(14 * sz);
    textStyle(NORMAL);
    text(required ? "TARGET" : "READY", s.x, cardY + cardH - 18 * sz);

    if (required) {
      fill(160, 50, 35);
      rect(s.x - 45 * sz, cardY - 15 * sz, 90 * sz, 24 * sz, 999);
      fill(255);
      textSize(12 * sz);
      textStyle(BOLD);
      text("DO NOW", s.x, cardY - 3 * sz);
    }
  }
}

function drawArms() {
  const armKeys = ["topLeft", "topRight", "bottomLeft", "bottomRight"];
  const level =
    game.tangleMeter >= 80
      ? "full"
      : game.tangleMeter >= 50
        ? "half"
        : "normal";
  for (const key of armKeys) {
    const armData = game.arms[key];
    const base = armBase(key);
    let tip;
    if (armData.isDragging) {
      tip = createVector(mouseX, mouseY);
    } else if (armData.activeStation) {
      const s = station(armData.activeStation);
      tip = createVector(s.x, s.y);
    } else {
      tip = defaultArmTip(key);
    }
    armData.tip = tip.copy();
    let armColor = color(158, 148, 255);
    let outlineCol = color(75, 77, 135);
    if (key === game.lockedArm) armColor = color(152, 173, 255);
    setShadow(10, "rgba(0,0,0,0.2)");
    stroke(outlineCol);
    strokeWeight(60);
    noFill();
    const kx = (base.x + tip.x) * 0.5;
    const ky =
      (base.y + tip.y) * 0.5 +
      sin(millis() * 0.005 + base.x * 0.01) *
        (level === "full" ? 24 : level === "half" ? 16 : 8);
    bezier(base.x, base.y, kx, ky, kx, ky, tip.x, tip.y);
    clearShadow();
    stroke(armColor);
    strokeWeight(52);
    bezier(base.x, base.y, kx, ky, kx, ky, tip.x, tip.y);
    noStroke();
    fill(220, 225, 255, 180);
    circle(base.x - 10, base.y + 10, 14);
    circle(base.x + 10, base.y + 5, 12);
  }
}

function drawOctopus() {
  const bob = sin(millis() * 0.002) * 10;
  const x = width * 0.5;
  const y = height * OCTOPUS_Y_FACTOR + bob;
  const mode =
    game.state === STATES.TANGLED ||
    game.state === STATES.UNTANGLE ||
    game.tangleMeter >= 80
      ? "full"
      : game.tangleMeter >= 50
        ? "half"
        : "normal";
  setShadow(15, "rgba(0,0,0,0.3)");
  let grad = drawingContext.createLinearGradient(0, y - 140, 0, y + 120);
  grad.addColorStop(0, "#B399FF");
  grad.addColorStop(0.5, "#7DD1FF");
  grad.addColorStop(1, "#9E94FF");
  drawingContext.fillStyle = grad;
  drawingContext.strokeStyle = "#4B4D87";
  drawingContext.lineWidth = 4;
  ellipse(x, y, 260, 240);
  clearShadow();
  drawChefHat(x, y);
  noStroke();
  fill(255, 255, 255, 220);
  push();
  translate(x - 50, y - 80);
  rotate(-PI / 8);
  ellipse(0, 0, 75, 35);
  pop();
  fill(255, 255, 255, 150);
  circle(x + 70, y - 60, 12);
  circle(x + 90, y - 30, 8);
  circle(x + 85, y - 10, 5);
  drawFace(x, y, mode);
}

function drawChefHat(x, y) {
  const hat = profile?.selected?.hat || "chef";
  if (hat === "barista") {
    setShadow(6, "rgba(0,0,0,0.16)");
    fill(118, 78, 51);
    stroke(86, 56, 36);
    strokeWeight(2);
    arc(x, y - 118, 168, 78, PI, TWO_PI);
    noStroke();
    fill(156, 104, 66);
    rect(x - 70, y - 122, 140, 20, 8);
    clearShadow();
    return;
  }
  if (hat === "royal") {
    setShadow(7, "rgba(0,0,0,0.16)");
    fill(227, 184, 84);
    stroke(182, 140, 52);
    strokeWeight(2);
    rect(x - 72, y - 130, 144, 26, 8);
    for (let i = -2; i <= 2; i++) {
      triangle(
        x + i * 28 - 12,
        y - 130,
        x + i * 28,
        y - 156,
        x + i * 28 + 12,
        y - 130,
      );
    }
    fill(255, 232, 166);
    circle(x - 28, y - 116, 7);
    circle(x, y - 116, 7);
    circle(x + 28, y - 116, 7);
    clearShadow();
    noStroke();
    return;
  }
  setShadow(8, "rgba(0,0,0,0.16)");
  fill(248, 248, 248, 245);
  stroke(214, 214, 214);
  strokeWeight(2);
  circle(x - 45, y - 158, 58);
  circle(x - 12, y - 172, 64);
  circle(x + 22, y - 168, 62);
  circle(x + 50, y - 152, 54);
  rect(x - 52, y - 176, 104, 52, 18);
  fill(238, 238, 238, 250);
  rect(x - 72, y - 128, 144, 24, 12);
  clearShadow();
  noStroke();
}

function drawFace(x, y, mode) {
  if (mode === "full") {
    drawSpiralEye(x - 55, y + 15);
    drawSpiralEye(x + 55, y + 15);
    fill(40, 45, 80);
    ellipse(x, y + 45, 26, 12);
    return;
  }
  fill(35, 35, 60);
  noStroke();
  ellipse(x - 55, y + 15, 36, 44);
  ellipse(x + 55, y + 15, 36, 44);
  fill(255);
  ellipse(x - 62, y + 5, 14, 18);
  ellipse(x + 48, y + 5, 14, 18);
  circle(x - 48, y + 25, 8);
  circle(x + 62, y + 25, 8);
  fill(255, 160, 200, 100);
  ellipse(x - 85, y + 35, 30, 15);
  ellipse(x + 85, y + 35, 30, 15);
  noFill();
  stroke(35, 35, 60);
  strokeWeight(3);
  if (mode === "half") {
    line(x - 8, y + 30, x + 8, y + 30);
    fill(160, 220, 255);
    noStroke();
    push();
    translate(x + 85, y - 15);
    rotate(-PI / 6);
    ellipse(0, 0, 12, 22);
    pop();
  } else {
    arc(x, y + 25, 16, 12, 0, PI);
  }
  noStroke();
}

function drawFaceScaled(x, y, mode, s = 1) {
  if (mode === "full") {
    drawSpiralEyeScaled(x - 55 * s, y + 15 * s, s);
    drawSpiralEyeScaled(x + 55 * s, y + 15 * s, s);
    fill(40, 45, 80);
    ellipse(x, y + 45 * s, 26 * s, 12 * s);
    return;
  }
  fill(35, 35, 60);
  noStroke();
  ellipse(x - 55 * s, y + 15 * s, 36 * s, 44 * s);
  ellipse(x + 55 * s, y + 15 * s, 36 * s, 44 * s);
  fill(255);
  ellipse(x - 62 * s, y + 5 * s, 14 * s, 18 * s);
  ellipse(x + 48 * s, y + 5 * s, 14 * s, 18 * s);
  circle(x - 48 * s, y + 25 * s, 8 * s);
  circle(x + 62 * s, y + 25 * s, 8 * s);
  fill(255, 160, 200, 100);
  ellipse(x - 85 * s, y + 35 * s, 30 * s, 15 * s);
  ellipse(x + 85 * s, y + 35 * s, 30 * s, 15 * s);
  noFill();
  stroke(35, 35, 60);
  strokeWeight(3 * s);
  if (mode === "half") {
    line(x - 8 * s, y + 30 * s, x + 8 * s, y + 30 * s);
    fill(160, 220, 255);
    noStroke();
    push();
    translate(x + 85 * s, y - 15 * s);
    rotate(-PI / 6);
    ellipse(0, 0, 12 * s, 22 * s);
    pop();
  } else {
    arc(x, y + 25 * s, 16 * s, 12 * s, 0, PI);
  }
  noStroke();
}

function drawSpiralEye(x, y) {
  noFill();
  stroke(58, 35, 93);
  strokeWeight(4);
  beginShape();
  for (let a = 0; a < TWO_PI * 2.1; a += 0.2) {
    const r = map(a, 0, TWO_PI * 2.1, 2, 14);
    vertex(x + cos(a) * r, y + sin(a) * r);
  }
  endShape();
  noStroke();
}
function drawSpiralEyeScaled(x, y, s = 1) {
  noFill();
  stroke(58, 35, 93);
  strokeWeight(4 * s);
  beginShape();
  for (let a = 0; a < TWO_PI * 2.1; a += 0.2) {
    const r = map(a, 0, TWO_PI * 2.1, 2, 14) * s;
    vertex(x + cos(a) * r, y + sin(a) * r);
  }
  endShape();
  noStroke();
}

function defaultArmTip(arm) {
  const bob = sin(millis() * 0.002) * 10;
  const x = width * 0.5;
  const y = height * OCTOPUS_Y_FACTOR + bob;
  const t = millis() * 0.002;
  if (arm === "topLeft")
    return createVector(x - 90 + sin(t) * 5, y + 90 + cos(t * 1.2) * 5);
  if (arm === "bottomLeft")
    return createVector(x - 30 + sin(t * 1.3) * 5, y + 100 + cos(t) * 5);
  if (arm === "bottomRight")
    return createVector(x + 30 + cos(t * 1.15) * 5, y + 100 + sin(t) * 5);
  if (arm === "topRight")
    return createVector(x + 90 + cos(t * 1.1) * 5, y + 90 + sin(t * 0.9) * 5);
  return createVector(x, y);
}

function backgroundPlacement() {
  if (!backgroundImg || !backgroundImg.width || !backgroundImg.height)
    return { x: 0, y: 0, w: width, h: height };
  const imgRatio = backgroundImg.width / backgroundImg.height;
  const canvasRatio = width / height;
  if (canvasRatio > imgRatio)
    return {
      x: 0,
      y: (height - width / imgRatio) * 0.5,
      w: width,
      h: width / imgRatio,
    };
  return {
    x: (width - height * imgRatio) * 0.5,
    y: 0,
    w: height * imgRatio,
    h: height,
  };
}

function scenePoint(nx, ny) {
  const p = backgroundPlacement();
  return createVector(p.x + p.w * nx, p.y + p.h * ny);
}
function sceneScale() {
  const p = backgroundPlacement();
  return p.w / BG_REFERENCE.width;
}

function drawHeader() {
  const sz = sceneScale();
  const meta = stageMeta(game.stage);
  const elapsed = game.roundStartMs
    ? floor((millis() - game.roundStartMs) / 1000)
    : 0;
  const left = max(0, GAME.durationSec - elapsed);

  const w = 380 * sz;
  const x = width - w - 25 * sz;

  // --- 增加 Tangle 面板高度 (从 90 增加到 100) 以容纳提示文字 ---
  drawTangleBar(x, 25 * sz, w, 100 * sz);

  // --- 下方 Shift 面板位置同步下移 ---
  const h = 158 * sz;
  const y = 135 * sz;

  setShadow(12, "rgba(66,42,22,0.18)");
  stroke(180, 140, 100);
  strokeWeight(3 * sz);
  fill(252, 245, 232, 240);
  rect(x, y, w, h, 22 * sz);
  clearShadow();

  noStroke();
  fill(92, 62, 38);
  textAlign(LEFT, CENTER);
  textSize(20 * sz);
  textStyle(BOLD);
  text("Shift Info", x + 20 * sz, y + 30 * sz);

  textAlign(RIGHT, CENTER);
  textSize(18 * sz);
  text(
    `⏱ ${nf(floor(left / 60), 2)}:${nf(left % 60, 2)}`,
    x + w - 20 * sz,
    y + 30 * sz,
  );

  textAlign(LEFT, TOP);
  textSize(16 * sz);
  text(`${meta.label}`, x + 20 * sz, y + 56 * sz);
  text(
    `Orders: ${game.ordersThisLevel}/${meta.targetOrders ?? "--"}`,
    x + 20 * sz,
    y + 82 * sz,
  );
  text(`Score: ${floor(game.score)}`, x + 20 * sz, y + 108 * sz);

  fill(200, 100, 80);
  text("Stress", x + 180 * sz, y + 60 * sz);
  drawMeter(
    x + 180 * sz,
    y + 85 * sz,
    175 * sz,
    15 * sz,
    game.stress,
    color(200),
    color(200, 50, 50),
  );
}

function drawMeter(x, y, w, h, v, c1, c2) {
  fill(236, 223, 206);
  rect(x, y, w, h, 999);
  fill(lerpColor(c1, c2, v / 100));
  rect(x, y, (w * v) / 100, h, 999);
}

function drawTangleBar(x, y, w, h) {
  const sz = sceneScale();
  setShadow(12, "rgba(66,42,22,0.18)");
  stroke(180, 140, 100);
  strokeWeight(3 * sz);
  fill(252, 245, 232, 240);
  rect(x, y, w, h, 20 * sz);
  clearShadow();

  noStroke();
  fill(92, 62, 38);
  textAlign(LEFT, CENTER);
  textSize(18 * sz);
  textStyle(BOLD);
  text("Tangle", x + 20 * sz, y + 25 * sz);

  textAlign(RIGHT, CENTER);
  textSize(16 * sz);
  textStyle(NORMAL);
  text(`${floor(game.tangleMeter)}%`, x + w - 20 * sz, y + 25 * sz);


  const bx = x + 20 * sz,
    by = y + 42 * sz,
    bw = w - 40 * sz,
    bh = 18 * sz;
  fill(236, 223, 202);
  rect(bx, by, bw, bh, 999);
  const t = game.tangleMeter / 100;
  fill(200, 100, 80);
  rect(bx, by, bw * t, bh, 999);

  fill(120, 90, 70);
  textSize(15 * sz); 
  textAlign(LEFT, CENTER);
  noStroke(); 
  text("80%+ locks one arm | hold R to calm", x + 20 * sz, y + 75 * sz);
}

function drawOrderCard() {
  const sz = sceneScale();
  const stepsCount = game.currentOrder ? game.currentOrder.steps.length + 1 : 1;

  const x = 25 * sz;
  const y = 25 * sz;
  const w = 380 * sz;
  const h = (180 + stepsCount * 45) * sz; 

  setShadow(15, "rgba(66,42,22,0.18)");
  stroke(180, 140, 100);
  strokeWeight(4 * sz);
  fill(252, 245, 232, 240);
  rect(x, y, w, h, 25 * sz);
  clearShadow();

  noStroke();
  fill(100, 70, 50);
  textAlign(LEFT, TOP);
  textSize(22 * sz);
  textStyle(BOLD);
  // 顶部标题 (Y = 25)
  text("Current Order", x + 25 * sz, y + 25 * sz);

  if (!game.currentOrder) return;

  fill(130, 80, 40);
  textSize(38 * sz);
  // 修正：将 Y 坐标改为 58，让它在标题和标签之间完美居中！
  text(game.currentOrder.drink, x + 25 * sz, y + 58 * sz);

  const cmods = getCustomerMods();
  fill(cmods.color[0], cmods.color[1], cmods.color[2]);
  // 底部标签 (Y = 115)
  rect(x + 25 * sz, y + 115 * sz, 140 * sz, 32 * sz, 999);
  fill(255);
  textSize(16 * sz);
  textAlign(CENTER, CENTER);
  text(
    game.currentOrder.customer?.label || "Regular",
    x + 95 * sz,
    y + 131 * sz,
  );

  textAlign(LEFT, TOP);
  const displaySteps = [...game.currentOrder.steps, "serve"];
  for (let i = 0; i < displaySteps.length; i++) {
    const s = displaySteps[i];
    fill(246, 236, 221, 180);
    rect(
      x + 25 * sz,
      y + 165 * sz + i * 50 * sz,
      w - 50 * sz,
      40 * sz,
      15 * sz,
    );

    fill(80, 50, 40);
    textSize(22 * sz);
    textStyle(BOLD);
    text(`${i + 1}. ${labelStep(s)}`, x + 40 * sz, y + 172 * sz + i * 50 * sz);
  }
}

function drawGuidePanel() {
  let msg = "";
  const stage = game.stage ?? 2;
  if (game.state === STATES.IDLE) msg = "Waiting for customer...";
  if (
    game.state === STATES.TUTORIAL_RECOVERY &&
    game.tutorialFinale?.active &&
    game.tutorialFinale.phase === "calm"
  ) {
    msg = "TUTORIAL: HOLD [R] TO LOWER STRESS & TANGLE!";
  }
  if (game.state === STATES.ARM_CONTROL) {
    msg =
      stage === 0
        ? "LEVEL 0: FOLLOW THE TUTORIAL STEPS!"
        : `${stageMeta(stage).label.toUpperCase()}: MAINTAIN YOUR FLOW!`;
  }
  if (game.state === STATES.TANGLED) msg = "OH NO! TANGLED!";
  if (game.state === STATES.UNTANGLE) msg = "MASH [SPACE] TO UNTANGLE!";
  if (game.state === STATES.SERVE_DRINK) msg = "ALL READY! DRAG TO SERVE!";
  if (game.state === STATES.ORDER_COMPLETE) msg = "SUCCESSFULLY SERVED!";

  if (!msg) return;

  const sz = sceneScale();
  
  // 测量文字长度自适应宽度
  textSize(stage === 0 ? 18 * sz : 17 * sz);
  textStyle(BOLD);
  const textW = textWidth(msg);
  const w = textW + (80 * sz); // 增加足够的安全内边距
  
  const h = 55 * sz;
  const x = width * 0.5 - w * 0.5;
  const y = 15 * sz;

  setShadow(12, "rgba(0,0,0,0.12)");
  stroke(180, 140, 100);
  strokeWeight(3 * sz);
  fill(255, 252, 245, 250);
  rect(x, y, w, h, 999);
  clearShadow();

  noStroke();
  fill(90, 60, 40);
  textAlign(CENTER, CENTER);
  text(msg, width * 0.5, y + h * 0.53);
  textStyle(NORMAL);
}

function drawNarrativeFlavor() {
  if (!game.narrativeToast) return;
  if (millis() > game.narrativeToast.untilMs) {
    game.narrativeToast = null;
    return;
  }
  if (game.state === STATES.IDLE || game.state === STATES.GAME_OVER) return;
  const w = min(520, width * 0.52),
    h = 34,
    x = width * 0.5 - w * 0.5;
  // Position just below the octopus
  const octopusY = height * OCTOPUS_Y_FACTOR + 120;
  const y = octopusY + 80;
  setShadow(8, "rgba(66,42,22,0.16)");
  fill(252, 245, 232, 222);
  rect(x, y, w, h, 999);
  clearShadow();
  fill(103, 70, 45);
  textAlign(CENTER, CENTER);
  textSize(13);
  textStyle(BOLD);
  text(game.narrativeToast.text, width * 0.5, y + 18);
  textStyle(NORMAL);
}

function drawTasksUi() {
  for (const step in game.activeTasks) {
    const task = game.activeTasks[step];
    const s = station(step);
    if (!s) continue;
    const sz = sceneScale();

    // 1. 定义统一的框体参数
    const boxW = 185 * sz;
    const boxH = 100 * sz;
    const boxX = s.x - boxW / 2;
    const boxY = s.y - 160 * sz; // 框体顶部位置

    // 绘制指令框边框
    stroke(255, 215, 100, 180);
    strokeWeight(2 * sz);
    fill(65, 45, 35, 240);
    rect(boxX, boxY, boxW, boxH, 18);

    // --- 文字部分：严格无描边，并进行分流处理 ---
    noStroke();
    fill(255, 240, 200);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);

    // 设定文字区域的中心高度 (让文字看起来在框内上下居中)
    const textCenterY = boxY + 33 * sz;

    if (task.type === "alternate") {
      // --- 仅对 ICE / ALTERNATE 进行双行处理 ---
      // 第一行：任务类型 (略微上移)
      textSize(17 * sz);
      text(task.type.toUpperCase(), s.x, textCenterY - 11 * sz);

      // 第二行：按键指令 (略微下移，字号稍小确保安全)
      textSize(15 * sz);
      text(`[${task.keyName}]`, s.x, textCenterY + 11 * sz);
    } else {
      // --- 其他所有站点：恢复正常的单行显示 ---
      textSize(18 * sz);
      text(`${task.type.toUpperCase()} [${task.keyName}]`, s.x, textCenterY);
    }

    // 重置样式给进度条
    textStyle(NORMAL);

    // 2. 进度条位置 (固定在框体下方)
    const barY = boxY + 72 * sz;
    fill(45, 30, 25);
    rect(s.x - 75 * sz, barY, 150 * sz, 16 * sz, 8); // 背景
    fill(255, 220, 80);
    rect(s.x - 75 * sz, barY, 150 * sz * (task.progress / 100), 16 * sz, 8); // 填充

    // 3. 装饰性组件 (Balance/Rhythm)
    if (task.type === "balance") {
      // 游标区位置同步
      const markerY = boxY + 18 * sz;
      fill(40, 25, 20);
      rect(s.x - 75 * sz, barY - 22 * sz, 150 * sz, 10 * sz, 5);
      fill(120, 255, 120, 150);
      rect(
        s.x - 75 * sz + 150 * sz * 0.35,
        barY - 22 * sz,
        150 * sz * 0.3,
        10 * sz,
      );
      fill(255, 100, 80);
      circle(
        s.x - 75 * sz + 150 * sz * (task.marker / 100),
        barY - 17 * sz,
        13 * sz,
      );
    } else if (task.type === "rhythm") {
      const r = map(task.timer, 0, task.beatMs, 35, 0);
      // Draw outer ring showing the beat window
      fill(120, 200, 255, 50);
      circle(s.x, barY - 18 * sz, 45 * sz);
      // Draw main rhythm circle
      fill(255, 230, 100, 150);
      circle(s.x, barY - 18 * sz, r * sz);
      // Draw center target
      fill(100, 255, 100);
      circle(s.x, barY - 18 * sz, 6 * sz);
    }
  }
}

function drawUntangleUi() {
  setShadow(15, "rgba(0,0,0,0.2)");
  fill(255, 255, 255, 245);
  rect(width * 0.39, height * 0.12, width * 0.22, 64, 20);
  clearShadow();
  fill(66, 81, 124);
  textAlign(CENTER, CENTER);
  textSize(15);
  textStyle(BOLD);
  text("Untangle Progress", width * 0.5, height * 0.145);
  textStyle(NORMAL);
  fill(226, 232, 249);
  rect(width * 0.41, height * 0.164, width * 0.18, 14, 999);
  fill(239, 146, 102);
  rect(
    width * 0.41,
    height * 0.164,
    (width * 0.18 * game.untangleProgress) / 100,
    14,
    999,
  );
}

function drawParticles() {
  for (let i = game.particles.length - 1; i >= 0; i--) {
    const p = game.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.03;
    p.life -= 1;
    fill(
      red(p.col),
      green(p.col),
      blue(p.col),
      map(p.life, 0, p.maxLife, 0, 230),
    );
    circle(p.x, p.y, p.size);
    if (p.life <= 0) game.particles.splice(i, 1);
  }
}

function addParticles(x, y, col, count) {
  for (let i = 0; i < count; i++) {
    game.particles.push({
      x,
      y,
      vx: random(-1.5, 1.5),
      vy: random(-2, -0.5),
      size: random(5, 10),
      life: random(25, 45),
      maxLife: 45,
      col,
    });
  }
}

function gameOverPanelRect() {
  const panelW = min(760, width * 0.74);
  const panelH = min(620, height * 0.86);
  const panelX = width * 0.5 - panelW * 0.5;
  const panelY = height * 0.5 - panelH * 0.5;
  return { panelX, panelY, panelW, panelH };
}
function gameOverRestartRect() {
  const { panelY, panelH } = gameOverPanelRect();
  const btnY = panelY + panelH - 76;
  return { x: width * 0.5 - 170, y: btnY, w: 340, h: 48 };
}
function gameOverCycleButtons() {
  const { panelY, panelH } = gameOverPanelRect();
  const y = panelY + panelH - 130;
  const w = 152;
  const h = 34;
  const gap = 12;
  const total = w * 4 + gap * 3;
  const x0 = width * 0.5 - total * 0.5;
  return [
    {
      key: "hats",
      hint: "H",
      label: `Hat: ${labelUnlockValue(profile?.selected?.hat)}`,
      x: x0 + 0 * (w + gap),
      y,
      w,
      h,
    },
    {
      key: "cupSkins",
      hint: "J",
      label: `Cup: ${labelUnlockValue(profile?.selected?.cupSkin)}`,
      x: x0 + 1 * (w + gap),
      y,
      w,
      h,
    },
    {
      key: "stationThemes",
      hint: "K",
      label: `Theme: ${labelUnlockValue(profile?.selected?.stationTheme)}`,
      x: x0 + 2 * (w + gap),
      y,
      w,
      h,
    },
    {
      key: "soundPacks",
      hint: "L",
      label: `Sound: ${labelUnlockValue(profile?.selected?.soundPack)}`,
      x: x0 + 3 * (w + gap),
      y,
      w,
      h,
    },
  ];
}

function drawGameOver() {
  fill(15, 23, 45, 220);
  rect(0, 0, width, height);
  const { panelX, panelY, panelW, panelH } = gameOverPanelRect();
  setShadow(40, "rgba(0,0,0,0.6)");
  fill(255, 255, 255, 248);
  rect(panelX, panelY, panelW, panelH, 24);
  clearShadow();
  fill(235, 242, 255);
  rect(panelX, panelY, panelW, 90, 24, 24, 0, 0);
  const rankScore = finalRankScore();
  const grade = finalGradeFromScore(rankScore);
  const stampScale = constrain(
    map(millis() - game.stateStartMs, 0, 400, 3, 1),
    1,
    3,
  );
  fill(37, 52, 90);
  textAlign(CENTER, CENTER);
  textSize(42);
  textStyle(BOLD);
  text("Shift Complete", width * 0.5, panelY + 48);
  textStyle(NORMAL);
  push();
  translate(width * 0.5, panelY + 140);
  scale(stampScale);
  if (stampScale === 1) setShadow(15, "rgba(0,0,0,0.2)");
  fill(
    grade === "S"
      ? color(255, 215, 0)
      : grade === "A"
        ? color(75, 192, 118)
        : grade === "B"
          ? color(87, 153, 222)
          : color(222, 91, 96),
  );
  ellipse(0, 0, 118, 118);
  fill(255);
  textSize(56);
  textStyle(BOLD);
  text(`${grade}`, 0, 0);
  pop();
  clearShadow();
  const statsY = panelY + 208;
  const statsW = panelW - 64;
  const statsX = panelX + 32;
  fill(246, 250, 255);
  rect(statsX, statsY, statsW, 120, 14);
  fill(37, 52, 90);
  textSize(20);
  textStyle(BOLD);
  text(
    `Highest Level: ${stageMeta(game.levelAtTimeout || game.stage).label} / Level 5   |   Orders: ${game.ordersDone}   |   Final Score: ${floor(game.score)}`,
    width * 0.5,
    statsY + 28,
  );
  textStyle(NORMAL);
  textSize(16);
  fill(90, 110, 150);
  text(
    `Mistakes: ${game.mistakes}   |   Tangles: ${game.tangles}   |   Best Combo: x${game.bestCombo}`,
    width * 0.5,
    statsY + 62,
  );
  const scaleMin = 0;
  const scaleMax = 900;
  const scaleX = statsX + 28;
  const scaleY = statsY + 95;
  const scaleW = statsW - 56;
  const scoreClamped = constrain(rankScore, scaleMin, scaleMax);
  const markerX = map(scoreClamped, scaleMin, scaleMax, scaleX, scaleX + scaleW);
  const thresholds = [0, 360, 560, 760, 900];
  const labels = ["C", "B", "A", "S"];
  const segmentColors = [
    color(222, 91, 96),
    color(87, 153, 222),
    color(75, 192, 118),
    color(255, 215, 0),
  ];
  stroke(214, 223, 240);
  strokeWeight(2);
  noFill();
  rect(scaleX, scaleY - 6, scaleW, 12, 999);
  noStroke();
  for (let i = 0; i < labels.length; i++) {
    const sx = map(thresholds[i], scaleMin, scaleMax, scaleX, scaleX + scaleW);
    const ex = map(
      thresholds[i + 1],
      scaleMin,
      scaleMax,
      scaleX,
      scaleX + scaleW,
    );
    fill(segmentColors[i]);
    rect(sx, scaleY - 6, ex - sx, 12, i === 0 ? 999 : 0, i === 0 ? 999 : 0, i === labels.length - 1 ? 999 : 0, i === labels.length - 1 ? 999 : 0);
    fill(55, 72, 108);
    textSize(11);
    textStyle(BOLD);
    text(labels[i], (sx + ex) * 0.5, scaleY + 17);
  }
  fill(37, 52, 90);
  triangle(markerX, scaleY - 16, markerX - 7, scaleY - 3, markerX + 7, scaleY - 3);
  textSize(12);
  textStyle(NORMAL);
  textAlign(RIGHT, CENTER);
  text(`Rank Score: ${floor(rankScore)}`, statsX + statsW - 12, scaleY - 18);
  textAlign(CENTER, CENTER);
  const progressY = statsY + 138;
  fill(241, 247, 235, 238);
  rect(statsX, progressY, statsW, 146, 14);
  fill(88, 120, 64);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(17);
  text("Progression", statsX + 16, progressY + 12);
  textStyle(NORMAL);
  textSize(14);
  if (profile) {
    fill(70, 92, 134);
    text(
      `Best Run  Score ${profile.bestScore}  |  Orders ${profile.bestOrders}`,
      statsX + 16,
      progressY + 40,
    );
    text(
      `Loadout: ${labelUnlockValue(profile.selected.hat)} | ${labelUnlockValue(profile.selected.cupSkin)} | ${labelUnlockValue(profile.selected.stationTheme)} | ${labelUnlockValue(profile.selected.soundPack)}`,
      statsX + 16,
      progressY + 62,
      statsW - 32,
      40,
    );
  }
  fill(78, 104, 58);
  textStyle(BOLD);
  text("New Unlocks:", statsX + 16, progressY + 92);
  textStyle(NORMAL);
  const unlockText =
    game.newUnlocks && game.newUnlocks.length
      ? game.newUnlocks.join(" | ")
      : "No new unlocks this round.";
  text(unlockText, statsX + 126, progressY + 92, statsW - 142, 42);
  textAlign(CENTER, CENTER);
  const cycleButtons = gameOverCycleButtons();
  for (const b of cycleButtons) {
    const hover =
      mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h;
    fill(hover ? color(221, 234, 250) : color(232, 240, 251));
    rect(b.x, b.y, b.w, b.h, 10);
    fill(67, 89, 124);
    textAlign(CENTER, CENTER);
    textSize(12);
    textStyle(BOLD);
    text(`${b.label}`, b.x + b.w * 0.5, b.y + 14);
    textStyle(NORMAL);
    textSize(11);
    fill(96, 116, 149);
    text(`[${b.hint}]`, b.x + b.w * 0.5, b.y + 25);
  }
  const pulse = sin(millis() * 0.005) * 5;
  setShadow(10, "rgba(87, 153, 222, 0.4)");
  fill(236, 244, 255);
  const restart = gameOverRestartRect();
  rect(
    restart.x - pulse / 2,
    restart.y - pulse / 2,
    restart.w + pulse,
    restart.h + pulse,
    999,
  );
  clearShadow();
  fill(46, 66, 111);
  textSize(16);
  textStyle(BOLD);
  text("SPACE: Restart", width * 0.5, restart.y + 24);
  textSize(13);
  textStyle(NORMAL);
  text(
    "Click buttons above or use H/J/K/L keys",
    width * 0.5,
    panelY + panelH - 22,
  );
  textStyle(NORMAL);
}

function finalRankScore() {
  return floor(game.score);
}

function finalGradeFromScore(score) {
  if (score > 760) return "S";
  if (score > 560) return "A";
  if (score > 360) return "B";
  return "C";
}

function finalGrade() {
  return finalGradeFromScore(finalRankScore());
}

function labelStep(step) {
  if (step === "coffee") return "Coffee";
  if (step === "milk") return "Milk";
  if (step === "ice") return "Ice";
  if (step === "syrup") return "Syrup";
  if (step === "foam") return "Foam";
  if (step === "serve") return "Serve";
  return "";
}

function drawIngredientIcon(step, x, y, size) {
  const cupSkin = profile?.selected?.cupSkin || "classic";
  const cupFill =
    cupSkin === "gold"
      ? color(244, 210, 136)
      : cupSkin === "ceramic"
        ? color(243, 243, 238)
        : color(239, 248, 255);
  const cupLine =
    cupSkin === "gold"
      ? color(160, 100, 30)
      : cupSkin === "ceramic"
        ? color(100, 110, 130)
        : color(60, 100, 160);

  push();
  translate(x, y);

  // 为所有图标开启加粗描边，增加可见度
  strokeJoin(ROUND);

  if (step === "coffee") {
    stroke(cupLine);
    strokeWeight(size * 0.08);
    fill(cupFill);
    beginShape();
    vertex(-size * 0.38, -size * 0.35);
    vertex(size * 0.38, -size * 0.35);
    vertex(size * 0.28, size * 0.45);
    vertex(-size * 0.28, size * 0.45);
    endShape(CLOSE);
    noStroke();
    fill(60, 35, 20);
    ellipse(0, -size * 0.35, size * 0.72, size * 0.22);
  } else if (step === "milk") {
    stroke(100, 140, 180);
    strokeWeight(size * 0.08);
    fill(250, 252, 255);
    rect(-size * 0.25, -size * 0.35, size * 0.5, size * 0.7, 8);
    noStroke();
    fill(180, 220, 250);
    rect(-size * 0.25, size * 0.1, size * 0.5, size * 0.25, 0, 0, 8, 8);
  } else if (step === "ice") {
    stroke(40, 120, 180);
    strokeWeight(size * 0.08);
    fill(120, 220, 255);
    rect(-size * 0.3, -size * 0.3, size * 0.35, size * 0.35, 5);
    rect(0, 0, size * 0.35, size * 0.35, 5);
  } else if (step === "syrup") {
    stroke(100, 50, 20);
    strokeWeight(size * 0.08);
    fill(180, 90, 40);
    rect(-size * 0.2, -size * 0.3, size * 0.4, size * 0.65, 8);
    fill(255, 180, 100);
    noStroke();
    rect(-size * 0.15, -size * 0.45, size * 0.3, size * 0.15, 4);
  } else if (step === "foam") {
    stroke(cupLine);
    strokeWeight(size * 0.06);
    fill(cupFill);
    ellipse(0, size * 0.15, size * 0.75, size * 0.5);
    noStroke();
    fill(255); // 纯白奶泡
    ellipse(0, -size * 0.1, size * 0.65, size * 0.45);
    ellipse(-size * 0.2, 0, size * 0.4, size * 0.35);
    ellipse(size * 0.2, 0, size * 0.4, size * 0.35);
  } else if (step === "serve") {
    stroke(80, 120, 80);
    strokeWeight(size * 0.08);
    fill(120, 180, 120);
    rect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.7, 8);
    noStroke();
    fill(255, 250, 240);
    rect(-size * 0.18, -size * 0.15, size * 0.36, size * 0.06, 2);
    rect(-size * 0.18, 0, size * 0.36, size * 0.06, 2);
    rect(-size * 0.18, size * 0.15, size * 0.36, size * 0.06, 2);
  }
  pop();
}

<<<<<<< HEAD
function maybeOpenLevelOneGuide(step) {
  if (!step) return;
  if (game.seenGuides?.[step]) return;
  game.seenGuides[step] = true;
  game.guidePopup = { open: true, step, openedMs: millis() };
  
}

function levelOneGuideContent(step) {
  if (step === "coffee") {
    return {
      title: "Coffee Challenge",
      lines: [
        "Drag one arm to the Coffee station.",
        "Hold [E] continuously to fill the bar.",
        "If you release [E], progress can drop.",
      ],
    };
  }
  if (step === "milk") {
    return {
      title: "Milk Challenge",
      lines: [
        "Drag one arm to the Milk station.",
        "Tap [T] repeatedly (do not hold).",
        "Keep tapping so the bar does not drain.",
      ],
    };
  }
  if (step === "foam") {
    return {
      title: "Foam Challenge (Detailed)",
      lines: [
        "Drag one arm to the Foam station.",
        "Press [H] to push the marker upward.",
        "Goal: keep marker inside GREEN zone while bar fills.",
        "If marker falls too low/high, progress slows or drops.",
      ],
    };
  }
  if (step === "ice") {
    return {
      title: "Ice Challenge",
      lines: [
        "Drag one arm to the Ice station.",
        "Alternate [X] then [C], then [X], then [C].",
        "Pressing the same key twice gives less progress.",
      ],
    };
  }
  if (step === "syrup") {
    return {
      title: "Syrup Challenge (Detailed)",
      lines: [
        "Drag one arm to the Syrup station.",
        "Watch the rhythm pulse/circle timing.",
        "Press [SPACE] right on the beat moment.",
        "Early/late presses reduce progress; accurate timing fills fast.",
      ],
    };
  }
  if (step === "serve") {
    return {
      title: "Serve Step",
      lines: [
        "All tasks are done.",
        "Drag any free arm to the Serve station.",
        "That submits the drink and completes the order.",
      ],
    };
  }
  if (step === "tutorial_calm") {
    return {
      title: "Stress Recovery",
      lines: [
        "Tutorial orders are done. Now the bar gets chaotic on purpose.",
        "Stress and Tangle are both rising. Do not start anything else yet.",
        "Hold [R] to calm down and bring both meters back under control.",
        "Keep holding until the warning pressure drops and the next lesson begins.",
      ],
    };
  }
  if (step === "tutorial_untangle") {
    return {
      title: "Untangle Drill",
      lines: [
        "The knot has fully triggered and one arm is locked.",
        "Spam [SPACE] to fill the Untangle Progress bar as fast as you can.",
        "Once the knot breaks, the tutorial is complete and Level 1 unlocks.",
      ],
    };
  }
  return {
    title: "Tutorial Step",
    lines: ["Follow the station instruction to complete this step."],
  };
}

function challengeGuideRect() {
  const w = min(820, width * 0.72);
  const h = min(400, height * 0.54);
  const x = width * 0.5 - w * 0.5;
  const y = height * 0.5 - h * 0.5;
  return { x, y, w, h };
}

function guideCloseButtonRect() {
  const p = challengeGuideRect();
  return { x: p.x + p.w - 128, y: p.y + p.h - 52, w: 104, h: 34 };
}

function drawChallengeGuidePopup() {
  if (!game.guidePopup?.open) return;
  const p = challengeGuideRect();
  const c = levelOneGuideContent(game.guidePopup.step);

  setShadow(24, "rgba(0,0,0,0.35)");
  fill(255, 252, 246, 252);
  stroke(179, 144, 103);
  strokeWeight(3);
  rect(p.x, p.y, p.w, p.h, 22);
  clearShadow();

  const headerGrad = drawingContext.createLinearGradient(p.x, p.y, p.x + p.w, p.y);
  headerGrad.addColorStop(0, "#F3E4C9");
  headerGrad.addColorStop(1, "#E9D5B4");
  drawingContext.fillStyle = headerGrad;
  noStroke();
  rect(p.x, p.y, p.w, 58, 22, 22, 0, 0);

  fill(90, 60, 40);
  textAlign(LEFT, CENTER);
  textSize(35);
  textStyle(BOLD);
  text(c.title, p.x + 22, p.y + 29);

  fill(118, 86, 58);
  textSize(20);
  textStyle(NORMAL);
  textAlign(RIGHT, CENTER); // 将 Tutorial Tip 改为右对齐
  text(stageMeta(game.stage).guideLabel, p.x + p.w - 24, p.y + 29); // 贴靠右侧边框

  fill(82, 58, 41);
  textAlign(LEFT, TOP);
  textSize(25);
  textStyle(BOLD);
  text("How to do this step:", p.x + 24, p.y + 76);

  textStyle(NORMAL);
  textSize(21);
  let y = p.y + 115; // 统一标题与内容 “1.” 的行间距
  for (let i = 0; i < c.lines.length; i++) {
    text(`${i + 1}. ${c.lines[i]}`, p.x + 28, y, p.w - 56, 66);
    y += 50;
  }

  const b = guideCloseButtonRect();
  const hover = mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h;
  fill(hover ? color(115, 185, 118) : color(98, 170, 104));
  rect(b.x, b.y, b.w, b.h, 10);
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(19);
  text("Got it", b.x + b.w * 0.5, b.y + b.h * 0.52);

  fill(122, 90, 62);
  textStyle(NORMAL);
  textSize(15);
  text("Press ENTER / SPACE / ESC / C to close", p.x + p.w * 0.5, p.y + p.h - 14);
}

function closeChallengeGuide() {
  if (!game.guidePopup) return;
  game.guidePopup.open = false;
  game.guidePopup.step = null;
}
=======
function drawChallengeGuidePopup() {} // Not used in multitask
function closeChallengeGuide() {}
>>>>>>> parent of 23cdb8e (Update sketch.js)
