import { lineString } from '@turf/turf';
import type { CyclingRoute } from '../services/cyclingRouteService';
import type { CyclingWaypoint } from '../types/planner';
import { easeInOutQuad, getCyclingStoryFrame } from './cyclingStoryMotion';

const W = 720;
const H = 1280;
const INTRO_MS = 1400;
const RIDE_MS = 6000;
const ARRIVAL_MS = 1400;

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 2) {
  const words = text.split(/\s+/); let line = ''; let lines = 0;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, y + lines * lineHeight); line = word; lines += 1;
      if (lines >= maxLines) break;
    } else line = next;
  }
  if (lines < maxLines && line) ctx.fillText(line, x, y + lines * lineHeight);
}

function bike(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
  ctx.save(); ctx.translate(x, y); ctx.rotate((angle * Math.PI) / 180);
  ctx.lineWidth = 5; ctx.strokeStyle = '#C76B3C'; ctx.fillStyle = '#FAF8F4'; ctx.shadowColor = 'rgba(44,38,33,.2)'; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.arc(-21, 13, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(21, 13, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0; ctx.lineWidth = 4; ctx.beginPath();
  ctx.moveTo(-21, 13); ctx.lineTo(-4, -11); ctx.lineTo(1, 13); ctx.lineTo(-21, 13);
  ctx.moveTo(1, 13); ctx.lineTo(21, 13); ctx.lineTo(8, -10); ctx.lineTo(-4, -11);
  ctx.moveTo(8, -10); ctx.lineTo(16, -10); ctx.moveTo(-8, -17); ctx.lineTo(1, -17); ctx.stroke(); ctx.restore();
}

function projection(coordinates: [number, number][]) {
  const longitudes = coordinates.map(([lng]) => lng); const latitudes = coordinates.map(([, lat]) => lat);
  const minLng = Math.min(...longitudes); const maxLng = Math.max(...longitudes);
  const minLat = Math.min(...latitudes); const maxLat = Math.max(...latitudes);
  const bounds = { left: 42, top: 210, width: W - 84, height: H - 465 };
  const lngSpan = Math.max(maxLng - minLng, .003); const latSpan = Math.max(maxLat - minLat, .003);
  const scale = Math.min(bounds.width / lngSpan, bounds.height / latSpan);
  const width = lngSpan * scale; const height = latSpan * scale;
  const left = (W - width) / 2; const top = bounds.top + (bounds.height - height) / 2;
  return (coords: [number, number][]): [number, number][] => coords.map(([lng, lat]) => [left + ((lng - minLng) / lngSpan) * width, top + ((maxLat - lat) / latSpan) * height]);
}

export async function exportCyclingStoryVideo(route: CyclingRoute, stops: CyclingWaypoint[], onProgress?: (progress: number) => void): Promise<void> {
  if (!('MediaRecorder' in window) || !HTMLCanvasElement.prototype.captureStream) throw new Error('Trình duyệt này chưa hỗ trợ xuất video WebM. Hãy thử Chrome hoặc Edge mới nhất.');
  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Không thể tạo canvas để xuất video.');
  const candidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  const mimeType = candidates.find(type => MediaRecorder.isTypeSupported(type));
  if (!mimeType) throw new Error('Trình duyệt không có codec WebM được hỗ trợ để xuất video.');
  const coordinates = route.geometry.coordinates;
  const displayCoordinates = [...coordinates, ...stops.map(stop => [stop.lng, stop.lat] as [number, number])];
  const mapPoint = projection(displayCoordinates); const points = mapPoint(coordinates); const line = lineString(coordinates);
  const stream = canvas.captureStream(30); const recorder = new MediaRecorder(stream, { mimeType }); const chunks: BlobPart[] = [];
  const totalMs = INTRO_MS + RIDE_MS + ARRIVAL_MS; let frameId = 0; let settled = false;
  const cleanup = () => { if (frameId) cancelAnimationFrame(frameId); stream.getTracks().forEach(track => track.stop()); };

  await new Promise<void>((resolve, reject) => {
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    recorder.onerror = () => { if (settled) return; settled = true; cleanup(); reject(new Error('Xuất video bị gián đoạn. Vui lòng thử lại.')); };
    recorder.onstop = () => {
      if (settled) return; settled = true; cleanup();
      const blob = new Blob(chunks, { type: mimeType }); const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = 'chupgibaygio-hanh-trinh-dap-xe.webm'; link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000); resolve();
    };
    recorder.start(250); const startedAt = performance.now();
    const render = (now: number) => {
      const elapsed = now - startedAt; const rideProgress = elapsed <= INTRO_MS ? 0 : easeInOutQuad((elapsed - INTRO_MS) / RIDE_MS);
      onProgress?.(Math.min(1, elapsed / totalMs));
      ctx.fillStyle = '#FAF8F4'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = '#EAE3D5'; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 36) { ctx.beginPath(); ctx.moveTo(x, 170); ctx.lineTo(x, 950); ctx.stroke(); }
      for (let y = 170; y < 950; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.fillStyle = '#2C2621'; ctx.font = 'bold 24px Georgia, serif'; ctx.fillText('HÀNH TRÌNH SĂN ẢNH HÀ NỘI', 44, 62);
      ctx.fillStyle = '#8C8377'; ctx.font = '15px sans-serif'; ctx.fillText('chupgibaygio.com  ·  ĐẠP XE / CHỤP ẢNH', 46, 91);
      ctx.fillStyle = '#C76B3C'; ctx.font = 'bold 12px sans-serif'; ctx.letterSpacing = '2px'; ctx.fillText(elapsed < INTRO_MS ? 'CHUẨN BỊ LĂN BÁNH' : rideProgress >= 1 ? 'ĐÃ ĐẾN NƠI' : 'ĐANG TRÊN ĐƯỜNG', 46, 148);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([8, 12]); ctx.strokeStyle = 'rgba(140,131,119,.42)'; ctx.lineWidth = 8;
      ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.setLineDash([]);
      const frame = getCyclingStoryFrame(line, rideProgress);
      const traveledPoints = frame.traveled ? mapPoint(frame.traveled.geometry.coordinates as [number, number][]) : [];
      if (traveledPoints.length > 1) {
        ctx.strokeStyle = '#FAF8F4'; ctx.lineWidth = 11; ctx.beginPath(); traveledPoints.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
        ctx.strokeStyle = '#C76B3C'; ctx.lineWidth = 6; ctx.beginPath(); traveledPoints.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
      }
      const stopPoints = mapPoint(stops.map(stop => [stop.lng, stop.lat] as [number, number]));
      stops.forEach((_, index) => {
        const [x, y] = stopPoints[index]; ctx.beginPath(); ctx.fillStyle = '#FAF8F4'; ctx.strokeStyle = '#C76B3C'; ctx.lineWidth = 3; ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#2C2621'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(String(index + 1), x, y + 4); ctx.textAlign = 'left';
      });
      const [bikeX, bikeY] = mapPoint([frame.position])[0] || points[0]; if (rideProgress < 1) bike(ctx, bikeX, bikeY, frame.bearing);
      const arrive = elapsed >= INTRO_MS + RIDE_MS;
      if (arrive) {
        ctx.save(); ctx.shadowColor = 'rgba(44,38,33,.16)'; ctx.shadowBlur = 25; roundedRect(ctx, 36, 966, W - 72, 242, 28); ctx.fillStyle = '#FAF8F4'; ctx.fill(); ctx.restore();
        ctx.strokeStyle = '#D8CFBD'; ctx.lineWidth = 1; roundedRect(ctx, 36, 966, W - 72, 242, 28); ctx.stroke();
        ctx.fillStyle = '#8C8377'; ctx.font = 'bold 12px sans-serif'; ctx.fillText('ĐIỂM DỪNG CUỐI', 64, 1006);
        ctx.fillStyle = '#2C2621'; ctx.font = 'bold 28px Georgia, serif'; wrapText(ctx, stops.at(-1)?.name || 'Điểm chụp', 64, 1045, 570, 34, 2);
        ctx.fillStyle = '#C76B3C'; ctx.font = 'bold 18px sans-serif'; ctx.fillText(`${route.distanceKm.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} km`, 64, 1130);
        ctx.fillStyle = '#6E655B'; ctx.font = '16px sans-serif'; ctx.fillText(`~${Math.round(route.durationMinutes)} phút đạp xe`, 210, 1130);
        ctx.fillStyle = '#8C8377'; ctx.font = '12px sans-serif'; ctx.fillText('© OpenStreetMap contributors · routing.openstreetmap.de · openstreetmap.org/fixthemap', 64, 1178);
      } else if (elapsed <= INTRO_MS) {
        ctx.fillStyle = '#2C2621'; ctx.font = 'bold 20px Georgia, serif'; ctx.fillText('Bắt đầu từ', 46, 1038);
        ctx.font = 'bold 28px Georgia, serif'; wrapText(ctx, stops[0]?.name || 'Vị trí hiện tại', 46, 1076, 600, 34, 2);
        ctx.fillStyle = '#6E655B'; ctx.font = '16px sans-serif'; ctx.fillText(`${route.distanceKm.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} km  ·  ~${Math.round(route.durationMinutes)} phút`, 46, 1165);
      } else {
        ctx.fillStyle = '#2C2621'; ctx.font = 'bold 20px Georgia, serif'; wrapText(ctx, stops.at(-1)?.name || 'Điểm chụp', 46, 1040, 600, 30, 2);
        ctx.fillStyle = '#6E655B'; ctx.font = '16px sans-serif'; ctx.fillText(`${frame.distanceKm.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} / ${route.distanceKm.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} km`, 46, 1120);
        ctx.fillStyle = '#C76B3C'; ctx.fillRect(46, 1160, 628 * rideProgress, 5);
      }
      if (elapsed >= totalMs) { recorder.stop(); return; }
      frameId = requestAnimationFrame(render);
    };
    frameId = requestAnimationFrame(render);
  });
}