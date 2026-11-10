import type { SlotPhotoState } from './types';
import { DEFAULT_SLOT_TRANSFORM } from './types';

export function createEmptySlotPhoto(objectUrl: string): SlotPhotoState {
  return { objectUrl, image: null, transform: { ...DEFAULT_SLOT_TRANSFORM } };
}

export function loadImageFromFile(file: File): Promise<{ objectUrl: string; image: HTMLImageElement }> {
  const objectUrl = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ objectUrl, image });
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Không đọc được ảnh'));
    };
    image.src = objectUrl;
  });
}

export function revokeSlotPhoto(photo: SlotPhotoState | undefined): void {
  if (!photo?.objectUrl) return;
  URL.revokeObjectURL(photo.objectUrl);
}
