import React, { useState } from "react";
import { StoreSettings } from "../types";
import { 
  Store, 
  Settings, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Upload, 
  Link, 
  ExternalLink,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface AdminStoreSettingsProps {
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => Promise<boolean>;
}

export default function AdminStoreSettings({
  settings,
  onSaveSettings,
}: AdminStoreSettingsProps) {
  // Local state for all fields
  const [logoUrl, setLogoUrl] = useState(settings.logo_url || "");
  const [storeName, setStoreName] = useState(settings.store_name || "");
  const [storeSlogan, setStoreSlogan] = useState(settings.store_slogan || "");
  const [corporateName, setCorporateName] = useState(settings.corporate_name || "");
  const [taxCode, setTaxCode] = useState(settings.tax_code || "");
  const [businessAddress, setBusinessAddress] = useState(settings.business_address || "");
  const [hotline, setHotline] = useState(settings.hotline || "");
  const [email, setEmail] = useState(settings.email || "");
  const [orderEmail, setOrderEmail] = useState(settings.order_email || "");
  const [shopeeUrl, setShopeeUrl] = useState(settings.shopee_url || "");
  const [tiktokUrl, setTiktokUrl] = useState(settings.tiktok_url || "");
  const [facebookUrl, setFacebookUrl] = useState(settings.facebook_url || "");
  const [zaloUrl, setZaloUrl] = useState(settings.zalo_url || "");

  // UI state
  const [logoMode, setLogoMode] = useState<"upload" | "url">(settings.logo_url ? "url" : "upload");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Upload handler
  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Vui lòng chỉ chọn tệp hình ảnh (.png, .jpg, .jpeg, .webp)." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB." });
      return;
    }

    setUploading(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      if (!base64) {
        setMessage({ type: "error", text: "Không thể đọc tệp hình ảnh." });
        setUploading(false);
        return;
      }

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: file.name, base64 }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.url) {
            setLogoUrl(data.url);
            setMessage({ type: "success", text: "Đã tải logo lên góc bán hàng thành công!" });
            setUploading(false);
            return;
          }
        }
      } catch (err: any) {
        console.warn("Logo upload error, using local base64 fallback:", err);
      }

      // Fallback: use Base64 string directly in local settings
      setLogoUrl(base64);
      setMessage({ type: "success", text: "Đã thiết lập logo cục bộ thành công! (Chế độ tương thích Vercel)" });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleLogoUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleLogoUpload(file);
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      setMessage({ type: "error", text: "Tên cửa hàng không được để trống." });
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload: StoreSettings = {
      logo_url: logoUrl.trim(),
      store_name: storeName.trim(),
      store_slogan: storeSlogan.trim(),
      corporate_name: corporateName.trim(),
      tax_code: taxCode.trim(),
      business_address: businessAddress.trim(),
      hotline: hotline.trim(),
      email: email.trim(),
      order_email: orderEmail.trim(),
      shopee_url: shopeeUrl.trim(),
      tiktok_url: tiktokUrl.trim(),
      facebook_url: facebookUrl.trim(),
      zalo_url: zaloUrl.trim(),
    };

    const isOk = await onSaveSettings(payload);
    setSaving(false);

    if (isOk) {
      setMessage({ type: "success", text: "Đã lưu toàn bộ cấu hình gian hàng & thông tin công khai thành công!" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setMessage({ type: "error", text: "Gặp lỗi trong quá trình lưu dữ liệu cài đặt cửa hàng." });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in" id="admin-settings-panel">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm">
        <div className="border-b border-slate-100 pb-4 mb-6 flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Thiết Lập Thông Tin Gian Hàng & Liên Kết</h3>
            <p className="text-xs text-slate-500">Quản lý định danh thương hiệu, thông tin pháp lý doanh nghiệp công khai và kênh mạng xã hội</p>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`p-4 rounded-xl flex items-start gap-3 mb-6 animate-fade-in ${
            message.type === "success" 
              ? "bg-emerald-50 border border-emerald-100 text-emerald-800"
              : "bg-red-50 border border-red-100 text-red-800"
          }`}>
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
            )}
            <div className="text-xs font-semibold">{message.text}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Logo & Branding */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block"></span>
              Phân khúc 1: Nhận diện thương hiệu & Logo
            </h4>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Left col: Logo upload */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-600">Logo nhãn hiệu *</label>
                
                <div className="flex bg-slate-100 p-0.5 rounded-lg border text-[11px] font-bold max-w-xs mb-3">
                  <button
                    type="button"
                    onClick={() => setLogoMode("upload")}
                    className={`flex-1 py-1.5 rounded-md text-center transition-all ${
                      logoMode === "upload" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    Tải từ máy tính
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoMode("url")}
                    className={`flex-1 py-1.5 rounded-md text-center transition-all ${
                      logoMode === "url" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    Đường dẫn URL ảnh
                  </button>
                </div>

                {logoMode === "upload" ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                      dragging ? "border-blue-500 bg-blue-50/40" : "border-slate-200 hover:border-blue-400 bg-white"
                    }`}
                    onClick={() => document.getElementById("logo-upload-input")?.click()}
                  >
                    <input
                      id="logo-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={onFileChange}
                      className="hidden"
                    />
                    {uploading ? (
                      <div className="flex flex-col items-center justify-center text-slate-500 py-3">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 mb-2" />
                        <span className="text-[11px]">Đang tải hình ảnh lên...</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <Upload className="h-6 w-6 text-slate-400 mx-auto" />
                        <p className="text-xs font-semibold text-slate-700">Kéo thả ảnh hoặc click để chọn</p>
                        <p className="text-[10px] text-slate-400">PNG, JPG, WEBP kích cỡ tối đa 5MB</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="VD: https://duy-anh.com/images/my-logo.png"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                )}

                {logoUrl && (
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border">
                    <img 
                      src={logoUrl} 
                      alt="Xem trước logo" 
                      className="h-12 w-auto max-w-[120px] object-contain bg-white rounded-lg p-1 border"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-800">Ảnh Logo của bạn</span>
                      <span className="block text-[10px] text-slate-400 truncate max-w-[200px]">{logoUrl}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLogoUrl("")}
                      className="text-xs text-red-500 hover:text-red-600 font-bold ml-auto px-2"
                    >
                      Xoá logo
                    </button>
                  </div>
                )}
              </div>

              {/* Right col: Store name & slogan */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Tên cửa hàng hiển thị *</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ví dụ: MEDSTORE, NHÀ THUỐC TÂM AN"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Sẽ thay đổi trực tiếp tiêu đề chính diện trên Header và chân trang.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Câu khẩu hiệu (Slogan) *</label>
                  <input
                    type="text"
                    value={storeSlogan}
                    onChange={(e) => setStoreSlogan(e.target.value)}
                    placeholder="Ví dụ: Chất lượng là ưu tiên số 1, Tận tâm vì sức khỏe cộng đồng"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Xuất hiện ngay dưới Logo để tạo sự tin tưởng cho khách hàng.</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Public Legal/Contact Disclosures */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
              Phân khúc 2: Công khai thông tin người bán (Yêu cầu Bộ Công Thương)
            </h4>
            <p className="text-xs text-slate-400">Hiển thị trực quan minh bạch pháp nhân ở cuối trang khách hàng, nâng cao độ tin cậy tuyệt đối.</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5 text-slate-400" /> Tên pháp nhân đăng ký kinh doanh *
                </label>
                <input
                  type="text"
                  value={corporateName}
                  onChange={(e) => setCorporateName(e.target.value)}
                  placeholder="Ví dụ: Công ty Cổ phần Thương mại và Dược phẩm An Bình"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" /> Mã số thuế doanh nghiệp *
                </label>
                <input
                  type="text"
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  placeholder="Ví dụ: 0109988776 hoặc mã số hộ kinh doanh"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> Địa chỉ đăng ký kinh doanh / Địa chỉ kho bán hàng *
                </label>
                <input
                  type="text"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> Điện thoại hotline hỗ trợ *
                </label>
                <input
                  type="text"
                  value={hotline}
                  onChange={(e) => setHotline(e.target.value)}
                  placeholder="Ví dụ: 1900 6000 hoặc 0912 345 678"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> Email liên hệ khách hàng
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ví dụ: hotro@medstore.vn"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-blue-500 animate-pulse" /> Email nhận thông báo đơn hàng *
                </label>
                <input
                  type="email"
                  value={orderEmail}
                  onChange={(e) => setOrderEmail(e.target.value)}
                  placeholder="Ví dụ: donhang@medstore.vn"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">Hệ thống sẽ gửi email hóa đơn chi tiết của mỗi đơn đặt hàng mới đến hộp thư này.</p>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Web sales channels integration (Shopee, Tiktok, Facebook, Zalo) */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-orange-500 rounded-full inline-block"></span>
              Phân khúc 3: Chỉ mục liên kết gian hàng khác
            </h4>
            <p className="text-xs text-slate-400">Các nút liên kết mạng xã hội và sàn TMĐT khác sẽ xuất hiện ở dòng dưới của chân trang web để điều hướng người mua.</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Đường dẫn Shopee (Shopee Mall / Shop)</label>
                <input
                  type="url"
                  value={shopeeUrl}
                  onChange={(e) => setShopeeUrl(e.target.value)}
                  placeholder="Ví dụ: https://shopee.vn/ten_gian_hang"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Đường dẫn TikTok Shop / Profile</label>
                <input
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="Ví dụ: https://www.tiktok.com/@ten_cua_hang"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Trang Fanpage Facebook</label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="Ví dụ: https://facebook.com/ten_cua_hang"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Liên kết Zalo (Zalo OA / SĐT Zalo)</label>
                <input
                  type="text"
                  value={zaloUrl}
                  onChange={(e) => setZaloUrl(e.target.value)}
                  placeholder="Ví dụ: https://zalo.me/0912345678"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className={`rounded-xl px-6 py-3 text-xs font-bold text-white shadow-sm flex items-center gap-2 transition bg-blue-600 hover:bg-blue-700 active:scale-95 ${
                saving ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Đang ghi nhận cấu hình...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Lưu Cấu Hình Sử Dụng Lâu Dài
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modern, high fidelity onboarding instructions for Supabase & Resend connection on Vercel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mt-6">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-blue-600 text-xs font-bold">💡</span>
          HƯỚNG DẪN CẤU HÌNH LIÊN KẾT CLOUD (VERCEL / PRODUCTION LIVE)
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          Khi bạn chạy ứng dụng thực tế trên môi trường Vercel hoặc Cloud, các thay đổi lưu trữ và gửi email cần được kết nối trực tiếp với <strong>Supabase</strong> và <strong>Resend</strong> để hoạt động an toàn vĩnh viễn. Hãy thiết lập các biến môi trường sau trong bảng điều khiển (Dashboard) của Vercel:
        </p>

        <div className="space-y-4 font-mono text-[11px]">
          {/* Supabase block */}
          <div className="p-3.5 rounded-xl border border-slate-150 bg-slate-50/50 space-y-2">
            <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
              SUPABASE DATABASE (Lưu trữ lâu dài)
            </span>
            <p className="text-slate-500 font-sans text-[10px] leading-relaxed">Kết nối tài khoản Supabase của bạn và chạy mã SQL trong tệp <code className="bg-slate-200 px-1 rounded text-slate-700">supabase_schema.sql</code> để tạo các bảng sản phẩm, cấu hình cửa hàng (settings) và đơn hàng.</p>
            <div className="space-y-1.5 pt-1.5 border-t border-slate-250">
              <div className="flex flex-col sm:flex-row sm:justify-between py-0.5"><span className="text-slate-800 font-bold">NEXT_PUBLIC_SUPABASE_URL</span> <span className="text-slate-400 font-sans">Đường dẫn dự án Supabase của bạn</span></div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-0.5"><span className="text-slate-800 font-bold">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> <span className="text-slate-400 font-sans">Mã khoá công khai anon của bạn</span></div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-0.5"><span className="text-slate-800 font-bold">SUPABASE_SERVICE_ROLE_KEY</span> <span className="text-slate-400 font-sans">Khóa quản trị (khuyên dùng để ghi đè dữ liệu nâng cao)</span></div>
            </div>
          </div>

          {/* Resend block */}
          <div className="p-3.5 rounded-xl border border-slate-150 bg-slate-50/50 space-y-2">
            <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              RESEND EMAIL LIVE (Gửi thông báo email tự động)
            </span>
            <p className="text-slate-500 font-sans text-[10px] leading-relaxed">Tạo tài khoản miễn phí tại <a href="https://resend.com" target="_blank" rel="noreferrer" className="text-blue-600 underline hover:text-blue-700 font-semibold">resend.com</a> để nhận khóa API bảo mật dùng để gửi thông báo đơn hàng.</p>
            
            <div className="space-y-1.5 pt-1.5 border-t border-slate-250">
              <div className="flex flex-col sm:flex-row sm:justify-between py-0.5"><span className="text-slate-800 font-bold">RESEND_API_KEY</span> <span className="text-slate-400 font-sans">Khóa API của Resend (VD: re_abc123...)</span></div>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 border border-amber-200 text-amber-900 text-[10px] leading-normal font-sans space-y-1 mt-2">
              <p className="font-bold flex items-center gap-1 text-amber-800">⚠️ LƯU Ý KHI SỬ DỤNG GÓI MIỄN PHÍ CỦA RESEND:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Nếu chưa cấu hình và xác minh tên miền riêng (Domain), Resend bắt buộc người gửi phải là <code className="bg-amber-150 px-1 rounded text-slate-800">onboarding@resend.dev</code> (được cấu hình mặc định trong chương trình).</li>
                <li><strong>Địa chỉ email nhận thư</strong> (bạn thiết lập trong ô <i>“Email nhận thông báo đơn hàng”</i> phía trên) <strong>phải trùng khớp</strong> với hòm thư bạn đã sử dụng để đăng ký tài khoản Resend (ví dụ: <code className="bg-amber-150 px-1 rounded text-slate-800">achau.kimduc@gmail.com</code>). Resend sẽ chặn việc gửi thư nếu hòm thư nhận không nằm trong danh sách hòm thư được liên kết tài khoản của bạn trừ khi tên miền riêng đã được xác thực hoàn chỉnh.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
