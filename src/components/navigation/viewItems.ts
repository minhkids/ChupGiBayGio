import { BookOpen, LayoutTemplate, Map, ShoppingBag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ViewId = 'map' | 'grid' | 'services';

export const LAYOUT_MAKER_PATH = '/tao-anh';

export const NAV_ITEMS: { id: ViewId; label: string; short: string; icon: LucideIcon }[] = [
  { id: 'map', label: 'Bản đồ', short: 'Bản đồ', icon: Map },
  { id: 'grid', label: 'Tạp chí', short: 'Tạp chí', icon: BookOpen },

  { id: 'services', label: 'Dịch vụ', short: 'Dịch vụ', icon: ShoppingBag },
];

export const LAYOUT_MAKER_NAV = {
  label: 'Tạo ảnh',
  short: 'Tạo ảnh',
  icon: LayoutTemplate,
  href: LAYOUT_MAKER_PATH,
} as const;

export function openLayoutMaker(): void {
  window.location.assign(LAYOUT_MAKER_PATH);
}
