import { useEffect, useRef, useState } from "react";

export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraStatus, setCameraStatus] = useState("idle");
  const [cameraError, setCameraError] = useState("");

  // Matikan webcam ketika hook dilepas.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  async function toggleCamera() {
    // Jika kamera sedang aktif, matikan.
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setCameraStatus("idle");
      setCameraError("");
      return;
    }

    try {
      setCameraError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("UnsupportedCamera");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraStatus("active");
    } catch (error) {
      console.error("Gagal mengakses kamera:", error);

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      const pesan =
        error.name === "NotAllowedError"
          ? "Izin kamera ditolak. Izinkan kamera melalui pengaturan browser."
          : error.name === "NotFoundError"
            ? "Webcam tidak ditemukan pada perangkat."
            : "Kamera gagal diakses. Periksa izin atau aplikasi lain yang memakai webcam.";

      setCameraError(pesan);
      setCameraStatus("error");
    }
  }

  return {
    videoRef,
    cameraStatus,
    cameraError,
    toggleCamera,
  };
}
