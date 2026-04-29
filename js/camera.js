export async function startCamera() {
  const video = document.getElementById("webcam");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }
    });
    video.srcObject = stream;
    return new Promise((resolve) => {
      video.addEventListener("loadeddata", () => resolve(video), { once: true });
    });
  } catch (err) {
    document.getElementById("loading-overlay").classList.add("hidden");
    document.getElementById("camera-error").style.display = "flex";
    throw err;
  }
}
