import { getGestureEmoji, getGestureCN } from "./gestureClassifier.js";

const $id = (id) => document.getElementById(id);

export function hideLoading() {
  $id("loading-overlay").classList.add("hidden");
}

export function hideModelLoading() {
  $id("model-loading").classList.add("hidden");
}

export function updateLoadingText(text) {
  $id("loading-text").textContent = text;
}

export function updateScore(score) {
  $id("player-score").textContent = score.player;
  $id("computer-score").textContent = score.computer;
  $id("round-info").textContent = `总 ${score.rounds} 局 · 平 ${score.draws}`;
}

export function showPlayerGesture(gesture) {
  const el = $id("player-emoji");
  if (gesture === "UNKNOWN") {
    el.style.display = "none";
    return;
  }
  el.textContent = getGestureEmoji(gesture);
  el.style.display = "flex";
}

export function showComputerGesture(gesture) {
  const el = $id("computer-display").querySelector(".gesture-emoji");
  el.textContent = getGestureEmoji(gesture);
  el.style.visibility = "visible";
  el.classList.remove("pop");
  void el.offsetWidth;
  el.classList.add("pop");
}

export function hideComputerGesture() {
  const el = $id("computer-display").querySelector(".gesture-emoji");
  el.style.visibility = "hidden";
  el.classList.remove("pop");
}

export function showResult(result) {
  const el = $id("result-banner");
  const labels = { WIN: "你赢了！", LOSE: "你输了！", DRAW: "平局！" };
  el.textContent = labels[result];
  el.className = `result-banner ${result.toLowerCase()} visible`;
}

export function hideResult() {
  const el = $id("result-banner");
  el.classList.remove("visible");
}

export function setHint(text) {
  $id("hint-text").textContent = text;
}
