"use client";
import { useRef, useEffect } from "react";

const NODE_COUNT = 100;
const NODE_RADIUS = 2.2;
const LINE_DISTANCE = 110;
const HIGHLIGHT_RADIUS = 16;
const BG_GRADIENT = ["#0a0a23", "#1a1a40"]; // Space-like gradient
const NODE_COLOR = "#3b82f6";
const LINE_COLOR = "#6366f1";
const HIGHLIGHT_COLOR = "#fffbe9"; // Star-like
const STAR_COUNT = 120;
const NAVBAR_HEIGHT = 72; // px, matches p-4 + text + padding in Navbar

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export default function NodeNetworkBackground() {
  const canvasRef = useRef(null);
  const nodes = useRef([]);
  const mouse = useRef({ x: -1000, y: -1000 });
  const stars = useRef([]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Initialize nodes
    nodes.current = Array.from({ length: NODE_COUNT }, () => ({
      x: randomBetween(0, width),
      y: randomBetween(NAVBAR_HEIGHT, height),
      vx: randomBetween(-0.18, 0.18),
      vy: randomBetween(-0.18, 0.18),
    }));
    // Initialize stars
    stars.current = Array.from({ length: STAR_COUNT }, () => ({
      x: randomBetween(0, width),
      y: randomBetween(NAVBAR_HEIGHT, height),
      r: randomBetween(0.4, 1.1),
      o: randomBetween(0.2, 0.8),
    }));

    function draw() {
      // Space gradient (starts below navbar)
      const grad = ctx.createLinearGradient(0, NAVBAR_HEIGHT, width, height);
      grad.addColorStop(0, BG_GRADIENT[0]);
      grad.addColorStop(1, BG_GRADIENT[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, NAVBAR_HEIGHT, width, height - NAVBAR_HEIGHT);

      // Draw stars
      for (let s of stars.current) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(255,255,255,${s.o})`;
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw lines
      for (let i = 0; i < NODE_COUNT; i++) {
        for (let j = i + 1; j < NODE_COUNT; j++) {
          const a = nodes.current[i];
          const b = nodes.current[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINE_DISTANCE) {
            ctx.strokeStyle = LINE_COLOR + "80";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < NODE_COUNT; i++) {
        const node = nodes.current[i];
        const isHovered = Math.hypot(node.x - mouse.current.x, node.y - mouse.current.y) < HIGHLIGHT_RADIUS;
        ctx.beginPath();
        ctx.arc(node.x, node.y, isHovered ? NODE_RADIUS * 2.2 : NODE_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = isHovered ? HIGHLIGHT_COLOR : NODE_COLOR;
        ctx.shadowColor = isHovered ? HIGHLIGHT_COLOR : NODE_COLOR;
        ctx.shadowBlur = isHovered ? 24 : 8;
        ctx.globalAlpha = isHovered ? 1 : 0.85;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    }

    function animate() {
      // Move nodes
      for (let node of nodes.current) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < NAVBAR_HEIGHT || node.y > height) node.vy *= -1;
      }
      draw();
      requestAnimationFrame(animate);
    }

    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      // Re-randomize stars
      stars.current = Array.from({ length: STAR_COUNT }, () => ({
        x: randomBetween(0, width),
        y: randomBetween(NAVBAR_HEIGHT, height),
        r: randomBetween(0.4, 1.1),
        o: randomBetween(0.2, 0.8),
      }));
    }
    function handleMouseMove(e) {
      mouse.current = { x: e.clientX, y: e.clientY };
    }
    function handleMouseLeave() {
      mouse.current = { x: -1000, y: -1000 };
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    animate();
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed left-0 w-full h-full z-0 pointer-events-none"
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0 }}
      aria-hidden="true"
    />
  );
} 