const GAME = {
  width: 1280,
  height: 720,
  durationSec: 120,
  targetOrders: 8,
};

const STATES = {
  IDLE: "IDLE",
  NEW_ORDER: "NEW_ORDER",
  ARM_SELECTION: "ARM_SELECTION",
  ARM_CONTROL: "ARM_CONTROL",
  STEP_CHALLENGE: "STEP_CHALLENGE",
  STEP_SUCCESS: "STEP_SUCCESS",
  TANGLED: "TANGLED",
  UNTANGLE: "UNTANGLE",
  SERVE_DRINK: "SERVE_DRINK",
  ORDER_COMPLETE: "ORDER_COMPLETE",
  GAME_OVER: "GAME_OVER",
};

const RECIPES = {
  Americano: ["coffee", "coffee"],
  Latte: ["coffee", "milk", "foam"],
  "Iced Latte": ["coffee", "syrup", "milk", "ice"],
  Mocha: ["coffee", "syrup", "milk", "foam"],
  "Iced Mocha": ["coffee", "syrup", "milk", "ice", "foam"],
};

const STATION_NAMES = ["coffee", "milk", "ice", "syrup", "foam", "serve"];

const ARM_KEYS = {
  W: "topRight",
  A: "topLeft",
  S: "bottomLeft",
  D: "bottomRight",
};

let game;
let octopusImage;

function preload() {
  octopusImage = loadImage(
    "Assets/octopus defult state.jpg",
    () => {},
    () => {
      octopusImage = null;
    },
  );
}

function setup() {
  const cnv = createCanvas(GAME.width, GAME.height);
  cnv.parent("app");
  textFont("Avenir Next");
  resetGame();
}

function resetGame() {
  game = {
    state: STATES.IDLE,
    stateStartMs: millis(),
    roundStartMs: null,

    currentOrder: null,
    stepIndex: 0,

    selectedArm: null,
    lockedArm: null,
    selectedChanges: [],

    armTip: createVector(width * 0.5, height * 0.45),
    hoverStation: null,
    hoverSince: 0,

    challenge: null,

    tangleMeter: 0,
    stress: 15,

    score: 0,
    mistakes: 0,
    tangles: 0,
    ordersDone: 0,
    wrongStationHits: 0,
    armSwitches: 0,
    combo: 0,
    bestCombo: 0,

    noInputSince: millis(),
    untangleProgress: 0,

    lastStation: null,
    lastStationMs: 0,

    particles: [],
  };
}

function draw() {
  updateGlobalMeters();
  updateState();

  drawBackdrop();
  drawScene();
  drawStations();
  drawArms();
  drawOctopus();

  drawHeader();
  drawOrderCard();
  drawQueuePanel();
  drawGuidePanel();

  drawParticles();

  if (game.state === STATES.IDLE) drawStartOverlay();
  if (game.state === STATES.STEP_CHALLENGE) drawChallengeUi();
  if (game.state === STATES.UNTANGLE || game.state === STATES.TANGLED)
    drawUntangleUi();
  if (game.state === STATES.GAME_OVER) drawGameOver();
}

function startButtonRect() {
  return {
    x: width * 0.43,
    y: height * 0.62,
    w: width * 0.14,
    h: 48,
  };
}

function drawStartOverlay() {
  fill(19, 30, 58, 170);
  rect(0, 0, width, height);

  fill(255);
  rect(width * 0.22, height * 0.16, width * 0.56, height * 0.62, 18);

  fill(33, 51, 92);
  textAlign(CENTER, TOP);
  textSize(40);
  text("Octopus Barista", width * 0.5, height * 0.22);

  textSize(18);
  text(
    "You know the recipe, but your body won't cooperate.",
    width * 0.5,
    height * 0.30,
  );

  textSize(16);
  textAlign(LEFT, TOP);
  text("W A S D : Select tentacle", width * 0.3, height * 0.39);
  text("Mouse : Aim tentacle", width * 0.3, height * 0.43);
  text("SPACE : Challenge input / Untangle", width * 0.3, height * 0.47);
  text("R : Calm tangle meter", width * 0.3, height * 0.51);

  const b = startButtonRect();
  const hover = mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h;
  fill(hover ? color(96, 175, 120) : color(87, 153, 222));
  rect(b.x, b.y, b.w, b.h, 999);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20);
  text("Start Shift", b.x + b.w * 0.5, b.y + b.h * 0.5);
}

function updateGlobalMeters() {
  if (game.state === STATES.GAME_OVER) return;

  const dt = deltaTime / 1000;

  if (
    millis() - game.noInputSince > 1000 &&
    game.state !== STATES.STEP_CHALLENGE
  ) {
    game.tangleMeter = max(0, game.tangleMeter - 20 * dt);
  }

  if (keyIsDown(82)) {
    game.tangleMeter = max(0, game.tangleMeter - 34 * dt);
  }

  game.stress = constrain(game.stress - 3.5 * dt, 0, 100);

  const elapsed = game.roundStartMs ? (millis() - game.roundStartMs) / 1000 : 0;
  if (game.roundStartMs && (elapsed >= GAME.durationSec || game.ordersDone >= GAME.targetOrders)) {
    game.state = STATES.GAME_OVER;
  }

  if (game.tangleMeter >= 80 && !game.lockedArm) {
    const arms = ["topLeft", "topRight", "bottomLeft", "bottomRight"];
    game.lockedArm = random(arms);
    if (game.selectedArm === game.lockedArm) game.selectedArm = null;
  }
  if (game.tangleMeter < 60 && game.state !== STATES.TANGLED && game.state !== STATES.UNTANGLE) {
    game.lockedArm = null;
  }
}

function updateState() {
  switch (game.state) {
    case STATES.IDLE:
      break;

    case STATES.NEW_ORDER:
      createOrder();
      game.state = STATES.ARM_SELECTION;
      game.stateStartMs = millis();
      break;

    case STATES.ARM_SELECTION:
      if (game.selectedArm) {
        game.state = STATES.ARM_CONTROL;
        game.stateStartMs = millis();
      }
      break;

    case STATES.ARM_CONTROL:
      updateArmReach();
      break;

    case STATES.STEP_CHALLENGE:
      updateChallenge();
      break;

    case STATES.STEP_SUCCESS:
      if (millis() - game.stateStartMs > 350) {
        if (game.stepIndex >= game.currentOrder.steps.length) {
          game.selectedArm = null;
          game.state = STATES.SERVE_DRINK;
        } else {
          game.state = STATES.ARM_SELECTION;
        }
        game.stateStartMs = millis();
      }
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
      if (game.selectedArm) updateArmReach();
      break;

    case STATES.ORDER_COMPLETE:
      if (millis() - game.stateStartMs > 900) {
        game.state = STATES.NEW_ORDER;
        game.stateStartMs = millis();
      }
      break;
  }
}

function createOrder() {
  const elapsed = game.roundStartMs ? (millis() - game.roundStartMs) / 1000 : 0;
  let pool;

  if (elapsed < 25) pool = ["Americano", "Latte"];
  else if (elapsed < 70) pool = ["Americano", "Latte", "Iced Latte"];
  else pool = ["Americano", "Latte", "Iced Latte", "Mocha", "Iced Mocha"];

  const drink = random(pool);
  game.currentOrder = {
    drink,
    steps: [...RECIPES[drink]],
    createdMs: millis(),
    startTangles: game.tangles,
    startWrongHits: game.wrongStationHits,
    startArmSwitches: game.armSwitches,
  };
  game.stepIndex = 0;
  game.selectedArm = null;
  game.challenge = null;
  game.hoverStation = null;
}

function currentStep() {
  if (!game.currentOrder) return null;
  return game.currentOrder.steps[game.stepIndex] || null;
}

function requiredStation() {
  if (game.state === STATES.SERVE_DRINK) return "serve";
  return currentStep();
}

function updateArmReach() {
  const base = armBase(game.selectedArm);
  const desired = createVector(mouseX, mouseY).sub(base);
  desired.limit(340);
  const target = p5.Vector.add(base, desired);
  game.armTip.lerp(target, 0.25);

  const required = requiredStation();
  if (!required) return;

  let touched = null;
  for (const name of STATION_NAMES) {
    const s = station(name);
    if (dist(game.armTip.x, game.armTip.y, s.x, s.y) <= s.r + 8) {
      touched = name;
      break;
    }
  }

  if (!touched) {
    game.hoverStation = null;
    return;
  }

  if (touched !== game.hoverStation) {
    game.hoverStation = touched;
    game.hoverSince = millis();
    return;
  }

  if (millis() - game.hoverSince < 220) return;

  if (touched === required) {
    if (game.state === STATES.SERVE_DRINK) {
      completeServeDrink();
    } else {
      beginChallenge(touched);
    }
  } else {
    game.mistakes += 1;
    game.wrongStationHits += 1;
    game.combo = 0;
    game.score = max(0, game.score - 5);
    addTangle(touched, 8);
    addParticles(
      station(touched).x,
      station(touched).y,
      color(246, 149, 128),
      8,
    );
    game.hoverStation = null;
  }
}

function addTangle(stationName, base) {
  let gain = base;
  const now = millis();

  if (stationName === game.lastStation) gain += 10;
  if (
    game.lastStation &&
    stationName !== game.lastStation &&
    now - game.lastStationMs < 2000
  )
    gain += 15;
  if (game.stress > 70) gain *= 1.2;

  game.tangleMeter = constrain(game.tangleMeter + gain, 0, 100);
  game.stress = constrain(game.stress + 7, 0, 100);

  game.lastStation = stationName;
  game.lastStationMs = now;
}

function beginChallenge(step) {
  const lag = actionLag();

  if (step === "coffee") {
    game.challenge = {
      type: "timing",
      cursor: 0,
      dir: 1,
      zoneStart: random(0.25, 0.55),
      zoneWidth: 0.28,
      speed: 0.95 - lag * 0.22,
      timeoutMs: millis() + 2200,
    };
  } else if (step === "milk") {
    game.challenge = {
      type: "hold",
      marker: 0.5,
      hold: 0,
      needHold: 0.8 + lag * 0.2,
      timer: 0,
      maxTime: 2.2,
    };
  } else if (step === "ice") {
    game.challenge = {
      type: "rhythm",
      beatsHit: 0,
      beatsNeed: 2,
      nextBeat: millis() + 550,
      beatWindow: 220 + lag * 40,
      misses: 0,
      timeoutMs: millis() + 2200,
    };
  } else if (step === "syrup") {
    game.challenge = {
      type: "timing",
      cursor: 0,
      dir: 1,
      zoneStart: random(0.3, 0.58),
      zoneWidth: 0.22,
      speed: 1.05 - lag * 0.2,
      timeoutMs: millis() + 2100,
    };
  } else if (step === "foam") {
    game.challenge = {
      type: "hold",
      marker: 0.5,
      hold: 0,
      needHold: 0.95 + lag * 0.2,
      timer: 0,
      maxTime: 2.1,
    };
  } else {
    game.challenge = {
      type: "tap",
      taps: 0,
      need: 2,
      timeoutMs: millis() + 1800,
    };
  }

  addTangle(step, 5);
  game.state = STATES.STEP_CHALLENGE;
  game.stateStartMs = millis();
  game.hoverStation = null;
}

function updateChallenge() {
  const c = game.challenge;
  if (!c) return;
  const dt = deltaTime / 1000;

  if (c.type === "timing") {
    c.cursor += c.dir * c.speed * dt;
    if (c.cursor >= 1) {
      c.cursor = 1;
      c.dir = -1;
    }
    if (c.cursor <= 0) {
      c.cursor = 0;
      c.dir = 1;
    }
    if (millis() > c.timeoutMs) failStep();
  }

  if (c.type === "hold") {
    c.timer += dt;
    c.marker = 0.5 + sin(millis() * (0.004 + game.stress * 0.00003)) * 0.35;
    const safe = c.marker > 0.34 && c.marker < 0.66;
    if (mouseIsPressed && safe) c.hold += dt;
    else c.hold = max(0, c.hold - 0.5 * dt);

    if (c.hold >= c.needHold) successStep();
    if (c.timer > c.maxTime) failStep();
  }

  if (c.type === "rhythm") {
    if (millis() > c.timeoutMs) failStep();
    if (millis() - c.nextBeat > c.beatWindow) {
      c.misses += 1;
      c.nextBeat = millis() + 550;
      if (c.misses >= 2) failStep();
    }
  }

  if (c.type === "tap") {
    if (c.taps >= c.need) successStep();
    if (millis() > c.timeoutMs) failStep();
  }
}

function successStep() {
  const waitSec = (millis() - game.currentOrder.createdMs) / 1000;
  const base = 45;
  const speedBonus = max(0, 24 - waitSec * 0.9);
  const precisionPenalty = game.mistakes * 1.1;

  game.combo += 1;
  game.bestCombo = max(game.bestCombo, game.combo);
  const comboBonus = min(30, (game.combo - 1) * 4);
  game.score += floor(base + speedBonus - precisionPenalty + comboBonus);
  game.stepIndex += 1;
  game.selectedArm = null;
  game.challenge = null;
  game.state = STATES.STEP_SUCCESS;
  game.stateStartMs = millis();
}

function completeServeDrink() {
  const timeTaken = (millis() - game.currentOrder.createdMs) / 1000;
  const tangleDelta = game.tangles - game.currentOrder.startTangles;
  const wrongDelta = game.wrongStationHits - game.currentOrder.startWrongHits;
  const armDelta = game.armSwitches - game.currentOrder.startArmSwitches;
  const efficiencyPenalty = max(0, armDelta - (game.currentOrder.steps.length + 1));

  const serveScore = floor(
    100 - timeTaken * 1.8 - tangleDelta * 10 - wrongDelta * 2 - efficiencyPenalty,
  );
  const rushBonus = timeTaken < 17 ? 20 : 0;
  game.score += max(25, serveScore) + rushBonus;
  game.ordersDone += 1;
  game.combo += 1;
  game.bestCombo = max(game.bestCombo, game.combo);

  addParticles(station("serve").x, station("serve").y, color(115, 210, 145), 18);
  game.state = STATES.ORDER_COMPLETE;
  game.stateStartMs = millis();
}

function failStep() {
  game.tangles += 1;
  game.mistakes += 1;
  game.score = max(0, game.score - 18);
  game.challenge = null;
  game.combo = 0;
  game.untangleProgress = 0;
  game.state = STATES.TANGLED;
  game.stateStartMs = millis();
  game.tangleMeter = constrain(game.tangleMeter + 20, 0, 100);
  game.stress = constrain(game.stress + 14, 0, 100);
}

function updateUntangleState() {
  const dt = deltaTime / 1000;
  game.untangleProgress = max(0, game.untangleProgress - 10 * dt);
  if (game.untangleProgress >= 100) {
    game.tangleMeter = max(0, game.tangleMeter - 48);
    game.lockedArm = null;
    game.selectedArm = null;
    game.state = STATES.ARM_SELECTION;
    game.stateStartMs = millis();
  }
}

function actionLag() {
  if (game.tangleMeter >= 80) return 0.6;
  if (game.tangleMeter >= 50) return 0.3;
  return 0.1;
}

function keyPressed() {
  game.noInputSince = millis();

  if (game.state === STATES.IDLE && (key === " " || keyCode === ENTER)) {
    game.roundStartMs = millis();
    game.state = STATES.NEW_ORDER;
    game.stateStartMs = millis();
    return false;
  }

  if (game.state === STATES.GAME_OVER && key === " ") {
    resetGame();
    return false;
  }

  if (
    game.state === STATES.ARM_SELECTION ||
    game.state === STATES.ARM_CONTROL ||
    game.state === STATES.SERVE_DRINK
  ) {
    const k = key.toUpperCase();
    if (ARM_KEYS[k]) {
      const arm = ARM_KEYS[k];
      if (arm !== game.lockedArm) {
        game.selectedArm = arm;
        game.armTip = armBase(arm).copy();
        registerArmChange();
      }
      return false;
    }
    if (k === "X") {
      game.selectedArm = null;
      game.state = STATES.ARM_SELECTION;
      game.score = max(0, game.score - 4);
      return false;
    }
  }

  if (game.state === STATES.STEP_CHALLENGE) {
    const c = game.challenge;
    if (!c) return false;

    if (c.type === "timing" && key === " ") {
      const inZone =
        c.cursor >= c.zoneStart && c.cursor <= c.zoneStart + c.zoneWidth;
      if (inZone) successStep();
      else failStep();
      return false;
    }

    if (c.type === "rhythm" && key === " ") {
      const d = abs(millis() - c.nextBeat);
      if (d <= c.beatWindow) {
        c.beatsHit += 1;
        c.nextBeat = millis() + 550;
        if (c.beatsHit >= c.beatsNeed) successStep();
      } else {
        c.misses += 1;
        if (c.misses >= 2) failStep();
      }
      return false;
    }

    if (c.type === "tap" && (key === " " || key.toUpperCase() === "E")) {
      c.taps += 1;
      return false;
    }
  }

  if ((game.state === STATES.TANGLED || game.state === STATES.UNTANGLE) && key === " ") {
    game.untangleProgress += 14;
    return false;
  }

  return false;
}

function mousePressed() {
  game.noInputSince = millis();
  if (game.state === STATES.IDLE) {
    const b = startButtonRect();
    if (
      mouseX > b.x &&
      mouseX < b.x + b.w &&
      mouseY > b.y &&
      mouseY < b.y + b.h
    ) {
      game.roundStartMs = millis();
      game.state = STATES.NEW_ORDER;
      game.stateStartMs = millis();
    }
  }
}

function registerArmChange() {
  game.armSwitches += 1;
  const now = millis();
  game.selectedChanges.push(now);
  game.selectedChanges = game.selectedChanges.filter((t) => now - t < 1000);

  if (game.selectedChanges.length >= 4) {
    game.selectedChanges = [];
    // Queue slip as a soft penalty, without changing recipe order.
    game.stress = constrain(game.stress + 8, 0, 100);
    game.tangleMeter = constrain(game.tangleMeter + 6, 0, 100);
    addParticles(width - 150, height - 155, color(255, 157, 107), 10);
  }
}

function station(name) {
  const y = height * 0.57;
  const map = {
    coffee: { x: width * 0.17, y, r: 56, label: "Coffee" },
    milk: { x: width * 0.33, y, r: 56, label: "Milk" },
    ice: { x: width * 0.49, y, r: 56, label: "Ice" },
    syrup: { x: width * 0.65, y, r: 56, label: "Syrup" },
    foam: { x: width * 0.81, y, r: 56, label: "Foam" },
    serve: { x: width * 0.9, y: y - 120, r: 58, label: "Serve" },
  };
  return map[name];
}

function armBase(arm) {
  const x = width * 0.5;
  const y = height * 0.44;
  const map = {
    topLeft: createVector(x - 64, y - 15),
    topRight: createVector(x + 64, y - 15),
    bottomLeft: createVector(x - 78, y + 34),
    bottomRight: createVector(x + 78, y + 34),
  };
  return map[arm] || createVector(x, y);
}

function drawBackdrop() {
  for (let y = 0; y < height; y += 2) {
    const t = y / height;
    const c = lerpColor(color(255, 245, 221), color(221, 239, 255), t);
    stroke(c);
    line(0, y, width, y);
  }
  noStroke();

  // Dyspraxia cognitive load lines under stress/tangle.
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

function drawScene() {
  const cy = height * 0.62;

  fill(205, 148, 106);
  rect(80, cy, width - 160, 120, 12);

  fill(230, 178, 128);
  rect(70, cy - 28, width - 140, 34, 12);

  drawLamp(width * 0.2, 58);
  drawLamp(width * 0.5, 58);
  drawLamp(width * 0.8, 58);
}

function drawLamp(x, y) {
  fill(255, 238, 189, 125);
  ellipse(x, y + 38, 150, 95);
  fill(255, 225, 158);
  circle(x, y, 16);
}

function drawStations() {
  const req = requiredStation();

  for (const name of STATION_NAMES) {
    const s = station(name);
    const required = name === req;
    const touched =
      name === game.hoverStation &&
      (game.state === STATES.ARM_CONTROL || game.state === STATES.SERVE_DRINK);

    fill(required ? color(168, 230, 188) : color(216, 231, 251));
    if (touched) fill(255, 233, 180);
    rect(s.x - 60, s.y - 52, 120, 100, 16);

    fill(name === "serve" ? color(95, 180, 118) : color(113, 140, 201));
    circle(s.x + 36, s.y - 32, 18);

    drawIngredientIcon(name, s.x - 2, s.y - 8, 34);

    textSize(14);
    fill(30, 44, 78);
    text(s.label, s.x, s.y + 52);

    if (required) {
      noFill();
      stroke(90, 189, 126);
      strokeWeight(3);
      circle(s.x, s.y - 2, 134);
      noStroke();
    }
  }
}

function drawArms() {
  const arms = ["topLeft", "topRight", "bottomLeft", "bottomRight"];
  const level =
    game.tangleMeter >= 80
      ? "full"
      : game.tangleMeter >= 50
        ? "half"
        : "normal";

  for (const arm of arms) {
    const base = armBase(arm);
    let tip = defaultArmTip(arm);

    if (arm === game.selectedArm && game.state === STATES.ARM_CONTROL) {
      tip = game.armTip.copy();
    }

    let armColor = color(145, 187, 245);
    if (level === "half") armColor = color(242, 165, 114);
    if (level === "full") armColor = color(129, 92, 133);
    if (arm === game.lockedArm)
      armColor = lerpColor(armColor, color(70, 42, 79), 0.55);

    stroke(58, 82, 153, 160);
    strokeWeight(30);
    noFill();
    const kx = (base.x + tip.x) * 0.5;
    const ky =
      (base.y + tip.y) * 0.5 +
      sin(millis() * 0.005 + base.x * 0.01) *
        (level === "full" ? 24 : level === "half" ? 16 : 8);
    bezier(base.x, base.y, kx, ky, kx, ky, tip.x, tip.y);

    stroke(armColor);
    strokeWeight(24);
    bezier(base.x, base.y, kx, ky, kx, ky, tip.x, tip.y);

    noStroke();
    fill(236, 241, 255, 165);
    circle(base.x, base.y, 10);
  }
}

function drawOctopus() {
  const x = width * 0.5;
  const y = height * 0.43;
  const mode =
    game.state === STATES.TANGLED ||
    game.state === STATES.UNTANGLE ||
    game.tangleMeter >= 80
      ? "full"
      : game.tangleMeter >= 50
        ? "half"
        : "normal";

  // Use asset image when in normal/calm state
  if (mode === "normal" && octopusImage) {
    push();
    imageMode(CENTER);
    // Scale image to fit nicely in the scene
    const scale = 0.35;
    image(
      octopusImage,
      x,
      y + 10,
      octopusImage.width * scale,
      octopusImage.height * scale,
    );
    pop();
    return;
  }

  // Dome body with jelly gradient when stressed or tangled.
  const topCol =
    mode === "full"
      ? color(144, 117, 179)
      : mode === "half"
        ? color(183, 163, 242)
        : color(186, 180, 244);
  const botCol =
    mode === "full"
      ? color(124, 170, 226)
      : mode === "half"
        ? color(125, 205, 251)
        : color(124, 215, 255);

  for (let r = 160; r > 0; r -= 2) {
    const t = r / 160;
    const c = lerpColor(botCol, topCol, t);
    fill(c);
    ellipse(x, y - 12, r * 1.1, r);
  }

  // Removed the extra 6 bottom feet; only active gameplay arms are shown.

  // Outline around body.
  noFill();
  stroke(62, 80, 169);
  strokeWeight(5);
  ellipse(x, y - 12, 176, 160);
  noStroke();

  // Big glossy highlight.
  fill(255, 255, 255, 205);
  ellipse(x - 45, y - 62, 70, 45);
  fill(255, 255, 255, 88);
  ellipse(x + 56, y - 74, 16, 12);
  ellipse(x + 83, y - 52, 20, 14);

  drawFace(x, y, mode);
}

function drawFace(x, y, mode) {
  if (mode === "full") {
    drawSpiralEye(x - 30, y - 2);
    drawSpiralEye(x + 30, y - 2);
    fill(56, 66, 128);
    ellipse(x, y + 27, 22, 8);
    return;
  }

  fill(46, 61, 136);
  ellipse(x - 30, y - 2, 27, 34);
  ellipse(x + 30, y - 2, 27, 34);
  fill(255);
  ellipse(x - 34, y - 7, 7, 7);
  ellipse(x + 26, y - 7, 7, 7);

  noFill();
  stroke(74, 103, 175);
  strokeWeight(4);
  arc(x, y + 26, 38, 20, 0.2, PI - 0.2);
  noStroke();

  if (mode === "half") {
    stroke(67, 88, 158);
    strokeWeight(3);
    line(x - 44, y - 24, x - 20, y - 18);
    line(x + 44, y - 24, x + 20, y - 18);
    noStroke();
  }
}

function drawSpiralEye(x, y) {
  noFill();
  stroke(58, 35, 93);
  strokeWeight(3);
  beginShape();
  for (let a = 0; a < TWO_PI * 2.1; a += 0.18) {
    const r = map(a, 0, TWO_PI * 2.1, 2, 12);
    vertex(x + cos(a) * r, y + sin(a) * r);
  }
  endShape();
  noStroke();
}

function defaultArmTip(arm) {
  const x = width * 0.5;
  const y = height * 0.43;
  const t = millis() * 0.002;

  if (arm === "topLeft")
    return createVector(x - 152 + sin(t) * 14, y - 70 + cos(t * 1.2) * 8);
  if (arm === "topRight")
    return createVector(x + 152 + cos(t * 1.1) * 14, y - 70 + sin(t * 0.9) * 8);
  if (arm === "bottomLeft")
    return createVector(x - 170 + sin(t * 1.3) * 15, y + 64 + cos(t) * 7);
  return createVector(x + 170 + cos(t * 1.15) * 15, y + 64 + sin(t) * 7);
}

function drawHeader() {
  const elapsed = game.roundStartMs
    ? floor((millis() - game.roundStartMs) / 1000)
    : 0;
  const left = max(0, GAME.durationSec - elapsed);

  fill(255, 255, 255, 212);
  rect(20, 16, 415, 120, 15);

  fill(33, 50, 93);
  textAlign(LEFT, TOP);
  textSize(20);
  text("Octopus Dyspraxia Coffee", 34, 28);

  textSize(14);
  text(
    `Time ${nf(floor(left / 60), 2)}:${nf(left % 60, 2)}   Orders ${game.ordersDone}/${GAME.targetOrders}`,
    34,
    58,
  );
  text(
    `Score ${floor(game.score)}   Mistakes ${game.mistakes}   Tangles ${game.tangles}`,
    34,
    80,
  );
  text(`Combo x${game.combo}   Best x${game.bestCombo}`, 34, 94);

  drawMeter(
    34,
    118,
    150,
    11,
    game.stress,
    color(112, 195, 142),
    color(247, 154, 97),
  );
  fill(33, 50, 93);
  text("Stress", 191, 111);

  drawTangleBar(width - 450, 16, 430, 120);
}

function drawMeter(x, y, w, h, v, c1, c2) {
  fill(226, 234, 251);
  rect(x, y, w, h, 999);
  fill(lerpColor(c1, c2, v / 100));
  rect(x, y, (w * v) / 100, h, 999);
}

function drawTangleBar(x, y, w, h) {
  fill(255, 255, 255, 212);
  rect(x, y, w, h, 15);

  fill(35, 52, 95);
  textAlign(LEFT, TOP);
  textSize(18);
  text("TangleMeter", x + 14, y + 10);

  const bx = x + 15;
  const by = y + 47;
  const bw = w - 30;
  const bh = 18;

  fill(227, 235, 251);
  rect(bx, by, bw, bh, 999);

  const t = game.tangleMeter / 100;
  const cA = color(120, 193, 255);
  const cB = color(238, 175, 118);
  const cC = color(222, 91, 96);
  fill(t < 0.5 ? lerpColor(cA, cB, t * 2) : lerpColor(cB, cC, (t - 0.5) * 2));
  rect(bx, by, bw * t, bh, 999);

  noFill();
  stroke(98, 125, 177);
  strokeWeight(2.4);
  beginShape();
  for (let i = 0; i <= 100; i++) {
    const xx = map(i, 0, 100, bx + 4, bx + bw - 4);
    const yy = by + bh * 0.5 + sin(i * 0.3) * (1.5 + game.tangleMeter * 0.04);
    curveVertex(xx, yy);
  }
  endShape();
  noStroke();

  fill(35, 52, 95);
  textSize(12);
  text("0-49 normal | 50-79 warning | 80-100 locked", x + 14, y + 73);
  text("R hold: quick calm", x + 14, y + 90);
}

function drawOrderCard() {
  fill(255, 255, 255, 222);
  rect(20, height - 214, 360, 194, 15);

  fill(35, 52, 95);
  textAlign(LEFT, TOP);
  textSize(18);
  text("Order Card", 34, height - 202);

  if (!game.currentOrder) return;

  textSize(24);
  text(game.currentOrder.drink, 34, height - 172);

  textSize(16);
  const displaySteps = [...game.currentOrder.steps, "serve"];
  const nowIndex =
    game.state === STATES.SERVE_DRINK
      ? game.currentOrder.steps.length
      : min(game.stepIndex, game.currentOrder.steps.length);
  const serveDone =
    game.state === STATES.ORDER_COMPLETE || game.state === STATES.NEW_ORDER;

  for (let i = 0; i < displaySteps.length; i++) {
    const s = displaySteps[i];
    const done = i < nowIndex || (s === "serve" && serveDone);
    const now = i === nowIndex && !done;

    fill(
      done
        ? color(44, 166, 97)
        : now
          ? color(237, 141, 84)
          : color(91, 108, 151),
    );
    text(
      `${done ? "✔" : now ? "→" : "•"} ${labelStep(s)}`,
      36,
      height - 132 + i * 25,
    );
  }
}

function drawQueuePanel() {
  fill(255, 255, 255, 222);
  rect(width - 300, height - 214, 280, 194, 15);

  fill(35, 52, 95);
  textAlign(LEFT, TOP);
  textSize(18);
  text("Action Queue", width - 286, height - 202);

  if (!game.currentOrder) return;

  const pending = [];
  for (
    let i = game.stepIndex;
    i < game.currentOrder.steps.length && pending.length < 3;
    i++
  ) {
    pending.push(game.currentOrder.steps[i]);
  }
  if (game.state === STATES.SERVE_DRINK && pending.length < 3) {
    pending.unshift("serve");
  }

  for (let i = 0; i < 3; i++) {
    const x = width - 286 + i * 86;
    const y = height - 164;
    fill(228, 237, 252);
    rect(x, y, 74, 74, 12);
    if (pending[i]) {
      drawIngredientIcon(pending[i], x + 37, y + 36, 30);
      fill(59, 79, 138);
      textAlign(CENTER, CENTER);
      textSize(11);
      text(labelStep(pending[i]), x + 37, y + 59);
    }
  }

  fill(75, 91, 132);
  textAlign(LEFT, TOP);
  textSize(12);
  text("W/A/S/D select arm | X clear arm", width - 286, height - 84);
  text("SPACE in challenge | SPACE mash untangle", width - 286, height - 68);
}

function drawGuidePanel() {
  let msg = "";

  if (game.state === STATES.IDLE) msg = "Waiting for customer...";
  if (game.state === STATES.ARM_SELECTION)
    msg = "ARM_SELECTION: Choose one tentacle (W/A/S/D)";
  if (game.state === STATES.ARM_CONTROL)
    msg = `ARM_CONTROL: Reach ${labelStep(currentStep())}`;
  if (game.state === STATES.STEP_CHALLENGE) msg = challengeHint();
  if (game.state === STATES.STEP_SUCCESS)
    msg = "STEP_SUCCESS: Step done. Re-select arm for next step.";
  if (game.state === STATES.TANGLED)
    msg = "TANGLED: coordination breakdown";
  if (game.state === STATES.UNTANGLE)
    msg = "UNTANGLE: mash SPACE to recover";
  if (game.state === STATES.SERVE_DRINK) {
    msg = game.selectedArm
      ? "SERVE_DRINK: bring cup to Serve Area"
      : "SERVE_DRINK: choose tentacle first (W/A/S/D)";
  }
  if (game.state === STATES.ORDER_COMPLETE)
    msg = "Drink served. Next customer incoming.";

  if (!msg) return;

  fill(255, 255, 255, 224);
  rect(width * 0.29, 18, width * 0.42, 38, 999);
  fill(41, 59, 103);
  textAlign(CENTER, CENTER);
  textSize(14);
  text(msg, width * 0.5, 37);
}

function challengeHint() {
  if (!game.challenge) return "";
  const step = currentStep();
  if (game.challenge.type === "timing")
    return `${labelStep(step)}: press SPACE in green zone`;
  if (game.challenge.type === "hold")
    return `${labelStep(step)}: hold mouse in center safe zone`;
  if (game.challenge.type === "rhythm") return "Ice: press SPACE on pulse";
  return `${labelStep(step)}: press SPACE or E twice`;
}

function drawChallengeUi() {
  const c = game.challenge;
  if (!c) return;

  fill(255, 255, 255, 235);
  rect(width * 0.315, height * 0.73, width * 0.37, 105, 15);

  if (c.type === "timing") {
    const x = width * 0.34;
    const y = height * 0.795;
    const w = width * 0.32;

    fill(224, 232, 250);
    rect(x, y, w, 16, 999);
    fill(131, 212, 153);
    rect(x + c.zoneStart * w, y, c.zoneWidth * w, 16, 999);

    fill(53, 77, 137);
    circle(x + c.cursor * w, y + 8, 16);
  }

  if (c.type === "hold") {
    const x = width * 0.34;
    const y = height * 0.795;
    const w = width * 0.32;

    fill(224, 232, 250);
    rect(x, y, w, 20, 999);
    fill(131, 212, 153);
    rect(x + w * 0.34, y, w * 0.32, 20, 999);

    fill(53, 77, 137);
    circle(x + w * c.marker, y + 10, 18);

    fill(72, 88, 132);
    textAlign(CENTER, CENTER);
    textSize(13);
    text(
      `Hold ${c.hold.toFixed(2)} / ${c.needHold.toFixed(2)} s`,
      width * 0.5,
      height * 0.845,
    );
  }

  if (c.type === "rhythm") {
    const x = width * 0.34;
    const y = height * 0.795;
    const w = width * 0.32;
    const p = constrain(1 - abs(millis() - c.nextBeat) / 700, 0, 1);

    fill(224, 232, 250);
    rect(x, y, w, 20, 999);
    fill(122, 196, 245);
    rect(x, y, w * p, 20, 999);

    fill(72, 88, 132);
    textAlign(CENTER, CENTER);
    textSize(13);
    text(
      `Beats ${c.beatsHit}/${c.beatsNeed}   Miss ${c.misses}/2`,
      width * 0.5,
      height * 0.845,
    );
  }

  if (c.type === "tap") {
    fill(72, 88, 132);
    textAlign(CENTER, CENTER);
    textSize(18);
    text(`Serve taps ${c.taps}/${c.need}`, width * 0.5, height * 0.81);
  }
}

function drawUntangleUi() {
  fill(255, 255, 255, 236);
  rect(width * 0.39, height * 0.12, width * 0.22, 64, 14);

  fill(66, 81, 124);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("Untangle Progress", width * 0.5, height * 0.145);

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
      vx: random(-1.2, 1.2),
      vy: random(-1.7, -0.2),
      size: random(4, 8),
      life: random(22, 38),
      maxLife: 38,
      col,
    });
  }
}

function drawGameOver() {
  fill(22, 30, 57, 180);
  rect(0, 0, width, height);

  fill(255);
  rect(width * 0.33, height * 0.22, width * 0.34, height * 0.56, 18);

  const grade = finalGrade();

  fill(37, 52, 90);
  textAlign(CENTER, TOP);
  textSize(34);
  text("Shift Complete", width * 0.5, height * 0.28);

  textSize(26);
  text(`Grade ${grade}`, width * 0.5, height * 0.35);

  textSize(17);
  text(`Orders ${game.ordersDone}`, width * 0.5, height * 0.42);
  text(`Score ${floor(game.score)}`, width * 0.5, height * 0.46);
  text(`Mistakes ${game.mistakes}`, width * 0.5, height * 0.5);
  text(`Tangles ${game.tangles}`, width * 0.5, height * 0.54);

  fill(236, 244, 255);
  rect(width * 0.39, height * 0.62, width * 0.22, 52, 999);
  fill(46, 66, 111);
  textSize(16);
  text("Press SPACE to Restart", width * 0.5, height * 0.639);
}

function finalGrade() {
  const s =
    game.score +
    game.ordersDone * 85 +
    game.bestCombo * 10 -
    game.mistakes * 14 -
    game.tangles * 16;
  if (s > 760) return "S";
  if (s > 560) return "A";
  if (s > 360) return "B";
  return "C";
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
  push();
  translate(x, y);
  noStroke();

  if (step === "coffee") {
    fill(95, 65, 42);
    ellipse(0, 2, size * 0.85, size * 0.6);
    fill(245, 232, 204);
    ellipse(0, 0, size * 0.55, size * 0.33);
    stroke(90, 70, 54);
    strokeWeight(2);
    noFill();
    arc(size * 0.43, 2, size * 0.35, size * 0.3, -HALF_PI, HALF_PI);
    noStroke();
  } else if (step === "milk") {
    fill(233, 246, 255);
    rect(-size * 0.22, -size * 0.26, size * 0.44, size * 0.56, 6);
    fill(176, 214, 241);
    quad(
      -size * 0.22,
      -size * 0.26,
      size * 0.22,
      -size * 0.26,
      size * 0.14,
      -size * 0.45,
      -size * 0.14,
      -size * 0.45,
    );
  } else if (step === "ice") {
    fill(171, 229, 255);
    rect(-size * 0.25, -size * 0.25, size * 0.25, size * 0.25, 4);
    rect(-size * 0.02, -size * 0.12, size * 0.25, size * 0.25, 4);
    rect(-size * 0.18, size * 0.07, size * 0.25, size * 0.25, 4);
  } else if (step === "syrup") {
    fill(228, 162, 96);
    rect(-size * 0.18, -size * 0.2, size * 0.36, size * 0.5, 7);
    fill(255, 207, 142);
    rect(-size * 0.11, -size * 0.34, size * 0.22, size * 0.12, 3);
    fill(188, 93, 54);
    ellipse(0, size * 0.03, size * 0.16, size * 0.3);
  } else if (step === "foam") {
    fill(238, 248, 255);
    ellipse(0, -size * 0.05, size * 0.6, size * 0.35);
    ellipse(-size * 0.16, size * 0.02, size * 0.35, size * 0.25);
    ellipse(size * 0.16, size * 0.03, size * 0.35, size * 0.25);
    fill(147, 182, 225);
    rect(-size * 0.24, size * 0.05, size * 0.48, size * 0.24, 5);
  } else if (step === "serve") {
    fill(239, 248, 255);
    rect(-size * 0.24, -size * 0.25, size * 0.48, size * 0.6, 6);
    fill(127, 166, 211);
    rect(-size * 0.13, -size * 0.15, size * 0.26, size * 0.04, 3);
    rect(-size * 0.13, -size * 0.03, size * 0.26, size * 0.04, 3);
    rect(-size * 0.13, size * 0.09, size * 0.26, size * 0.04, 3);
  } else {
    fill(90, 110, 160);
    circle(0, 0, size * 0.3);
  }

  pop();
}
