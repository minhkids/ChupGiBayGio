import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ClipboardList,
  MapPin,
  Clock,
  Camera,
  Trash2,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  Shirt,
  Upload,
  Sparkles
} from 'lucide-react';
import { useShootPlan } from '../../context/ShootPlanContext';
import { readReferenceImage, exportVisualBrief } from './referenceImage';

interface ShootPlannerDrawerProps {
  onOpenPhotographerDirectory?: () => void;
}

export const ShootPlannerDrawer: React.FC<ShootPlannerDrawerProps> = ({
  onOpenPhotographerDirectory,
}) => {
  const {
    referencePhotos,
    addReferencePhoto,
    removeReferencePhoto,
    updateReferencePhotoNote,
    generateBriefText,
    spots,
    items,
    photographer,
    totalCount,
    totalSpotCost,
    totalItemCost,
    photographerCost,
    grandTotalFormatted,
    isDrawerOpen,
    closeDrawer,
    removeSpot,
    removeItem,
    removePhotographer,
    clearPlan,
    copyBriefToClipboard,
  } = useShootPlan();

  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const briefRef = useRef<HTMLDivElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    setUploading(true);
    setImageError(null);
    try {
      for (const file of files) {
        const imageUrl = await readReferenceImage(file);
        addReferencePhoto({ imageUrl, label: file.name });
      }
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Không đọc được ảnh. Hãy thử ảnh khác.');
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async () => {
    if (!briefRef.current || exporting) return;
    setExporting(true);
    setImageError(null);
    try {
      await exportVisualBrief(briefRef.current);
    } catch {
      setImageError('Không xuất được PNG. Ảnh nguồn có thể bị chặn hoặc mất kết nối. Hãy tải ảnh về máy rồi tải lên kế hoạch và thử lại.');
    } finally {
      setExporting(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  const handleCopy = async () => {
    const success = await copyBriefToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[var(--z-modal,75)] flex justify-end pointer-events-none">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg md:max-w-xl h-full bg-editorial-surface border-l border-editorial-border text-neutral-100 flex flex-col shadow-2xl pointer-events-auto overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Bản Kế Hoạch & Dự Toán Chi Phí Buổi Chụp"
          >
            {/* 1. Header */}
            <div className="relative shrink-0 border-b border-editorial-border bg-editorial-bg p-5 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center font-bold shadow-md shadow-amber-400/20">
                    <ClipboardList className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                      <span>Kế Hoạch & Dự Toán</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-400/20 text-amber-300 rounded-full border border-amber-400/30">
                        {totalCount} mục
                      </span>
                    </h2>
                    <p className="text-[11px] text-neutral-400">
                      Lịch trình và dự toán buổi chụp
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {totalCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Bạn có chắc muốn xóa toàn bộ kế hoạch để tạo mới?')) {
                          clearPlan();
                        }
                      }}
                      className="p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-neutral-800/80 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                      title="Xóa làm lại từ đầu"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline text-[11px]">Xóa hết</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                    aria-label="Đóng bảng kế hoạch"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-neutral-900/90 custom-scrollbar">
              {totalCount === 0 ? (
                /* Empty state */
                <div className="py-16 text-center space-y-3 px-4">
                  <div className="w-16 h-16 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 mx-auto flex items-center justify-center text-amber-400">
                    <ClipboardList className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">Chưa có mục nào trong kế hoạch</h3>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                    Bấm nút <strong className="text-amber-400">[+ Kế hoạch]</strong> tại các thẻ Địa điểm, Trang phục Shopee hoặc Thợ chụp ảnh để ước tính chi phí buổi chụp hoàn chỉnh.
                  </p>
                </div>
              ) : (
                <>
                  {/* NHÓM 1: ĐỊA ĐIỂM & GIỜ VÀNG */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                          1. Địa Điểm & Khung Giờ ({spots.length})
                        </h3>
                      </div>
                      <span className="text-xs font-mono-spec font-bold text-amber-400">
                        {totalSpotCost > 0 ? `${totalSpotCost.toLocaleString('vi-VN')}đ` : '0đ'}
                      </span>
                    </div>

                    {spots.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic p-3 bg-neutral-950/40 rounded-xl border border-neutral-800/60">
                        Chưa chọn điểm chụp nào. Hãy bấm [+ Kế hoạch] trên thẻ điểm chụp.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {spots.map((spot) => (
                          <div
                            key={spot.id}
                            className="p-3 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl flex items-start justify-between gap-3 transition-colors group"
                          >
                            <div className="flex items-start space-x-3 min-w-0">
                              <img
                                src={spot.coverImageUrl}
                                alt={spot.name}
                                className="w-14 h-14 rounded-lg object-cover shrink-0 border border-neutral-800"
                              />
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                                  {spot.name}
                                </h4>
                                <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-0.5 truncate">
                                  <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span className="truncate">{spot.bestTime}</span>
                                </div>
                                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-neutral-900 text-amber-300 border border-neutral-800">
                                    Vé/Nước: {spot.costFormatted}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeSpot(spot.id)}
                              className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                              title="Xóa khỏi kế hoạch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* NHÓM 2: TRANG PHỤC & ĐẠO CỤ */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <Shirt className="w-4 h-4 text-amber-300" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                          2. Đồ Mặc & Phụ Kiện ({items.length})
                        </h3>
                      </div>
                      <span className="text-xs font-mono-spec font-bold text-amber-300">
                        {totalItemCost > 0 ? `${totalItemCost.toLocaleString('vi-VN')}đ` : '0đ'}
                      </span>
                    </div>

                    {items.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic p-3 bg-neutral-950/40 rounded-xl border border-neutral-800/60">
                        Chưa chọn đồ mặc. Chọn trong mục Tap-to-Shop hoặc Tiệm thuê đồ.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl flex items-start justify-between gap-3 transition-colors group"
                          >
                            <div className="flex items-start space-x-3 min-w-0">
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-12 h-12 rounded-lg object-cover shrink-0 border border-neutral-800"
                                />
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="text-xs font-bold text-white truncate">
                                    {item.name}
                                  </h4>
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                    {item.categoryLabel}
                                  </span>
                                </div>
                                <div className="text-[11px] font-bold text-amber-400 mt-1">
                                  {item.priceFormatted}
                                </div>
                                {item.sourceUrl && (
                                  <a
                                    href={item.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-amber-300 hover:underline flex items-center gap-0.5 mt-0.5"
                                  >
                                    <span>Xem link mua/thuê</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                              title="Xóa khỏi kế hoạch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* NHÓM 3: NHIẾP ẢNH GIA */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-amber-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                          3. Thợ Chụp & Gói Đã Chọn
                        </h3>
                      </div>
                      <span className="text-xs font-mono-spec font-bold text-amber-400">
                        {photographerCost > 0 ? `${photographerCost.toLocaleString('vi-VN')}đ` : 'Chưa chọn'}
                      </span>
                    </div>

                    {!photographer ? (
                      <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-800/80 text-center space-y-2">
                        <p className="text-xs text-neutral-400">
                          Bạn chưa chọn thợ chụp ảnh cho buổi này.
                        </p>
                        {onOpenPhotographerDirectory && (
                          <button
                            type="button"
                            onClick={() => {
                              closeDrawer();
                              onOpenPhotographerDirectory();
                            }}
                            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs rounded-lg inline-flex items-center gap-1.5 border border-neutral-700 cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Xem Danh Bạ Thợ Ảnh Hà Nội</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-neutral-950 border-2 border-amber-500/50 rounded-xl flex items-start justify-between gap-3 shadow-md shadow-amber-500/5">
                        <div className="flex items-start space-x-3 min-w-0">
                          <img
                            src={photographer.avatarUrl}
                            alt={photographer.name}
                            className="w-13 h-13 rounded-full object-cover shrink-0 border-2 border-amber-400"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                              <span>{photographer.name}</span>
                              <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-black">
                                PRO
                              </span>
                            </h4>
                            <p className="text-[11px] text-amber-300 font-bold mt-0.5">
                              {photographer.packageName} ({photographer.priceFormatted})
                            </p>
                            <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
                              {photographer.duration} • {photographer.deliverablesSummary}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <a
                                href={photographer.zaloUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-amber-300 flex items-center gap-1 hover:bg-neutral-700"
                              >
                                <MessageCircle className="w-3 h-3 fill-current" />
                                <span>Zalo: {photographer.phone}</span>
                              </a>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={removePhotographer}
                          className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                          title="Bỏ chọn thợ này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
              <section className="space-y-3" aria-label="Ảnh mẫu & Shot List tham khảo">
                <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      4. Ảnh mẫu & Shot List tham khảo ({referencePhotos.length})
                    </h3>
                  </div>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1 text-xs text-amber-300 font-semibold focus-within:ring-2 focus-within:ring-amber-400 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>{uploading ? 'Đang xử lý ảnh…' : '+ Tải ảnh lên'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      disabled={uploading || exporting}
                      aria-label="Tải ảnh mẫu lên"
                      className="sr-only"
                      onChange={handleUpload}
                    />
                  </label>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Ghim góc chụp từ website hoặc tải ảnh mẫu từ máy/Pinterest (JPG, PNG, WebP) để tạo shot list chi tiết gửi cho thợ ảnh.
                </p>

                {/* Grid 3 cột */}
                <div className="grid grid-cols-3 gap-2">
                  {referencePhotos.map((photo, index) => (
                    <figure
                      key={photo.id}
                      className="group relative min-w-0 rounded-xl border border-neutral-850 hover:border-amber-400/50 bg-neutral-950 overflow-hidden flex flex-col justify-between transition-all"
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-neutral-900">
                        <img
                          src={photo.imageUrl}
                          alt={photo.label}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <button
                          type="button"
                          aria-label={`Xóa ảnh mẫu ${index + 1}`}
                          onClick={() => removeReferencePhoto(photo.id)}
                          className="absolute right-1.5 top-1.5 h-6 w-6 rounded-full bg-black/80 hover:bg-red-500 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 [@media(hover:none)]:opacity-100 shadow-md cursor-pointer"
                          title="Xóa nhanh khỏi kế hoạch"
                        >
                          <X className="h-3.5 w-3.5 stroke-[2.5]" />
                        </button>
                        <span className="absolute left-1.5 top-1.5 px-1.5 py-0.2 rounded bg-black/70 text-[9px] font-mono-spec font-bold text-amber-300">
                          #{index + 1}
                        </span>
                      </div>
                      <figcaption className="p-2 border-t border-neutral-900">
                        <p className="truncate text-[10px] font-medium text-neutral-300" title={photo.label}>
                          {index + 1}. {photo.label}
                        </p>
                        <textarea
                          aria-label={`Ghi chú ảnh ${index + 1}`}
                          title={photo.note || 'Thêm ghi chú góc chụp…'}
                          value={photo.note}
                          maxLength={240}
                          placeholder="Thêm ghi chú góc chụp…"
                          rows={2}
                          onChange={event => updateReferencePhotoNote(photo.id, event.target.value)}
                          className="mt-1 w-full resize-none rounded-md bg-neutral-900 border border-neutral-800 p-1 text-[11px] text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                        />
                      </figcaption>
                    </figure>
                  ))}
                </div>
                {referencePhotos.length === 0 && (
                  <p className="text-xs text-neutral-500 italic p-3 bg-neutral-950/40 rounded-xl border border-neutral-800/60">
                    Chưa có ảnh mẫu nào. Ghim ảnh trên website hoặc bấm [+ Tải ảnh lên] từ máy/Pinterest để tạo shot list.
                  </p>
                )}
              </section>
            </div>

            {/* A full-height print surface, independent of the drawer's scroll viewport. */}
            <div aria-hidden="true" className="fixed -left-[10000px] top-0 pointer-events-none">
              <div
                ref={briefRef}
                style={{
                  width: 760,
                  minHeight: 1000,
                  padding: 40,
                  background: '#faf8f4',
                  color: '#1c1917',
                  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  boxSizing: 'border-box',
                }}
              >
                {/* Brand Header */}
                <div style={{ borderBottom: '2px solid #e7e5e4', paddingBottom: 20, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'inline-block', backgroundColor: '#fbbf24', color: '#1c1917', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 6, letterSpacing: '0.05em', marginBottom: 8 }}>
                      CHỤP GÌ BÂY GIỜ · CHUPGIBAYGIO.VN
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0c0a09', margin: '4px 0' }}>
                      Bản Kế Hoạch & Visual Brief Buổi Chụp
                    </h1>
                    <p style={{ fontSize: 13, color: '#78716c', margin: 0 }}>
                      Lịch trình, chi phí dự toán & danh sách góc chụp tham khảo
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TỔNG DỰ TOÁN</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#b45309', fontFamily: 'monospace' }}>
                      {grandTotalFormatted}
                    </div>
                  </div>
                </div>

                {/* Key Summary Metrics Banner */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24, padding: 14, backgroundColor: '#f5f5f4', borderRadius: 12, border: '1px solid #e7e5e4' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#78716c', fontWeight: 600 }}>📍 ĐỊA ĐIỂM</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#1c1917', marginTop: 2 }}>{spots.length} điểm chụp</div>
                    <div style={{ fontSize: 11, color: '#b45309', fontWeight: 600, marginTop: 1 }}>{totalSpotCost > 0 ? `${totalSpotCost.toLocaleString('vi-VN')}đ` : 'Miễn phí'}</div>
                  </div>
                  <div style={{ textAlign: 'center', borderLeft: '1px solid #e7e5e4', borderRight: '1px solid #e7e5e4' }}>
                    <div style={{ fontSize: 11, color: '#78716c', fontWeight: 600 }}>👗 TRANG PHỤC & ĐỒ</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#1c1917', marginTop: 2 }}>{items.length} món đồ</div>
                    <div style={{ fontSize: 11, color: '#b45309', fontWeight: 600, marginTop: 1 }}>{totalItemCost > 0 ? `${totalItemCost.toLocaleString('vi-VN')}đ` : '0đ'}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#78716c', fontWeight: 600 }}>📷 NHIẾP ẢNH GIA</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#1c1917', marginTop: 2 }}>{photographer ? photographer.name : 'Tự chụp'}</div>
                    <div style={{ fontSize: 11, color: '#b45309', fontWeight: 600, marginTop: 1 }}>{photographerCost > 0 ? `${photographerCost.toLocaleString('vi-VN')}đ` : '0đ'}</div>
                  </div>
                </div>

                {/* Detailed Plan Text */}
                <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontSize: 13, lineHeight: 1.65, backgroundColor: '#ffffff', padding: 20, borderRadius: 12, border: '1px solid #e7e5e4', marginBottom: 24 }}>
                  {generateBriefText()}
                </div>

                {/* Section 4: Reference Photos & Moodboard Grid */}
                {referencePhotos.length > 0 && (
                  <div>
                    <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 800, color: '#0c0a09' }}>
                      🖼️ Ảnh mẫu & Shot List tham khảo ({referencePhotos.length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
                      {referencePhotos.map((photo, index) => (
                        <figure
                          key={photo.id}
                          style={{
                            margin: 0,
                            padding: 10,
                            border: '1px solid #e7e5e4',
                            borderRadius: 12,
                            background: '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}
                        >
                          <img
                            src={photo.imageUrl}
                            alt=""
                            style={{
                              width: '100%',
                              height: 190,
                              objectFit: 'cover',
                              borderRadius: 8,
                              backgroundColor: '#f5f5f4'
                            }}
                          />
                          <figcaption style={{ marginTop: 10, fontSize: 12, lineHeight: 1.5, overflowWrap: 'anywhere' }}>
                            <div style={{ fontWeight: 700, color: '#1c1917' }}>
                              #{index + 1}. {photo.label}
                            </div>
                            {photo.note && (
                              <div style={{ marginTop: 4, padding: '4px 8px', backgroundColor: '#fef3c7', borderRadius: 6, color: '#92400e', fontSize: 11, fontWeight: 500 }}>
                                📌 {photo.note}
                              </div>
                            )}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Brand Info */}
                <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #e7e5e4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#a8a29e' }}>
                  <span>Tạo tự động từ chupgibaygio.vn · Cẩm nang check-in & nhiếp ảnh Hà Nội</span>
                  <span>Gửi thợ ảnh trước buổi chụp để thống nhất góc máy</span>
                </div>
              </div>
            </div>

            {/* 3. Sticky Footer with Grand Total & CTAs */}
            <div className="shrink-0 p-5 border-t border-neutral-800 bg-neutral-950 flex flex-col gap-3 shadow-2xl">
              {/* Grand Total Box */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 block">
                    TỔNG DỰ TOÁN BUỔI CHỤP
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Vé/nước ({totalSpotCost.toLocaleString('vi-VN')}đ) + Đồ ({totalItemCost.toLocaleString('vi-VN')}đ) + Thợ ({photographerCost.toLocaleString('vi-VN')}đ)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl md:text-2xl font-black text-amber-400 tracking-tight font-mono-spec">
                    {grandTotalFormatted}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {imageError && <p role="alert" className="text-xs text-red-300">{imageError}</p>}
              <button
                type="button"
                aria-label="Xuất Thẻ Lịch Trình (Ảnh)"
                onClick={handleExport}
                disabled={exporting || uploading || totalCount === 0}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-[0.99] text-neutral-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-wait cursor-pointer"
              >
                {exporting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                    <span>Đang xuất PNG…</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm">🖼️</span>
                    <span>Xuất Thẻ Lịch Trình (Ảnh)</span>
                  </>
                )}
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Button 1: Copy Lịch Trình */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="py-3 px-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center space-x-1.5 border border-neutral-700 transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Đã copy lịch trình!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span>Copy Lịch Trình</span>
                    </>
                  )}
                </button>

                {/* Button 2: Đặt Lịch Chụp qua Zalo thợ */}
                {photographer ? (
                  <a
                    href={photographer.zaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-3.5 rounded-xl bg-kodak-amber hover:bg-amber-400 active:scale-[0.98] text-editorial-bg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Nhắn Zalo Đặt Lịch</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenPhotographerDirectory) {
                        closeDrawer();
                        onOpenPhotographerDirectory();
                      } else {
                        alert('Vui lòng chọn một thợ ảnh trong danh bạ trước khi đặt lịch.');
                      }
                    }}
                    className="py-3 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-neutral-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Chọn Thợ Để Đặt Lịch</span>
                  </button>
                )}
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
