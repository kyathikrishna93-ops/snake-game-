import React, { useEffect, useRef, useState } from 'react';

interface SnakeGameProps {
  onScoreUpdate: (score: number) => void;
  isMusicPlaying: boolean;
}

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const getInitialSnake = () => [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 80; // ms per frame

export function SnakeGame({ onScoreUpdate, isMusicPlaying }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  
  const scoreRef = useRef(0);
  const onScoreUpdateRef = useRef(onScoreUpdate);
  
  useEffect(() => {
    onScoreUpdateRef.current = onScoreUpdate;
  }, [onScoreUpdate]);

  // Game state refs
  const snakeRef = useRef(getInitialSnake());
  const directionRef = useRef(INITIAL_DIRECTION);
  const inputQueueRef = useRef<{x: number, y: number}[]>([]);
  const foodRef = useRef({ x: 5, y: 5 });
  const lastRenderTimeRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);

  const generateFood = () => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
      };
      if (!snakeRef.current.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  };

  const resetGame = () => {
    snakeRef.current = getInitialSnake();
    directionRef.current = INITIAL_DIRECTION;
    inputQueueRef.current = [];
    foodRef.current = generateFood();
    scoreRef.current = 0;
    onScoreUpdateRef.current(0);
    setGameOver(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (gameOver && e.key === ' ') {
        resetGame();
        return;
      }

      const lastInput = inputQueueRef.current.length > 0 
        ? inputQueueRef.current[inputQueueRef.current.length - 1] 
        : directionRef.current;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (lastInput.y !== 1) inputQueueRef.current.push({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          if (lastInput.y !== -1) inputQueueRef.current.push({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          if (lastInput.x !== 1) inputQueueRef.current.push({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          if (lastInput.x !== -1) inputQueueRef.current.push({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Draw grid
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      for (let i = 0; i < CANVAS_SIZE; i += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_SIZE, i);
        ctx.stroke();
      }

      // Draw food (Magenta)
      ctx.fillStyle = '#FF00FF';
      ctx.fillRect(
        foodRef.current.x * GRID_SIZE + 1,
        foodRef.current.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );

      // Draw snake (Cyan)
      snakeRef.current.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#FFFFFF' : '#00FFFF';
        ctx.fillRect(
          segment.x * GRID_SIZE + 1,
          segment.y * GRID_SIZE + 1,
          GRID_SIZE - 2,
          GRID_SIZE - 2
        );
      });

      // Draw score on canvas
      ctx.font = '16px "VT323", monospace';
      ctx.fillStyle = '#00FFFF';
      ctx.textAlign = 'left';
      ctx.fillText(`YIELD: ${scoreRef.current}`, 10, 20);

      if (gameOver) {
        // Glitchy overlay
        ctx.fillStyle = Math.random() > 0.8 ? 'rgba(255, 0, 255, 0.2)' : 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        
        ctx.font = '24px "Press Start 2P", cursive';
        ctx.fillStyle = '#FF00FF';
        ctx.textAlign = 'center';
        
        // Simulated glitch text
        const xOffset = Math.random() > 0.5 ? 2 : -2;
        ctx.fillText('SYSTEM FAILURE', CANVAS_SIZE / 2 + xOffset, CANVAS_SIZE / 2 - 40);
        ctx.fillStyle = '#00FFFF';
        ctx.fillText('SYSTEM FAILURE', CANVAS_SIZE / 2 - xOffset, CANVAS_SIZE / 2 - 40);
        
        ctx.font = '20px "VT323", monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`FINAL_YIELD: ${scoreRef.current}`, CANVAS_SIZE / 2, CANVAS_SIZE / 2);
        
        ctx.font = '16px "Press Start 2P", cursive';
        ctx.fillStyle = '#00FFFF';
        ctx.fillText('REBOOT (SPACE)', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 50);
      }
    };

    const update = () => {
      if (gameOver) return;

      if (inputQueueRef.current.length > 0) {
        directionRef.current = inputQueueRef.current.shift()!;
      }

      const head = { ...snakeRef.current[0] };
      head.x += directionRef.current.x;
      head.y += directionRef.current.y;

      // Check wall collision
      if (
        head.x < 0 ||
        head.x >= CANVAS_SIZE / GRID_SIZE ||
        head.y < 0 ||
        head.y >= CANVAS_SIZE / GRID_SIZE
      ) {
        setGameOver(true);
        return;
      }

      // Check self collision
      if (snakeRef.current.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return;
      }

      snakeRef.current.unshift(head);

      // Check food collision
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        scoreRef.current += 10;
        onScoreUpdateRef.current(scoreRef.current);
        foodRef.current = generateFood();
      } else {
        snakeRef.current.pop();
      }
    };

    const gameLoop = (currentTime: number) => {
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);

      const secondsSinceLastRender = (currentTime - lastRenderTimeRef.current);
      if (secondsSinceLastRender < GAME_SPEED) return;

      lastRenderTimeRef.current = currentTime;

      update();
      draw();
    };

    animationFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [gameOver]);

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <div className="relative brutal-border bg-black">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      
      <div className="mt-6 flex gap-4 text-lg font-mono text-[#FF00FF] uppercase tracking-widest">
        <span>[WASD/ARROWS]: NAVIGATE</span>
        <span>//</span>
        <span>[SPACE]: REBOOT</span>
      </div>
    </div>
  );
}
