import { BookOpen, Map, ShoppingBag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ViewId = 'map' | 'grid' | 'services';

export const NAV_ITEMS: { id: ViewId; label: string; short: string; icon: LucideIcon }[] = [
  { id: 'map', label: 'Bản đồ', short: 'Bản đồ', icon: Map },
  { id: 'grid', label: 'Tạp chí', short: 'Tạp chí', icon: BookOpen },

  { id: 'services', label: 'Dịch vụ', short: 'Dịch vụ', icon: ShoppingBag },
];
