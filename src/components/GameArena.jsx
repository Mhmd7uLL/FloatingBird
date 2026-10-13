import { useEffect, useRef } from "react";

function GameArena({
  arenaRef,
  birdRef,
  videoRef,
  cameraStatus,
  pipes,
  handStatus,
  handY,
  handLandmarks,
  gestureName,
  gestureScore,
  gameOver,
  isPaused,
  score,
  onRestart,
}) {
  const landmarksCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = landmarksCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // Jangan gambar jika kamera mati atau tangan tidak terdeteksi.
    if (
      cameraStatus !== "active" ||
      !handLandmarks ||
      handLandmarks.length === 0
    ) {
      return;
    }

    // Hubungan antartitik landmark tangan MediaPipe.
    const connections = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [0, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [5, 9],
      [9, 10],
      [10, 11],
      [11, 12],
      [9, 13],
      [13, 14],
      [14, 15],
      [15, 16],
      [13, 17],
      [17, 18],
      [18, 19],
      [19, 20],
      [0, 17],
    ];

    // Gambar garis penghubung.
    ctx.strokeStyle = "#00FFB4";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    connections.forEach(([start, end]) => {
      const a = handLandmarks[start];
      const b = handLandmarks[end];

      if (!a || !b) return;

      ctx.beginPath();
      ctx.moveTo((1 - a.x) * width, a.y * height);
      ctx.lineTo((1 - b.x) * width, b.y * height);
      ctx.stroke();
    });

    // Gambar 21 titik landmark.
    handLandmarks.forEach((point) => {
      ctx.beginPath();
      ctx.arc((1 - point.x) * width, point.y * height, 3, 0, Math.PI * 2);

      ctx.fillStyle = "#FFFFFF";
      ctx.fill();

      ctx.strokeStyle = "#00FFB4";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, [handLandmarks, cameraStatus]);

  return (
    <section className="game-section">
      <div className="game-heading">
        <div>
          <p className="section-label">YOUR PLAYGROUND</p>
          <h2>Game arena</h2>
        </div>

        <div className="score-card">
          <span>YOUR SCORE</span>
          <strong>{String(score).padStart(2, "0")}</strong>
        </div>
      </div>

      <div className="game-arena" ref={arenaRef}>
        <div className="arena-camera-widget">
          <div className="arena-camera-preview">
            <video
              ref={videoRef}
              className={`arena-camera-video ${
                cameraStatus === "active" ? "arena-camera-visible" : ""
              }`}
              autoPlay
              playsInline
              muted
              aria-label="Preview webcam"
            />

            <canvas
              ref={landmarksCanvasRef}
              className="arena-landmarks-canvas"
            />

            {/* Grid pelacakan */}
            {cameraStatus === "active" && <div className="arena-camera-grid" />}

            {cameraStatus !== "active" && (
              <div className="arena-camera-placeholder">
                <span>◎</span>
                <small>KAMERA OFF</small>
              </div>
            )}

            <span className="arena-camera-label">
              {cameraStatus === "active" ? "● LIVE" : "WEBCAM"}
            </span>
          </div>
          <div className="ai-gesture-info">
            <div className="ai-gesture-heading">
              <span>AI GESTURE RECOGNITION</span>
              <span className="ai-badge">AI</span>
            </div>

            <div className="ai-gesture-result">
              <div>
                <small>Gestur dikenali</small>
                <strong>
                  {handStatus === "detected"
                    ? gestureName.replaceAll("_", " ")
                    : "Menunggu gestur..."}
                </strong>
              </div>

              <div className="ai-confidence">
                <small>Confidence</small>
                <strong>
                  {handStatus === "detected"
                    ? `${Math.round(gestureScore * 100)}%`
                    : "--"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="arena-sun" />
        <div className="arena-cloud cloud-one" />
        <div className="arena-cloud cloud-two" />

        {pipes.map((pipe) => (
          <div key={pipe.id}>
            <div
              className="arena-pipe pipe-top"
              style={{
                left: `${pipe.x}%`,
                top: "-4px",
                height: `${pipe.gapTop}%`,
              }}
            />

            <div
              className="arena-pipe pipe-bottom"
              style={{
                left: `${pipe.x}%`,
                top: `${pipe.gapTop + 28}%`,
                height: `${100 - pipe.gapTop - 28}%`,
              }}
            />
          </div>
        ))}

        <div
          ref={birdRef}
          className={`arena-bird ${
            handStatus === "detected" ? "arena-bird-controlled" : ""
          }`}
          style={{
            top: `${3 + handY * 85}%`,
          }}
        >
          🐤
        </div>

        {handStatus !== "detected" && (
          <div className="arena-message">
            <span className="play-icon">▶</span>
            <h3>Siap untuk terbang?</h3>
            <p>Area permainan akan aktif setelah kontrol tangan tersedia.</p>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="game-paused-overlay">
            <span className="game-over-icon">Ⅱ</span>

            <h3>Game Paused</h3>

            <p>
              AI mendeteksi kepalan tangan.
              <br />
              Buka telapak tangan untuk melanjutkan.
            </p>
          </div>
        )}

        {gameOver && (
          <div className="game-over-overlay">
            <span className="game-over-icon">✦</span>

            <h3>Game Over!</h3>
            <p>Ups, burungmu menabrak rintangan.</p>

            <button type="button" onClick={onRestart}>
              Main lagi
            </button>
          </div>
        )}

        <div className="arena-ground" />
      </div>

      <p className="game-note">
        GAME STATUS <span>•</span> Menunggu inisialisasi
      </p>
    </section>
  );
}

export default GameArena;
