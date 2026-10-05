import React, { useState } from 'react';
import { X, User, Users, Compass, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../services/db';
import type { PoseItem } from '../../types';
import { PoseCamera } from '../features/PoseCamera';
import { modalShutterVariants, backdropVariants } from '../../utils/motion-tokens';

interface PoseLibraryModalProps {
  onClose: () => void;
}

export const PoseLibraryModal: React.FC<PoseLibraryModalProps> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'female' | 'male' | 'couple' | 'props'>('female');
  const [selectedPose, setSelectedPose] = useState<PoseItem | null>(null);

  const categories = [
    { id: 'female', label: 'Nữ', icon: <User className="w-5 h-5" /> },
    { id: 'male', label: 'Nam', icon: <User className="w-5 h-5" /> },
    { id: 'couple', label: 'Cặp đôi', icon: <Users className="w-5 h-5" /> },
    { id: 'props', label: 'Phụ kiện', icon: <Smile className="w-5 h-5" /> },
  ] as const;

  const filteredPoses = db.poses.getAll().filter(p => p.category === activeCategory);

  return (
    <>
      <AnimatePresence>
        {!selectedPose && (
          <motion.div 
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-slateInk/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              variants={modalShutterVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-paper-light w-full max-w-2xl max-h-[85vh] border-2 border-slateInk shadow-hard flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slateInk bg-paper-warm">
                <div className="flex items-center space-x-2 font-mono-spec font-bold text-slateInk">
                  <Compass className="w-5 h-5 text-terracotta" />
                  <span className="uppercase tracking-wider text-sm">Thư Viện Dáng Chụp</span>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 border border-slateInk bg-paper-light hover:bg-slateInk hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Categories */}
              <div className="p-4 border-b border-slateInk/20 bg-white">
                <div className="flex justify-center gap-4">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 transition-all ${
                        activeCategory === cat.id 
                          ? 'border-terracotta bg-terracotta/10 text-terracotta shadow-xs' 
                          : 'border-slateInk/20 bg-paper-warm text-slateInk-muted hover:border-slateInk/50'
                      }`}
                    >
                      {cat.icon}
                      <span className="text-xs font-mono-spec font-semibold mt-1">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pose Grid */}
              <div className="p-4 overflow-y-auto flex-1 bg-neutral-50">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {filteredPoses.map(pose => (
                    <button
                      key={pose.id}
                      onClick={() => setSelectedPose(pose)}
                      className="group flex flex-col items-center bg-white border border-slateInk/20 rounded-xl p-3 hover:border-terracotta hover:shadow-hard transition-all text-left"
                    >
                      <div className="w-full aspect-square bg-slate-100 rounded-full flex items-center justify-center mb-3 relative overflow-hidden border border-slateInk/10">
                        <svg 
                          viewBox={pose.viewBox} 
                          className="w-3/4 h-3/4 opacity-40 group-hover:opacity-100 transition-opacity"
                        >
                          <path 
                            d={pose.svgPath} 
                            fill="none" 
                            stroke="#0f172a" 
                            strokeWidth="4" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                          />
                        </svg>
                      </div>
                      <div className="w-full">
                        <h4 className="font-bold text-sm text-slateInk mb-1 truncate">{pose.name}</h4>
                        <p className="text-xs text-slateInk-muted line-clamp-2">{pose.tips}</p>
                      </div>
                    </button>
                  ))}
                  {filteredPoses.length === 0 && (
                    <div className="col-span-full py-8 text-center text-slateInk-muted font-sans text-sm">
                      Chưa có dáng chụp nào cho danh mục này.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render PoseCamera if a pose is selected */}
      {selectedPose && (
        <PoseCamera 
          pose={selectedPose} 
          onClose={() => setSelectedPose(null)} 
        />
      )}
    </>
  );
};
