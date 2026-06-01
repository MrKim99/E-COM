import { ShoppingCart, LayoutDashboard, Store, Mail, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { StoreSettings } from "../types";

interface HeaderProps {
  currentRoute: string;
  setRoute: (route: string) => void;
  cartCount: number;
  supabaseConnected: boolean;
  resendConnected: boolean;
  storeSettings?: StoreSettings;
}

export default function Header({
  currentRoute,
  setRoute,
  cartCount,
  supabaseConnected,
  resendConnected,
  storeSettings,
}: HeaderProps) {

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    setIsAdmin(!!token);
  }, [currentRoute]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setIsAdmin(false);
    setRoute("#/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md">
      {/* Configuration Status Ribbon */}
      <div className="flex flex-wrap items-center justify-between bg-slate-900 px-4 py-1.5 text-xs text-slate-200 sm:px-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span className="font-medium">Chế độ xem trước:</span>
          {supabaseConnected ? (
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
              ● Supabase Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
              ⚠️ Local Mode (Supabase chưa cấu hình)
            </span>
          )}
          <span className="text-slate-500">|</span>
          {resendConnected ? (
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
              ● Resend Email Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
              ⚠️ Email Demo (Resend chưa cấu hình)
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-400">
          Dành cho nhà thuốc, bệnh viện và phòng khám tư nhân
        </div>
      </div>

      {/* Main navigation header */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div 
          onClick={() => setRoute("#/")} 
          className="flex cursor-pointer items-center gap-2.5 text-slate-900 transition hover:opacity-90"
          id="header-brand-logo"
        >
          {storeSettings?.logo_url ? (
            <img 
              src={storeSettings.logo_url} 
              alt={storeSettings?.store_name || "MEDSTORE"} 
              className="h-9 w-auto max-w-[120px] object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white shadow-md">
              <Store className="h-5 w-5" />
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 uppercase">
              {storeSettings?.store_name || "MEDSTORE"}
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold leading-none">
              {storeSettings?.store_slogan || "Chất lượng là ưu tiên số 1"}
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-2 sm:gap-4">
          <button
            id="nav-btn-home"
            onClick={() => setRoute("#/")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              currentRoute === "#/" || currentRoute.startsWith("#/product/")
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Sản Phẩm
          </button>

          {isAdmin ? (
            <>
              <button
                id="nav-btn-admin-dash"
                onClick={() => setRoute("#/admin/dashboard")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  currentRoute === "#/admin/dashboard"
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Quản Trị</span>
              </button>
              <button
                id="nav-btn-logout"
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Đăng Xuất
              </button>
            </>
          ) : (
            <button
              id="nav-btn-admin-login"
              onClick={() => setRoute("#/admin/login")}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                currentRoute === "#/admin/login"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Kênh Người Bán
            </button>
          )}

          <div className="h-6 w-px bg-slate-200" />

          {/* Cart Icon trigger */}
          <button
            id="nav-btn-cart"
            onClick={() => setRoute("#/cart")}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
              currentRoute === "#/cart"
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
