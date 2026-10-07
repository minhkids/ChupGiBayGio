const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Persist pixels, not blob URLs, which expire when the page closes. */
export async function readReferenceImage(file: File): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.');
  if (file.size > MAX_FILE_SIZE) throw new Error('Mỗi ảnh tối đa 10 MB.');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 1000 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Trình duyệt không hỗ trợ xử lý ảnh.');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function exportVisualBrief(node: HTMLElement): Promise<void> {
  const { toBlob } = await import('html-to-image');
  const clone = node.cloneNode(true) as HTMLElement;
  clone.style.position = 'fixed';
  clone.style.left = '-10000px';
  clone.style.top = '0';
  document.body.appendChild(clone);
  try {
    // Explicitly resolve every reference: convert cross-origin images to base64 if possible
    await Promise.all(Array.from(clone.querySelectorAll('img')).map(async image => {
      if (!image.src.startsWith('data:')) {
        try {
          const response = await fetch(image.src, { mode: 'cors', signal: AbortSignal.timeout(10000) });
          if (response.ok) {
            const blob = await response.blob();
            image.src = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = () => resolve(image.src);
              reader.readAsDataURL(blob);
            });
          }
        } catch {
          // Graceful fallback: keep existing url and continue export
        }
      }
      try {
        await image.decode();
      } catch {
        // Ignored
      }
    }));
    const blob = await toBlob(clone, {
      pixelRatio: 2,
      backgroundColor: '#fcfaf6',
      skipFonts: true,
      width: 760,
      height: clone.scrollHeight,
      style: { position: 'static', left: 'auto', top: 'auto' },
    });
    if (!blob) throw new Error('Không tạo được PNG.');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ke-hoach-buoi-chup-${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } finally {
    clone.remove();
  }
}
