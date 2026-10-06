import React from 'react';
import { MapPin, ExternalLink, MessageSquare, ChevronRight, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import type { InspirationPost, Spot } from '../../types';
import type { PostFeedProps } from './shared-types';

interface PostItemProps {
  post: InspirationPost & { spot: Spot };
  onSelectSpot: (spot: Spot) => void;
  isMobile?: boolean;
  mobileSnap?: 'peek' | 'half' | 'full';
}

const PostItem: React.FC<PostItemProps> = ({
  post,
  onSelectSpot,
  isMobile = false,
  mobileSnap,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-850/80 hover:border-blue-400/60 dark:hover:border-blue-500/60 transition-all space-y-2.5 shadow-xs"
    >
      {/* Author Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="w-7 h-7 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
          />
          <div>
            <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center space-x-1">
              <span>{post.authorName}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded font-mono-spec font-semibold">
                Aphoto
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 font-mono-spec">
              {post.postDate}
            </div>
          </div>
        </div>

        <a
          href={post.postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
          title="Mở bài viết gốc trên Facebook"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Caption & Post Content */}
      <p className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-3 leading-relaxed font-sans">
        {post.fullContent || post.caption}
      </p>

      {/* Photo Preview Strip */}
      {post.galleryUrls && post.galleryUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 rounded-lg overflow-hidden">
          {post.galleryUrls.slice(0, 3).map((img, imgIdx) => (
            <div key={imgIdx} className="relative aspect-4/3 bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover hover:scale-105 transition-transform"
                loading="lazy"
                onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }}
              />
              {imgIdx === 2 && (post.galleryUrls || []).length > 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-mono-spec font-bold">
                  +{(post.galleryUrls || []).length - 3}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Camera Settings Snippet */}
      {post.cameraSettings && (
        <div className="text-[10px] font-mono-spec text-neutral-500 dark:text-neutral-400 flex items-center space-x-1 truncate bg-neutral-50 dark:bg-neutral-800/60 px-2 py-1 rounded">
          <Camera className="w-3 h-3 text-terracotta shrink-0" />
          <span className="truncate">{post.cameraSettings}</span>
        </div>
      )}

      {/* Spot Badge & Focus Map Action */}
      <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800">
        <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300 truncate max-w-[200px] flex items-center">
          <MapPin className="w-3 h-3 text-terracotta mr-1 shrink-0" />
          <span className="truncate">{post.spot.name}</span>
        </span>

        <button
          type="button"
          onClick={() => {
            onSelectSpot(post.spot);
            if (isMobile && mobileSnap !== 'peek') {
              // On mobile, close drawer when navigating to spot
            }
          }}
          className="text-xs font-semibold text-terracotta hover:underline flex items-center space-x-1"
        >
          <span>Xem trên bản đồ</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

interface PostFeedMobileProps {
  posts: (InspirationPost & { spot: Spot })[];
  onSelectSpot: (spot: Spot) => void;
  mobileSnap: 'peek' | 'half' | 'full';
  className?: string;
}

const PostFeedMobile: React.FC<PostFeedMobileProps> = ({
  posts,
  onSelectSpot,
  mobileSnap,
}) => {
  if (posts.length === 0) {
    return (
      <div className="py-12 text-center space-y-2 text-neutral-500">
        <MessageSquare className="w-8 h-8 text-neutral-300 mx-auto" />
        <p className="font-editorial text-base">Chưa có bài viết nào phù hợp</p>
        <button
          type="button"
          onClick={() => {
            // onChangeFilters would be needed here but we don't have it in mobile context
          }}
          className="text-xs font-mono-spec font-bold text-blue-600 hover:underline"
        >
          Xem lại tất cả bài viết
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map(post => (
        <div
          key={post.id}
          onClick={() => {
            onSelectSpot(post.spot);
            if (mobileSnap !== 'peek') {
              // Could trigger drawer snap to peek
            }
          }}
          className="p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-850 space-y-2 shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-6 h-6 rounded-full object-cover"
              />
              <div>
                <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  {post.authorName}
                </div>
                <div className="text-[10px] text-neutral-400 font-mono-spec">
                  {post.postDate}
                </div>
              </div>
            </div>

            <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded font-mono-spec">
              Aphoto
            </span>
          </div>

          <p className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-2 leading-relaxed">
            {post.fullContent || post.caption}
          </p>

          {post.galleryUrls && post.galleryUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
              {post.galleryUrls.slice(0, 3).map((img, i) => (
                <div key={i} className="aspect-4/3 bg-neutral-200 overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} />
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800 text-[11px]">
            <span className="text-neutral-600 dark:text-neutral-400 font-medium truncate flex items-center">
              <MapPin className="w-3 h-3 text-terracotta mr-1 shrink-0" />
              <span className="truncate">{post.spot.name}</span>
            </span>

            <span className="text-terracotta font-bold shrink-0">
              Xem vị trí →
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

interface PostFeedDesktopProps {
  posts: (InspirationPost & { spot: Spot })[];
  onSelectSpot: (spot: Spot) => void;
  postTagFilter: string;
  setPostTagFilter: (tag: string) => void;
  className?: string;
}

const PostFeedDesktop: React.FC<PostFeedDesktopProps> = ({
  posts,
  onSelectSpot,
  setPostTagFilter,
}) => {
  if (posts.length === 0) {
    return (
      <div className="py-12 text-center space-y-2 text-neutral-500">
        <MessageSquare className="w-8 h-8 text-neutral-300 mx-auto" />
        <p className="font-editorial text-base">Chưa có bài viết nào phù hợp</p>
        <button
          type="button"
          onClick={() => {
            setPostTagFilter('ALL');
          }}
          className="text-xs font-mono-spec font-bold text-blue-600 hover:underline"
        >
          Xem lại tất cả bài viết
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {posts.map(post => (
        <PostItem
          key={post.id}
          post={post}
          onSelectSpot={onSelectSpot}
          isMobile={false}
        />
      ))}
    </div>
  );
};

export const PostFeed: React.FC<PostFeedProps> = ({
  posts,
  callbacks,
  postTagFilter,
  setPostTagFilter,
  isMobile = false,
  mobileSnap = 'peek',
  className = '',
}) => {
  const { onSelectSpot } = callbacks;

  if (isMobile) {
    return (
      <PostFeedMobile
        posts={posts}
        onSelectSpot={onSelectSpot}
        mobileSnap={mobileSnap}
        className={className}
      />
    );
  }

  return (
    <PostFeedDesktop
      posts={posts}
      onSelectSpot={onSelectSpot}
      postTagFilter={postTagFilter}
      setPostTagFilter={setPostTagFilter}
      className={className}
    />
  );
};