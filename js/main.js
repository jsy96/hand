import { HandLandmarker, FilesetResolver, DrawingUtils }
  from "../assets/vision_bundle.mjs";
import { startCamera } from "./camera.js";
import { classifyGesture } from "./gestureClassifier.js";
import { startRound, getState, resolveRound, onCountdownTick, onCapture, onResult, onIdle } from "./gameState.js";
import {
  hideLoading, updateLoadingText, enableStartButton, disableStartButton,
  updateScore, showGestureLabel, hideGestureLabel,
  showCountdown, hideCountdown, showResult, showError, hideResult
} from "./ui.js";

let handLandmarker;
let drawingUtils;
let lastGesture = "UNKNOWN";
let videoReady = false;

async function init() {
  try {
    // 并行启动摄像头和加载模型，缩短总等待时间
    updateLoadingText("正在初始化...");

    const [video, vision] = await Promise.all([
      startCamera().catch((err) => {
        updateLoadingText("摄像头启动失败，请检查权限设置");
        throw err;
      }),
      loadModel()
    ]);

    videoReady = true;

    const canvas = document.getElementById("overlay");
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    drawingUtils = new DrawingUtils(ctx);

    hideLoading();
    enableStartButton();

    // Wire game state callbacks
    onCountdownTick((n) => {
      disableStartButton("倒计时...");
      showCountdown(n);
    });

    onCapture(() => {
      hideCountdown();
      hideGestureLabel();
      if (lastGesture === "UNKNOWN") {
        showError("未检测到有效手势，请重试");
        setTimeout(() => {
          hideResult();
          enableStartButton();
        }, 2000);
      } else {
        resolveRound(lastGesture);
      }
    });

    onResult((player, computer, result) => {
      showResult(player, computer, result);
      updateScore(getScore());
      disableStartButton("下一轮...");
    });

    onIdle(() => {
      hideResult();
      enableStartButton();
    });

    document.getElementById("start-btn").addEventListener("click", () => startRound());
    detectLoop(video, canvas, ctx);
  } catch (err) {
    console.error("初始化失败:", err);
    updateLoadingText("初始化失败，请刷新页面重试。");
  }
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

    drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
      color: "#00FF88",
      lineWidth: 3
    });
    drawingUtils.drawLandmarks(landmarks, {
      color: "#FF4488",
      lineWidth: 1,
      radius: 4
    });

    lastGesture = classifyGesture(landmarks);

    const state = getState();
    if (state === "IDLE") {
      showGestureLabel(lastGesture);
    }
  } else {
    lastGesture = "UNKNOWN";
    hideGestureLabel();
  }

  requestAnimationFrame(() => detectLoop(video, canvas, ctx));
}

init();
