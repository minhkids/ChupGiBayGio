export interface ExportResult {
  kind: 'download' | 'share' | 'preview';
  blob: Blob;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: 'image/png' | 'image/jpeg', quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Không tạo được ảnh'))),
      type,
      quality,
    );
  });
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export async function exportLayoutImage(
  canvas: HTMLCanvasElement,
  filename: string,
): Promise<ExportResult> {
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
  const file = new File([blob], filename, { type: 'image/jpeg' });

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      const payload: ShareData & { files?: File[] } = { files: [file], title: 'Ảnh từ Chụp Gì Bây Giờ' };
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share(payload);
        return { kind: 'share', blob };
      }
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') {
        return { kind: 'share', blob };
      }
    }
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  // iOS Safari often ignores download — caller may show preview fallback.
  URL.revokeObjectURL(url);
  if (isIOS()) {
    return { kind: 'preview', blob };
  }
  return { kind: 'download', blob };
}

export function blobToObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}
