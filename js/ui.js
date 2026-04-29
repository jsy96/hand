import { getGestureEmoji, getGestureCN } from "./gestureClassifier.js";

const $id = (id) => document.getElementById(id);

export function hideLoading() {
  $id("loading-overlay").classList.add("hidden");
}

export function updateLoadingText(text) {
  $id("loading-text").textContent = text;
}

export function enableStartButton() {
  const btn = $id("start-btn");
  btn.disabled = false;
  btn.textContent = "开始";
}

export function disableStartButton(text) {
  const btn = $id("start-btn");
  btn.disabled = true;
  btn.textContent = text || "开始";
}

export function updateScore(score) {
  $id("player-score").textContent = score.player;
  $id("computer-score").textContent = score.computer;
}

export function showGestureLabel(gesture) {
  const el = $id("gesture-label");
  el.textContent = getGestureCN(gesture);
  el.style.display = gesture === "UNKNOWN" ? "none" : "block";
}

export function hideGestureLabel() {
  $id("gesture-label").style.display = "none";
}

export function showCountdown(number) {
  const el = $id("countdown-display");
  el.textContent = number;
  el.className = "show";
}

export function hideCountdown() {
  const el = $id("countdown-display");
  el.className = "";
  el.style.display = "none";
}

export function showResult(playerGesture, computerGesture, result) {
  $id("result-player-gesture").textContent = getGestureEmoji(playerGesture);
  $id("result-computer-gesture").textContent = getGestureEmoji(computerGesture);

  const textEl = $id("result-text");
  const labels = { WIN: "你赢了！", LOSE: "你输了！", DRAW: "平局！" };
  textEl.textContent = labels[result];
  textEl.className = result.toLowerCase();

  $id("result-overlay").style.display = "flex";
}

export function showError(msg) {
  const textEl = $id("result-text");
  textEl.textContent = msg;
  textEl.className = "";
  $id("result-player-gesture").textContent = "?";
  $id("result-computer-gesture").textContent = "?";
  $id("result-overlay").style.display = "flex";
}

export function hideResult() {
  $id("result-overlay").style.display = "none";
}
