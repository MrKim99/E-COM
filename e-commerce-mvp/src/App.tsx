import React from 'react';
import { ShoppingBag, ChevronRight, Store, Shield, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductFilter from './components/ProductFilter';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartSidebar from './components/CartSidebar';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { Category, Product, StoreSettings, Order } from './types';

export default function App() {
  // Navigation: 'shop' | 'admin-panel'
  const [currentRoute, setCurrentRoute] = React.useState<string>('shop');

  // Business / Store states dynamically fetched from DB/server
  const [settings, setSettings] = React.useState<StoreSettings>({
    logo_url: "https://images.unsplash.com/photo-1631217818202-90ef7a0c3d93?auto=format&fit=crop&q=80&w=200",
    store_name: "MediShop MVP",
    slogan: "Thiết Bị Y Tế & Dược Phẩm Chính Hãng",
    business_name: "Công ty Cổ phần Công nghệ Y tế MediShop Việt Nam",
    tax_code: "0109876543",
    tax_address: "123 Đường Giải Phóng, Quận Hai Bà Trưng, Hà Nội",
    phone: "0987654321",
    email: "support@medishop.com",
    shopee_url: "https://shopee.vn",
    tiktok_url: "https://tiktok.com",
    facebook_url: "https://facebook.com/medishop",
    zalo_url: "https://zalo.me/0987654321"
  });

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Cart Local state
  const [cartItems, setCartItems] = React.useState<{ id: string; product: Product; quantity: number }[]>([]);
  const [showCart, setShowCart] = React.useState(false);

  // Filter states
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<string>('popular');

  // Product detail specs state overlay
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);

  // Admin authentication states
  const [adminToken, setAdminToken] = React.useState<string | null>(null);

  // Setup / Load initial datasets
  const loadStoreData = async () => {
    setIsLoading(true);
    try {
      // 1. Load Settings
      const settingsRes = await fetch('/api/store-settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }

      // 2. Load Categories
      const categoriesRes = await fetch('/api/categories');
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      // 3. Load Products
      const productsRes = await fetch('/api/products');
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }
    } catch (e) {
      console.error("Error loaded store dataset: ", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Check existing login tokens on load
  const loadAdminData = async (token: string) => {
    try {
      const checkRes = await fetch('/api/admin/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (checkRes.ok) {
        setAdminToken(token);
        // Load admin specific orders list
        const ordersRes = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }
      } else {
        // Token expired/invalid
        localStorage.removeItem('admin_token');
        setAdminToken(null);
      }
    } catch (e) {
      console.warn("Failed checking admin auth status on startup - continuing to local simulation mode");
    }
  };

  React.useEffect(() => {
    loadStoreData();

    // Check localStorage credentials
    const storedToken = localStorage.getItem('admin_token');
    if (storedToken) {
      loadAdminData(storedToken);
    }

    // Load checkout items from localStorage if exists
    const storedCart = localStorage.getItem('medi_cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {}
    }

    // Listen to route changes via simple hashtag routing to prevent full-page locks
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin-dashboard') {
        setCurrentRoute('admin-panel');
      } else {
        setCurrentRoute('shop');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Trigger initial hash state check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Save cart back on updates
  const handleUpdateCartItems = (newItems: typeof cartItems) => {
    setCartItems(newItems);
    localStorage.setItem('medi_cart', JSON.stringify(newItems));
  };

  // Refresh entire system data on trigger (e.g. products changed, orders updated)
  const handleRefreshEverything = async () => {
    await loadStoreData();
    const activeToken = adminToken || localStorage.getItem('admin_token');
    if (activeToken) {
      await loadAdminData(activeToken);
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    const existing = cartItems.find((item) => item.product.id === product.id);
    if (existing) {
      handleUpdateCartItems(
        cartItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      handleUpdateCartItems([...cartItems, { id: product.id, product, quantity: 1 }]);
    }

    // Show cart preview naturally
    setShowCart(true);
  };

  const handleUpdateQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    handleUpdateCartItems(
      cartItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    handleUpdateCartItems(cartItems.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    handleUpdateCartItems([]);
  };

  // Auth Operations
  const handleLoginSuccess = async (token: string) => {
    setAdminToken(token);
    window.location.hash = '#admin-dashboard';
    setCurrentRoute('admin-panel');
    await loadAdminData(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setAdminToken(null);
    window.location.hash = '';
    setCurrentRoute('shop');
  };

  // Filtering Products computed logic
  const filteredProducts = React.useMemo(() => {
    let result = [...products];

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) => 
          p.name.toLowerCase().includes(q) || 
          p.description_short.toLowerCase().includes(q) ||
          p.description_detail.toLowerCase().includes(q)
      );
    }

    // Category filter match 
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((p) => p.category_id === selectedCategory);
    }

    // Sorting implementation
    if (sortBy === 'popular') {
      // Featured or newest products (for simple mockup we prioritize is_featured)
      result.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        // fallback newest id
        return b.id.localeCompare(a.id);
      });
    } else if (sortBy === 'discount') {
      result = result.filter(p => p.discount_percent > 0);
      result.sort((a, b) => b.discount_percent - a.discount_percent);
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price_after_discount - b.price_after_discount);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price_after_discount - a.price_after_discount);
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Navbar segment */}
      <Navbar
        settings={settings}
        cartCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
        onOpenCart={() => setShowCart(true)}
        onNavigate={(route) => {
          if (route === 'admin-panel') {
            if (adminToken) {
              window.location.hash = '#admin-dashboard';
              setCurrentRoute('admin-panel');
            } else {
              window.location.hash = '#admin-login';
              setCurrentRoute('admin-login'); // Will trigger login page view
            }
          } else {
            window.location.hash = '';
            setCurrentRoute('shop');
          }
        }}
        currentRoute={currentRoute}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <svg className="animate-spin h-10 w-10 text-sky-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-slate-500 font-bold text-sm">Đang nạp dữ liệu cửa hàng y tế...</span>
          </div>
        ) : (
          /* Route dispatcher Router block */
          <>
            {currentRoute === 'shop' && (
              <div className="space-y-10 animate-fadeIn">
                
                {/* Visual Banner Hero Accent */}
                <div id="hero-banner" className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-sky-600 to-indigo-700 text-white p-8 md:p-12 flex flex-col justify-center min-h-[250px] shadow-lg">
                  <div className="absolute inset-0 bg-cover bg-center brightness-35 mix-blend-multiply opacity-30" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200')` }}></div>
                  <div className="relative z-10 max-w-xl space-y-4.5">
                    <span className="bg-sky-500/30 text-sky-200 border-2 border-sky-400/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest inline-block animate-pulse">
                      🏥 MediShop E-commerce MVP
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                      Sức Khỏe Của Bạn,<br />Sứ Mệnh Của Chúng Tôi
                    </h1>
                    <p className="text-xs md:text-sm text-sky-100 font-medium">
                      Cung cấp trang thiết bị y khoa, vật tư sơ cứu vô trùng và thuốc hỗ trợ chất lượng chuẩn quốc tế, xuất xứ minh bạch nhất.
                    </p>
                    <div className="pt-2">
                      <a
                        href="#filter-wrapper"
                        className="bg-white text-sky-900 border-2 border-white hover:bg-transparent hover:text-white font-extrabold text-xs px-5 py-3 rounded-full uppercase tracking-wider inline-flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                      >
                        <span>Mua sắm ngay</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* 3a. Search & Advanced Filtering element */}
                <ProductFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  resultsCount={filteredProducts.length}
                />

                {/* 3c. Products Listing Grid */}
                {filteredProducts.length === 0 ? (
                  <div id="products-empty" className="bg-white border rounded-3xl p-16 text-center text-slate-400 space-y-3 shadow-2xs">
                    <ShoppingBag className="w-14 h-14 mx-auto stroke-1 text-slate-300" />
                    <p className="text-sm font-semibold">Không tìm thấy sản phẩm y khoa khớp với bộ lọc hiện tại</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setSortBy('popular');
                      }}
                      className="bg-sky-600 text-white font-bold text-xs py-2 px-4 rounded-xl"
                    >
                      Bỏ lọc quay lại
                    </button>
                  </div>
                ) : (
                  <div id="products-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        categories={categories}
                        onAddToCart={(p, e) => handleAddToCart(p, e)}
                        onOpenDetails={setSelectedProduct}
                      />
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* Seller Account Authentication screens */}
            {currentRoute === 'admin-login' && (
              <AdminLogin
                onLoginSuccess={handleLoginSuccess}
                onBackToShop={() => {
                  window.location.hash = '';
                  setCurrentRoute('shop');
                }}
              />
            )}

            {/* Store Administration dashboards */}
            {currentRoute === 'admin-panel' && adminToken && (
              <AdminDashboard
                categories={categories}
                products={products}
                settings={settings}
                orders={orders}
                adminToken={adminToken}
                onLogout={handleLogout}
                onRefreshData={handleRefreshEverything}
              />
            )}
          </>
        )}

      </main>

      {/* Footer segment */}
      <Footer settings={settings} />

      {/* Overlays / Slide Panels / Dialog boxes */}
      <CartSidebar
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      <ProductDetailModal
        product={selectedProduct}
        categories={categories}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

    </div>
  );
}
