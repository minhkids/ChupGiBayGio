interface Rect { left: number; top: number; width: number; height: number }

export function getClickPercent(clientX: number, clientY: number, rect: Rect) {
  const x = rect.width > 0 ? ((clientX - rect.left) / rect.width) * 100 : 0;
  const y = rect.height > 0 ? ((clientY - rect.top) / rect.height) * 100 : 0;
  return { x: Number(Math.max(0, Math.min(100, x)).toFixed(1)), y: Number(Math.max(0, Math.min(100, y)).toFixed(1)) };
}
