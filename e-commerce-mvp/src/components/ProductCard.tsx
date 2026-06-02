import React from 'react';
import { Plus, Maximize2, ShoppingCart } from 'lucide-react';
import { Product, Category } from '../types';

interface ProductCardProps {
  product: Product;
  categories: Category[];
  onAddToCart: (product: Product, e: any) => void;
  onOpenDetails: (product: Product) => void;
  key?: any;
}

export default function ProductCard({
  product,
  categories,
  onAddToCart,
  onOpenDetails,
}: ProductCardProps) {
  // Find category name
  const catObj = categories.find((c) => c.id === product.category_id);
  const categoryName = catObj ? catObj.name : 'Vật tư';

  // Format currency helper
  const formatVND = (num: number) => num.toLocaleString('vi-VN') + ' đ';

  return (
    <div
      id={`product-card-${product.id}`}
      className="bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-sky-350 hover:shadow-xl hover:-translate-y-1 transition-all duration-350 flex flex-col h-full group"
    >
      {/* Product Image and Overlay Badges */}
      <div className="relative pt-[75%] bg-slate-50 overflow-hidden cursor-pointer shrink-0" onClick={() => onOpenDetails(product)}>
        <img
          src={product.image_url}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* 3c. Badges Overlay - Left Top */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_featured && (
            <span id={`badge-featured-${product.id}`} className="bg-sky-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs flex items-center space-x-1">
              <span>🏷️</span>
              <span>NỔI BẬT</span>
            </span>
          )}
          {product.is_hot_deal && (
            <span id={`badge-hot-${product.id}`} className="bg-orange-550 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs flex items-center space-x-1">
              <span>🔥</span>
              <span>HOT DEAL</span>
            </span>
          )}
          {product.is_flash_sale && (
            <span id={`badge-flash-${product.id}`} className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs flex items-center space-x-1 animate-pulse">
              <span>⚡</span>
              <span>FLASH SALE</span>
            </span>
          )}
        </div>

        {/* 3c. Discount Percentage Overlay - Right Top */}
        {product.discount_percent > 0 && (
          <div id={`badge-discount-${product.id}`} className="absolute top-3 right-3 bg-orange-500 text-white font-extrabold text-xs w-10.5 h-10.5 rounded-full flex items-center justify-center shadow-md border-2 border-white transform rotate-3 z-10-unused hover:scale-110 transition-transform">
            <span>-{product.discount_percent}%</span>
          </div>
        )}

        {/* 3c. Category Label overlay - Bottom Left */}
        <div className="absolute bottom-3 left-3 z-10">
          <span id={`badge-cat-${product.id}`} className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-xs border border-white/50">
            {categoryName}
          </span>
        </div>

        {/* Quick zoom inspect button overlay */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="bg-white/90 backdrop-blur-xs p-2.5 rounded-full text-slate-800 shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all">
            <Maximize2 className="w-4 h-4 text-sky-600" />
          </button>
        </div>
      </div>

      {/* Product Metadata & Description */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* 3c. Product Name */}
          <h3
            id={`prod-title-${product.id}`}
            onClick={() => onOpenDetails(product)}
            className="font-bold text-slate-900 text-base leading-snug hover:text-sky-600 cursor-pointer line-clamp-2 min-h-[2.5rem]"
          >
            {product.name}
          </h3>

          {/* 3c. Short description (Line Clamping) */}
          <p id={`prod-desc-${product.id}`} className="text-slate-400 text-xs line-clamp-2 min-h-[2rem]">
            {product.description_short || 'Sản phẩm chính hãng chất lượng cao đạt tiêu chuẩn chứng nhận Y tế Việt Nam.'}
          </p>
        </div>

        {/* Price Tag & Action strip */}
        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
          {/* 3c. Pricing tag */}
          <div className="flex flex-col">
            <span id={`prod-price-${product.id}`} className="text-sky-600 font-extrabold text-lg leading-none">
              {formatVND(product.price_after_discount)}
            </span>
            {product.discount_percent > 0 && (
              <span id={`prod-original-price-${product.id}`} className="text-slate-300 text-xs line-through mt-1">
                {formatVND(product.original_price)}
              </span>
            )}
          </div>

          {/* 3c. Action strip */}
          <div className="flex items-center space-x-2.5">
            <button
              id={`prod-btn-detail-${product.id}`}
              onClick={() => onOpenDetails(product)}
              className="text-sky-600 hover:text-sky-850 text-xs font-semibold hover:underline flex items-center transition-all cursor-pointer"
            >
              <span>Chi tiết ↗</span>
            </button>
            <button
              id={`prod-btn-add-cart-${product.id}`}
              onClick={(e) => onAddToCart(product, e)}
              title="Thêm nhanh vào giỏ hàng"
              className="bg-sky-600 text-white hover:bg-sky-700 p-2 rounded-xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-sky-500/10 flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
