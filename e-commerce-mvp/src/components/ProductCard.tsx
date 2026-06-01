import { Plus, Tag, ArrowUpRight } from "lucide-react";
import { Product } from "../types";
import React from "react";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onViewDetails: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
}) => {
  const hasDiscount = product.discount_percent > 0;
  const displayPrice = product.original_price - (product.original_price * (product.discount_percent || 0)) / 100;

  return (
    <div
      onClick={() => onViewDetails(product.id)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-md cursor-pointer"
      id={`product-card-${product.id}`}
    >
      {/* Product Image and badges */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={product.image_url || "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Badges container */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_featured && (
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
              🚀 NỔI BẬT
            </span>
          )}
          {product.is_on_sale && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
              🔥 HOT DEAL
            </span>
          )}
        </div>

        {/* Category sticker */}
        <div className="absolute bottom-3 left-3">
          <span className="rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-xs text-slate-800 font-medium border border-slate-100 shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Discount tag badge in corner */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 font-bold text-white text-xs shadow-md">
            -{product.discount_percent}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-blue-600 transition duration-150">
          {product.name}
        </h3>
        
        <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 flex-1">
          {product.description || "Chưa có mô tả chi tiết."}
        </p>

        {/* Pricing tag */}
        <div className="mt-4 flex flex-wrap items-baseline gap-2">
          <span className="text-base font-bold text-blue-600">
            {displayPrice.toLocaleString("vi-VN")} đ
          </span>
          {hasDiscount && (
            <span className="text-xs text-slate-400 line-through">
              {product.original_price.toLocaleString("vi-VN")} đ
            </span>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-0.5 text-xs text-slate-500 font-medium group-hover:text-blue-600 transition-colors">
            Chi tiết <ArrowUpRight className="h-3 w-3" />
          </span>

          <button
            id={`add-to-cart-btn-${product.id}`}
            onClick={(e) => onAddToCart(product, e)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition-all hover:bg-blue-700 hover:scale-105 focus:outline-none"
            title="Thêm vào giỏ"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
