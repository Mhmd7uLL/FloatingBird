function GameArena({
  arenaRef,
  birdRef,
  videoRef,
  cameraStatus,
  pipes,
  handStatus,
  handY,
  gameOver,
  score,
  onRestart,
}) {
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
