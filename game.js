const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");

const memoryCount = document.querySelector("#memory-count");
const hintPill = document.querySelector("#hint-pill");
const memoryModal = document.querySelector("#memory-modal");
const finalModal = document.querySelector("#final-modal");
const closeMemory = document.querySelector("#close-memory");
const closeFinal = document.querySelector("#close-final");
const continueGame = document.querySelector("#continue-game");
const restartGame = document.querySelector("#restart-game");
const memoryPhotoFrame = document.querySelector("#memory-photo-frame");
const memoryPhoto = document.querySelector("#memory-photo");
const photoFallback = document.querySelector("#photo-fallback");
const memoryDate = document.querySelector("#memory-date");
const memoryTitle = document.querySelector("#memory-title");
const memoryText = document.querySelector("#memory-text");
const rollDiceButton = document.querySelector("#roll-dice");
const diceFace = document.querySelector("#dice-face");
const diceResult = document.querySelector("#dice-result");
const rollCount = document.querySelector("#roll-count");
const nextMemory = document.querySelector("#next-memory");

const memories = [
  {
    title: "Quando a gente se conheceu no FF",
    date: "Primeira memória",
    text: "Olha onde a gente foi se conhecer KAKAKAKAKAK no FF. No começo era só partida, conversa aleatória e risada, e do nada você virou a pessoa mais especial da minha vida.",
    image: "assets/foto-1.png",
  },
  {
    title: "Quando a gente se viu pessoalmente",
    date: "Segunda memória",
    text: "Minha princesa, depois de tanta conversa finalmente chegou o dia de te ver de perto. Eu tava nervoso e inseguro demais CAGAÇOOOO KKKKKKK, morrendo de medo de vc n me querer. Encarei aquela viagem longa, cheguei lá e te vi com a camisa rosa do Sport... aí veio aquele selinho tímido, e pronto. No fim das contas, foi um dos dias mais felizes da minha vida.",
    image: "assets/foto-2.png",
  },
  {
    title: "O pedido de namoro",
    date: "Terceira memória",
    text: "Até que veio o pedido de namoro. Aliança, flores, coração acelerado e eu tentando parecer tranquilo (impossível, tava sua família toda AKAKAKAKAK). Mas o pedido veio e depois uma declaração toda embolada AKAKAKAKAK",
    image: "assets/foto-3.png",
  },
  {
    title: "Nossa primeira vez juntos na praia",
    date: "Quarta memória",
    text: "Nossa primeira praia com o sol, mar e você linda sorrindo. E eu pesando comigo mesmo: né que tá dando tudo certo KKKKKKKKKK..",
    image: "assets/foto-4.png",
  },
  {
    title: "O sorvete horrível de limão",
    date: "Quinta memória",
    text: "Você me fez trocar o meu por aquele de limão AZEDO DA BOMBA 😂😂😂😂😂. NAMORAL TU AINDA ME DEVE UM SORVETE DE LEITE NINHO E AÇAÍ.",
    image: "assets/foto-5.png",
  },
  {
    title: "Seu primeiro aniversário comigo",
    date: "Sexta memória",
    text: "Aqui, a primeira vez que eu passei seu aniversário contigo. Ver você nesse dia, poder estar perto e fazer parte desse dia especial da sua vida foi bom demais. FIQUEI FEIO DEMAIS NESSA FOTOOOT AKAKAK PQPQQ",
    image: "assets/foto-6.png",
  },
  {
    title: "A virada de ano de 2026",
    date: "Sétima memória",
    text: "Aí veio a segunda virada de ano juntos, começar 2026 com você foi bom demais. A gente junto, feliz, cheio de planos... e ainda de par de jarro AIAAI BOIOLAS É. Eu olhava pra gente e só conseguia pensar em como sou feliz por ter você do meu lado. ",
    image: "assets/foto-7.png",
  },
  {
    title: "Agora, mesmo de longe",
    date: "Oitava memória",
    text: "Agora tá tendo distância, saudadeee que maltrata pqpqpqpq e aquela vontade de sair correndo pra te ver. Mas julho tá chegando, e eu não vejo a hora de dançar aquele forró que só a gente sabe AKAKKAKAKAKKAKAKAK.",
    image: null,
  },
];

const imageCache = new Map();

const world = {
  width: canvas.width,
  height: canvas.height,
};

const pathSegments = [
  {
    start: { x: 72, y: 310 },
    c1: { x: 170, y: 142 },
    c2: { x: 362, y: 96 },
    end: { x: 512, y: 166 },
  },
  {
    start: { x: 512, y: 166 },
    c1: { x: 704, y: 256 },
    c2: { x: 852, y: 286 },
    end: { x: 814, y: 420 },
  },
  {
    start: { x: 814, y: 420 },
    c1: { x: 776, y: 560 },
    c2: { x: 536, y: 516 },
    end: { x: 354, y: 444 },
  },
  {
    start: { x: 354, y: 444 },
    c1: { x: 226, y: 392 },
    c2: { x: 124, y: 448 },
    end: { x: 112, y: 534 },
  },
];

const spacesPerMemory = 3;
const boardSpaces = buildBoardSpaces(memories.length * spacesPerMemory + 1);
const state = {
  currentSpaceIndex: 0,
  currentMemoryIndex: 0,
  stepsTowardNextMemory: 0,
  rollsForCurrentMemory: 0,
  collected: new Set(),
  paused: false,
  isRolling: false,
  isMoving: false,
  diceValue: null,
  lastTime: 0,
  move: null,
};

let audioContext = null;

preloadMemoryImages();

function preloadMemoryImages() {
  memories.forEach((memory) => {
    if (!memory.image) {
      return;
    }

    const image = new Image();
    image.src = memory.image;
    imageCache.set(memory.image, image);
  });
}

function ensureAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playMemorySound() {
  if (!audioContext) {
    return;
  }

  const now = audioContext.currentTime;
  const notes = [523.25, 659.25, 783.99];

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = now + index * 0.08;

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.3);
  });
}

function playFinishSound() {
  if (!audioContext) {
    return;
  }

  const now = audioContext.currentTime;
  const notes = [392, 523.25, 659.25, 783.99, 1046.5];

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = now + index * 0.1;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.16, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.38);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.42);
  });
}

function resetGame() {
  state.currentSpaceIndex = 0;
  state.currentMemoryIndex = 0;
  state.stepsTowardNextMemory = 0;
  state.rollsForCurrentMemory = 0;
  state.collected.clear();
  state.paused = false;
  state.isRolling = false;
  state.isMoving = false;
  state.diceValue = null;
  state.move = null;
  finalModal.close();
  diceFace.textContent = "♡";
  diceFace.classList.remove("is-rolling");
  diceResult.textContent = "Jogue o dado para começar";
  hintPill.textContent = "Jogue o dado e avance pelo tabuleiro";
  updateProgress();
  updateDicePanel();
}

function updateProgress() {
  memoryCount.textContent = `${state.collected.size} / ${memories.length}`;
}

function updateDicePanel() {
  const finished = state.collected.size === memories.length;
  rollDiceButton.disabled = state.paused || state.isRolling || state.isMoving || finished;
  rollCount.textContent = `Jogada ${state.rollsForCurrentMemory} de 3`;

  if (finished) {
    nextMemory.textContent = "Todas as memórias foram encontradas";
    return;
  }

  nextMemory.textContent = `Próxima: ${memories[state.currentMemoryIndex].date}`;
}

function rollDice() {
  if (rollDiceButton.disabled) {
    return;
  }

  ensureAudioContext();
  state.isRolling = true;
  rollDiceButton.disabled = true;
  diceFace.classList.add("is-rolling");
  diceResult.textContent = "Girando o dado...";

  let ticks = 0;
  const rollAnimation = window.setInterval(() => {
    diceFace.textContent = String(randomDiceValue());
    ticks += 1;

    if (ticks < 10) {
      return;
    }

    window.clearInterval(rollAnimation);
    const advance = getAdvanceForRoll();
    state.diceValue = advance;
    state.isRolling = false;
    diceFace.classList.remove("is-rolling");
    diceFace.textContent = String(advance);
    diceResult.textContent = `Saiu ${advance}: avance ${advance} casa${advance > 1 ? "s" : ""}`;
    startMove(advance);
  }, 90);
}

function randomDiceValue() {
  return Math.floor(Math.random() * 3) + 1;
}

function getAdvanceForRoll() {
  state.rollsForCurrentMemory += 1;
  const diceValue = randomDiceValue();
  const remaining = spacesPerMemory - state.stepsTowardNextMemory;

  if (state.rollsForCurrentMemory >= 3) {
    return remaining;
  }

  return Math.min(diceValue, remaining);
}

function startMove(advance) {
  const from = boardSpaces[state.currentSpaceIndex];
  const targetIndex = Math.min(state.currentSpaceIndex + advance, boardSpaces.length - 1);
  const to = boardSpaces[targetIndex];

  state.isMoving = true;
  state.move = {
    from,
    to,
    advance,
    targetIndex,
    elapsed: 0,
    duration: 520 + advance * 110,
  };

  updateDicePanel();
}

function finishMove() {
  state.currentSpaceIndex = state.move.targetIndex;
  state.stepsTowardNextMemory += state.move.advance;
  state.stepsTowardNextMemory = Math.min(state.stepsTowardNextMemory, spacesPerMemory);
  state.move = null;
  state.isMoving = false;

  if (state.stepsTowardNextMemory >= spacesPerMemory) {
    revealCurrentMemory();
    return;
  }

  hintPill.textContent = "Continue no dado";
  updateDicePanel();
}

function revealCurrentMemory() {
  const memory = memories[state.currentMemoryIndex];
  state.paused = true;
  state.collected.add(state.currentMemoryIndex);
  state.currentMemoryIndex += 1;
  state.stepsTowardNextMemory = 0;
  state.rollsForCurrentMemory = 0;
  updateProgress();
  updateDicePanel();
  playMemorySound();
  openMemory(memory);
}

function closeMemoryModal() {
  memoryModal.close();

  if (state.collected.size === memories.length) {
    hintPill.textContent = "Todas as memórias foram encontradas";
    playFinishSound();
    finalModal.showModal();
    updateDicePanel();
    return;
  }

  state.paused = false;
  hintPill.textContent = "Jogue o dado para chegar na próxima memória";
  diceResult.textContent = "Sua vez de jogar de novo";
  updateDicePanel();
}

function openMemory(memory) {
  memoryDate.textContent = memory.date;
  memoryTitle.textContent = memory.title;
  memoryText.textContent = memory.text;
  continueGame.textContent =
    state.collected.size === memories.length ? "Abrir carta" : "Continuar jornada";

  if (!memory.image) {
    memoryPhotoFrame.hidden = true;
    memoryModal.showModal();
    return;
  }

  memoryPhotoFrame.hidden = false;
  photoFallback.style.display = "grid";
  memoryPhoto.style.display = "none";
  memoryPhoto.removeAttribute("src");
  memoryPhoto.alt = memory.title;

  memoryPhoto.onload = () => {
    photoFallback.style.display = "none";
    memoryPhoto.style.display = "block";
  };

  memoryPhoto.onerror = showMissingPhotoFallback;

  const cachedImage = imageCache.get(memory.image);

  if (cachedImage?.complete && cachedImage.naturalWidth > 0) {
    memoryPhoto.src = cachedImage.src;
    photoFallback.style.display = "none";
    memoryPhoto.style.display = "block";
    memoryModal.showModal();
    return;
  }

  memoryPhoto.src = memory.image;
  memoryModal.showModal();
}

function showMissingPhotoFallback() {
  photoFallback.style.display = "grid";
  memoryPhoto.style.display = "none";
}

function cubicPoint(segment, t) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  return {
    x:
      mt2 * mt * segment.start.x +
      3 * mt2 * t * segment.c1.x +
      3 * mt * t2 * segment.c2.x +
      t2 * t * segment.end.x,
    y:
      mt2 * mt * segment.start.y +
      3 * mt2 * t * segment.c1.y +
      3 * mt * t2 * segment.c2.y +
      t2 * t * segment.end.y,
  };
}

function buildPathPoints() {
  const points = [];

  pathSegments.forEach((segment) => {
    for (let step = 0; step <= 80; step += 1) {
      points.push(cubicPoint(segment, step / 80));
    }
  });

  return points;
}

function buildBoardSpaces(totalSpaces) {
  const pathPoints = buildPathPoints();
  const distances = [0];
  let totalDistance = 0;

  for (let index = 1; index < pathPoints.length; index += 1) {
    totalDistance += Math.hypot(
      pathPoints[index].x - pathPoints[index - 1].x,
      pathPoints[index].y - pathPoints[index - 1].y,
    );
    distances.push(totalDistance);
  }

  const spaces = [];

  for (let space = 0; space < totalSpaces; space += 1) {
    const wanted = (space / (totalSpaces - 1)) * totalDistance;
    const pointIndex = distances.findIndex((distance) => distance >= wanted);

    if (pointIndex <= 0) {
      spaces.push(pathPoints[0]);
      continue;
    }

    const previousDistance = distances[pointIndex - 1];
    const nextDistance = distances[pointIndex];
    const progress = (wanted - previousDistance) / (nextDistance - previousDistance || 1);
    const previousPoint = pathPoints[pointIndex - 1];
    const nextPoint = pathPoints[pointIndex];

    spaces.push({
      x: previousPoint.x + (nextPoint.x - previousPoint.x) * progress,
      y: previousPoint.y + (nextPoint.y - previousPoint.y) * progress,
    });
  }

  return spaces;
}

function drawPixelRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function drawHeart(x, y, size, color, shadow = "#8d3159") {
  const unit = size / 6;
  drawPixelRect(x + unit, y, unit * 2, unit * 2, color);
  drawPixelRect(x + unit * 3, y, unit * 2, unit * 2, color);
  drawPixelRect(x, y + unit, unit * 6, unit * 2, color);
  drawPixelRect(x + unit, y + unit * 3, unit * 4, unit, color);
  drawPixelRect(x + unit * 2, y + unit * 4, unit * 2, unit, color);
  drawPixelRect(x + unit * 2, y + unit * 5, unit * 2, unit, shadow);
}

function drawStar(x, y, size, color) {
  const unit = size / 5;
  drawPixelRect(x + unit * 2, y, unit, unit * 5, color);
  drawPixelRect(x, y + unit * 2, unit * 5, unit, color);
  drawPixelRect(x + unit, y + unit, unit, unit, color);
  drawPixelRect(x + unit * 3, y + unit, unit, unit, color);
  drawPixelRect(x + unit, y + unit * 3, unit, unit, color);
  drawPixelRect(x + unit * 3, y + unit * 3, unit, unit, color);
}

function drawBackground(time) {
  ctx.clearRect(0, 0, world.width, world.height);
  ctx.fillStyle = "#aeeccf";
  ctx.fillRect(0, 0, world.width, world.height);

  for (let y = 0; y < world.height; y += 32) {
    for (let x = 0; x < world.width; x += 32) {
      if ((x + y) % 64 === 0) {
        drawPixelRect(x, y, 8, 8, "rgba(255,255,255,0.18)");
      }
    }
  }

  drawPath();
  drawDecorations(time);
  drawBoardSpaces(time);
}

function drawPath() {
  ctx.strokeStyle = "#ffd8a8";
  ctx.lineWidth = 64;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(72, 310);
  ctx.bezierCurveTo(170, 142, 362, 96, 512, 166);
  ctx.bezierCurveTo(704, 256, 852, 286, 814, 420);
  ctx.bezierCurveTo(776, 560, 536, 516, 354, 444);
  ctx.bezierCurveTo(226, 392, 124, 448, 112, 534);
  ctx.stroke();

  ctx.strokeStyle = "#f3ba7d";
  ctx.lineWidth = 6;
  ctx.setLineDash([18, 16]);
  ctx.beginPath();
  ctx.moveTo(72, 310);
  ctx.bezierCurveTo(170, 142, 362, 96, 512, 166);
  ctx.bezierCurveTo(704, 256, 852, 286, 814, 420);
  ctx.bezierCurveTo(776, 560, 536, 516, 354, 444);
  ctx.bezierCurveTo(226, 392, 124, 448, 112, 534);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawDecorations(time) {
  const bob = Math.sin(time / 400) * 3;
  drawPixelRect(46, 58, 58, 34, "#8be0bd");
  drawPixelRect(760, 54, 72, 44, "#8be0bd");
  drawPixelRect(58, 382, 66, 38, "#80d5b2");
  drawPixelRect(856, 238, 50, 34, "#80d5b2");
  drawStar(214, 230 + bob, 28, "#fff4a8");
  drawStar(640, 72 - bob, 24, "#fff4a8");
  drawStar(704, 504 + bob, 22, "#fff4a8");
  drawStar(424, 562 - bob, 20, "#fff4a8");
  drawHeart(36, 196 - bob, 28, "#ff8db8");
  drawHeart(884, 104 + bob, 28, "#ff8db8");
  drawHeart(470, 310 + bob, 24, "#ff8db8");
}

function drawBoardSpaces(time) {
  boardSpaces.forEach((space, index) => {
    const isStart = index === 0;
    const memoryIndex = index / spacesPerMemory - 1;
    const isMemorySpace = index > 0 && index % spacesPerMemory === 0;
    const isCollected = isMemorySpace && state.collected.has(memoryIndex);
    const pulse = Math.sin(time / 260 + index) * 2;

    ctx.fillStyle = isMemorySpace ? "#ff7bac" : "#fffaf1";
    ctx.strokeStyle = isCollected ? "#ffffff" : "#8d3159";
    ctx.lineWidth = isMemorySpace ? 4 : 3;
    ctx.beginPath();
    ctx.arc(space.x, space.y + pulse, isMemorySpace ? 20 : 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (isStart) {
      drawStar(space.x - 12, space.y - 12 + pulse, 24, "#fff4a8");
      return;
    }

    if (isMemorySpace) {
      drawHeart(space.x - 12, space.y - 12 + pulse, 24, isCollected ? "#ffffff" : "#ff4f93");
    }
  });
}

function drawPlayer(time) {
  const position = getPlayerPosition();
  const finalSpace = boardSpaces[boardSpaces.length - 1];
  const isMeeting = Math.hypot(position.x - finalSpace.x, position.y - finalSpace.y) < 8;
  const meetingOffset = isMeeting ? -18 : 0;
  const bounce = Math.sin(time / 120) * 2;
  const x = position.x - 17 + meetingOffset;
  const y = position.y - 20 + bounce;

  drawPixelRect(x - 12, y + 24, 48, 10, "rgba(80, 38, 55, 0.2)");
  drawPixelRect(x, y - 10, 34, 34, "#ff7bac");
  drawPixelRect(x + 6, y - 22, 22, 18, "#ffd1df");
  drawPixelRect(x + 10, y - 28, 14, 8, "#6d3950");
  drawPixelRect(x + 9, y - 4, 6, 6, "#3b1d2a");
  drawPixelRect(x + 22, y - 4, 6, 6, "#3b1d2a");
  drawPixelRect(x + 9, y + 24, 8, 14, "#6d3950");
  drawPixelRect(x + 21, y + 24, 8, 14, "#6d3950");
  drawPixelRect(x + 30, y + 4, 10, 8, "#ffd1df");
}

function drawPartner(time) {
  const finalSpace = boardSpaces[boardSpaces.length - 1];
  const bounce = Math.sin(time / 130 + 1) * 2;
  const x = finalSpace.x + 2;
  const y = finalSpace.y - 20 + bounce;

  drawPixelRect(x - 12, y + 24, 48, 10, "rgba(80, 38, 55, 0.2)");
  drawPixelRect(x, y - 10, 34, 34, "#4f9cff");
  drawPixelRect(x + 6, y - 22, 22, 18, "#ffd1df");
  drawPixelRect(x + 8, y - 30, 18, 10, "#3b1d2a");
  drawPixelRect(x + 9, y - 4, 6, 6, "#3b1d2a");
  drawPixelRect(x + 22, y - 4, 6, 6, "#3b1d2a");
  drawPixelRect(x + 9, y + 24, 8, 14, "#2c4d86");
  drawPixelRect(x + 21, y + 24, 8, 14, "#2c4d86");
  drawPixelRect(x - 6, y + 4, 10, 8, "#ffd1df");
}

function getPlayerPosition() {
  if (!state.move) {
    return boardSpaces[state.currentSpaceIndex];
  }

  const progress = easeOutCubic(Math.min(state.move.elapsed / state.move.duration, 1));

  return {
    x: state.move.from.x + (state.move.to.x - state.move.from.x) * progress,
    y: state.move.from.y + (state.move.to.y - state.move.from.y) * progress,
  };
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function update(delta) {
  if (!state.move) {
    return;
  }

  state.move.elapsed += delta * 1000;

  if (state.move.elapsed >= state.move.duration) {
    finishMove();
  }
}

function loop(time) {
  const delta = Math.min((time - state.lastTime) / 1000 || 0, 0.033);
  state.lastTime = time;
  update(delta);
  drawBackground(time);
  drawPartner(time);
  drawPlayer(time);
  requestAnimationFrame(loop);
}

rollDiceButton.addEventListener("click", rollDice);
closeMemory.addEventListener("click", closeMemoryModal);
closeFinal.addEventListener("click", () => {
  finalModal.close();
});
continueGame.addEventListener("click", closeMemoryModal);
memoryModal.addEventListener("cancel", closeMemoryModal);
restartGame.addEventListener("click", resetGame);
finalModal.addEventListener("cancel", (event) => {
  event.preventDefault();
});

resetGame();
requestAnimationFrame(loop);
