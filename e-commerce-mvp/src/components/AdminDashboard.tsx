import React from 'react';
import {
  Store,
  Layers,
  ShoppingBag,
  Clock,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle,
  Eye,
  AlertCircle,
  Mail,
  Building,
  User,
  Phone,
  FileText,
  MapPin,
  ExternalLink,
  ChevronRight,
  Info,
  X,
  Upload
} from 'lucide-react';
import { Category, Product, StoreSettings, Order } from '../types';

interface AdminDashboardProps {
  categories: Category[];
  products: Product[];
  settings: StoreSettings;
  orders: Order[];
  adminToken: string;
  onLogout: () => void;
  onRefreshData: () => Promise<void>;
}

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  adminToken: string;
}

function ImageUploadWidget({ label, value, onChange, adminToken }: ImageUploadProps) {
  const [uploading, setUploading] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const [error, setError] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    if (!file) return;
    
    // Validate is image
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chỉ tải tệp hình ảnh (png, jpg, jpeg, webp, svg)');
      setTimeout(() => setError(''), 4000);
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Dung lượng ảnh tối đa là 5MB');
      setTimeout(() => setError(''), 4000);
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        },
        body: formData
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Tải ảnh lên máy chủ thất bại');
      }

      const result = await response.json();
      if (result.url) {
        onChange(result.url);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi kết nối tải ảnh');
      setTimeout(() => setError(''), 5000);
    } finally {
      setUploading(false);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      <label className="text-xs text-slate-700 font-bold block">{label}</label>
      
      <div 
        onDragEnter={onDrag}
        onDragOver={onDrag}
        onDragLeave={onDrag}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all duration-200 flex flex-col items-center justify-center text-center ${
          dragActive 
            ? 'border-sky-500 bg-sky-50/50 scale-[0.99]' 
            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleUploadFile(e.target.files[0]);
            }
          }}
        />

        {value ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-white">
              <img 
                src={value} 
                alt="Uploaded preview" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="flex-1 text-left min-w-0">
              <p className="text-[10px] text-slate-400 font-mono truncate mb-1">{value}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-[10px] py-1.5 px-3 rounded-lg border border-slate-200 transition-colors shadow-2xs inline-flex items-center space-x-1"
                >
                  <Upload className="w-3 h-3 text-slate-500" />
                  <span>Chọn từ máy tính</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] py-1.5 px-3 rounded-lg border border-red-200/50 transition-colors inline-flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Xóa ảnh</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer py-3 w-full flex flex-col items-center justify-center space-y-1"
          >
            <div className="p-2 bg-sky-100/60 rounded-xl text-sky-600 group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5 animate-bounce" />
            </div>
            <p className="text-xs font-semibold text-slate-705">Kéo thả hoặc nhấn chọn tập tin</p>
            <p className="text-[10px] text-slate-400">Hình ảnh tối đa 5MB (PNG, JPG, WEBP)</p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/85 rounded-2xl flex flex-col items-center justify-center space-y-2 backdrop-blur-3xs animate-fadeIn z-10">
            <svg className="animate-spin h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-[11px] font-bold text-sky-700 font-sans">Đang tải ảnh lên...</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 mt-1">
        <span className="text-[11px] text-slate-400 whitespace-nowrap">Hoặc đường dẫn ảnh (URL):</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/logo.png"
          className="flex-1 text-[11px] bg-white border border-slate-200 p-1.5 rounded-lg outline-none font-mono focus:border-indigo-500"
        />
      </div>

      {error && (
        <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center space-x-1 animate-pulse">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export default function AdminDashboard({
  categories,
  products,
  settings,
  orders,
  adminToken,
  onLogout,
  onRefreshData,
}: AdminDashboardProps) {
  // Tabs: 'products' | 'categories' | 'branding' | 'social' | 'orders' | 'emails'
  const [activeTab, setActiveTab] = React.useState<'products' | 'categories' | 'branding' | 'orders' | 'emails'>('products');
  
  // Status feedback
  const [successMsg, setSuccessMsg] = React.useState('');
  const [errMsg, setErrMsg] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  // States for category management
  const [newCatName, setNewCatName] = React.useState('');

  // States for email log simulation preview
  const [emailLogs, setEmailLogs] = React.useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = React.useState<any>(null);

  // States for products editing
  const [editingProduct, setEditingProduct] = React.useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = React.useState(false);

  // States for corporate branding
  const [brandLogo, setBrandLogo] = React.useState(settings.logo_url);
  const [brandStoreName, setBrandStoreName] = React.useState(settings.store_name);
  const [brandSlogan, setBrandSlogan] = React.useState(settings.slogan);
  const [brandBusName, setBrandBusName] = React.useState(settings.business_name);
  const [brandTaxCode, setBrandTaxCode] = React.useState(settings.tax_code);
  const [brandTaxAddr, setBrandTaxAddr] = React.useState(settings.tax_address);
  const [brandPhone, setBrandPhone] = React.useState(settings.phone);
  const [brandEmail, setBrandEmail] = React.useState(settings.email);
  // Multichannel channels
  const [chanShopee, setChanShopee] = React.useState(settings.shopee_url);
  const [chanTiktok, setChanTiktok] = React.useState(settings.tiktok_url);
  const [chanFacebook, setChanFacebook] = React.useState(settings.facebook_url);
  const [chanZalo, setChanZalo] = React.useState(settings.zalo_url);

  const formatVND = (num: number) => num.toLocaleString('vi-VN') + ' đ';

  // Fetch email logs on load when tab is active
  React.useEffect(() => {
    if (activeTab === 'emails') {
      fetchEmailLogs();
    }
  }, [activeTab]);

  const showStatus = (type: 'success' | 'error', text: string) => {
    if (type === 'success') {
      setSuccessMsg(text);
      setErrMsg('');
      setTimeout(() => setSuccessMsg(''), 3500);
    } else {
      setErrMsg(text);
      setSuccessMsg('');
      setTimeout(() => setErrMsg(''), 5000);
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const response = await fetch('/api/admin/email-logs', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (response.ok) {
        const logs = await response.json();
        setEmailLogs(logs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- BRANDING SAVE FUNCTION ---
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: StoreSettings = {
        logo_url: brandLogo,
        store_name: brandStoreName,
        slogan: brandSlogan,
        business_name: brandBusName,
        tax_code: brandTaxCode,
        tax_address: brandTaxAddr,
        phone: brandPhone,
        email: brandEmail,
        shopee_url: chanShopee,
        tiktok_url: chanTiktok,
        facebook_url: chanFacebook,
        zalo_url: chanZalo,
      };

      const response = await fetch('/api/store-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showStatus('success', 'Đã lưu cấu hình thương hiệu & thông tin pháp lý thành công!');
        await onRefreshData();
      } else {
        showStatus('error', 'Không thể lưu cài đặt thương hiệu.');
      }
    } catch (err) {
      showStatus('error', 'Lỗi mạng, kiểm tra lại kết nối!');
    } finally {
      setIsSaving(false);
    }
  };

  // --- CATEGORIES FUNCTIONS ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ name: newCatName.trim() })
      });
      const resData = await response.json();
      if (response.ok) {
        showStatus('success', `Đã thêm danh mục "${resData.name}"`);
        setNewCatName('');
        await onRefreshData();
      } else {
        showStatus('error', resData.error || 'Có lỗi khi thêm danh mục.');
      }
    } catch (err) {
      showStatus('error', 'Lỗi kết nối máy chủ.');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"? Các sản phẩm thuộc danh mục này sẽ hiển thị Không xác định.`)) {
      return;
    }
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (response.ok) {
        showStatus('success', 'Xóa danh mục thành công!');
        await onRefreshData();
      } else {
        showStatus('error', 'Không thể xóa danh mục.');
      }
    } catch (err) {
      showStatus('error', 'Lỗi mạng khi xóa.');
    }
  };

  // --- PRODUCTS FUNCTIONS ---
  const handleOpenProductCreate = () => {
    setEditingProduct({
      name: '',
      category_id: categories[0]?.id || '',
      original_price: 100000,
      discount_percent: 0,
      description_short: '',
      description_detail: '',
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',
      video_url: '',
      is_featured: false,
      is_hot_deal: false,
      is_flash_sale: false
    });
    setIsProductModalOpen(true);
  };

  const handleOpenProductEdit = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.category_id) {
      showStatus('error', 'Vui lòng cung cấp tối thiểu Tên sản phẩm và Danh mục.');
      return;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(editingProduct)
      });
      const resData = await response.json();
      if (response.ok) {
        showStatus('success', `Đã lưu sản phẩm "${resData.name}" thành công!`);
        setIsProductModalOpen(false);
        setEditingProduct(null);
        await onRefreshData();
      } else {
        showStatus('error', resData.error || 'Có lỗi phát sinh khi lưu sản phẩm.');
      }
    } catch (e) {
      showStatus('error', 'Lỗi mạng kết nối.');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tuyệt đối sản phẩm "${name}" khỏi kệ hàng?`)) {
      return;
    }
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (response.ok) {
        showStatus('success', 'Xóa sản phẩm thành công!');
        await onRefreshData();
      } else {
        showStatus('error', 'Không thể xóa sản phẩm hiện tại.');
      }
    } catch (err) {
      showStatus('error', 'Lỗi kết nối xảy ra.');
    }
  };

  // --- ORDERS FUNCTIONS ---
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        showStatus('success', `Đã cập nhật trạng thái đơn hàng sang: ${newStatus}`);
        await onRefreshData();
      } else {
        showStatus('error', 'Không thể thay đổi trạng thái đơn.');
      }
    } catch (e) {
      showStatus('error', 'Kết nối gặp vấn đề.');
    }
  };

  return (
    <div id="admin-dashboard-wrap" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Upper info panel */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-500 w-2.5 h-2.5 rounded-full animate-ping"></span>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Hệ thống Trực tuyến</span>
          </div>
          <h2 id="admin-dashboard-title" className="text-xl md:text-2xl font-black tracking-tight flex items-center space-x-2">
            <span>Bảng Quản Lý Cửa Hàng</span>
            <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-md font-normal">MVP Mode</span>
          </h2>
          <p className="text-slate-400 text-xs text-[11px]">Đồng bộ cấu hình doanh nghiệp thực tế. Trình biên dịch hỗ trợ Supabase & Resend API.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:block text-right">
            <span className="block text-xs font-bold text-slate-400">Admin Account</span>
            <span id="admin-email-badge" className="text-xs font-mono text-indigo-400">achau.kimduc@gmail.com</span>
          </div>
          <button
            id="btn-admin-logout"
            onClick={onLogout}
            className="bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer border border-slate-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Global Toast Notices */}
      {successMsg && (
        <div id="admin-success-toast" className="p-4 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-2xl flex items-center space-x-3 text-xs animate-slideDown shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}
      {errMsg && (
        <div id="admin-error-toast" className="p-4 bg-red-50 border border-red-150 text-red-800 rounded-2xl flex items-center space-x-3 text-xs animate-slideDown shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span className="font-semibold">{errMsg}</span>
        </div>
      )}

      {/* Section tab-selector */}
      <div className="flex flex-wrap border-b border-slate-100 gap-1">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-3 text-xs font-extrabold cursor-pointer transition-colors border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'products'
              ? 'border-indigo-650 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Sản phẩm ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-5 py-3 text-xs font-extrabold cursor-pointer transition-colors border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'categories'
              ? 'border-indigo-650 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Danh mục ({categories.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-5 py-3 text-xs font-extrabold cursor-pointer transition-colors border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'branding'
              ? 'border-indigo-650 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Thương hiệu & Pháp lý</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 text-xs font-extrabold cursor-pointer transition-colors border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'orders'
              ? 'border-indigo-650 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Đơn đặt hàng ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('emails')}
          className={`px-5 py-3 text-xs font-extrabold cursor-pointer transition-colors border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'emails'
              ? 'border-indigo-650 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Nhật ký gửi thư</span>
        </button>
      </div>

      {/* ----------------- TAB: PRODUCTS LIST ----------------- */}
      {activeTab === 'products' && (
        <div id="tab-products-panel" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5 animate-scaleUp">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">Danh Sách Sản Phẩm Kinh Doanh</h3>
              <p className="text-xs text-slate-400">Thêm mới, chỉnh sửa thông số và trạng thái badges hiển thị công khai trên Store.</p>
            </div>
            
            <button
              id="admin-btn-create-product"
              onClick={handleOpenProductCreate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1 cursor-pointer transition-colors shadow-md shadow-indigo-600/10"
            >
              <Plus className="w-4 h-4" />
              <span>THÊM SẢN PHẨM MỚI</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] text-slate-500 font-extrabold">
                  <th className="p-3">Sản phẩm</th>
                  <th className="p-3">Danh mục</th>
                  <th className="p-3 text-right">Giá gốc</th>
                  <th className="p-3 text-center">Giảm %</th>
                  <th className="p-3 text-right text-indigo-650">Giá bán thực</th>
                  <th className="p-3 text-center">Hiển thị Badges</th>
                  <th className="p-3 text-center">Biên tập</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">Chưa có sản phẩm nào trên kệ hàng. Hãy bấm Thêm sản phẩm mới!</td>
                  </tr>
                ) : (
                  products.map((prod) => {
                    const cat = categories.find((c) => c.id === prod.category_id);
                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <img src={prod.image_url} alt={prod.name} className="w-10 h-10 object-cover rounded-md border" referrerPolicy="no-referrer" />
                            <div>
                              <span className="font-bold text-slate-900 block line-clamp-1">{prod.name}</span>
                              {prod.video_url && <span className="text-[10px] text-red-500 font-semibold block">Has Video YouTube ✔</span>}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-sm">
                            {cat ? cat.name : 'Unknown'}
                          </span>
                        </td>
                        <td className="p-3 text-right">{formatVND(prod.original_price)}</td>
                        <td className="p-3 text-center text-orange-500 font-bold">{prod.discount_percent}%</td>
                        <td className="p-3 text-right font-extrabold text-sky-600">{formatVND(prod.price_after_discount)}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 justify-center max-w-[150px] mx-auto">
                            {prod.is_featured && <span className="bg-sky-50 text-sky-700 font-bold text-[9px] px-1.5 py-0.5 rounded-sm">FEATURED</span>}
                            {prod.is_hot_deal && <span className="bg-orange-50 text-orange-700 font-bold text-[9px] px-1.5 py-0.5 rounded-sm">HOT DEAL</span>}
                            {prod.is_flash_sale && <span className="bg-red-50 text-red-700 font-bold text-[9px] px-1.5 py-0.5 rounded-sm">FLASH</span>}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => handleOpenProductEdit(prod)}
                              title="Sửa sản phẩm"
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              title="Xóa tuyệt đối"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- TAB: CATEGORIES ----------------- */}
      {activeTab === 'categories' && (
        <div id="tab-categories-panel" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 animate-scaleUp">
          <div>
            <h3 className="text-base font-black text-slate-900">Quản Lý Danh Mục Bản Đồ Kinh Doanh</h3>
            <p className="text-xs text-slate-400">Các phần hệ ngành hàng phân phối như: Thiết bị, Vật tư, Dược phẩm...</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Create form */}
            <form onSubmit={handleAddCategory} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3.5 h-fit">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Thêm danh mục động mới</span>
              
              <div className="space-y-1">
                <label className="text-xs text-slate-700 font-bold">Tên Ngành Hàng / Danh Mục:</label>
                <input
                  id="admin-new-cat-input"
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ví dụ: Thiết bị y tế cá nhân"
                  className="w-full text-xs bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 outline-none"
                />
              </div>

              <button
                id="admin-btn-add-cat-submit"
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>XÁC NHẬN THÊM</span>
              </button>
            </form>

            {/* List and delete */}
            <div className="space-y-3">
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Danh mục đang hoạt động ({categories.length})</span>
              <div id="admin-categories-active-list" className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-4 bg-white space-y-2">
                {categories.length === 0 ? (
                  <p className="text-slate-400 text-xs italic text-center py-4">Chưa có danh mục nào. Hãy bổ sung danh mục mới!</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat.id} className="flex justify-between items-center py-2 text-xs">
                      <div>
                        <span className="font-extrabold text-slate-800 block text-sm">{cat.name}</span>
                        <span className="font-mono text-[10px] text-slate-400">Slug: {cat.slug}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1 px-2.5 text-xs text-red-600 font-bold hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB: BRANDING & CONTACT LEGAL SETTINGS ----------------- */}
      {activeTab === 'branding' && (
        <form id="brand-legal-form" onSubmit={handleSaveBranding} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-8 animate-scaleUp">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">Cấu Hình Thương Hiệu & Thông Tin Pháp Lý</h3>
              <p className="text-xs text-slate-400">Thiết lập logo, slogan, hotline và thông tin kinh doanh hiển thị trực tiếp công khai dưới chân trang (Footer).</p>
            </div>
            
            <button
              id="admin-brand-submit-btn"
              type="submit"
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold text-xs px-5 py-3 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-sm shadow-indigo-600/10"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'ĐANG LƯU...' : 'LƯU CẤU HÌNH'}</span>
            </button>
          </div>

          {/* Grid fields for branding */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left box: Branding details */}
            <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <span className="block text-xs font-black text-slate-600 uppercase tracking-widest flex items-center space-x-1">
                <Store className="w-4 h-4 text-sky-500" />
                <span>1. Diện mạo Cây thương hiệu</span>
              </span>

              {/* Logo Upload & URL */}
              <ImageUploadWidget
                label="Hình ảnh Logo gian hàng:"
                value={brandLogo}
                onChange={setBrandLogo}
                adminToken={adminToken}
              />

              {/* Store Name */}
              <div className="space-y-1">
                <label className="text-xs text-slate-700 font-bold block">Tên gian hàng / Cửa hàng:</label>
                <input
                  id="admin-brand-name-input"
                  type="text"
                  required
                  value={brandStoreName}
                  onChange={(e) => setBrandStoreName(e.target.value)}
                  placeholder="MediShop Việt Nam"
                  className="w-full text-xs bg-white border border-slate-200 focus:border-indigo-500 p-2.5 rounded-xl outline-none"
                />
              </div>

              {/* Slogan */}
              <div className="space-y-1">
                <label className="text-xs text-slate-700 font-bold block">Slogan thương hiệu:</label>
                <input
                  id="admin-brand-slogan-input"
                  type="text"
                  required
                  value={brandSlogan}
                  onChange={(e) => setBrandSlogan(e.target.value)}
                  placeholder="Tiên phong phân phối thiết bị y tế chính hãng"
                  className="w-full text-xs bg-white border border-slate-200 focus:border-indigo-500 p-2.5 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Right box: Corporate business & tax info */}
            <div className="space-y-4 bg-indigo-50/20 p-5 rounded-2xl border border-indigo-100/50">
              <span className="block text-xs font-black text-indigo-700 uppercase tracking-widest flex items-center space-x-1">
                <Building className="w-4 h-4 text-indigo-500" />
                <span>2. Đăng ký thông tin pháp lý (Footer)</span>
              </span>

              {/* Corporate business legal name */}
              <div className="space-y-1">
                <label className="text-xs text-slate-700 font-bold block">Tên doanh nghiệp đầy đủ:</label>
                <input
                  id="admin-legal-name-input"
                  type="text"
                  required
                  value={brandBusName}
                  onChange={(e) => setBrandBusName(e.target.value)}
                  placeholder="Công ty Cổ phần Công nghệ Y tế MediShop Việt Nam"
                  className="w-full text-xs bg-white border border-slate-100 focus:border-indigo-500 p-2.5 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tax code (MST) */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-700 font-bold block">Mã số thuế doanh nghiệp (MST):</label>
                  <input
                    id="admin-legal-tax-input"
                    type="text"
                    required
                    value={brandTaxCode}
                    onChange={(e) => setBrandTaxCode(e.target.value)}
                    placeholder="0109876543"
                    className="w-full text-xs bg-white border border-slate-100 focus:border-indigo-500 p-2.5 rounded-xl outline-none"
                  />
                </div>

                {/* Hotline contact phone */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-700 font-bold block">Hotline liên hệ công khai:</label>
                  <input
                    id="admin-legal-phone-input"
                    type="text"
                    required
                    value={brandPhone}
                    onChange={(e) => setBrandPhone(e.target.value)}
                    placeholder="0987654321"
                    className="w-full text-xs bg-white border border-slate-100 focus:border-indigo-500 p-2.5 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Email Support */}
              <div className="space-y-1">
                <label className="text-xs text-slate-700 font-bold block">Email chăm sóc / Hỗ trợ:</label>
                <input
                  id="admin-legal-email-input"
                  type="email"
                  required
                  value={brandEmail}
                  onChange={(e) => setBrandEmail(e.target.value)}
                  placeholder="support@medishop.com"
                  className="w-full text-xs bg-white border border-slate-100 focus:border-indigo-500 p-2.5 rounded-xl outline-none"
                />
              </div>

              {/* Tax Official address */}
              <div className="space-y-1">
                <label className="text-xs text-slate-700 font-bold block">Địa chỉ trụ sở chính:</label>
                <textarea
                  id="admin-legal-address-input"
                  required
                  rows={2}
                  value={brandTaxAddr}
                  onChange={(e) => setBrandTaxAddr(e.target.value)}
                  placeholder="123 Đường Giải Phóng, Quận Hai Bà Trưng, Hà Nội"
                  className="w-full text-xs bg-white border border-slate-100 focus:border-indigo-500 p-2.5 rounded-xl outline-none resize-none"
                ></textarea>
              </div>
            </div>

          </div>

          {/* Social Platforms Links */}
          <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
            <span className="block text-xs font-black text-slate-655 uppercase tracking-widest">3. Tích hợp liên kết đa kênh thương mại</span>
            <p className="text-xs text-slate-400">Nhập liên kết Shopee, Facebook Page, TikTok Shop, Zalo OA để các biểu tượng điều hướng tự động hiển thị công khai ở ngoài trang chủ / Footer.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Shopee */}
              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-bold block">Mạng lưới Shopee Shop URL:</label>
                <input
                  id="admin-social-shopee-input"
                  type="text"
                  value={chanShopee}
                  onChange={(e) => setChanShopee(e.target.value)}
                  placeholder="https://shopee.vn/ten-cua-hang"
                  className="w-full text-xs bg-white border border-slate-200 focus:border-indigo-500 p-2.5 rounded-xl outline-none"
                />
              </div>

              {/* TikTok Shop */}
              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-bold block">Mạng lưới TikTok Shop URL:</label>
                <input
                  id="admin-social-tiktok-input"
                  type="text"
                  value={chanTiktok}
                  onChange={(e) => setChanTiktok(e.target.value)}
                  placeholder="https://tiktok.com/@tencuahang"
                  className="w-full text-xs bg-white border border-slate-200 focus:border-indigo-500 p-2.5 rounded-xl outline-none"
                />
              </div>

              {/* Facebook */}
              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-bold block">Đường dẫn Facebook Fanpage:</label>
                <input
                  id="admin-social-facebook-input"
                  type="text"
                  value={chanFacebook}
                  onChange={(e) => setChanFacebook(e.target.value)}
                  placeholder="https://facebook.com/tenfanpage"
                  className="w-full text-xs bg-white border border-slate-200 focus:border-indigo-500 p-2.5 rounded-xl outline-none"
                />
              </div>

              {/* Zalo */}
              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-bold block">Số điện thoại / Link Zalo OA:</label>
                <input
                  id="admin-social-zalo-input"
                  type="text"
                  value={chanZalo}
                  onChange={(e) => setChanZalo(e.target.value)}
                  placeholder="https://zalo.me/sdt-hoac-oa-id"
                  className="w-full text-xs bg-white border border-slate-200 focus:border-indigo-500 p-2.5 rounded-xl outline-none"
                />
              </div>
            </div>
          </div>

        </form>
      )}

      {/* ----------------- TAB: ORDERS MANAGEMENT ----------------- */}
      {activeTab === 'orders' && (
        <div id="tab-orders-panel" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 animate-scaleUp">
          <div>
            <h3 className="text-base font-black text-slate-900">Quản Lý Đơn Đặt Hàng Trực Tuyến</h3>
            <p className="text-xs text-slate-400">Danh sách tất cả các đơn hàng do khách đăng ký đặt mua thông qua phễu Giỏ hàng trực tuyến.</p>
          </div>

          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center p-12 bg-slate-50 rounded-2xl text-slate-400 text-xs italic">Chưa phát sinh đơn đặt hàng nào trong lịch sử hệ thống.</div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  id={`admin-order-box-${ord.id}`}
                  className="border border-slate-150 rounded-2xl overflow-hidden shadow-xs hover:border-slate-350 transition-all text-xs"
                >
                  {/* Title heading strip */}
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-900 font-mono text-sm">{ord.id}</span>
                      <span className="text-[10px] text-slate-400">{new Date(ord.created_at).toLocaleString('vi-VN')}</span>
                    </div>

                    {/* Interactive controls status changer */}
                    <div className="flex items-center space-x-2.5">
                      <span className="text-slate-400 font-bold uppercase text-[9px]">Cập nhật Trạng thái:</span>
                      <select
                        id={`admin-select-status-${ord.id}`}
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className={`font-semibold p-1.5 rounded-lg border focus:outline-none cursor-pointer ${
                          ord.status === 'NEW'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : ord.status === 'CONFIRMED'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : ord.status === 'SHIPPED'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : ord.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        <option value="NEW">MỚI CHƯA XỬ LÝ (NEW)</option>
                        <option value="CONFIRMED">ĐÃ XÁC NHẬN (CONFIRMED)</option>
                        <option value="SHIPPED">ĐANG GIAO (SHIPPED)</option>
                        <option value="COMPLETED">ĐÃ HOÀN THÀNH (COMPLETED)</option>
                        <option value="CANCELLED">HỦY ĐƠN (CANCELLED)</option>
                      </select>
                    </div>
                  </div>

                  {/* Body info layout */}
                  <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white">
                    {/* Customer columns details */}
                    <div className="space-y-2 border-r border-slate-100 pr-4">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Khách hàng nhận hàng</span>
                      <p className="font-extrabold text-slate-900 text-sm">{ord.customer_name}</p>
                      <p className="font-semibold text-slate-600">📞 SĐT: <a href={`tel:${ord.customer_phone}`} className="text-indigo-600 hover:underline">{ord.customer_phone}</a></p>
                      <p className="text-xs text-slate-500 leading-relaxed">📍 Địa chỉ: {ord.customer_address}</p>
                    </div>

                    {/* Bought items columns table details */}
                    <div className="md:col-span-2 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Danh sách sản phẩm mua</span>
                        <div className="divide-y divide-slate-100 max-h-32 overflow-y-auto border border-slate-100 rounded-xl p-2.5 space-y-1">
                          {ord.items.map((it: any) => (
                            <div key={it.id} className="flex justify-between items-center py-1.5 text-xs text-slate-700">
                              <span className="font-semibold block max-w-xs truncate">{it.product_name} <span className="text-slate-400">x{it.quantity}</span></span>
                              <span className="font-bold text-slate-800 shrink-0">{formatVND(it.price_at_purchase * it.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Display total amount */}
                      <div className="pt-2 border-t border-slate-50 flex justify-between items-center bg-slate-50/50 p-2.5 rounded-xl">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Doanh số Đơn hàng:</span>
                        <span className="text-base font-black text-rose-600">{formatVND(ord.total_amount)}</span>
                      </div>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ----------------- TAB: EMAIL SIMULATION / LOGS PREVIEW ----------------- */}
      {activeTab === 'emails' && (
        <div id="tab-emails-panel" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 animate-scaleUp">
          <div>
            <h3 className="text-base font-black text-slate-900">Lịch Sử & Nhật Ký Gửi Thư Thông Báo (Resend.com)</h3>
            <p className="text-xs text-slate-400">Các bọc cấu trúc email chuẩn HTML được hệ thống chuyển hóa khi người dùng tạo đơn. Hỗ trợ xem trực tiếp layout email thông báo của người bán.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left box: Sent list */}
            <div className="lg:col-span-1 space-y-3.5">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Danh mục email đã phát sinh ({emailLogs.length})</span>
              <div className="space-y-2 max-h-[500px] overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                {emailLogs.length === 0 ? (
                  <p className="text-slate-400 text-xs italic text-center py-4">Chưa phát sinh thư điện tử nào.</p>
                ) : (
                  emailLogs.map((log: any, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedEmail(log)}
                      className={`p-3.5 rounded-xl cursor-pointer transition-all border text-xs text-left text-slate-700 space-y-1.5 ${
                        selectedEmail === log
                          ? 'bg-slate-900 text-white border-slate-905 scale-[1.01]'
                          : 'bg-white text-slate-655 border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold font-mono text-sky-500">{log.orderId}</span>
                        <span className={`text-[10px] p-0.5 px-2 rounded-md font-bold ${
                          log.status === 'SENT' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'
                        }`}>
                          {log.status === 'SENT' ? 'Thật' : 'Mô phỏng'}
                        </span>
                      </div>
                      
                      <p className="line-clamp-1"><b>Khách:</b> {log.customer_name}</p>
                      <p className="line-clamp-1 text-[10px] text-slate-400 font-mono"><b>Gửi đến:</b> {log.sent_to}</p>
                      
                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100/50">
                        <span>{new Date(log.timestamp).toLocaleTimeString('vi-VN')}</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right box: Rich HTML Frame render */}
            <div className="lg:col-span-2 space-y-3">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Layout Email hiển thị trực quan</span>
              {selectedEmail ? (
                <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white shadow-xs">
                  {/* Info Header */}
                  <div className="bg-slate-50 p-4 border-b border-slate-150 text-xs flex justify-between items-center text-slate-600">
                    <div>
                      <p><b>Mã đơn:</b> {selectedEmail.orderId}</p>
                      <p><b>SMTP Logs:</b> <span className="text-red-500">{selectedEmail.error || 'Tuyệt vời, không có lỗi'}</span></p>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">{new Date(selectedEmail.timestamp).toLocaleString('vi-VN')}</span>
                  </div>
                  
                  {/* Direct Iframe render with clean HTML code */}
                  <div className="p-1 bg-slate-100">
                    <iframe
                      srcDoc={selectedEmail.html}
                      title="Email HTML Preview"
                      className="w-full h-[450px] border-0 bg-white"
                    ></iframe>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-slate-50 rounded-2xl text-slate-400 text-xs space-y-2 border border-dashed border-slate-200">
                  <Mail className="w-12 h-12 stroke-1 text-slate-300" />
                  <p>Chọn một Email trong danh sách bên trái để kiểm tra giao diện hiển thị.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ----------------- DIALOG POPUPS: PRODUCTS EDIT MODAL ----------------- */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="text-base font-black text-slate-900 leading-snug">
                {editingProduct.id ? `Chỉnh sửa sản phẩm: ${editingProduct.name}` : 'Thêm sản phẩm mới'}
              </h4>
              <button
                onClick={() => {
                  setIsProductModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="space-y-4 text-xs text-slate-800">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-700 font-bold block">Tên sản phẩm <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="Máy đo huyết áp Omron"
                    className="w-full text-xs bg-slate-50 border border-slate-150 p-2.5 rounded-xl outline-none"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-700 font-bold block">Danh mục ngành hàng <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={editingProduct.category_id || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-150 p-2.5 rounded-xl outline-none cursor-pointer"
                  >
                    <option value="" disabled>-- Chọn một danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Original Price */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-700 font-bold block">Giá gốc chưa giảm (VND) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingProduct.original_price ?? ''}
                    onChange={(e) => {
                      const orig = Number(e.target.value) || 0;
                      const disc = editingProduct.discount_percent || 0;
                      const after = Math.round(orig * (1 - disc / 100));
                      setEditingProduct({
                        ...editingProduct,
                        original_price: orig,
                        price_after_discount: after
                      });
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-150 p-2.5 rounded-xl outline-none"
                  />
                </div>

                {/* Discount % */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-700 font-bold block">Giảm giá (%) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={editingProduct.discount_percent ?? ''}
                    onChange={(e) => {
                      const disc = Number(e.target.value) || 0;
                      const orig = editingProduct.original_price || 0;
                      const after = Math.round(orig * (1 - disc / 100));
                      setEditingProduct({
                        ...editingProduct,
                        discount_percent: disc,
                        price_after_discount: after
                      });
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-150 p-2.5 rounded-xl outline-none"
                  />
                </div>

                {/* Generated Price tag */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold block uppercase tracking-widest text-[10px]">Giá bán thực tế (đã tính):</label>
                  <div className="bg-slate-100 p-2.5 rounded-xl font-bold text-sky-600 text-sm border-2 border-dashed border-slate-205 text-center">
                    {formatVND(editingProduct.price_after_discount || 0)}
                  </div>
                </div>
              </div>

              {/* Image Upload & Video URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <ImageUploadWidget
                  label="Hình ảnh sản phẩm:"
                  value={editingProduct.image_url || ''}
                  onChange={(url) => setEditingProduct({ ...editingProduct, image_url: url })}
                  adminToken={adminToken}
                />

                <div className="space-y-1.5 self-start">
                  <label className="text-xs text-slate-700 font-bold block">Liên kết video sản phẩm (YouTube URL):</label>
                  <input
                    type="url"
                    value={editingProduct.video_url || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full text-xs bg-slate-50 border border-slate-150 p-2.5 rounded-xl outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400">Xem trực tiếp trailer/hướng dẫn sử dụng video tại trang chi tiết.</p>
                </div>
              </div>

              {/* Display badges checkboxes settings */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="block text-xs font-bold text-slate-600 uppercase tracking-widest">Thiết lập hiển thị nhanh (Badges)</span>
                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center space-x-2.5 font-bold text-slate-750 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingProduct.is_featured}
                      onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                      className="w-4.5 h-4.5 accent-indigo-650 cursor-pointer"
                    />
                    <span>📍 NỔI BẬT</span>
                  </label>
                  <label className="flex items-center space-x-2.5 font-bold text-slate-750 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingProduct.is_hot_deal}
                      onChange={(e) => setEditingProduct({ ...editingProduct, is_hot_deal: e.target.checked })}
                      className="w-4.5 h-4.5 accent-indigo-650 cursor-pointer"
                    />
                    <span>🔥 HOT DEAL</span>
                  </label>
                  <label className="flex items-center space-x-2.5 font-bold text-slate-750 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingProduct.is_flash_sale}
                      onChange={(e) => setEditingProduct({ ...editingProduct, is_flash_sale: e.target.checked })}
                      className="w-4.5 h-4.5 accent-indigo-650 cursor-pointer"
                    />
                    <span>⚡ FLASH SALE</span>
                  </label>
                </div>
              </div>

              {/* Short description */}
              <div className="space-y-1">
                <label className="text-xs text-slate-700 font-bold block">Mô tả ngắn gọn:</label>
                <input
                  type="text"
                  maxLength={180}
                  value={editingProduct.description_short || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description_short: e.target.value })}
                  placeholder="2 dòng tóm tắt công cụ, tác dụng nổi bật..."
                  className="w-full text-xs bg-slate-50 border border-slate-150 p-2.5 rounded-xl outline-none"
                />
              </div>

              {/* Detail description */}
              <div className="space-y-1">
                <label className="text-xs text-slate-700 font-bold block">Mô tả chi tiết kỹ thuật:</label>
                <textarea
                  rows={4}
                  value={editingProduct.description_detail || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description_detail: e.target.value })}
                  placeholder="Thông số kỹ thuật đầy đủ, hướng dẫn đo đạc và quyền lợi bảo hành..."
                  className="w-full text-xs bg-slate-50 border border-slate-150 p-2.5 rounded-xl outline-none resize-none"
                ></textarea>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="bg-indigo-650 text-white font-extrabold px-6 py-2.5 rounded-xl hover:bg-indigo-700 cursor-pointer"
                >
                  XÁC NHẬN LƯU
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
