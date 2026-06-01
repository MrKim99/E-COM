import { Search, Filter, SlidersHorizontal, ArrowUpDown } from "lucide-react";

interface FilterSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedSort: string;
  setSelectedSort: (sort: string) => void;
  categories: string[];
}

export default function FilterSection({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedSort,
  setSelectedSort,
  categories,
}: FilterSectionProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-5" id="filter-section-container">
      {/* Search Input and Top Heading */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-red-600" />
            Bộ Lọc Tìm Kiếm Nâng Cao
          </h2>
          <p className="text-xs text-slate-500">Tìm kiếm trang thiết bị y tế, dược phẩm nhanh chóng</p>
        </div>

        {/* Name Search Box */}
        <div className="relative flex-1 max-w-md w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="search-input-box"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm sản phẩm theo tên..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-850 placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
          />
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Categories filter and sorting tab */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Category Filters */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Danh Mục Sản Phẩm
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              id={`category-btn-all`}
              onClick={() => setSelectedCategory("")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedCategory === ""
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                id={`category-btn-${cat}`}
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Fast sorting filters */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3" /> Lọc Nhanh & Sắp Xếp
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              id={`sort-btn-all`}
              onClick={() => setSelectedSort("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedSort === "all"
                  ? "bg-[#df1b1b] text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Phổ Biến
            </button>
            <button
              id={`sort-btn-sale`}
              onClick={() => setSelectedSort("sale")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedSort === "sale"
                  ? "bg-[#df1b1b] text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              🔥 Đang Giảm Giá
            </button>
            <button
              id={`sort-btn-low-high`}
              onClick={() => setSelectedSort("low-to-high")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedSort === "low-to-high"
                  ? "bg-[#df1b1b] text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Giá Từ Thấp Đến Cao
            </button>
            <button
              id={`sort-btn-high-low`}
              onClick={() => setSelectedSort("high-to-low")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedSort === "high-to-low"
                  ? "bg-[#df1b1b] text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Giá Từ Cao Đến Thấp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
