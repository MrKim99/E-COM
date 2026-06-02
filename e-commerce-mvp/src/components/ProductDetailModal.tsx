import React from 'react';
import { X, Youtube, Star, AlertCircle, ShoppingCart, Film } from 'lucide-react';
import { Product, Category } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductDetailModal({
  product,
  categories,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  if (!product) return null;

  const catObj = categories.find((c) => c.id === product.category_id);
  const categoryName = catObj ? catObj.name : 'Vật tư';

  const formatVND = (num: number) => num.toLocaleString('vi-VN') + ' đ';

  // Embed support for standard YouTube URLs if added by admin
  const getYoutubeEmbed = (url?: string) => {
    if (!url) return null;
    let videoId = '';
    
    try {
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
      }
    } catch (e) {
      console.warn("Invalid YouTube URL: ", url);
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
  };

  const embedUrl = getYoutubeEmbed(product.video_url);

  return (
    <div id="product-detail-modal-backdrop" className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div id="product-detail-modal-card" className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6 animate-scaleUp">
        
        {/* Close Button top-right */}
        <button
          id="btn-close-detail-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          
          {/* Left: Images / Badges */}
          <div className="space-y-4">
            <div className="relative pt-[100%] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
              <img
                src={product.image_url}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.is_featured && <span className="bg-sky-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">🏷️ NỔI BẬT</span>}
                {product.is_hot_deal && <span className="bg-orange-550 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">🔥 HOT DEAL</span>}
                {product.is_flash_sale && <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">⚡ FLASH SALE</span>}
              </div>
            </div>
            
            {/* Category tag status */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">Danh mục:</span>
              <span className="bg-slate-100 text-slate-800 font-extrabold px-2 py-1 rounded-sm">{categoryName}</span>
            </div>
          </div>

          {/* Right: Technical info and pricing */}
          <div className="flex flex-col justify-between">
            <div className="space-y-4 text-slate-800">
              <h2 id="modal-product-title" className="text-xl md:text-2xl font-black leading-snug tracking-tight text-slate-900">
                {product.name}
              </h2>

              {/* Price Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Giá bán công khai:</span>
                <div className="flex items-baseline space-x-3.5">
                  <span id="modal-prod-price" className="text-2xl font-black text-sky-600">
                    {formatVND(product.price_after_discount)}
                  </span>
                  {product.discount_percent > 0 && (
                    <>
                      <span id="modal-prod-original-price" className="text-slate-400 text-sm line-through">
                        {formatVND(product.original_price)}
                      </span>
                      <span className="bg-red-100 text-red-650 text-xs font-bold px-2 py-0.5 rounded-md">
                        -{product.discount_percent}% GIẢM
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Short Descripion */}
              <div>
                <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">Mô tả ngắn:</span>
                <p id="modal-prod-short-desc" className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-dashed border-slate-100 italic">
                  {product.description_short || 'Sản phẩm chính hãng chất lượng cao đạt tiêu chuẩn chứng nhận Y tế Việt Nam.'}
                </p>
              </div>

              {/* Specifications Warning */}
              <div className="flex items-start space-x-2 text-xs text-amber-650 bg-amber-50 p-3 rounded-xl border border-amber-100">
                <Star className="w-4 h-4 shrink-0 mt-0.5 fill-amber-400 text-amber-500" />
                <span>Cam kết 100% sản phẩm chính hãng, được đổi trả trong 7 ngày nếu lỗi từ nhà sản xuất.</span>
              </div>
            </div>

            {/* Main CTA button */}
            <div className="pt-6 border-t border-slate-100 mt-6 md:mt-0">
              <button
                id="btn-modal-add-to-cart"
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-all cursor-pointer shadow-lg shadow-sky-600/10 flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>THÊM VÀO GIỎ HÀNG</span>
              </button>
            </div>

          </div>

        </div>

        {/* Detailed Descriptions tab & Embedded YouTube Section */}
        <div className="border-t border-slate-100 pt-6 space-y-6">
          
          {/* Detailed Content */}
          <div className="space-y-2">
            <h4 id="detail-desc-title" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mô tả chi tiết sản phẩm</h4>
            <div id="modal-prod-detail-desc" className="text-sm text-slate-655 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {product.description_detail || 'Sản phẩm chưa cập nhật mô tả chi tiết cụ thể từ phía quản trị viên. Vui lòng liên hệ trực tiếp hotline để nhận hỗ trợ tư vấn sản phẩm dồi dào.'}
            </div>
          </div>

          {/* Video Block if exists */}
          {embedUrl ? (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>Video giới thiệu & hướng dẫn sử dụng</span>
              </h4>
              <div className="relative pt-[56.25%] rounded-2xl overflow-hidden shadow-md border border-slate-100">
                <iframe
                  id="modal-prod-video-iframe"
                  src={embedUrl}
                  title={`Video ${product.name}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
            </div>
          ) : product.video_url ? (
            // Fallback link if video is not direct youtube
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Video xem thêm</h4>
              <a
                href={product.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-sky-600 hover:text-sky-850 hover:underline text-xs bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100"
              >
                <Film className="w-4 h-4" />
                <span>Mở link video sản phẩm ↗</span>
              </a>
            </div>
          ) : null}

        </div>

      </div>
    </div>
  );
}
