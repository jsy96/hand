const GESTURE_EMOJI = {
  ROCK: "✊",
  PAPER: "✋",
  SCISSORS: "✌️",
  UNKNOWN: "❓"
};

const GESTURE_CN = {
  ROCK: "石头",
  PAPER: "布",
  SCISSORS: "剪刀",
  UNKNOWN: "?"
};

function isFingerExtended(landmarks, tipIdx, pipIdx) {
  return landmarks[tipIdx].y < landmarks[pipIdx].y;
}

function isThumbExtended(landmarks) {
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const indexMcp = landmarks[5];
  const dTip = Math.hypot(thumbTip.x - indexMcp.x, thumbTip.y - indexMcp.y);
  const dIp = Math.hypot(thumbIp.x - indexMcp.x, thumbIp.y - indexMcp.y);
  return dTip > dIp;
}

export function classifyGesture(landmarks) {
  if (!landmarks || landmarks.length < 21) return "UNKNOWN";

  const index = isFingerExtended(landmarks, 8, 6);
  const middle = isFingerExtended(landmarks, 12, 10);
  const ring = isFingerExtended(landmarks, 16, 14);
  const pinky = isFingerExtended(landmarks, 20, 18);

  const extendedCount = [index, middle, ring, pinky].filter(Boolean).length;

  if (extendedCount === 0) return "ROCK";
  if (index && middle && !ring && !pinky) return "SCISSORS";
  if (extendedCount >= 3) return "PAPER";
  return "UNKNOWN";
}

export function getGestureEmoji(gesture) {
  return GESTURE_EMOJI[gesture] || "?";
}

export function getGestureCN(gesture) {
  return GESTURE_CN[gesture] || "?";
}
