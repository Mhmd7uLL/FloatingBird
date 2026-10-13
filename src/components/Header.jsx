function Header({ cameraStatus }) {
  return (
    <header className="topbar">
      <a className="brand" href="/">
        <span className="brand-icon">FH</span>

        <span>
          <strong>Flappy Hand</strong>
          <small>GESTURE ARCADE</small>
        </span>
      </a>

      <div className="connection-status">
        <span
          className={`status-dot ${
            cameraStatus === "active"
              ? "status-dot-active"
              : cameraStatus === "error"
                ? "status-dot-error"
                : ""
          }`}
        />

        {cameraStatus === "active"
          ? "Kamera aktif"
          : cameraStatus === "error"
            ? "Kamera gagal diakses"
            : "Kamera belum terhubung"}
      </div>
    </header>
  );
}

export default Header;
