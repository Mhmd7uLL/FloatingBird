import { useEffect, useState } from "react";

export function useHandTracking({
  cameraStatus,
  videoRef,
  birdRef,
  isPausedRef,
}) {
  const [handStatus, setHandStatus] = useState("idle");
  const [handY, setHandY] = useState(0.5);
  const [gestureName, setGestureName] = useState("None");
  const [gestureScore, setGestureScore] = useState(0);
  const [handLandmarks, setHandLandmarks] = useState([]);

  useEffect(() => {
    if (cameraStatus !== "active") {
      setHandStatus("idle");
      setGestureName("None");
      setGestureScore(0);
      return;
    }

    let cancelled = false;
    let workerReady = false;
    let processingFrame = false;
    let animationFrameId;
    let lastFrameTime = 0;
    let lastUiUpdate = 0;

    // Jalankan model AI di thread terpisah.
    const worker = new Worker(
      new URL("../workers/gestureRecognizer.worker.js", import.meta.url),
      { type: "module" },
    );

    setHandStatus("loading");

    worker.onmessage = (event) => {
      if (cancelled) return;

      const data = event.data;

      if (data.type === "ready") {
        workerReady = true;
        setHandStatus("searching");
        return;
      }

      if (data.type === "error") {
        workerReady = false;
        processingFrame = false;

        cancelAnimationFrame(animationFrameId);

        console.error("Gesture Worker:", data.message);

        setHandStatus("error");
        setGestureName("None");
        setGestureScore(0);
        return;
      }

      if (data.type === "result") {
        processingFrame = false;

        const now = performance.now();

        if (data.handFound) {
          // Perbarui posisi burung langsung tanpa menunggu render React.
          if (!isPausedRef.current && birdRef.current) {
            birdRef.current.style.top = `${3 + data.handY * 85}%`;
          }

          // State UI cukup diperbarui secara berkala.
          if (now - lastUiUpdate >= 120) {
            setHandY(data.handY);
            setGestureName(data.gestureName);
            setGestureScore(data.gestureScore);
            setHandStatus("detected");
            setHandLandmarks(data.landmarks || []);

            lastUiUpdate = now;
          }
        } else if (now - lastUiUpdate >= 250) {
          setHandStatus("searching");
          setGestureName("None");
          setGestureScore(0);
          setHandLandmarks([]);

          lastUiUpdate = now;
        }
      }
    };

    worker.onerror = (error) => {
      if (cancelled) return;

      console.error("Worker gagal dijalankan:", error);

      workerReady = false;
      processingFrame = false;

      cancelAnimationFrame(animationFrameId);
      setHandStatus("error");
    };

    // Kirim gambar webcam ke Worker secara berkala.
    async function sendFrame() {
      if (cancelled || !workerReady) return;

      animationFrameId = requestAnimationFrame(sendFrame);

      const now = performance.now();
      const video = videoRef.current;

      // Batasi pengiriman maksimal sekitar 20 frame per detik
      // dan jangan menumpuk pekerjaan di Worker.
      if (
        processingFrame ||
        !video ||
        video.readyState < 2 ||
        now - lastFrameTime < 33
      ) {
        return;
      }

      lastFrameTime = now;
      processingFrame = true;

      try {
        const bitmap = await createImageBitmap(video);

        if (cancelled) {
          bitmap.close();
          processingFrame = false;
          return;
        }

        worker.postMessage(
          {
            type: "frame",
            bitmap,
            timestamp: now,
          },
          [bitmap],
        );
      } catch (error) {
        processingFrame = false;

        if (!cancelled) {
          console.error("Gagal mengirim frame webcam:", error);
        }
      }
    }

    // Muat model AI di dalam Worker.
    worker.postMessage({ type: "init" });

    // Loop baru dimulai setelah Worker mengirim status ready.
    // Kita memulainya melalui pesan ready di bawah.
    const originalOnMessage = worker.onmessage;

    // Bungkus handler agar loop dimulai tepat ketika model siap.
    worker.onmessage = (event) => {
      originalOnMessage(event);

      if (event.data.type === "ready" && !cancelled) {
        animationFrameId = requestAnimationFrame(sendFrame);
      }
    };

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrameId);
      worker.terminate();
    };
  }, [cameraStatus, videoRef]);

  return {
    handStatus,
    handY,
    gestureName,
    gestureScore,
    handLandmarks,
  };
}
