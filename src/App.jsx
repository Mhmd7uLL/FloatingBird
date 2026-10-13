import { useRef } from "react";
import { useCamera } from "./hooks/useCamera";
import { useHandTracking } from "./hooks/useHandTracking";
import { useGame } from "./hooks/useGame";

import GameArena from "./components/GameArena";
import Header from "./components/Header";
import Hero from "./components/Hero";

import "./App.css";

function App() {
  const { videoRef, cameraStatus, cameraError, toggleCamera } = useCamera();
  const birdRef = useRef(null)
  const { handStatus, handY } = useHandTracking({
    cameraStatus,
    videoRef,
    birdRef,
  });
  const { arenaRef, pipes, score, gameOver, restartGame } = useGame({
    handStatus,
  });

  return (
    <main className="app-shell">
      <Header cameraStatus={cameraStatus} />

      <Hero
        cameraStatus={cameraStatus}
        cameraError={cameraError}
        toggleCamera={toggleCamera}
        handStatus={handStatus}
        handY={handY}
      />

      <GameArena
        arenaRef={arenaRef}
        birdRef={birdRef}
        videoRef={videoRef}
        cameraStatus={cameraStatus}
        pipes={pipes}
        handStatus={handStatus}
        handY={handY}
        gameOver={gameOver}
        score={score}
        onRestart={restartGame}
      />

      <footer className="app-footer">
        <span>FLAPPY HAND</span>
        <span>Made with React & JavaScript</span>
      </footer>
    </main>
  );
}

export default App;
