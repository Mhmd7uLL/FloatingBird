import { useEffect, useRef, useState } from "react";

const INITIAL_PIPES = [
  { id: 1, x: 100, gapTop: 22, passed: false },
  { id: 2, x: 145, gapTop: 35, passed: false },
  { id: 3, x: 190, gapTop: 28, passed: false },
];

export function useGame({ handStatus, gestureName, gestureScore }) {
  const arenaRef = useRef(null);
  const gestureCandidateRef = useRef({
    name: null,
    count: 0,
  });
  const lastTriggeredGestureRef = useRef(null);

  const [score, setScore] = useState(0);
  const [pipes, setPipes] = useState(() =>
    INITIAL_PIPES.map((pipe) => ({ ...pipe })),
  );
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let candidate = null;

    // Closed Fist: pause.
    if (gestureName === "Closed_Fist" && gestureScore >= 0.75) {
      candidate = "Closed_Fist";
    }

    // Open Palm: resume.
    else if (gestureName === "Open_Palm" && gestureScore >= 0.55) {
      candidate = "Open_Palm";
    }

    // Jika tidak memenuhi syarat, reset kandidat.
    if (!candidate) {
      gestureCandidateRef.current = {
        name: null,
        count: 0,
      };
      return;
    }

    // Hitung hasil klasifikasi berturut-turut.
    if (gestureCandidateRef.current.name === candidate) {
      gestureCandidateRef.current.count += 1;
    } else {
      gestureCandidateRef.current = {
        name: candidate,
        count: 1,
      };
    }

    // Jalankan aksi setelah dua hasil berturut-turut.
    if (
      gestureCandidateRef.current.count >= 2 &&
      lastTriggeredGestureRef.current !== candidate
    ) {
      if (candidate === "Closed_Fist") {
        setIsPaused(true);
      } else if (candidate === "Open_Palm") {
        setIsPaused(false);
      }

      lastTriggeredGestureRef.current = candidate;
    }
  }, [gestureName, gestureScore]);

  // Animasi Menggerakkan pipa.
  useEffect(() => {
    if (handStatus !== "detected" || gameOver || isPaused) return;

    let animationId;
    let previousTime = 0;

    const speed = 12;

    function animatePipes(currentTime) {
      if (!previousTime) {
        previousTime = currentTime;
      }

      const deltaTime = Math.min((currentTime - previousTime) / 1000, 0.05);

      previousTime = currentTime;

      setPipes((currentPipes) => {
        const nextPipes = currentPipes.map((pipe) => ({
          ...pipe,
          x: pipe.x - speed * deltaTime,
        }));

        let rightMost = Math.max(...nextPipes.map((pipe) => pipe.x));

        return nextPipes.map((pipe) => {
          if (pipe.x < -15) {
            rightMost += 45;

            return {
              ...pipe,
              x: rightMost,
              gapTop: 18 + Math.random() * 25,
              passed: false,
            };
          }

          return pipe;
        });
      });

      animationId = requestAnimationFrame(animatePipes);
    }

    animationId = requestAnimationFrame(animatePipes);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [handStatus, gameOver, isPaused]);

  // 2. Memeriksa tabrakan burung dengan pipa dan tanah.
  useEffect(() => {
    if (handStatus !== "detected" || gameOver || isPaused) return;

    let animationId;

    function overlaps(a, b) {
      return (
        a.left < b.right &&
        a.right > b.left &&
        a.top < b.bottom &&
        a.bottom > b.top
      );
    }

    function checkCollision() {
      const arena = arenaRef.current;

      const bird = arena?.querySelector(".arena-bird");
      const ground = arena?.querySelector(".arena-ground");

      if (!arena || !bird || !ground) {
        animationId = requestAnimationFrame(checkCollision);
        return;
      }

      const birdRect = bird.getBoundingClientRect();
      const groundRect = ground.getBoundingClientRect();

      const birdBox = {
        left: birdRect.left + 5,
        right: birdRect.right - 5,
        top: birdRect.top + 5,
        bottom: birdRect.bottom - 5,
      };

      const pipeElements = arena.querySelectorAll(".arena-pipe");

      const hitPipe = Array.from(pipeElements).some((pipe) => {
        return overlaps(birdBox, pipe.getBoundingClientRect());
      });

      const hitGround = birdBox.bottom >= groundRect.top;

      if (hitPipe || hitGround) {
        setGameOver(true);
        return;
      }

      animationId = requestAnimationFrame(checkCollision);
    }

    animationId = requestAnimationFrame(checkCollision);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [handStatus, gameOver, isPaused]);

  // 3. Menambahkan skor ketika burung melewati pipa.
  useEffect(() => {
    if (handStatus !== "detected" || gameOver || isPaused) return;

    const newlyPassed = pipes.filter((pipe) => !pipe.passed && pipe.x < 20);

    if (newlyPassed.length === 0) return;

    const passedIds = new Set(newlyPassed.map((pipe) => pipe.id));

    setScore((currentScore) => {
      return currentScore + newlyPassed.length;
    });

    setPipes((currentPipes) =>
      currentPipes.map((pipe) =>
        passedIds.has(pipe.id) ? { ...pipe, passed: true } : pipe,
      ),
    );
  }, [pipes, handStatus, gameOver]);

  // 4. Mengatur ulang permainan.
  function restartGame() {
    setPipes(INITIAL_PIPES.map((pipe) => ({ ...pipe })));
    setScore(0);
    setGameOver(false);
  }

  return {
    arenaRef,
    pipes,
    score,
    gameOver,
    isPaused,
    restartGame,
  };
}
