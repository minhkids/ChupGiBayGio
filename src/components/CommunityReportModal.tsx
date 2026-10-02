import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import type { Spot, CommunityReport } from '../types';

interface CommunityReportModalProps {
  spot: Spot | null;
  onClose: () => void;
  onSubmitReport: (spotId: string, report: Omit<CommunityReport, 'id' | 'reportedAt'>) => void;
}

export const CommunityReportModal: React.FC<CommunityReportModalProps> = ({
  spot,
  onClose,
  onSubmitReport
}) => {
  const [authorName, setAuthorName] = useState('');
  const [bloomPercentage, setBloomPercentage] = useState<number>(spot?.seasonalTrend.bloomPercentage || 85);
  const [crowdLevel, setCrowdLevel] = useState<'Rất vắng' | 'Bình thường' | 'Đông' | 'Quá tải'>('Bình thường');
  const [weather, setWeather] = useState<'Nắng đẹp' | 'Nắng gắt' | 'Nhiều mây' | 'Âm u' | 'Mưa bay'>('Nắng đẹp');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!spot) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !notes.trim()) return;

    onSubmitReport(spot.id, {
      authorName: authorName.trim(),
      bloomPercentage,
      crowdLevel,
      weather,
      notes: notes.trim()
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] overflow-y-auto bg-slateInk/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-paper-light border-2 border-slateInk w-full max-w-lg shadow-hard-lg overflow-hidden reticle-corner reticle-tl reticle-br"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-slateInk bg-paper-warm px-4 py-2.5 flex items-center justify-between font-mono-spec text-xs">
          <span className="font-bold text-terracotta">BÁO CÁO THỰC ĐỊA HÔM NAY</span>
          <button onClick={onClose} className="w-6 h-6 border border-slateInk bg-paper-light flex items-center justify-center hover:bg-slateInk hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-terracotta mx-auto" />
            <h3 className="font-editorial text-2xl font-bold text-slateInk">Cảm ơn đóng góp của bạn!</h3>
            <p className="text-xs text-slateInk-muted font-sans">
              Báo cáo của bạn đã được cập nhật trực tiếp vào hồ sơ địa điểm <strong>{spot.name}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs font-sans">
            <div>
              <span className="text-[11px] font-mono-spec text-slateInk-muted block">ĐỊA ĐIỂM BÁO CÁO:</span>
              <h3 className="font-editorial text-lg font-bold text-slateInk">{spot.name}</h3>
            </div>

            {/* Author Name */}
            <div>
              <label className="font-mono-spec font-bold text-slateInk block mb-1">
                TÊN BẠN / BIỆT DANH PHOTOGRAPHER: *
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="VD: Hoàng Tuấn (Sony shooter)"
                className="w-full p-2 bg-paper-warm border border-slateInk/40 focus:border-slateInk text-sm font-sans focus:outline-none"
              />
            </div>

            {/* Bloom percentage slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-mono-spec font-bold text-slateInk">
                  TÌNH TRẠNG HOA NỞ / DECOR HOÀN THIỆN:
                </label>
                <span className="font-mono-spec font-bold text-terracotta text-sm">
                  {bloomPercentage}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={bloomPercentage}
                onChange={(e) => setBloomPercentage(Number(e.target.value))}
                className="w-full accent-terracotta"
              />
              <div className="flex justify-between text-[10px] font-mono-spec text-slateInk-muted">
                <span>Chớm nở (10%)</span>
                <span>Rực rỡ nhất (90-100%)</span>
                <span>Tàn dần</span>
              </div>
            </div>

            {/* Crowd Level */}
            <div>
              <label className="font-mono-spec font-bold text-slateInk block mb-1">
                MỨC ĐỘ ĐÔNG ĐÚC:
              </label>
              <div className="grid grid-cols-4 gap-1.5 font-mono-spec">
                {(['Rất vắng', 'Bình thường', 'Đông', 'Quá tải'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setCrowdLevel(level)}
                    className={`py-1.5 border text-center transition-all ${
                      crowdLevel === level
                        ? 'border-slateInk bg-slateInk text-white font-bold'
                        : 'border-paper-border bg-paper-warm text-slateInk hover:border-slateInk'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Weather status */}
            <div>
              <label className="font-mono-spec font-bold text-slateInk block mb-1">
                THỜI TIẾT TẠI ĐIỂM CHỤP:
              </label>
              <div className="grid grid-cols-5 gap-1 font-mono-spec text-[11px]">
                {(['Nắng đẹp', 'Nắng gắt', 'Nhiều mây', 'Âm u', 'Mưa bay'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWeather(w)}
                    className={`py-1.5 border text-center transition-all ${
                      weather === w
                        ? 'border-terracotta bg-terracotta text-white font-bold'
                        : 'border-paper-border bg-paper-warm text-slateInk hover:border-slateInk'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Real Notes */}
            <div>
              <label className="font-mono-spec font-bold text-slateInk block mb-1">
                GHI CHÚ THỰC TẾ (HƯỚNG NẮNG, HOA TƯƠI/DẬP, GIÁ VÉ): *
              </label>
              <textarea
                required
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="VD: Hoa đang rất tươi, nên đi tầm 16h nắng xiên qua hoa rất đẹp, vé 70k không phụ thu máy..."
                className="w-full p-2 bg-paper-warm border border-slateInk/40 focus:border-slateInk text-sm font-sans focus:outline-none"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-2 border-t border-paper-border flex justify-end space-x-2 font-mono-spec">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 border border-slateInk bg-paper-warm text-slateInk hover:bg-paper-light"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 border border-slateInk bg-terracotta text-white font-bold shadow-hard hover:bg-terracotta-dark flex items-center"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Gửi Báo Cáo
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
