import { useEffect, useRef } from 'react';

export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let stars = [];
    let animationId;
    let width, height;
    let running = false;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const count = Math.floor((width * height) / 9000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.2 + 0.2,
        alpha: Math.random(),
        delta: (Math.random() * 0.015 + 0.003) * (Math.random() < 0.5 ? -1 : 1)
      }));
    }

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      stars.forEach((s) => {
        s.alpha += s.delta;
        if (s.alpha <= 0 || s.alpha >= 1) s.delta *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,234,246,${Math.max(0, Math.min(1, s.alpha))})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(tick);
    }

    function start() {
      if (running) return;
      running = true;
      tick();
    }

    function stop() {
      running = false;
      cancelAnimationFrame(animationId);
    }

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    resize();
    if (!document.hidden) start();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div id="starfield">
      <canvas ref={canvasRef} />
    </div>
  );
}
