function Hero({
  cameraStatus,
  cameraError,
  toggleCamera,
  handStatus,
  handY,
  gestureName,
  gestureScore,
}) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">CAMERA-POWERED MINI GAME</p>

        <h1>
          Terbangkan burung,
          <br />
          <span>cukup dengan tangan.</span>
        </h1>

        <p className="hero-description">
          Kendalikan burung dengan menggerakkan tangan di depan webcam. Hindari
          pipa dan raih skor tertinggi!
        </p>

        <div className="feature-list">
          <div className="feature-item">
            <span className="feature-number">01</span>
            <div>
              <strong>Gerakkan tangan</strong>
              <p>Naik dan turunkan tangan di depan kamera.</p>
            </div>
          </div>

          <div className="feature-item">
            <span className="feature-number">02</span>
            <div>
              <strong>Hindari rintangan</strong>
              <p>Atur ketinggian burung untuk melewati pipa.</p>
            </div>
          </div>

          <div className="feature-item">
            <span className="feature-number">03</span>
            <div>
              <strong>Kumpulkan skor</strong>
              <p>Lewati pipa sebanyak mungkin tanpa menabrak.</p>
            </div>
          </div>
        </div>
      </div>

      <aside className="camera-card">
        <div className="camera-heading">
          <div>
            <p className="section-label">CAMERA PREVIEW</p>
            <h2>Pelacakan tangan</h2>
          </div>

          <span
            className={`offline-badge ${
              cameraStatus === "active" ? "online-badge" : ""
            }`}
          >
            {cameraStatus === "active"
              ? "LIVE"
              : cameraStatus === "error"
                ? "ERROR"
                : "OFFLINE"}
          </span>
        </div>

        <div className="camera-controls">
          <p className="privacy-note">
            {cameraError ||
              "Preview kamera tersedia langsung di sudut arena permainan."}
          </p>

          <button
            className={`camera-action ${
              cameraStatus === "active" ? "camera-action-stop" : ""
            }`}
            type="button"
            onClick={toggleCamera}
          >
            {cameraStatus === "active"
              ? "Matikan kamera"
              : cameraStatus === "error"
                ? "Coba lagi"
                : "Aktifkan kamera"}
          </button>
        </div>

        <div className={`tracking-info tracking-${handStatus}`}>
          <span className="tracking-dot" />

          <span>
            {handStatus === "idle" && "Deteksi tangan belum aktif"}

            {handStatus === "loading" && "Memuat model deteksi tangan..."}

            {handStatus === "searching" &&
              "Tangan belum terdeteksi. Tunjukkan telapak tangan."}

            {handStatus === "detected" && "Tangan terdeteksi"}

            {handStatus === "error" &&
              "Deteksi gagal. Periksa koneksi internet dan Console."}
          </span>

          {handStatus === "detected" && (
            <strong>{Math.round(handY * 100)}%</strong>
          )}
        </div>
      </aside>
    </section>
  );
}

export default Hero;
