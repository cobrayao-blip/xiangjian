import { useEffect, useRef, type RefObject } from 'react';
import { hexToRgba } from '../utils/color';

interface UseIncenseSmokeCanvasOptions {
  enabled: boolean;
  isBrewing: boolean;
  smokeColor: string;
}

export function useIncenseSmokeCanvas({
  enabled,
  isBrewing,
  smokeColor,
}: UseIncenseSmokeCanvasOptions): RefObject<HTMLCanvasElement | null> {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      size: number;
      age: number;
      maxAge: number;
    }[] = [];

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const emitterX = canvas.width / 2;
      const emitterY = canvas.height - 30;

      ctx.beginPath();
      ctx.arc(emitterX, emitterY + 5, 18, 0, Math.PI, true);
      ctx.fillStyle = '#4a3728';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(emitterX, emitterY, 3, 0, Math.PI * 2);
      ctx.fillStyle = isBrewing ? '#ff9d42' : '#8c7665';
      ctx.shadowBlur = isBrewing ? 15 : 0;
      ctx.shadowColor = '#ff6c00';
      ctx.fill();
      ctx.shadowBlur = 0;

      const spawnRate = isBrewing ? 3 : 1;
      for (let i = 0; i < spawnRate; i++) {
        if (Math.random() < 0.6) {
          particles.push({
            x: emitterX + (Math.random() - 0.5) * 6,
            y: emitterY - 2,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -(Math.random() * 0.8 + 0.4),
            alpha: 0.85,
            size: Math.random() * 4 + 2,
            age: 0,
            maxAge: Math.random() * 80 + 100,
          });
        }
      }

      particles = particles.filter((p) => {
        p.age++;
        p.x += p.vx + Math.sin(p.age * 0.04) * 0.4;
        p.y += p.vy;
        p.alpha = 1 - p.age / p.maxAge;
        p.size += 0.08;

        if (p.age >= p.maxAge || p.x < 0 || p.x > canvas.width) return false;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(smokeColor, p.alpha * 0.28);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.2})`;
        ctx.fill();

        return true;
      });

      animationId = requestAnimationFrame(updateAndDraw);
    };

    updateAndDraw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      resizeObserver.disconnect();
    };
  }, [enabled, isBrewing, smokeColor]);

  return canvasRef;
}
