import { Plus, Edit2, Trash2, Video, Tag, Check, X, Sparkles, HelpCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Product } from "../types";

interface AdminProductManagerProps {
  products: Product[];
  onSaveProduct: (product: Partial<Product>) => Promise<boolean>;
  onDeleteProduct: (id: string) => Promise<boolean>;
  categories: string[];
}

export default function AdminProductManager({
  products,
  onSaveProduct,
  onDeleteProduct,
  categories,
}: AdminProductManagerProps) {
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form values
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Thiết bị");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isOnSale, setIsOnSale] = useState(false);

  // Upload fields
  const [imageSourceMode, setImageSourceMode] = useState<"upload" | "url">("upload");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Load product to edit
  const handleEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    
    // Check if category is standard or custom
    const standardCats = ["Thiết bị", "Vật tư", "Dược phẩm"];
    if (standardCats.includes(prod.category)) {
      setCategory(prod.category);
      setIsCustomCategory(false);
    } else {
      setCategory("__NEW_CATEGORY__");
      setIsCustomCategory(true);
      setCustomCategory(prod.category);
    }

    setOriginalPrice(prod.original_price);
    setDiscountPercent(prod.discount_percent);
    setDescription(prod.description);
    setImageUrl(prod.image_url);
    setVideoUrl(prod.video_url || "");
    setIsFeatured(prod.is_featured);
    setIsOnSale(prod.is_on_sale);
    setImageSourceMode(prod.image_url.startsWith("/uploads/") ? "upload" : "url");
    
    setShowForm(true);
    setSubmitError("");
    setSubmitSuccess("");
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setName("");
    setCategory("Thiết bị");
    setCustomCategory("");
    setIsCustomCategory(false);
    setOriginalPrice(0);
    setDiscountPercent(0);
    setDescription("");
    setImageUrl("");
    setVideoUrl("");
    setIsFeatured(false);
    setIsOnSale(false);
    setImageSourceMode("upload");
    
    setShowForm(true);
    setSubmitError("");
    setSubmitSuccess("");
  };

  const uploadLocalFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setSubmitError("Vui lòng chỉ chọn file hình ảnh (PNG, JPG, JPEG, WEBP, GIF, ...).");
      return;
    }
    
    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setSubmitError("Kích thước tệp quá lớn. Vui lòng tải tệp dưới 10MB.");
      return;
    }

    setUploadingImage(true);
    setSubmitError("");
    setSubmitSuccess("");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (!base64) {
        setSubmitError("Không thể đọc tệp hình ảnh.");
        setUploadingImage(false);
        return;
      }

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: file.name,
            base64: base64,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Lỗi tải ảnh lên máy chủ");
        }

        const data = await response.json();
        setImageUrl(data.url);
        setSubmitSuccess("Đã tải hình ảnh thành công!");
      } catch (err: any) {
        console.error("Upload error:", err);
        setSubmitError(`Lỗi tải ảnh: ${err.message}`);
      } finally {
        setUploadingImage(false);
      }
    };

    reader.onerror = () => {
      setSubmitError("Đã xảy ra lỗi khi đọc tệp.");
      setUploadingImage(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadLocalFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadLocalFile(file);
    }
  };

  const calculatedDiscountedPrice = originalPrice - (originalPrice * discountPercent) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setSubmitError("Vui lòng nhập tên sản phẩm.");
    if (originalPrice <= 0) return setSubmitError("Giá gốc phải lớn hơn 0 VND.");
    if (discountPercent < 0 || discountPercent > 100) return setSubmitError("Tỉ lệ giảm giá từ 0% đến 100%.");
    
    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (!finalCategory) {
      return setSubmitError("Vui lòng xác định danh mục cho sản phẩm.");
    }
    
    if (!imageUrl.trim()) {
      return setSubmitError("Vui lòng cung cấp link hình ảnh hoặc tải ảnh lên từ máy tính.");
    }

    setIsSubmitting(true);
    setSubmitError("");

    const payload: Partial<Product> = {
      id: editingProduct?.id,
      name,
      category: finalCategory,
      original_price: originalPrice,
      discount_percent: discountPercent,
      description,
      image_url: imageUrl,
      video_url: videoUrl,
      is_featured: isFeatured,
      is_on_sale: isOnSale,
    };

    const success = await onSaveProduct(payload);
    setIsSubmitting(false);

    if (success) {
      setSubmitSuccess("Đã lưu thông tin sản phẩm thành công!");
      setTimeout(() => {
        setShowForm(false);
        setEditingProduct(null);
        setSubmitSuccess("");
      }, 1500);
    } else {
      setSubmitError("Lỗi khi kết nối máy chủ để lưu sản phẩm.");
    }
  };

  // Helper autofill templates for fast demo testing
  const applyAutofill = (type: "duoc" | "thietbi" | "vattu") => {
    if (type === "duoc") {
      setName("Thuốc ho bổ phế Nam Hà");
      setCategory("Dược phẩm");
      setOriginalPrice(60000);
      setDiscountPercent(10);
      setDescription("Siro ho thảo dược giúp bổ phế, trị ho khan, ho có đờm, viêm phế quản và đau rát cổ họng hiệu quả.");
      setImageUrl("https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80");
      setVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      setIsOnSale(true);
    } else if (type === "thietbi") {
      setName("Máy xông khí dung Omron NE-C28");
      setCategory("Thiết bị");
      setOriginalPrice(1450000);
      setDiscountPercent(15);
      setDescription("Máy xông mũi họng dùng cho cả trẻ em và người lớn, hỗ trợ điều trị đắc lực các bệnh hen suyễn, viêm phế quản co thắt.");
      setImageUrl("https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80");
      setVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      setIsFeatured(true);
    } else {
      setName("Băng gạc vết thương Urgo Sterile (Hộp 50 miếng)");
      setCategory("Vật tư");
      setOriginalPrice(110000);
      setDiscountPercent(5);
      setDescription("Băng cá nhân vô trùng bảo vệ vết thương tối đa, chống nước và bám bẩn, thông thoáng khí giúp vết thương mau lành.");
      setImageUrl("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80");
      setVideoUrl("");
      setIsFeatured(false);
    }
  };

  return (
    <div className="space-y-6" id="admin-product-manager-root">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản Lý Sản Phẩm</h2>
          <p className="text-xs text-slate-500">Cập nhật danh sách trang thiết bị của cửa hàng</p>
        </div>
        {!showForm && (
          <button
            id="admin-add-new-btn"
            onClick={handleAddNew}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Thêm Sản Phẩm Mới
          </button>
        )}
      </div>

      {/* Editor Form Modal or Block */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-blue-600" />
              {editingProduct ? `Chỉnh sửa: ${editingProduct.name}` : "Đăng bán sản phẩm mới"}
            </h3>
            <button
              id="admin-form-close-btn"
              onClick={() => setShowForm(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!editingProduct && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-blue-600/5 p-3 text-xs text-blue-800">
              <span className="font-semibold">Điền nhanh sản phẩm mẫu:</span>
              <button
                type="button"
                onClick={() => applyAutofill("duoc")}
                className="rounded bg-white border border-blue-200 px-2.5 py-1 font-medium text-slate-700 hover:bg-blue-50 transition"
              >
                + Dược phẩm mẫu
              </button>
              <button
                type="button"
                onClick={() => applyAutofill("thietbi")}
                className="rounded bg-white border border-blue-200 px-2.5 py-1 font-medium text-slate-700 hover:bg-blue-50 transition"
              >
                + Thiết bị mẫu
              </button>
              <button
                type="button"
                onClick={() => applyAutofill("vattu")}
                className="rounded bg-white border border-blue-200 px-2.5 py-1 font-medium text-slate-700 hover:bg-blue-50 transition"
              >
                + Vật tư mẫu
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            {/* Column 1 */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tên sản phẩm *</label>
                <input
                  id="form-product-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Máy đo huyết áp bắp tay Omron"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Danh mục *</label>
                  <select
                    id="form-product-category"
                    value={isCustomCategory ? "__NEW_CATEGORY__" : category}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "__NEW_CATEGORY__") {
                        setIsCustomCategory(true);
                        setCategory("__NEW_CATEGORY__");
                      } else {
                        setIsCustomCategory(false);
                        setCategory(val);
                      }
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__NEW_CATEGORY__">➕ + Thêm danh mục mới...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Giá gốc (VND) *</label>
                  <input
                    id="form-product-price"
                    type="number"
                    value={originalPrice || ""}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    placeholder="VD: 1200000"
                    className="w-full rounded-lg border border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {isCustomCategory && (
                <div className="rounded-xl border border-blue-105 bg-blue-50/20 p-3.5 space-y-1.5 animate-fade-in">
                  <label className="block text-xs font-bold text-blue-600">Tên danh mục tự thêm mới *</label>
                  <input
                    id="form-product-custom-category"
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Nhập tên danh mục ví dụ: Kháng sinh, Thực phẩm chức năng..."
                    className="w-full rounded-lg border border-blue-200 bg-white px-3.5 py-2 text-xs focus:border-blue-505 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block leading-normal">Danh mục này sẽ tự động lưu và hiển thị lâu dài ở thanh công cụ lọc của khách hàng.</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phần trăm giảm giá (%)</label>
                  <input
                    id="form-product-discount"
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent || ""}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    placeholder="Ví dụ: 15"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Giá bán sau giảm</label>
                  <div className="rounded-lg bg-blue-50 border border-blue-105 px-3.5 py-2 font-bold text-blue-600 text-xs flex items-center h-[34px]">
                    {calculatedDiscountedPrice.toLocaleString("vi-VN")} VND
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Mô tả sản phẩm</label>
                <textarea
                  id="form-product-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Thông số kỹ thuật, hướng dẫn sử dụng, đối tượng bệnh nhân..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-650 mb-1.5">Hình Ảnh Sản Phẩm *</label>
                
                {/* Visual Tab Selection for upload vs url */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border mb-2 text-[10px] max-w-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setImageSourceMode("upload")}
                    className={`flex-1 py-1 rounded-md text-center transition-all ${
                      imageSourceMode === "upload"
                        ? "bg-white text-slate-905 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Tải từ máy tính (.PNG, .JPG...)
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSourceMode("url")}
                    className={`flex-1 py-1 rounded-md text-center transition-all ${
                      imageSourceMode === "url"
                        ? "bg-white text-slate-905 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Dán Link Internet (Unsplash...)
                  </button>
                </div>

                {imageSourceMode === "upload" ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-blue-500 bg-blue-50/40"
                        : "border-slate-250 hover:border-blue-400 bg-white"
                    }`}
                    onClick={() => document.getElementById("file-upload-input")?.click()}
                  >
                    <input
                      id="file-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {uploadingImage ? (
                      <div className="flex flex-col items-center justify-center py-2 text-slate-500">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 mb-1.5" />
                        <span className="text-[11px] font-semibold">Đang xử lý & tải hình ảnh...</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 py-1">
                        <span className="inline-block text-xl">📁</span>
                        <p className="text-xs font-semibold text-slate-700">Kéo thả ảnh hoặc click để chọn tệp</p>
                        <p className="text-[10px] text-slate-400">Hỗ trợ PNG, JPG, JPEG, WEBP, GIF dưới 10MB</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    id="form-product-image"
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Dán URL hình ảnh từ Unsplash hoặc nguồn bất kỳ"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    required={imageSourceMode === "url"}
                  />
                )}

                {imageUrl && (
                  <div className="mt-2 text-[10px] bg-slate-50 hover:bg-slate-100 rounded-xl p-2 flex items-center justify-between border select-none">
                    <div className="flex items-center gap-2">
                      <img src={imageUrl} alt="preview" className="h-10 w-10 object-cover rounded-lg border border-slate-200" referrerPolicy="no-referrer" />
                      <div className="leading-tight">
                        <span className="block font-bold text-slate-800">Ảnh đã lưu</span>
                        <span className="block text-[9px] text-slate-400 truncate max-w-[200px]">{imageUrl}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1 select-none"
                    >
                      Xoá ảnh
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Link Video giới thiệu (Vimeo/Youtube)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Video className="h-4 w-4 text-slate-400" />
                  </span>
                  <input
                    id="form-product-video"
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Badges and specials selection */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5">
                <span className="block text-xs font-bold text-slate-800">Nhãn dán quảng bá đặc biệt</span>
                
                <div className="flex items-start gap-3">
                  <input
                    id="form-product-featured"
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <label htmlFor="form-product-featured" className="block text-xs font-bold text-slate-800 cursor-pointer">Sản phẩm Nổi bật (Featured)</label>
                    <span className="block text-[10px] text-slate-500">Hiển thị ở trang chủ ở vị trí banner ưu tiên để thu hút khách hãng vãng lai</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    id="form-product-onsale"
                    type="checkbox"
                    checked={isOnSale}
                    onChange={(e) => setIsOnSale(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <label htmlFor="form-product-onsale" className="block text-xs font-bold text-slate-800 cursor-pointer">Sản phẩm đang Giảm giá (On Sale)</label>
                    <span className="block text-[10px] text-slate-500">Gắn nhãn HOT DEAL và cho vào bộ lọc giảm giá sốc của hệ thống</span>
                  </div>
                </div>
              </div>

              {/* Message Banner indicators */}
              {submitError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-xs text-red-600">
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-2 text-xs text-green-700 flex items-center gap-1">
                  <Check className="h-4 w-4" /> {submitSuccess}
                </div>
              )}

              {/* Submit trigger actions */}
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                  disabled={isSubmitting}
                >
                  Huỷ
                </button>
                <button
                  id="admin-form-submit-btn"
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang lưu..." : "Xác nhận & Lưu"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Products Grid Table listing */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full border-collapse text-left text-xs text-slate-600">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <th className="px-5 py-3">Ảnh</th>
              <th className="px-5 py-3">Tên sản phẩm</th>
              <th className="px-5 py-3">Danh Mục</th>
              <th className="px-5 py-3">Giá gốc</th>
              <th className="px-5 py-3">KM %</th>
              <th className="px-5 py-3">Giá sau giảm</th>
              <th className="px-5 py-3 text-center">Nổi Bật</th>
              <th className="px-5 py-3 text-right">Tác vụ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                  Chưa có sản phẩm nào được tạo. Hãy nhấn nút "Thêm Sản Phẩm Mới" để bắt đầu!
                </td>
              </tr>
            ) : (
              products.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/70 transition">
                  {/* Image */}
                  <td className="px-5 py-3">
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="h-10 w-10 object-cover rounded-lg border border-slate-250 bg-slate-100"
                      referrerPolicy="no-referrer"
                    />
                  </td>
                  {/* Name */}
                  <td className="px-5 py-3 font-semibold text-slate-900 max-w-xs truncate">
                    {prod.name}
                  </td>
                  {/* Category */}
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                      {prod.category}
                    </span>
                  </td>
                  {/* Original Price */}
                  <td className="px-5 py-3 font-medium text-slate-500">
                    {prod.original_price.toLocaleString("vi-VN")} đ
                  </td>
                  {/* Discount percentage */}
                  <td className="px-5 py-3 font-semibold text-blue-600 text-center sm:text-left">
                    {prod.discount_percent > 0 ? `-${prod.discount_percent}%` : "0%"}
                  </td>
                  {/* After Discount */}
                  <td className="px-5 py-3 font-bold text-slate-900">
                    {prod.discounted_price.toLocaleString("vi-VN")} đ
                  </td>
                  {/* Specials */}
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {prod.is_featured && <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" title="Sản phẩm nổi bật" />}
                      {prod.is_on_sale && <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" title="Sản phẩm giảm giá sập sàn" />}
                    </div>
                  </td>
                  {/* Operations actions */}
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        id={`edit-prod-btn-${prod.id}`}
                        onClick={() => handleEdit(prod)}
                        className="rounded bg-slate-100 p-1.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition"
                        title="Chỉnh sửa sản phẩm"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        id={`delete-prod-btn-${prod.id}`}
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${prod.name}" không?`)) {
                            onDeleteProduct(prod.id);
                          }
                        }}
                        className="rounded bg-slate-100 p-1.5 text-slate-600 hover:bg-red-100 hover:text-red-700 transition"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
