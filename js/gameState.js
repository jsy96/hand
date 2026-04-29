const STATES = { IDLE: "IDLE", COUNTDOWN: "COUNTDOWN", CAPTURE: "CAPTURE", RESULT: "RESULT" };

let state = STATES.IDLE;
let score = { player: 0, computer: 0, draws: 0 };

let onCountdownTickCb = null;
let onCaptureCb = null;
let onResultCb = null;
let onIdleCb = null;

export function onCountdownTick(cb) { onCountdownTickCb = cb; }
export function onCapture(cb) { onCaptureCb = cb; }
export function onResult(cb) { onResultCb = cb; }
export function onIdle(cb) { onIdleCb = cb; }

export function getState() { return state; }
export function getScore() { return score; }

function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }

export function startRound() {
  if (state !== STATES.IDLE) return;
  state = STATES.COUNTDOWN;
  runCountdown();
}

async function runCountdown() {
  for (let i = 3; i >= 1; i--) {
    if (onCountdownTickCb) onCountdownTickCb(i);
    await delay(1000);
  }
  state = STATES.CAPTURE;
  if (onCaptureCb) onCaptureCb();
}

export function resolveRound(playerGesture) {
  const choices = ["ROCK", "PAPER", "SCISSORS"];
  const computerGesture = choices[Math.floor(Math.random() * 3)];
  const result = determineWinner(playerGesture, computerGesture);

  if (result === "WIN") score.player++;
  else if (result === "LOSE") score.computer++;
  else score.draws++;

  state = STATES.RESULT;
  if (onResultCb) onResultCb(playerGesture, computerGesture, result);

  setTimeout(() => {
    state = STATES.IDLE;
    if (onIdleCb) onIdleCb();
  }, 3000);
}

function determineWinner(player, computer) {
  if (player === computer) return "DRAW";
  if (
    (player === "ROCK" && computer === "SCISSORS") ||
    (player === "PAPER" && computer === "ROCK") ||
    (player === "SCISSORS" && computer === "PAPER")
  ) return "WIN";
  return "LOSE";
}
