import React from 'react';
import { Search, SlidersHorizontal, Layers, Check, Sparkles } from 'lucide-react';
import { Category } from '../types';

interface ProductFilterProps {
  categories: Category[];
  selectedCategory: string; // "all" or specific category ID
  onSelectCategory: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string; // "popular" | "discount" | "price-asc" | "price-desc"
  onSortChange: (sortOption: string) => void;
  resultsCount: number;
}

export default function ProductFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  resultsCount,
}: ProductFilterProps) {
  return (
    <div id="filter-wrapper" className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      
      {/* 3a. Advanced Search Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 id="filter-main-title" className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-sky-500" />
            <span>Bộ Lọc Tìm Kiếm Nâng Cao</span>
          </h2>
          <p id="filter-subtitle" className="text-slate-500 text-xs md:text-sm mt-1">
            Tìm kiếm trang thiết bị y tế, vật tư và dược phẩm nhanh chóng, chính xác.
          </p>
        </div>

        {/* 3a. Search Bar right hand side */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            id="input-product-search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm sản phẩm theo tên..."
            className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 focus:border-sky-500 focus:bg-white text-slate-800 placeholder-slate-400 rounded-full text-sm outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-red-500 text-xs"
            >
              Xóa
            </button>
          )}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* 3b. Filter Navigation & Sắp xếp Block */}
      <div className="flex flex-col gap-4">
        
        {/* Categories Tab list */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Danh mục sản phẩm</span>
          </label>
          <div id="category-badge-list" className="flex flex-wrap gap-2">
            <button
              id="cat-badge-all"
              onClick={() => onSelectCategory('all')}
              className={`px-4.5 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all tracking-wide ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-950/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-150'
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`cat-badge-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4.5 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all tracking-wide ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-950/20'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-150'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sort option tabs */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            <span>Sắp xếp & Lọc nhanh</span>
          </label>
          <div id="sort-option-list" className="flex flex-wrap gap-2">
            <button
              id="sort-btn-popular"
              onClick={() => onSortChange('popular')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 border ${
                sortBy === 'popular'
                  ? 'bg-red-500 text-white border-red-500 shadow-sm shadow-red-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <span>Phổ Biến</span>
            </button>
            <button
              id="sort-btn-discount"
              onClick={() => onSortChange('discount')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 border ${
                sortBy === 'discount'
                  ? 'bg-red-500 text-white border-red-500 shadow-sm shadow-red-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <span>🔥 Đang Giảm Giá</span>
            </button>
            <button
              id="sort-btn-price-asc"
              onClick={() => onSortChange('price-asc')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 border ${
                sortBy === 'price-asc'
                  ? 'bg-red-500 text-white border-red-500 shadow-sm shadow-red-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <span>Giá Từ Thấp Đến Cao</span>
            </button>
            <button
              id="sort-btn-price-desc"
              onClick={() => onSortChange('price-desc')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 border ${
                sortBy === 'price-desc'
                  ? 'bg-red-500 text-white border-red-500 shadow-sm shadow-red-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <span>Giá Từ Cao Đến Thấp</span>
            </button>
          </div>
        </div>

      </div>

      <hr className="border-slate-100" />

      {/* Result counter indicator */}
      <div id="results-count-indicator" className="flex items-center text-xs font-medium text-slate-500">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
        <span>Kết quả: <strong>{resultsCount}</strong> sản phẩm được trưng bày</span>
      </div>

    </div>
  );
}
