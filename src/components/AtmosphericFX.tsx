import React, { useRef, useEffect, useCallback } from 'react';
import type { AtmosphericEffect, Season, TimeOfDay } from '../hooks/useWeather';

interface AtmosphericFXProps {
  effect: AtmosphericEffect;
  season: Season;
  timeOfDay: TimeOfDay;
  particleDensity: number; // 0–1
  overlayOpacity: number;  // 0–0.5
  colorTemperature: 'warm' | 'neutral' | 'cool';
  windSpeed: number;       // km/h
  isActive?: boolean;      // master toggle
}

// Particle interface
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  type: 'rain' | 'leaf' | 'petal' | 'snow' | 'fog' | 'firefly' | 'dust' | 'sunbeam';
  color: string;
  life: number;
  maxLife: number;
}

// ═══════════════════════════════════════════════════════════════
// COLOR PALETTES BY SEASON + TIME
// ═══════════════════════════════════════════════════════════════
const AUTUMN_LEAF_COLORS = [
  '#D97706', // Warm amber
  '#EA580C', // Burnt orange
  '#B45309', // Terracotta
  '#C2410C', // Rust
  '#9A3412', // Deep brown-orange
  '#EAB308', // Golden ochre
  '#78350F', // Warm chestnut
];

const SEASON_COLORS: Record<Season, { particles: string[]; overlay: string }> = {
  spring: {
    particles: ['#FFB7C5', '#FF91A4', '#FFDAB9', '#FFC0CB', '#E8A0BF'],
    overlay: 'rgba(255, 183, 197, 0.04)',
  },
  summer: {
    particles: ['#FFE066', '#FFA94D', '#87CEEB', '#B8E0D2', '#95E1D3'],
    overlay: 'rgba(255, 224, 102, 0.03)',
  },
  autumn: {
    particles: AUTUMN_LEAF_COLORS,
    overlay: 'rgba(245, 158, 11, 0.06)',
  },
  winter: {
    particles: ['#E8E8E8', '#D5D5D5', '#B0C4DE', '#AFEEEE', '#F0F8FF'],
    overlay: 'rgba(176, 196, 222, 0.06)',
  },
};

const TIME_OVERLAYS: Record<TimeOfDay, string> = {
  dawn: 'rgba(255, 183, 77, 0.09)',
  morning: 'rgba(255, 245, 220, 0.03)',
  afternoon: 'rgba(255, 235, 190, 0.03)',
  golden_hour: 'rgba(255, 152, 48, 0.14)',
  dusk: 'rgba(123, 63, 150, 0.09)',
  night: 'rgba(10, 10, 30, 0.16)',
};

// ═══════════════════════════════════════════════════════════════
// SPECIFIC FACTORY HELPERS FOR CLEAR/SUNNY CONDITIONS
// ═══════════════════════════════════════════════════════════════
function createAutumnLeaf(w: number, h: number, windSpeed: number, isInitial = false): Particle {
  const windForce = Math.min(windSpeed / 25, 1);
  const color = AUTUMN_LEAF_COLORS[Math.floor(Math.random() * AUTUMN_LEAF_COLORS.length)];
  return {
    x: Math.random() * (w + 60) - 30,
    y: isInitial ? Math.random() * h : -30 - Math.random() * 50,
    vx: 0.6 + Math.random() * 1.2 + windForce * 0.8,
    vy: 0.7 + Math.random() * 0.9,
    size: 14 + Math.random() * 8, // Clearly visible 14–22px
    opacity: 0.75 + Math.random() * 0.22,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.035,
    type: 'leaf',
    color,
    life: isInitial ? Math.floor(Math.random() * 200) : 0,
    maxLife: 700 + Math.random() * 400,
  };
}

function createSunbeam(w: number, h: number, index: number, isInitial = false): Particle {
  // Distribute beam origins across the top width
  const slotWidth = w / 5;
  const xBase = index * slotWidth + Math.random() * (slotWidth * 0.8);
  return {
    x: xBase,
    y: isInitial ? Math.random() * h * 0.4 - 50 : -120 - Math.random() * 80,
    vx: 0.15 + Math.random() * 0.15,
    vy: 0.35 + Math.random() * 0.25, // Gentle downward drift
    size: 200 + Math.random() * 150,  // Beam width 200–350px
    opacity: 0.3 + Math.random() * 0.15, // Boosted opacity for visibility
    rotation: -0.42 + (Math.random() - 0.5) * 0.08, // ~24 deg diagonal angle
    rotationSpeed: 0,
    type: 'sunbeam',
    color: 'rgba(255, 220, 120, 0.6)', // Brighter color
    life: isInitial ? Math.floor(Math.random() * 300) : 0,
    maxLife: 800 + Math.random() * 400,
  };
}

// ═══════════════════════════════════════════════════════════════
// GENERAL PARTICLE FACTORY (RAIN, SNOW, FOG, ETC.)
// ═══════════════════════════════════════════════════════════════
function createParticle(
  w: number,
  h: number,
  effect: AtmosphericEffect,
  season: Season,
  windSpeed: number
): Particle {
  const colors = SEASON_COLORS[season].particles;
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const windForce = Math.min(windSpeed / 30, 1);

  switch (effect) {
    case 'rain':
    case 'heavy_rain': {
      const intensity = effect === 'heavy_rain' ? 2.5 : 1.5;
      return {
        x: Math.random() * w * 1.2 - w * 0.1,
        y: -10 - Math.random() * h * 0.3,
        vx: windForce * 2 + Math.random(),
        vy: 8 + Math.random() * 6 * intensity,
        size: effect === 'heavy_rain' ? 1.5 + Math.random() : 1 + Math.random() * 0.5,
        opacity: 0.25 + Math.random() * 0.25,
        rotation: 0,
        rotationSpeed: 0,
        type: 'rain',
        color: 'rgba(174, 194, 224, 0.6)',
        life: 0,
        maxLife: 200,
      };
    }

    case 'drizzle':
      return {
        x: Math.random() * w,
        y: -5 - Math.random() * 100,
        vx: windForce * 0.8,
        vy: 3 + Math.random() * 2,
        size: 0.8 + Math.random() * 0.3,
        opacity: 0.15 + Math.random() * 0.15,
        rotation: 0,
        rotationSpeed: 0,
        type: 'rain',
        color: 'rgba(174, 194, 224, 0.4)',
        life: 0,
        maxLife: 300,
      };

    case 'snow':
      return {
        x: Math.random() * w * 1.2,
        y: -10 - Math.random() * 50,
        vx: (Math.random() - 0.5) * 1.5 + windForce,
        vy: 0.8 + Math.random() * 1.2,
        size: 2 + Math.random() * 4,
        opacity: 0.5 + Math.random() * 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        type: 'snow',
        color: '#F0F8FF',
        life: 0,
        maxLife: 600,
      };

    case 'fog':
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3 + windForce * 0.2,
        vy: (Math.random() - 0.5) * 0.1,
        size: 80 + Math.random() * 120,
        opacity: 0.03 + Math.random() * 0.05,
        rotation: 0,
        rotationSpeed: 0,
        type: 'fog',
        color: 'rgba(220, 220, 230, 0.6)',
        life: 0,
        maxLife: 800,
      };

    case 'thunderstorm':
      return {
        x: Math.random() * w * 1.3 - w * 0.15,
        y: -15 - Math.random() * h * 0.2,
        vx: windForce * 4 + Math.random() * 2,
        vy: 12 + Math.random() * 8,
        size: 1.5 + Math.random(),
        opacity: 0.3 + Math.random() * 0.3,
        rotation: 0,
        rotationSpeed: 0,
        type: 'rain',
        color: 'rgba(160, 180, 210, 0.7)',
        life: 0,
        maxLife: 150,
      };

    default: {
      if (season === 'spring') {
        return {
          x: Math.random() * w,
          y: -10 - Math.random() * 60,
          vx: (Math.random() - 0.3) * 1 + windForce * 0.5,
          vy: 0.4 + Math.random() * 0.8,
          size: 6 + Math.random() * 6,
          opacity: 0.6 + Math.random() * 0.3,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.05,
          type: 'petal',
          color: randomColor,
          life: 0,
          maxLife: 500,
        };
      }
      return createAutumnLeaf(w, h, windSpeed);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// DRAW HELPERS
// ═══════════════════════════════════════════════════════════════
function drawRainDrop(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.strokeStyle = p.color;
  ctx.lineWidth = p.size;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x - p.vx * 0.4, p.y - p.vy * 1.5);
  ctx.stroke();
  ctx.restore();
}

/**
 * Autumn leaf with organic contour, pointed tip, 3D curl/flutter, and central vein.
 */
function drawLeaf(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);

  // 3D tumble simulation: oscillating scaleX makes the leaf curl & flip in 3D
  const flutterScaleX = Math.cos(p.life * 0.035) * 0.7 + 0.3;
  ctx.scale(flutterScaleX, 1);

  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;

  const s = p.size;

  // Organic leaf shape using Bézier curves
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.8); // Top leaf tip
  // Right side curve
  ctx.bezierCurveTo(s * 0.55, -s * 0.4, s * 0.6, s * 0.3, 0, s * 0.8); // Base
  // Left side curve
  ctx.bezierCurveTo(-s * 0.6, s * 0.3, -s * 0.55, -s * 0.4, 0, -s * 0.8);
  ctx.closePath();
  ctx.fill();

  // Subtle leaf rib / central vein
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.7);
  ctx.lineTo(0, s * 0.95); // Extends into stem
  ctx.stroke();

  ctx.restore();
}

function drawPetal(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;

  ctx.beginPath();
  ctx.arc(-p.size * 0.15, 0, p.size * 0.35, 0, Math.PI * 2);
  ctx.arc(p.size * 0.15, 0, p.size * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSnowflake(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;

  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
  gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(0.5, 'rgba(240,248,255,0.4)');
  gradient.addColorStop(1, 'rgba(240,248,255,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, p.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFogBlob(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
  gradient.addColorStop(0, 'rgba(220,220,230,0.15)');
  gradient.addColorStop(0.6, 'rgba(220,220,230,0.05)');
  gradient.addColorStop(1, 'rgba(220,220,230,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFirefly(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.globalAlpha = p.opacity * (0.5 + 0.5 * Math.sin(p.life * 0.05));
  const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
  gradient.addColorStop(0, 'rgba(255,215,0,0.8)');
  gradient.addColorStop(0.4, 'rgba(255,215,0,0.2)');
  gradient.addColorStop(1, 'rgba(255,215,0,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawDust(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.globalAlpha = p.opacity * (0.6 + 0.4 * Math.sin(p.life * 0.02));
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Volumetric sunbeam: soft wide diagonal light ray with smooth horizontal falloff.
 */
function drawSunbeam(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);

  // Breathing pulse
  const pulse = 0.8 + 0.2 * Math.sin(p.life * 0.007);
  ctx.globalAlpha = p.opacity * pulse;

  const beamW = p.size;
  const beamLen = 1500; // Increased length

  // Linear gradient across beam width (fade in and fade out)
  const gradient = ctx.createLinearGradient(-beamW * 0.5, 0, beamW * 0.5, 0);
  gradient.addColorStop(0, 'rgba(255, 240, 150, 0)');
  gradient.addColorStop(0.25, 'rgba(255, 220, 120, 0.15)');
  gradient.addColorStop(0.5, 'rgba(255, 210, 100, 0.3)');
  gradient.addColorStop(0.75, 'rgba(255, 220, 120, 0.15)');
  gradient.addColorStop(1, 'rgba(255, 240, 150, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(-beamW * 0.5, -beamLen * 0.5, beamW, beamLen);
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export const AtmosphericFX: React.FC<AtmosphericFXProps> = ({
  effect,
  season,
  timeOfDay,
  particleDensity,
  overlayOpacity,
  colorTemperature,
  windSpeed,
  isActive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const lastFlashRef = useRef<number>(0);
  const flashActiveRef = useRef(false);

  // Targets for clear / sunny autumn weather
  const TARGET_LEAVES = 15;
  const TARGET_SUNBEAMS = 5;

  const getMaxParticles = useCallback(() => {
    if (!isActive || particleDensity === 0) return 0;

    const baseCount: Record<AtmosphericEffect, number> = {
      clear: 20,
      cloudy: 18,
      fog: 8,
      drizzle: 60,
      rain: 120,
      heavy_rain: 200,
      snow: 50,
      thunderstorm: 160,
    };

    return Math.floor(baseCount[effect] * particleDensity);
  }, [effect, particleDensity, isActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Resize handler
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const w = () => window.innerWidth;
    const h = () => window.innerHeight;

    // ─── Initial Population (immediate display without waiting for drift) ───
    if (particlesRef.current.length === 0 && (effect === 'clear' || effect === 'cloudy')) {
      const initList: Particle[] = [];
      // ~15 autumn leaves scattered across the screen
      for (let i = 0; i < TARGET_LEAVES; i++) {
        initList.push(createAutumnLeaf(w(), h(), windSpeed, true));
      }
      // ~5 sunbeams
      for (let i = 0; i < TARGET_SUNBEAMS; i++) {
        initList.push(createSunbeam(w(), h(), i, true));
      }
      particlesRef.current = initList;
    }

    // Animation loop
    const animate = () => {
      const maxP = getMaxParticles();
      const particles = particlesRef.current;

      ctx.clearRect(0, 0, w(), h());

      // ─── 1. Warm Golden Sunlight Overlay (Radial from top-left) ───
      if (colorTemperature === 'warm' || effect === 'clear' || season === 'autumn') {
        const sunX = w() * 0.25;
        const sunY = -40;
        const sunRadius = Math.max(w(), h()) * 1.1;
        const sunGlow = ctx.createRadialGradient(sunX, sunY, 30, sunX, sunY, sunRadius);
        sunGlow.addColorStop(0, 'rgba(255, 215, 110, 0.09)');
        sunGlow.addColorStop(0.35, 'rgba(251, 191, 36, 0.05)');
        sunGlow.addColorStop(0.7, 'rgba(245, 158, 11, 0.025)');
        sunGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = sunGlow;
        ctx.fillRect(0, 0, w(), h());
      }

      // ─── 2. Time-of-day gradient overlay ───
      if (overlayOpacity > 0) {
        ctx.fillStyle = TIME_OVERLAYS[timeOfDay];
        ctx.fillRect(0, 0, w(), h());
      }

      // ─── 3. Season ambient color tint ───
      if (overlayOpacity > 0.02) {
        ctx.fillStyle = SEASON_COLORS[season].overlay;
        ctx.fillRect(0, 0, w(), h());
      }

      // ─── 4. Lightning flash (thunderstorm) ───
      if (effect === 'thunderstorm') {
        const now = Date.now();
        if (now - lastFlashRef.current > 3000 + Math.random() * 8000) {
          flashActiveRef.current = true;
          lastFlashRef.current = now;
        }
        if (flashActiveRef.current) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fillRect(0, 0, w(), h());
          if (Date.now() - lastFlashRef.current > 80) {
            flashActiveRef.current = false;
          }
        }
      }

      // ─── 5. Replenish particles by category ───
      if (effect === 'clear' || effect === 'cloudy') {
        const leafCount = particles.filter((p) => p.type === 'leaf' || p.type === 'petal').length;
        const beamCount = particles.filter((p) => p.type === 'sunbeam').length;

        if (leafCount < TARGET_LEAVES) {
          particles.push(createAutumnLeaf(w(), h(), windSpeed, false));
        }
        if (beamCount < TARGET_SUNBEAMS) {
          particles.push(createSunbeam(w(), h(), beamCount, false));
        }
      } else {
        // Standard weather replenishment
        while (particles.length < maxP) {
          particles.push(createParticle(w(), h(), effect, season, windSpeed));
        }
      }

      // ─── 6. Update & draw particles (Draw sunbeams first for background lighting) ───
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        // Physics
        if (p.type === 'leaf' || p.type === 'petal') {
          // Graceful sinusoidal sway & tumbling
          p.x += p.vx + Math.sin(p.life * 0.025) * 1.1;
          p.y += p.vy + Math.cos(p.life * 0.018) * 0.25;
          p.rotation += p.rotationSpeed;
        } else if (p.type === 'sunbeam') {
          // Volumetric ray slow downward drift
          p.x += p.vx + Math.sin(p.life * 0.003) * 0.1;
          p.y += p.vy;
        } else if (p.type === 'snow') {
          p.x += p.vx + Math.sin(p.life * 0.01 + p.x * 0.01) * 0.5;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
        } else if (p.type === 'fog') {
          p.x += p.vx;
          p.y += p.vy + Math.sin(p.life * 0.005) * 0.2;
        } else if (p.type === 'firefly') {
          p.x += p.vx + Math.sin(p.life * 0.03) * 0.4;
          p.y += p.vy + Math.cos(p.life * 0.02) * 0.3;
        } else if (p.type === 'dust') {
          p.x += p.vx + Math.sin(p.life * 0.01) * 0.2;
          p.y += p.vy + Math.cos(p.life * 0.008) * 0.15;
        } else {
          // Rain
          p.x += p.vx;
          p.y += p.vy;
        }

        // Lifecycle fade
        if (p.life > p.maxLife * 0.8) {
          p.opacity *= 0.98;
        }

        // Render particle
        switch (p.type) {
          case 'sunbeam': drawSunbeam(ctx, p); break;
          case 'leaf': drawLeaf(ctx, p); break;
          case 'petal': drawPetal(ctx, p); break;
          case 'rain': drawRainDrop(ctx, p); break;
          case 'snow': drawSnowflake(ctx, p); break;
          case 'fog': drawFogBlob(ctx, p); break;
          case 'firefly': drawFirefly(ctx, p); break;
          case 'dust': drawDust(ctx, p); break;
        }

        // Removal bounds
        const isOffScreen =
          p.type === 'sunbeam'
            ? p.y > h() + 300 || p.life > p.maxLife
            : p.x > w() + 80 ||
              p.x < -80 ||
              p.y > h() + 60 ||
              p.life > p.maxLife ||
              p.opacity < 0.01;

        if (isOffScreen) {
          particles.splice(i, 1);
        }
      }

      // DEBUG: Log particle count every 60 frames
      if (pLifeCounter++ % 60 === 0) {
        console.log(`[AtmosphericFX] effect: ${effect}, particles: ${particles.length}`);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    let pLifeCounter = 0;
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [effect, season, timeOfDay, particleDensity, overlayOpacity, colorTemperature, windSpeed, isActive, getMaxParticles]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen pointer-events-none"
      style={{
        zIndex: 5, // Above map (z-0), below floating UI (z-30+)
        mixBlendMode: 'normal',
      }}
      aria-hidden="true"
    />
  );
};
