import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";

let recognizer = null;

self.onmessage = async (event) => {
  const { type, bitmap, timestamp } = event.data;

  // Inisialisasi model AI di worker.
  if (type === "init") {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
      );

      // Workaround untuk pemuatan WASM di module Web Worker.
      if (vision.wasmLoaderPath) {
        const response = await fetch(vision.wasmLoaderPath);

        if (!response.ok) {
          throw new Error("Gagal mengunduh WASM loader MediaPipe.");
        }

        const loaderScript = await response.text();

        // Jalankan loader di konteks Worker agar ModuleFactory tersedia.
        (0, eval)(loaderScript);

        delete vision.wasmLoaderPath;
      }

      recognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
        },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      self.postMessage({ type: "ready" });
    } catch (error) {
      self.postMessage({
        type: "error",
        message: error.message || "Gagal memuat model AI.",
      });
    }

    return;
  }

  // Memproses satu frame gambar dari webcam.
  if (type === "frame") {
    try {
      if (!recognizer) {
        self.postMessage({
          type: "error",
          message: "Model AI belum siap.",
        });
        return;
      }

      const result = recognizer.recognizeForVideo(bitmap, timestamp);

      const landmarks = result.landmarks?.[0];

      if (!landmarks) {
        self.postMessage({
          type: "result",
          handFound: false,
          gestureName: "None",
          gestureScore: 0,
        });

        return;
      }

      const handY =
        (landmarks[0].y +
          landmarks[5].y +
          landmarks[9].y +
          landmarks[13].y +
          landmarks[17].y) /
        5;

      const gesture = result.gestures?.[0]?.[0];

      self.postMessage({
        type: "result",
        handFound: true,
        handY: Math.max(0, Math.min(1, handY)),
        gestureName: gesture?.categoryName || "None",
        gestureScore: gesture?.score || 0,
      });
    } catch (error) {
      self.postMessage({
        type: "error",
        message: error.message || "Gagal memproses gambar.",
      });
    } finally {
      bitmap?.close();
    }
  }
};
