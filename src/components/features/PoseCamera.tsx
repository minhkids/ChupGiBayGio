import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, FlipHorizontal, Download, CameraOff, RotateCcw, Scaling } from 'lucide-react';
import { motion } from 'framer-motion';
import { PinReferenceButton, poseReferenceImage } from '../planner/PinReferenceButton';

/**
 * Ghost Pose Camera — camera stream + interactive SVG wireframe overlay.
 *
 * Spec compliance notes:
 * - Stream uses facingMode 'environment' at 1920x1080 (ideal), degrading to
 *   'user' and then to any camera so desktop without a rear sensor still works.
 * - Every track is stopped on unmount and whenever we re-acquire, so the
 *   camera indicator light never stays on after close.
 * - The wireframe is stroke-only SVG (#FBBF24, dasharray 2.5 1.5, opacity 0.6),
 *   vertically rescalable 0.6x–1.5x and flippable.
 * - Capture draws ONLY the raw <video> frame into an offscreen canvas at the
 *   stream's native resolution and exports image/jpeg at 0.95 — the overlay is
 *   never composited into the output.
 */

import type { PoseItem } from '../../types';

interface PoseCameraProps {
  pose: PoseItem;
  onClose: () => void;
}

type CameraErrorKind = 'denied' | 'notfound' | 'insecure' | 'unknown';

const ERROR_COPY: Record<CameraErrorKind, { title: string; body: string }> = {
  denied: {
    title: 'Quyền camera bị từ chối',
    body: 'Cho phép truy cập camera trong cài đặt trình duyệt rồi thử lại, hoặc chuyển sang tab Tương tác. Không có overlay thì bạn vẫn chụp được ảnh bình thường.'
  },
  notfound: {
    title: 'Không tìm thấy camera',
    body: 'Thiết bị này không có camera khả dụng (phổ biến trên desktop khi không gắn webcam). Bạn vẫn có thể tải ảnh chụp sẵn từ thư viện điểm chụp.'
  },
  insecure: {
    title: 'Cần kết nối bảo mật',
    body: 'Camera chỉ chạy trên HTTPS hoặc localhost. Hãy mở lại trang bằng địa chỉ https://.'
  },
  unknown: {
    title: 'Không khởi động được camera',
    body: 'Đã xảy ra lỗi không xác định khi mở camera. Thử lại, hoặc đóng ứng dụng khác đang dùng camera.'
  }
};

export const PoseCamera: React.FC<PoseCameraProps> = ({ pose, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  // The stream lives in a ref, not state: a state value would make the mount
  // effect re-run and restart the camera on every acquisition.
  const streamRef = useRef<MediaStream | null>(null);

  const [errorKind, setErrorKind] = useState<CameraErrorKind | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Overlay controls
  const [scale, setScale] = useState(1.0);
  const [isFlipped, setIsFlipped] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const classify = (err: unknown): CameraErrorKind => {
      const name = (err as { name?: string })?.name;
      if (name === 'NotAllowedError' || name === 'SecurityError') return 'denied';
      if (name === 'NotFoundError' || name === 'OverconstrainedError' || name === 'DevicesNotFoundError') {
        return 'notfound';
      }
      if (name === 'NotReadableError' || name === 'TrackStartError') return 'unknown';
      return 'unknown';
    };

    const open = async () => {
      // A previous stream (retry, or StrictMode double-effect) must die first.
      stopCamera();

      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorKind(window.isSecureContext ? 'notfound' : 'insecure');
        return;
      }

      const attempts: MediaStreamConstraints[] = [
        { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false },
        { video: { facingMode: { ideal: 'user' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false },
        { video: true, audio: false }
      ];

      let lastError: unknown = null;
      for (const constraints of attempts) {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
          if (cancelled) {
            mediaStream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = mediaStream;
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            await videoRef.current.play().catch(() => undefined);
          }
          setIsReady(true);
          return;
        } catch (err) {
          lastError = err;
          const kind = classify(err);
          // Permission denied / no secure context: the remaining profiles
          // cannot help, so bail out instead of prompting three times.
          if (kind === 'denied' || kind === 'insecure') {
            if (!cancelled) setErrorKind(kind);
            return;
          }
        }
      }

      if (!cancelled) setErrorKind(classify(lastError));
    };

    open();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [stopCamera, attempt]);

  // Release the camera whenever the modal leaves the tree.
  useEffect(() => () => stopCamera(), [stopCamera]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    // Offscreen canvas at the stream's native resolution; the SVG overlay is a
    // sibling DOM layer and is never drawn here.
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.95));
  };

  const handleDownload = () => {
    if (!capturedImage) return;
    const a = document.createElement('a');
    a.href = capturedImage;
    a.download = `chupgi-pose-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const errorCopy = errorKind ? ERROR_COPY[errorKind] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Camera hướng dẫn tạo dáng"
      className="fixed inset-0 z-[100] bg-neutral-950 flex flex-col select-none"
    >
      {/* Header Bar */}
      <div className="absolute top-0 inset-x-0 z-20 px-4 py-3 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <div>
          <h2 className="text-white font-mono-spec text-xs font-bold uppercase tracking-[0.18em]">
            Pose Guide Camera
          </h2>
          <p className="hidden sm:block text-white/50 font-mono-spec text-[10px] uppercase tracking-[0.14em] mt-0.5">
            Overlay không được ghi vào ảnh
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng camera"
          className="h-10 w-10 flex items-center justify-center border border-white/25 text-white hover:bg-white hover:text-neutral-950 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="relative flex-1 overflow-hidden bg-black flex items-center justify-center">
        <PinReferenceButton
          imageUrl={capturedImage || poseReferenceImage(pose)}
          label={capturedImage ? `Ảnh thử dáng: ${pose.name}` : `Dáng chụp: ${pose.name}`}
          className="absolute top-20 right-4"
        />
        {errorCopy ? (
          <div className="max-w-sm px-6 text-center">
            <CameraOff className="w-10 h-10 mx-auto text-amberFilm" strokeWidth={1.5} />
            <h3 className="mt-4 text-white font-editorial text-xl">{errorCopy.title}</h3>
            <p className="mt-2 text-white/60 text-sm leading-relaxed">{errorCopy.body}</p>
            <button
              type="button"
              onClick={() => { setErrorKind(null); setIsReady(false); setAttempt(a => a + 1); }}
              className="mt-6 inline-flex items-center gap-2 border border-amberFilm px-4 py-2 font-mono-spec text-[11px] font-bold uppercase tracking-[0.16em] text-amberFilm hover:bg-amberFilm hover:text-neutral-950 transition-colors"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={2.2} />
              Thử lại
            </button>
          </div>
        ) : (
          <>
            {/* Video Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              aria-label="Luồng camera trực tiếp"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Ghost Pose Overlay */}
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center transition-transform duration-200"
              style={{
                transform: `scale(${scale})${isFlipped ? ' scaleX(-1)' : ''}`
              }}
            >
              <svg
                width="200"
                height="400"
                viewBox={pose.viewBox || "0 0 200 400"}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="opacity-60"
                stroke="#FBBF24"
                strokeWidth={2.5}
                strokeDasharray="2.5 1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={pose.svgPath} />
              </svg>
            </div>

            {/* Scale readout */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 border border-white/20 bg-black/60 px-3 py-1.5 backdrop-blur-sm">
              <Scaling className="w-3.5 h-3.5 text-amberFilm" strokeWidth={2} />
              <span className="text-amberFilm font-mono-spec text-[11px] font-bold tabular-nums">
                {scale.toFixed(2)}×
              </span>
              {isFlipped && (
                <span className="text-white/50 font-mono-spec text-[10px] uppercase tracking-[0.14em]">
                  Flipped
                </span>
              )}
            </div>

            {/* Captured Image Preview */}
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Ảnh đã chụp"
                className="absolute inset-0 w-full h-full object-contain z-10"
              />
            )}
          </>
        )}
      </div>

      {/* Controls Bar */}
      <div className="relative z-20 bg-neutral-950 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col gap-4">

        {/* Vertical scale slider + flip */}
        {!capturedImage && !errorCopy && (
          <div className="flex items-end justify-center gap-5">
            <button
              type="button"
              onClick={() => setIsFlipped((f) => !f)}
              aria-pressed={isFlipped}
              aria-label="Lật ngang tư thế"
              className={`h-12 w-12 flex items-center justify-center border transition-colors ${
                isFlipped
                  ? 'border-amberFilm bg-amberFilm text-neutral-950'
                  : 'border-white/25 text-white hover:border-amberFilm hover:text-amberFilm'
              }`}
            >
              <FlipHorizontal className="w-5 h-5" strokeWidth={2} />
            </button>

            <div className="flex items-end gap-3">
              <span className="text-white/40 font-mono-spec text-[10px] uppercase tracking-[0.14em] [writing-mode:vertical-rl]">
                Cỡ dáng
              </span>
              <input
                type="range"
                min="0.6"
                max="1.5"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                aria-label="Tỉ lệ khung dáng (0.6× đến 1.5×)"
                className="h-32 w-6 accent-[#FBBF24] cursor-ns-resize [writing-mode:vertical-lr] [direction:rtl]"
              />
            </div>

            <div className="flex flex-col gap-1 pb-1">
              <span className="text-white/40 font-mono-spec text-[10px] tabular-nums">1.5×</span>
              <span className="text-white/40 font-mono-spec text-[10px] tabular-nums">0.6×</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 pb-2">
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={() => setCapturedImage(null)}
                className="px-5 py-3 border border-white/30 text-white font-mono-spec text-[11px] font-bold uppercase tracking-[0.16em] hover:bg-white hover:text-neutral-950 transition-colors"
              >
                Chụp lại
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 bg-[#FBBF24] text-neutral-950 px-5 py-3 font-mono-spec text-[11px] font-bold uppercase tracking-[0.16em] hover:bg-amberFilm transition-colors"
              >
                <Download className="w-4 h-4" strokeWidth={2.2} />
                Tải ảnh
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleCapture}
              disabled={!!errorCopy || !isReady}
              aria-label="Chụp ảnh"
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-40 enabled:hover:border-amberFilm transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-white enabled:active:scale-95 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};