import { HandLandmarker, FilesetResolver, DrawingUtils }
  from "../assets/vision_bundle.mjs";
import { startCamera } from "./camera.js";
import { classifyGesture } from "./gestureClassifier.js";
import { resolveRound, isCooldown, resetCooldown, onResult, getScore } from "./gameState.js";
import { playWin, playLose, playDraw } from "./sound.js";
import {
  hideLoading, updateLoadingText, updateScore,
  showPlayerGesture, showComputerGesture, hideComputerGesture,
  showResult, hideResult, setHint
} from "./ui.js";

let handLandmarker;
let drawingUtils;
let videoReady = false;

// 手势稳定检测：连续 N 帧识别到同一手势才触发
let stableGesture = "UNKNOWN";
let stableCount = 0;
const STABLE_THRESHOLD = 8; // 约 0.25 秒（30fps × 8 ≈ 267ms）

async function init() {
  try {
    updateLoadingText("正在初始化...");

    const [video] = await Promise.all([
      startCamera().catch((err) => {
        updateLoadingText("摄像头启动失败，请检查权限设置");
        throw err;
      }),
      loadModel()
    ]);

    videoReady = true;

    // Canvas 只画手部骨架，不显示视频画面
    const canvas = document.getElementById("overlay");
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    drawingUtils = new DrawingUtils(ctx);

    hideLoading();
    updateScore(getScore());
    setHint("举起手势开始对战");

    onResult((player, computer, result) => {
      showComputerGesture(computer);
      showResult(result);
      updateScore(getScore());

      if (result === "WIN") playWin();
      else if (result === "LOSE") playLose();
      else playDraw();

      const names = { WIN: "你赢了！", LOSE: "你输了！", DRAW: "平局！" };
      setHint(`${gestureCN(player)} vs ${gestureCN(computer)} — ${names[result]}`);
    });

    detectLoop(video, canvas, ctx);
  } catch (err) {
    console.error("初始化失败:", err);
    updateLoadingText("初始化失败，请刷新页面重试。");
  }
}

function gestureCN(g) {
  const map = { ROCK: "石头", PAPER: "布", SCISSORS: "剪刀" };
  return map[g] || g;
}

async function loadModel() {
  updateLoadingText("正在加载手势识别模型...");

  const vision = await FilesetResolver.forVisionTasks("./assets/wasm");

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "./assets/models/hand_landmarker.task",
      delegate: "GPU"
    },
    numHands: 1,
    runningMode: "VIDEO",
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  return vision;
}

let lastTimestamp = -1;

function detectLoop(video, canvas, ctx) {
  if (!videoReady) return;

  const now = performance.now();
  if (now === lastTimestamp) {
    requestAnimationFrame(() => detectLoop(video, canvas, ctx));
    return;
  }
  lastTimestamp = now;

  const results = handLandmarker.detectForVideo(video, now);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.landmarks && results.landmarks.length > 0) {
    const landmarks = results.landmarks[0];

    // 只画手部骨架，背景透明（视频 opacity:0）
    drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
      color: "#00FF88",
      lineWidth: 3
    });
    drawingUtils.drawLandmarks(landmarks, {
      color: "#FF4488",
      lineWidth: 1,
      radius: 4
    });

    const gesture = classifyGesture(landmarks);
    showPlayerGesture(gesture);

    // 手势稳定检测
    if (gesture !== "UNKNOWN" && !isCooldown()) {
      if (gesture === stableGesture) {
        stableCount++;
      } else {
        stableGesture = gesture;
        stableCount = 1;
      }

      // 手势稳定后自动触发对战
      if (stableCount >= STABLE_THRESHOLD) {
        resolveRound(gesture);
        stableCount = 0;
        stableGesture = "UNKNOWN";
      }
    }
  } else {
    showPlayerGesture("UNKNOWN");
    stableGesture = "UNKNOWN";
    stableCount = 0;
    // 手离开画面 → 隐藏电脑手势和结果，准备下一轮
    hideComputerGesture();
    hideResult();
    resetCooldown();
    setHint("举起手势开始对战");
  }

  requestAnimationFrame(() => detectLoop(video, canvas, ctx));
}

init();
