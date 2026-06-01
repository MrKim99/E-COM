import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, ShoppingCart, ShoppingBag, Send, CreditCard, 
  Trash2, User, Phone, MapPin, AlignLeft, ShieldCheck, 
  Database, Mail, Calendar, Check, AlertCircle, Sparkles, Plus, Minus
} from "lucide-react";
import { Product, Order, OrderItem, AdminConfig, StoreSettings } from "./types";
import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import FilterSection from "./components/FilterSection";
import AdminProductManager from "./components/AdminProductManager";
import AdminOrderList, { OrderWithItems } from "./components/AdminOrderList";
import AdminStoreSettings from "./components/AdminStoreSettings";

export default function App() {
  // Navigation Routing States
  const [route, setRoute] = useState(window.location.hash || "#/");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Configuration check states
  const [config, setConfig] = useState<AdminConfig>({
    supabaseConnected: false,
    resendConnected: false,
    sellerEmail: "achau.kimduc@gmail.com",
  });

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSort, setSelectedSort] = useState("all");

  // Cart State
  const [cart, setCart] = useState<Array<{ product_id: string; name: string; price: number; quantity: number; image_url: string }>>([]);

  // Customer checkout form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  // Submitting States
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [orderSuccessDetails, setOrderSuccessDetails] = useState<any | null>(null);

  // Admin login states
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Dashboard Toggle state
  const [adminActiveTab, setAdminActiveTab] = useState<"products" | "orders" | "settings">("products");

  // Store profile metadata settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    logo_url: "",
    store_name: "MEDSTORE",
    store_slogan: "Chất lượng là ưu tiên số 1",
    corporate_name: "Công ty Cổ phần Đầu tư Y tế MedStore Việt Nam",
    tax_code: "0109876543",
    business_address: "Số 45, Đường Giải Phóng, Phường Phương Mai, Quận Đống Đa, Hà Nội",
    hotline: "1900 6000",
    email: "achau.kimduc@gmail.com",
    order_email: "achau.kimduc@gmail.com",
    shopee_url: "https://shopee.vn/medstore",
    tiktok_url: "https://tiktok.com/@medstore",
    facebook_url: "https://facebook.com/medstore",
    zalo_url: "https://zalo.me/0987654321",
  });

  // Fetch initial config and products
  useEffect(() => {
    fetchConfig();
    fetchProducts();
    fetchStoreSettings();

    // Setup routing hash listener
    const handleHashChange = () => {
      const currentHash = window.location.hash || "#/";
      setRoute(currentHash);

      // Check if viewing specific product details
      if (currentHash.startsWith("#/product/")) {
        const id = currentHash.split("#/product/")[1];
        setSelectedProductId(id);
      } else {
        setSelectedProductId(null);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Trigger once on mount

    // Load initial cart if saved
    const savedCart = localStorage.getItem("cart_items");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.warn("Could not load cart items:", e);
      }
    }

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Sync route and Hash
  const navigateTo = (newHash: string) => {
    window.location.hash = newHash;
    setRoute(newHash);
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      setConfig(data);
    } catch (e) {
      console.warn("Could not retrieve system config status.", e);
    }
  };

  const fetchStoreSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setStoreSettings(data);
      }
    } catch (e) {
      console.warn("Could not retrieve store settings.", e);
    }
  };

  const saveStoreSettings = async (updatedSettings: StoreSettings): Promise<boolean> => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSettings),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStoreSettings(data.settings);
          return true;
        }
      }
    } catch (e) {
      console.error("Could not save store settings:", e);
    }
    return false;
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error("Could not fetch products list.", e);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      console.error("Could not fetch orders list.", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Re-fetch orders when going to dashboard
  useEffect(() => {
    if (route === "#/admin/dashboard") {
      // confirm admin token exists, otherwise redirect
      const token = localStorage.getItem("admin_token");
      if (!token) {
        navigateTo("#/admin/login");
      } else {
        fetchOrders();
      }
    }
  }, [route]);

  // Cart operations
  const addToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click triggers
    const discountPrice = product.original_price - (product.original_price * (product.discount_percent || 0)) / 100;

    let updatedCart = [...cart];
    const existingIdx = cart.findIndex((it) => it.product_id === product.id);

    if (existingIdx !== -1) {
      updatedCart[existingIdx].quantity += 1;
    } else {
      updatedCart.push({
        product_id: product.id,
        name: product.name,
        price: discountPrice,
        quantity: 1,
        image_url: product.image_url,
      });
    }

    setCart(updatedCart);
    localStorage.setItem("cart_items", JSON.stringify(updatedCart));

    // Show floating mini alert
    const floatMsg = document.createElement("div");
    floatMsg.className = "fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 border border-slate-750 px-4 py-3 text-xs text-white shadow-xl flex items-center gap-2 pointer-events-none animate-bounce";
    floatMsg.innerHTML = `<span class="text-orange-500">🛒</span> Đã thêm sản phẩm vào giỏ hàng!`;
    document.body.appendChild(floatMsg);
    setTimeout(() => floatMsg.remove(), 2000);
  };

  const updateCartQuantity = (productId: string, diff: number) => {
    const updated = cart.map((it) => {
      if (it.product_id === productId) {
        const nextQty = it.quantity + diff;
        return { ...it, quantity: nextQty < 1 ? 1 : nextQty };
      }
      return it;
    });
    setCart(updated);
    localStorage.setItem("cart_items", JSON.stringify(updated));
  };

  const removeFromCart = (productId: string) => {
    const updated = cart.filter((it) => it.product_id !== productId);
    setCart(updated);
    localStorage.setItem("cart_items", JSON.stringify(updated));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart_items");
  };

  // Checkout order submission
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      alert("Vui lòng nhập đầy đủ các thông tin bắt buộc!");
      return;
    }

    setCheckoutSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: customerName,
            phone: customerPhone,
            address: customerAddress,
            notes: customerNotes
          },
          items: cart.map(it => ({
            product_id: it.product_id,
            name: it.name,
            price: it.price,
            quantity: it.quantity,
          }))
        })
      });

      const resData = await response.json();
      if (resData.success) {
        setOrderSuccessDetails(resData);
        clearCart();
        // Clear customer inputs
        setCustomerName("");
        setCustomerPhone("");
        setCustomerAddress("");
        setCustomerNotes("");
      } else {
        alert("Có lỗi xảy ra: " + (resData.error || "Không thể xác nhận đơn hàng lúc này"));
      }
    } catch (err) {
      console.error(err);
      alert("Kết nối tới máy chủ gửi đơn thất bại. Vui lòng thử lại!");
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  // Admin login submission
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_user", JSON.stringify(data.user));
        // Reset login email/password
        setAdminEmail("");
        setAdminPassword("");
        navigateTo("#/admin/dashboard");
      } else {
        setLoginError(data.message || "Email hoặc mật khẩu không chính xác.");
      }
    } catch (err) {
      setLoginError("Không thể kết nối đến máy chủ xác thực.");
    } finally {
      setLoginSubmitting(false);
    }
  };

  // Admin Products save & delete
  const saveProductByAdmin = async (productData: Partial<Product>) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        await fetchProducts(); // reload
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const deleteProductByAdmin = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await fetchProducts(); // reload
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  // Filtering Logic
  const categoriesList = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];
  const finalCategoriesList = Array.from(new Set(["Thiết bị", "Vật tư", "Dược phẩm", ...categoriesList]));

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (selectedSort === "sale") {
      // sort only items which are on sale, or prioritize sale items
      const saleA = a.is_on_sale ? 1 : 0;
      const saleB = b.is_on_sale ? 1 : 0;
      return saleB - saleA; // put sale items first
    }
    if (selectedSort === "low-to-high") {
      return a.discounted_price - b.discounted_price;
    }
    if (selectedSort === "high-to-low") {
      return b.discounted_price - a.discounted_price;
    }
    return 0; // Default: 'all' (keep raw server sort by created_at)
  });

  // Active product display selector
  const activeProduct = selectedProductId ? products.find((p) => p.id === selectedProductId) : null;

  // Render Helpers
  const renderHomeView = () => {
    // Collect Featured Products
    const featuredItems = products.filter((p) => p.is_featured);
    const saleItems = products.filter((p) => p.is_on_sale);

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Banner Carousel Highlight Section */}
        {featuredItems.length > 0 && (
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
            {/* Visual background gradient and decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 opacity-90" />
            <div className="absolute -top-12 -left-12 h-44 w-44 rounded-full bg-blue-600/10 blur-xl" />
            <div className="absolute -bottom-12 -right-12 h-60 w-60 rounded-full bg-blue-500/5 blur-2xl" />

            {/* Slider content */}
            <div className="relative mx-auto max-w-7xl px-6 py-12 sm:px-12 lg:px-16 grid gap-8 md:grid-cols-2 md:items-center">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                  🚀 SẢN PHẨM ƯU TIÊN NỔI BẬT
                </span>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
                  {featuredItems[0].name}
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                  {featuredItems[0].description}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xl font-black text-blue-400">
                    {featuredItems[0].discounted_price.toLocaleString("vi-VN")} đ
                  </span>
                  {featuredItems[0].discount_percent > 0 && (
                    <span className="text-sm text-slate-400 line-through">
                      {featuredItems[0].original_price.toLocaleString("vi-VN")} đ
                    </span>
                  )}
                </div>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    id={`banner-view-now-btn`}
                    onClick={() => navigateTo(`#/product/${featuredItems[0].id}`)}
                    className="rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-slate-900 shadow transition hover:bg-slate-100 cursor-pointer"
                  >
                    Xem Chi Tiết
                  </button>
                  <button
                    id={`banner-add-cart-btn`}
                    onClick={(e) => addToCart(featuredItems[0], e)}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 cursor-pointer"
                  >
                    Thêm Vào Giỏ Hàng
                  </button>
                </div>
              </div>
              <div className="flex justify-center md:justify-end">
                <div className="relative h-56 w-56 sm:h-72 sm:w-72 overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl">
                  <img
                    src={featuredItems[0].image_url}
                    alt={featuredItems[0].name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 rounded bg-amber-500 px-2 py-0.5 text-[10px] font-bold">
                    -{featuredItems[0].discount_percent}% OFF
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories quick filtering menu */}
        <FilterSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
          categories={finalCategoriesList}
        />

        {/* Main Products Grid displaying items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm font-bold text-slate-500">
              Kết quả: <span className="text-slate-900">{sortedProducts.length}</span> sản phẩm được trưng bày
            </span>
            {selectedCategory && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 font-medium text-slate-600 border">
                Danh mục: {selectedCategory}
              </span>
            )}
          </div>

          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-350 border-t-blue-600" />
              <p className="mt-4 text-xs font-medium">Đang tải danh sách sản phẩm y tế...</p>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
              <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-800">Không tìm thấy sản phẩm y khoa phù hợp</p>
              <p className="text-xs text-slate-500 mt-1">Thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc để tìm lại</p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory(""); setSelectedSort("all"); }}
                className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {sortedProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onAddToCart={addToCart}
                  onViewDetails={(id) => navigateTo(`#/product/${id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProductDetailsView = () => {
    if (!activeProduct) {
      return (
        <div className="py-20 text-center text-slate-400">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-2" />
          <p className="text-sm font-bold text-slate-800">Sản phẩm không khả dụng hoặc đã bị gỡ bỏ.</p>
          <button
            onClick={() => navigateTo("#/")}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow"
          >
            Về Trang Chủ
          </button>
        </div>
      );
    }

    const hasDiscount = activeProduct.discount_percent > 0;
    const finalPrice = activeProduct.original_price - (activeProduct.original_price * (activeProduct.discount_percent || 0)) / 100;

    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-8 animate-fade-in">
        {/* Navigation Button */}
        <div>
          <button
            id="back-to-home-btn"
            onClick={() => navigateTo("#/")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Quay Lại Sản Phẩm
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Column Images */}
          <div className="space-y-4">
            <div className="aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <img
                src={activeProduct.image_url}
                alt={activeProduct.name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Column Description info */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800 border">
                  {activeProduct.category}
                </span>

                {activeProduct.is_on_sale && (
                  <span className="rounded-full bg-blue-600/10 px-3 py-1 text-xs font-bold text-blue-600 border border-blue-200">
                    🎁 Hạn mức giảm giá
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {activeProduct.name}
              </h1>
            </div>

            {/* Pricing Tag details */}
            <div className="rounded-2xl bg-slate-50 p-4 sm:p-5 border border-slate-200/60">
              <p className="text-xs text-slate-500 font-medium mb-1.5">Giá bán lẻ đề xuất:</p>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-blue-600">
                  {finalPrice.toLocaleString("vi-VN")} đ
                </span>
                {hasDiscount && (
                  <span className="text-sm text-slate-400 line-through">
                    {activeProduct.original_price.toLocaleString("vi-VN")} đ
                  </span>
                )}
                {hasDiscount && (
                  <span className="rounded-md bg-amber-150 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                    Tiết kiệm {activeProduct.discount_percent}% vãng lai
                  </span>
                )}
              </div>
            </div>

            {/* Description details */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 border-l-4 border-blue-600 pl-2">Mô Tả Sản Phẩm</h3>
              <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-line">
                {activeProduct.description || "Chưa có văn bản mô tả cụ thể."}
              </p>
            </div>

            {/* Delivery banner and guarantees */}
            <div className="grid gap-3 grid-cols-2 text-xs p-3.5 rounded-xl border border-dashed border-slate-200">
              <div>
                <span className="block font-bold text-slate-800">📦 ĐÓNG GÓI CHUẨN</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">Hộp kín vô trùng bảo vệ</span>
              </div>
              <div>
                <span className="block font-bold text-slate-800">🚚 GIAO TẬN NƠI</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">Đặt hàng nhận thuốc hoả tốc</span>
              </div>
            </div>

            {/* Controls Add to cart */}
            <div className="flex gap-4">
              <button
                id="details-add-to-cart-btn"
                onClick={(e) => addToCart(activeProduct, e)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/15 transition-all hover:bg-blue-700 hover:-translate-y-0.5 cursor-pointer"
              >
                <ShoppingCart className="h-5 w-5" /> Thêm Vào Giỏ Hàng
              </button>
            </div>
          </div>
        </div>

        {/* Video presentation integration if link is added */}
        {activeProduct.video_url && (
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Video clip giới thiệu & Hướng dẫn sử dụng</h3>
            <div className="aspect-video max-w-3xl w-full mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 flex items-center justify-center">
              {activeProduct.video_url.includes("youtube.com") || activeProduct.video_url.includes("youtu.be") ? (
                <iframe
                  title="Giới thiệu sản phẩm"
                  src={`https://www.youtube.com/embed/${
                    activeProduct.video_url.split("v=")[1]?.split("&")[0] || 
                    activeProduct.video_url.split("youtu.be/")[1]?.split("?")[0]
                  }`}
                  className="h-full w-full border-0"
                  allowFullScreen
                />
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 max-w-md">
                  <PlayIcon className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                  <p>Hệ thống hỗ trợ phát video từ nền tảng <strong>YouTube</strong>.</p>
                  <p className="mt-1 font-mono text-[10px] text-blue-600 select-all underline">{activeProduct.video_url}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCartView = () => {
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
      <div className="space-y-6 sm:space-y-8 animate-fade-in" id="cart-view-container">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Giỏ Hàng Của Bạn</h1>
          <p className="text-xs text-slate-550">Xem lại các sản phẩm y tế của bạn và tiến hành đặt đơn lấy hàng</p>
        </div>

        {/* Success Modal order completed details */}
        {orderSuccessDetails && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 text-emerald-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold">ĐẶT HÀNG THÀNH CÔNG!</h2>
                <p className="text-[11px] opacity-90">Hệ thống đã gửi thông báo tự động tới người bán.</p>
              </div>
            </div>

            <div className="h-px bg-emerald-200" />

            <div className="bg-white rounded-2xl border border-emerald-150 p-4 sm:p-5 text-slate-800 space-y-3.5 text-xs">
              <div className="space-y-1">
                <p>Mã đơn hàng: <strong className="font-mono text-blue-600">{orderSuccessDetails.order?.id}</strong></p>
                <p>Khách hàng: <strong>{orderSuccessDetails.order?.customer_name}</strong> - {orderSuccessDetails.order?.customer_phone}</p>
                <p>Địa chỉ thanh toán: <strong>{orderSuccessDetails.order?.customer_address}</strong></p>
              </div>

              {/* Items Summary list */}
              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <p className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">Sản phẩm đã mua</p>
                {orderSuccessDetails.items?.map((it: any) => (
                  <div key={it.id} className="flex justify-between items-center text-[11px]">
                    <span>{it.product_name} <span className="text-slate-400">x{it.quantity}</span></span>
                    <span className="font-semibold text-slate-900">{(it.quantity * it.unit_price).toLocaleString("vi-VN")} đ</span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-sm font-extrabold border-t border-slate-100 pt-2 text-blue-600">
                  <span>Tổng tiền thanh toán</span>
                  <span>{orderSuccessDetails.order?.total_amount.toLocaleString("vi-VN")} đ</span>
                </div>
              </div>

              {/* Status integration logs */}
              <div className="rounded-lg bg-slate-900 p-3.5 font-mono text-[11px] text-slate-200 space-y-1.5">
                <h4 className="font-bold text-amber-400 border-b border-slate-800 pb-1 text-[10px] flex items-center gap-1">
                  <Database className="h-3 w-3" /> TRẠNG THÁI GIAO DỊCH CHỨC NĂNG
                </h4>
                <p className="text-slate-400">1. Lưu Database: {config.supabaseConnected ? "✅ Ghi nhận thực tế ở Supabase PostgreSQL" : "💾 Đã ghi vào local fallback memory database"}</p>
                <p className="text-slate-400">2. Gửi Email thông báo:
                  <span className={orderSuccessDetails.emailSent ? "text-emerald-400 font-bold ml-1" : "text-amber-400 font-bold ml-1"}>
                    {orderSuccessDetails.emailSent ? "✅ Resend Live Sent!" : "⚠️ Demo Simulated Login"}
                  </span>
                </p>
                <p className="text-[10px] text-emerald-400 flex items-start gap-1">Trình mô tả: <span>{orderSuccessDetails.emailLog}</span></p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                id="success-close-btn"
                onClick={() => setOrderSuccessDetails(null)}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
              >
                Tiếp tục mua hàng
              </button>
            </div>
          </div>
        )}

        {/* Cart Listing layout */}
        {cart.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
            <ShoppingCart className="mx-auto h-12 w-12 text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-800">Giỏ hàng của bạn đang trống</p>
            <p className="text-xs text-slate-500 mt-1">Lựa chọn các sản phẩm vật tư y khoa bên ngoài trang cửa hàng để thêm vào</p>
            <button
              onClick={() => navigateTo("#/")}
              className="mt-5 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold px-6 py-2.5 text-xs text-white shadow shadow-blue-200 transition"
            >
              Xem ngay sản phẩm
            </button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* Left Items Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100 shadow-sm">
                {cart.map((item) => (
                  <div key={item.product_id} className="p-4 sm:p-5 flex gap-4 items-center" id={`cart-product-row-${item.product_id}`}>
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-14 w-14 object-cover rounded-xl border border-slate-200 bg-slate-100"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 leading-tight truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs font-black text-blue-600 mt-1">
                        {item.price.toLocaleString("vi-VN")} đ
                      </p>
                    </div>

                    {/* Quantity Selector buttons */}
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                      <button
                        onClick={() => updateCartQuantity(item.product_id, -1)}
                        className="rounded bg-white p-1 text-slate-500 hover:bg-slate-100"
                        title="Giảm 1"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-slate-800 shrink-0 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product_id, 1)}
                        className="rounded bg-white p-1 text-slate-500 hover:bg-slate-100"
                        title="Tăng 1"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Delete item button */}
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                      title="Xoá khỏi giỏ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total Summary calculations box */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3.5 shadow-sm">
                <div className="flex justify-between items-center text-xs text-slate-550 border-b border-slate-100 pb-3 font-medium">
                  <span>Giá gốc chưa cộng</span>
                  <span>{totalAmount.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between items-center text-sm font-black text-slate-900 pt-1">
                  <span>Số tiền thực tế thanh toán</span>
                  <span className="text-lg text-blue-600">{totalAmount.toLocaleString("vi-VN")} đ</span>
                </div>
              </div>
            </div>

            {/* Right Information Form Column */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-slate-50/40 p-5 space-y-4 shadow-sm">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  Thông Tin Giao Hàng & Đặt Đơn
                </h3>
                <p className="text-[11px] text-slate-550">Cổng thanh toán COD: Nhận hàng kiểm tra và thanh toán trực tiếp</p>
              </div>

              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Họ tên người nhận *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-4 w-4 text-slate-400" />
                    </span>
                    <input
                      id="checkout-name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Số điện thoại liên hệ *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </span>
                    <input
                      id="checkout-phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="VD: 0987654321, 09xx"
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Địa chỉ giao hàng nhận hàng *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-start pl-3 pt-2.5">
                      <MapPin className="h-4 w-4 text-slate-400" />
                    </span>
                    <textarea
                      id="checkout-address"
                      rows={2}
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh thành..."
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ghi chú cho shipper/nhà bán hàng</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-start pl-3 pt-2.5">
                      <AlignLeft className="h-4 w-4 text-slate-400" />
                    </span>
                    <textarea
                      id="checkout-notes"
                      rows={2}
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="Giao buổi chiều, Gọi trước 15 phút..."
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Confirm orders validation trigger button */}
                <button
                  id="checkout-submit-btn"
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  disabled={checkoutSubmitting}
                >
                  {checkoutSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-white" />
                      Đang kết nối hệ thống dơn hàng...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Xác Nhận Đặt Hàng (Xử Lý Resend Email)
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAdminLoginView = () => {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in" id="admin-login-pane">
        <div className="text-center space-y-1.5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Kênh Đăng Nhập Người Bán (Admin)</h2>
          <p className="text-xs text-slate-500">Nhập thông tin quản trị cửa hàng y tế để tiếp quản sản phẩm</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email truy nhập cán bộ quản lý</label>
            <input
              id="admin-email-field"
              type="text"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@yourseller.com"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Mật khẩu định danh quản trị viên</label>
            <input
              id="admin-password-field"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          {loginError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            id="admin-login-submit"
            type="submit"
            disabled={loginSubmitting}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 cursor-pointer disabled:opacity-50"
          >
            {loginSubmitting ? "Đang xác nhận mật mã..." : "Xác Nhận Đăng Nhập"}
          </button>
        </form>

        <div className="h-px bg-slate-100" />

        {/* Demo Fast Autofill Helper for Admin Testing */}
        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-150 text-xs space-y-2">
          <p className="font-bold text-slate-700 flex items-center gap-1 text-[11px]">
            💡 HƯỚNG DẪN ĐĂNG NHẬP NHANH (PREVIEW MODE)
          </p>
          <p className="text-slate-500 text-[10px]">Bạn hãy bấm nút bên dưới để tự động điền mật khẩu demo để vào trải nghiệm Admin nhanh:</p>
          <div className="pt-1 flex gap-2">
            <button
              id="autofill-admin-btn"
              type="button"
              onClick={() => {
                setAdminEmail(config.sellerEmail);
                setAdminPassword("admin123");
              }}
              className="rounded bg-blue-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-blue-700"
            >
              Điền Tài Khoản Mail Admin
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAdminDashboardView = () => {
    // Calculators
    const salesTotal = orders.reduce((sum, ord) => {
      if (ord.status !== "cancelled") return sum + Number(ord.total_amount);
      return sum;
    }, 0);

    return (
      <div className="space-y-6 sm:space-y-8 animate-fade-in" id="admin-dashboard-root">
        {/* Top greeting with configuration options */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Tổng Quan Gian Hàng (Admin)</h2>
            <p className="text-xs text-slate-500">Theo dõi doanh số đơn hàng và kiểm soát kho sản phẩm</p>
          </div>

          <div className="flex bg-slate-100 p-0.5 rounded-lg border">
            <button
              id="tab-btn-products"
              onClick={() => setAdminActiveTab("products")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
                adminActiveTab === "products"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Biên Tập Sản Phẩm
            </button>
            <button
              id="tab-btn-orders"
              onClick={() => {
                setAdminActiveTab("orders");
                fetchOrders();
              }}
              className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
                adminActiveTab === "orders"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Bản Ghi Đơn Hàng ({orders.length})
            </button>
            <button
              id="tab-btn-settings"
              onClick={() => setAdminActiveTab("settings")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1 ${
                adminActiveTab === "settings"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ⚙️ Cài Đặt Gian Hàng
            </button>
          </div>
        </div>

        {/* Dashboard Numerical metrics widgets */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-medium text-slate-400">Doanh số thực tế (Trừ Đơn Huỷ)</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {salesTotal.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <div className="mt-1.5 text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span>● Doanh thu trực tiếp COD</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-medium text-slate-400">Tổng sản phẩm y dược</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {products.length}
              </span>
            </div>
            <div className="mt-1.5 text-[10px] text-slate-500">
              Quy chuẩn danh mục thiết bị, thuốc
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-medium text-slate-400">Giao dịch đã xác nhận</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {orders.length}
              </span>
            </div>
            <div className="mt-1.5 text-[10px] text-slate-500">
              Cơ sở dữ liệu orders / order_items
            </div>
          </div>
        </div>

        {/* Content selector */}
        {adminActiveTab === "products" && (
          <AdminProductManager
            products={products}
            onSaveProduct={saveProductByAdmin}
            onDeleteProduct={deleteProductByAdmin}
            categories={finalCategoriesList}
          />
        )}
        {adminActiveTab === "orders" && (
          <AdminOrderList
            orders={orders}
          />
        )}
        {adminActiveTab === "settings" && (
          <AdminStoreSettings
            settings={storeSettings}
            onSaveSettings={saveStoreSettings}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased">
      {/* Header bar tracking configuration and path */}
      <Header
        currentRoute={route}
        setRoute={navigateTo}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        supabaseConnected={config.supabaseConnected}
        resendConnected={config.resendConnected}
        storeSettings={storeSettings}
      />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {route === "#/" && renderHomeView()}
        {route.startsWith("#/product/") && renderProductDetailsView()}
        {route === "#/cart" && renderCartView()}
        {route === "#/admin/login" && renderAdminLoginView()}
        {route === "#/admin/dashboard" && renderAdminDashboardView()}
      </main>

      {/* Modern Compact Site Footer with Public Legal Disclosures and Channels */}
      <footer className="border-t border-slate-200 bg-white pt-10 pb-8 mt-12 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
          {/* Main Footer grid */}
          <div className="grid gap-8 sm:grid-cols-3 border-b border-slate-105 pb-8 bg-white">
            {/* Brand Intro Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {storeSettings?.logo_url ? (
                  <img 
                    src={storeSettings.logo_url} 
                    alt={storeSettings?.store_name} 
                    className="h-8 w-auto max-w-[120px] object-contain rounded"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <h1 className="text-sm font-black tracking-wider text-slate-800 uppercase">{storeSettings?.store_name || "MEDSTORE"}</h1>
                )}
              </div>
              <p className="text-slate-400 leading-relaxed font-medium">
                {storeSettings?.store_slogan || "Hệ thống bán lẻ vật tư y khoa & dược phẩm chính hãng bảo vệ sức khỏe gia đình."}
              </p>
              <p className="text-[10px] text-slate-400">
                Tất cả sản phẩm bầy bán đều được chuẩn hóa và thẩm định nghiêm ngặt theo quy định hiện hành của Bộ Y Tế Việt Nam.
              </p>
            </div>

            {/* Seller Contact & Legal Disclosures Column */}
            <div className="space-y-2 text-slate-500 leading-normal">
              <h4 className="text-slate-800 font-bold border-b pb-1 border-slate-100 uppercase tracking-wider text-[10px]">Thông tin người bán công khai</h4>
              <p className="leading-relaxed">
                <strong className="text-slate-755">Đơn vị:</strong> {storeSettings?.corporate_name || "Công ty Cổ phần Đầu tư Y tế MedStore Việt Nam"}
              </p>
              <p>
                <strong className="text-slate-755">Mã số thuế:</strong> {storeSettings?.tax_code || "0109876543"}
              </p>
              <p className="leading-relaxed">
                <strong className="text-slate-755">Địa chỉ:</strong> {storeSettings?.business_address || "Số 45, Đường Giải Phóng, Phường Phương Mai, Quận Đống Đa, Hà Nội"}
              </p>
              <p>
                <strong className="text-slate-755">Hotline:</strong> {storeSettings?.hotline || "1900 6000"} {storeSettings?.email && <> | <strong className="text-slate-755">Email:</strong> {storeSettings.email}</>}
              </p>
            </div>

            {/* Digital Channels Links Column */}
            <div className="space-y-3">
              <h4 className="text-slate-800 font-bold border-b pb-1 border-slate-100 uppercase tracking-wider text-[10px]">Kênh Bán Hàng Liên Kết</h4>
              <p className="text-slate-400">Ghé thăm các gian hàng chính hãng khác của chúng tôi trên các sàn giao dịch:</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {storeSettings?.shopee_url && (
                  <a 
                    href={storeSettings.shopee_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 px-3 py-1.5 font-bold transition text-[10px]"
                  >
                    <span>🧡</span> Shopee Mall
                  </a>
                )}
                {storeSettings?.tiktok_url && (
                  <a 
                    href={storeSettings.tiktok_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 font-bold transition text-[10px]"
                  >
                    <span>🖤</span> TikTok Shop
                  </a>
                )}
                {storeSettings?.facebook_url && (
                  <a 
                    href={storeSettings.facebook_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 hover:bg-blue-105 text-blue-600 px-3 py-1.5 font-bold transition text-[10px]"
                  >
                    <span>💙</span> Facebook
                  </a>
                )}
                {storeSettings?.zalo_url && (
                  <a 
                    href={storeSettings.zalo_url.startsWith("http") ? storeSettings.zalo_url : `https://zalo.me/${storeSettings.zalo_url}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-600 px-3 py-1.5 font-bold transition text-[10px]"
                  >
                    <span>💬</span> Zalo Chat
                  </a>
                )}
                {!storeSettings?.shopee_url && !storeSettings?.tiktok_url && !storeSettings?.facebook_url && !storeSettings?.zalo_url && (
                  <span className="text-[10px] text-slate-400 italic">Chưa liên kết kênh ngoài khác.</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-400">
            <div>
              &copy; 2026 <strong className="text-slate-600 uppercase">{storeSettings?.store_name || "MEDSTORE"}</strong>. Bảo lưu mọi quyền đối với nhãn hiệu.
            </div>
            <div className="flex gap-4">
              <span className="hover:text-blue-600 cursor-pointer transition">Chính sách bảo mật thông tin</span>
              <span>&bull;</span>
              <span className="hover:text-blue-600 cursor-pointer transition">Điều khoản sử dụng dịch vụ</span>
              <span>&bull;</span>
              <span className="hover:text-blue-600 cursor-pointer transition">Quy chuẩn bồi thường giao dịch</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Visual utilities helper
function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
