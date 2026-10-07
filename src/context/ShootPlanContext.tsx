import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { Spot, Photographer, PlannedSpot, PlannedItem, PlannedPhotographer, ShootPlanState } from '../types';
import type { ReferencePhoto } from '../types/planner';

interface AddItemInput {
  id: string;
  name: string;
  category?: 'outfit' | 'prop' | 'accessory' | 'other' | string;
  categoryLabel?: string;
  price?: number | string;
  priceText?: string;
  imageUrl?: string;
  sourceUrl?: string;
  link?: string;
  shopName?: string;
  type?: 'rent' | 'purchase';
  notes?: string;
}

interface ShootPlanContextType {
  referencePhotos: ReferencePhoto[];
  addReferencePhoto: (input: { imageUrl: string; label: string; note?: string }) => void;
  removeReferencePhoto: (id: string) => void;
  updateReferencePhotoNote: (id: string, note: string) => void;
  isPhotoPinned: (imageUrl: string) => boolean;
  toggleReferencePhoto: (input: { imageUrl: string; label: string; note?: string }) => void;
  state: ShootPlanState;
  spots: PlannedSpot[];
  items: PlannedItem[];
  photographer: PlannedPhotographer | null;
  totalCount: number;
  totalSpotCost: number;
  totalItemCost: number;
  photographerCost: number;
  grandTotal: number;
  grandTotalFormatted: string;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addSpot: (spot: Spot, customCost?: number) => void;
  removeSpot: (spotId: string) => void;
  toggleSpot: (spot: Spot) => void;
  isSpotInPlan: (spotId: string) => boolean;
  isSpotPlanned: (spotId: string) => boolean;
  addItem: (input: AddItemInput) => void;
  removeItem: (itemId: string) => void;
  toggleItem: (input: AddItemInput) => void;
  isItemInPlan: (itemId: string) => boolean;
  isItemPlanned: (itemId: string) => boolean;
  setPhotographer: (photographer: Photographer, packageId?: string) => void;
  removePhotographer: () => void;
  clearPlan: () => void;
  generateBriefText: () => string;
  copyBriefToClipboard: () => Promise<boolean>;
}

const STORAGE_KEY = 'chupgibaygio_shoot_plan';

/**
 * Phân tích và ước tính chi phí vé/nước từ chuỗi mô tả giá của spot
 */
function parseSpotCost(spot: Spot): { cost: number; formatted: string } {
  if (spot.costType === 'FREE') {
    return { cost: 0, formatted: 'Miễn phí' };
  }

  const range = spot.ticketPriceRange || '';
  if (/miễn phí|free/i.test(range)) {
    return { cost: 0, formatted: 'Miễn phí' };
  }

  // Tìm các con số trong chuỗi (vd: "30.000 - 50.000đ" hoặc "30k" hoặc "50.000")
  const cleaned = range.replace(/\./g, '');
  const matchK = cleaned.match(/(\d+)\s*k/i);
  if (matchK) {
    const val = parseInt(matchK[1], 10) * 1000;
    return { cost: val, formatted: `${val.toLocaleString('vi-VN')}đ/người` };
  }

  const matchNum = cleaned.match(/(\d{4,9})/);
  if (matchNum) {
    const val = parseInt(matchNum[1], 10);
    return { cost: val, formatted: `${val.toLocaleString('vi-VN')}đ/người` };
  }

  // Fallback nếu có vé nhưng chưa rõ giá: mặc định ước tính 30k nước/vé
  return { cost: 35000, formatted: range || '~35.000đ (dự kiến)' };
}

/**
 * Phân tích giá tiền từ item trang phục/đạo cụ
 */
function parseItemPrice(priceInput?: number | string): { price: number; formatted: string } {
  if (typeof priceInput === 'number') {
    return {
      price: priceInput,
      formatted: `${priceInput.toLocaleString('vi-VN')}đ`
    };
  }

  if (!priceInput || priceInput.trim() === '') {
    return { price: 0, formatted: 'Chưa có giá' };
  }

  const str = priceInput.replace(/\./g, '');
  const matchK = str.match(/(\d+)\s*k/i);
  if (matchK) {
    const val = parseInt(matchK[1], 10) * 1000;
    return { price: val, formatted: `${val.toLocaleString('vi-VN')}đ` };
  }

  const matchNum = str.match(/(\d{4,9})/);
  if (matchNum) {
    const val = parseInt(matchNum[1], 10);
    return { price: val, formatted: `${val.toLocaleString('vi-VN')}đ` };
  }

  return { price: 0, formatted: priceInput };
}

const ShootPlanContext = createContext<ShootPlanContextType | undefined>(undefined);

export const ShootPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plan, setPlan] = useState<ShootPlanState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.spots) && Array.isArray(parsed.items)) {
          return { ...parsed, photographer: parsed.photographer ?? null,
            referencePhotos: Array.isArray(parsed.referencePhotos) ? parsed.referencePhotos.filter(
              (photo: ReferencePhoto) => photo && typeof photo.id === 'string' && typeof photo.imageUrl === 'string' && typeof photo.label === 'string' && typeof photo.note === 'string'
            ) : [] };
        }
      }
    } catch {
      // Ignored
    }
    // Mặc định ban đầu: điểm khởi đầu Hà Nội đẹp
    return {
      referencePhotos: [],
      spots: [],
      items: [],
      photographer: null,
    };
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Lưu tự động vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch {
      // Storage full or private mode.
    }
  }, [plan]);

  // Drawer handlers
  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen(prev => !prev), []);

  // 1. Quản lý Địa điểm
  const addSpot = useCallback((spot: Spot, customCost?: number) => {
    setPlan(prev => {
      if (prev.spots.some(s => s.id === spot.id)) {
        return prev; // Đã có trong kế hoạch
      }

      const costInfo = customCost !== undefined
        ? { cost: customCost, formatted: `${customCost.toLocaleString('vi-VN')}đ` }
        : parseSpotCost(spot);

      const newSpot: PlannedSpot = {
        id: spot.id,
        name: spot.name,
        coverImageUrl: spot.coverImageUrl,
        address: spot.address,
        bestTime: spot.bestTimeDescription,
        costEstimated: costInfo.cost,
        costFormatted: costInfo.formatted,
        costType: spot.costType,
      };

      return {
        ...prev,
        spots: [...prev.spots, newSpot],
      };
    });
  }, []);

  const removeSpot = useCallback((spotId: string) => {
    setPlan(prev => ({
      ...prev,
      spots: prev.spots.filter(s => s.id !== spotId),
    }));
  }, []);

  const isSpotInPlan = useCallback((spotId: string) => {
    return plan.spots.some(s => s.id === spotId);
  }, [plan.spots]);

  const toggleSpot = useCallback((spot: Spot) => {
    if (plan.spots.some(s => s.id === spot.id)) {
      removeSpot(spot.id);
    } else {
      addSpot(spot);
    }
  }, [plan.spots, addSpot, removeSpot]);

  // 2. Quản lý Trang phục & Phụ kiện
  const addItem = useCallback((input: AddItemInput) => {
    setPlan(prev => {
      if (prev.items.some(i => i.id === input.id)) {
        return prev;
      }

      const rawPrice = input.priceText ?? input.price;
      const priceInfo = parseItemPrice(rawPrice);
      const rawCategory = input.category || 'outfit';
      const category: 'outfit' | 'prop' | 'accessory' = 
        rawCategory === 'prop' ? 'prop' : rawCategory === 'accessory' ? 'accessory' : 'outfit';
      const categoryLabel = input.categoryLabel || (
        category === 'prop' ? 'Đạo cụ / Hoa' : category === 'accessory' ? 'Phụ kiện' : 'Trang phục'
      );

      const newItem: PlannedItem = {
        id: input.id,
        name: input.name,
        category,
        categoryLabel,
        imageUrl: input.imageUrl,
        price: priceInfo.price,
        priceFormatted: priceInfo.formatted,
        sourceUrl: input.sourceUrl || input.link,
        shopName: input.shopName,
      };

      return {
        ...prev,
        items: [...prev.items, newItem],
      };
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setPlan(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== itemId),
    }));
  }, []);

  const isItemInPlan = useCallback((itemId: string) => {
    return plan.items.some(i => i.id === itemId);
  }, [plan.items]);

  const toggleItem = useCallback((input: AddItemInput) => {
    if (plan.items.some(i => i.id === input.id)) {
      removeItem(input.id);
    } else {
      addItem(input);
    }
  }, [plan.items, addItem, removeItem]);

  // 3. Quản lý Photographer
  const setPhotographer = useCallback((photographer: Photographer, packageId?: string) => {
    setPlan(prev => {
      // Tìm gói được chọn hoặc mặc định gói highlight / gói đầu tiên
      const pkg = packageId
        ? photographer.packages.find(p => p.id === packageId)
        : (photographer.packages.find(p => p.highlight) || photographer.packages[0]);

      const pkgPrice = pkg ? pkg.price : photographer.startingPrice;
      const pkgPriceFormatted = pkg ? pkg.priceFormatted : photographer.startingPriceFormatted;
      const packageName = pkg ? pkg.name : 'Gói Tiêu Chuẩn';
      const duration = pkg ? pkg.duration : '2 tiếng';
      const deliverablesSummary = pkg
        ? `${pkg.deliverables.totalOriginalPhotos} • ${pkg.deliverables.retouchedPhotos}`
        : 'Trả ảnh gốc & photoshop';

      const plannedPhotographer: PlannedPhotographer = {
        id: photographer.id,
        name: photographer.name,
        avatarUrl: photographer.avatarUrl,
        gear: photographer.gear,
        packageId: pkg ? pkg.id : 'pkg-default',
        packageName,
        price: pkgPrice,
        priceFormatted: pkgPriceFormatted,
        duration,
        deliverablesSummary,
        zaloUrl: photographer.contact.zaloUrl,
        phone: photographer.contact.phone,
      };

      return {
        ...prev,
        photographer: plannedPhotographer,
      };
    });
  }, []);

  const removePhotographer = useCallback(() => {
    setPlan(prev => ({
      ...prev,
      photographer: null,
    }));
  }, []);

  const addReferencePhoto = useCallback((input: { imageUrl: string; label: string; note?: string }) => {
    const photo: ReferencePhoto = { ...input, id: crypto.randomUUID(), note: (input.note ?? '').slice(0, 240) };
    setPlan(prev => prev.referencePhotos.some(p => p.imageUrl === photo.imageUrl) ? prev : {
      ...prev, referencePhotos: [...prev.referencePhotos, photo],
    });
  }, []);

  const removeReferencePhoto = useCallback((id: string) => {
    setPlan(prev => ({ ...prev, referencePhotos: prev.referencePhotos.filter(p => p.id !== id) }));
  }, []);

  const updateReferencePhotoNote = useCallback((id: string, note: string) => {
    setPlan(prev => ({ ...prev, referencePhotos: prev.referencePhotos.map(p => p.id === id ? { ...p, note: note.slice(0, 240) } : p) }));
  }, []);

  const isPhotoPinned = useCallback((imageUrl: string) => {
    return plan.referencePhotos.some(p => p.imageUrl === imageUrl);
  }, [plan.referencePhotos]);

  const toggleReferencePhoto = useCallback((input: { imageUrl: string; label: string; note?: string }) => {
    setPlan(prev => {
      const existing = prev.referencePhotos.find(p => p.imageUrl === input.imageUrl);
      if (existing) {
        return { ...prev, referencePhotos: prev.referencePhotos.filter(p => p.id !== existing.id) };
      }
      const photo: ReferencePhoto = { ...input, id: crypto.randomUUID(), note: (input.note ?? '').slice(0, 240) };
      return { ...prev, referencePhotos: [...prev.referencePhotos, photo] };
    });
  }, []);

  const clearPlan = useCallback(() => {
    setPlan({
      referencePhotos: [],
      spots: [],
      items: [],
      photographer: null,
    });
  }, []);

  // 4. Tính toán chi phí
  const totalCount = useMemo(() => {
    return plan.spots.length + plan.items.length + plan.referencePhotos.length + (plan.photographer ? 1 : 0);
  }, [plan]);

  const totalSpotCost = useMemo(() => {
    return plan.spots.reduce((sum, s) => sum + s.costEstimated, 0);
  }, [plan.spots]);

  const totalItemCost = useMemo(() => {
    return plan.items.reduce((sum, i) => sum + i.price, 0);
  }, [plan.items]);

  const photographerCost = useMemo(() => {
    return plan.photographer ? plan.photographer.price : 0;
  }, [plan.photographer]);

  const grandTotal = useMemo(() => {
    return totalSpotCost + totalItemCost + photographerCost;
  }, [totalSpotCost, totalItemCost, photographerCost]);

  const grandTotalFormatted = useMemo(() => {
    return `${grandTotal.toLocaleString('vi-VN')}đ`;
  }, [grandTotal]);

  // 5. Tự format chuỗi tóm tắt lịch trình (Copy Brief)
  const generateBriefText = useCallback(() => {
    const lines: string[] = [];
    lines.push('📸 BẢN KẾ HOẠCH & DỰ TOÁN BUỔI CHỤP');
    lines.push('Tạo từ: Chụp Gì Bây Giờ (chupgibaygio.vn)');
    lines.push('====================================');
    lines.push('');

    // Nhóm 1: Địa điểm
    if (plan.spots.length > 0) {
      lines.push(`📍 1. ĐỊA ĐIỂM CHECK-IN (${plan.spots.length} điểm):`);
      plan.spots.forEach((spot, idx) => {
        lines.push(`  ${idx + 1}. ${spot.name}`);
        lines.push(`     • Khung giờ vàng: ${spot.bestTime}`);
        lines.push(`     • Vé / Phí nước: ${spot.costFormatted}`);
        lines.push(`     • Địa chỉ: ${spot.address}`);
      });
      lines.push(`  => Dự toán vé/nước: ${totalSpotCost.toLocaleString('vi-VN')}đ`);
      lines.push('');
    } else {
      lines.push('📍 1. ĐỊA ĐIỂM: (Chưa chọn điểm chụp)');
      lines.push('');
    }

    // Nhóm 2: Trang phục & Phụ kiện
    if (plan.items.length > 0) {
      lines.push(`👗 2. TRANG PHỤC & ĐẠO CỤ (${plan.items.length} món):`);
      plan.items.forEach((item, idx) => {
        lines.push(`  ${idx + 1}. ${item.name} (${item.categoryLabel})`);
        lines.push(`     • Giá dự kiến: ${item.priceFormatted}`);
        if (item.sourceUrl) {
          lines.push(`     • Link mua/thuê: ${item.sourceUrl}`);
        }
      });
      lines.push(`  => Dự toán đồ mặc: ${totalItemCost.toLocaleString('vi-VN')}đ`);
      lines.push('');
    }

    // Nhóm 3: Photographer
    if (plan.photographer) {
      lines.push('📷 3. NHIẾP ẢNH GIA ĐÃ CHỌN:');
      lines.push(`  • Thợ chụp: ${plan.photographer.name}`);
      lines.push(`  • Máy móc gear: ${plan.photographer.gear.split('•')[0]}`);
      lines.push(`  • Gói chụp: ${plan.photographer.packageName} (${plan.photographer.priceFormatted})`);
      lines.push(`  • Thời lượng: ${plan.photographer.duration}`);
      lines.push(`  • Trả ảnh: ${plan.photographer.deliverablesSummary}`);
      lines.push(`  • Zalo thợ: ${plan.photographer.phone}`);
      lines.push('');
    }

    if (plan.referencePhotos.length) {
      lines.push('4. ẢNH MẪU & SHOT LIST THAM KHẢO:');
      plan.referencePhotos.forEach((photo, index) => lines.push(`  ${index + 1}. ${photo.label}${photo.note ? ` — ${photo.note}` : ''}`));
      lines.push('');
    }

    // Khối tổng chi phí
    lines.push('====================================');
    lines.push(`💰 TỔNG DỰ TOÁN BUỔI CHỤP: ~${grandTotal.toLocaleString('vi-VN')}đ`);
    lines.push('====================================');

    return lines.join('\n');
  }, [plan, totalSpotCost, totalItemCost, grandTotal]);

  const copyBriefToClipboard = useCallback(async () => {
    const briefText = generateBriefText();
    try {
      await navigator.clipboard.writeText(briefText);
      return true;
    } catch {
      // Fallback
      try {
        const textarea = document.createElement('textarea');
        textarea.value = briefText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      } catch {
        return false;
      }
    }
  }, [generateBriefText]);

  const value = useMemo(() => ({
    referencePhotos: plan.referencePhotos,
    addReferencePhoto,
    removeReferencePhoto,
    updateReferencePhotoNote,
    isPhotoPinned,
    toggleReferencePhoto,
    state: plan,
    spots: plan.spots,
    items: plan.items,
    photographer: plan.photographer,
    totalCount,
    totalSpotCost,
    totalItemCost,
    photographerCost,
    grandTotal,
    grandTotalFormatted,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    addSpot,
    removeSpot,
    toggleSpot,
    isSpotInPlan,
    isSpotPlanned: isSpotInPlan,
    addItem,
    removeItem,
    toggleItem,
    isItemInPlan,
    isItemPlanned: isItemInPlan,
    setPhotographer,
    removePhotographer,
    clearPlan,
    generateBriefText,
    copyBriefToClipboard,
  }), [
    addReferencePhoto,
    removeReferencePhoto,
    updateReferencePhotoNote,
    isPhotoPinned,
    toggleReferencePhoto,
    plan,
    totalCount,
    totalSpotCost,
    totalItemCost,
    photographerCost,
    grandTotal,
    grandTotalFormatted,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    addSpot,
    removeSpot,
    toggleSpot,
    isSpotInPlan,
    addItem,
    removeItem,
    toggleItem,
    isItemInPlan,
    setPhotographer,
    removePhotographer,
    clearPlan,
    generateBriefText,
    copyBriefToClipboard,
  ]);

  return (
    <ShootPlanContext.Provider value={value}>
      {children}
    </ShootPlanContext.Provider>
  );
};

const defaultFallbackState: ShootPlanState = {
  referencePhotos: [],
  spots: [],
  items: [],
  photographer: null,
};

const defaultFallbackContext: ShootPlanContextType = {
  referencePhotos: [],
  addReferencePhoto: () => {},
  removeReferencePhoto: () => {},
  updateReferencePhotoNote: () => {},
  isPhotoPinned: () => false,
  toggleReferencePhoto: () => {},
  state: defaultFallbackState,
  spots: [],
  items: [],
  photographer: null,
  totalCount: 0,
  totalSpotCost: 0,
  totalItemCost: 0,
  photographerCost: 0,
  grandTotal: 0,
  grandTotalFormatted: '0đ',
  isDrawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  toggleDrawer: () => {},
  addSpot: () => {},
  removeSpot: () => {},
  toggleSpot: () => {},
  isSpotInPlan: () => false,
  isSpotPlanned: () => false,
  addItem: () => {},
  removeItem: () => {},
  toggleItem: () => {},
  isItemInPlan: () => false,
  isItemPlanned: () => false,
  setPhotographer: () => {},
  removePhotographer: () => {},
  clearPlan: () => {},
  generateBriefText: () => '',
  copyBriefToClipboard: async () => false,
};

export function useShootPlan(): ShootPlanContextType {
  const context = useContext(ShootPlanContext);
  if (!context) {
    console.warn('useShootPlan was used outside of ShootPlanProvider. Using safe fallback context.');
    return defaultFallbackContext;
  }
  return context;
}
