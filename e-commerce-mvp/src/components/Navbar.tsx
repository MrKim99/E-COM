import React from 'react';
import { ShoppingBag, Shield, Store, Menu, X } from 'lucide-react';
import { StoreSettings } from '../types';

interface NavbarProps {
  settings: StoreSettings;
  cartCount: number;
  onOpenCart: () => void;
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export default function Navbar({
  settings,
  cartCount,
  onOpenCart,
  onNavigate,
  currentRoute
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <nav id="app-navbar" className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Store Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('shop')}>
            <img
              id="navbar-logo"
              src={settings.logo_url || 'https://images.unsplash.com/photo-1631217818202-90ef7a0c3d93?auto=format&fit=crop&q=80&w=200'}
              alt={settings.store_name}
              className="h-10 w-10 rounded-full object-cover border border-sky-100 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <span id="navbar-store-name" className="block text-lg font-bold text-slate-900 tracking-tight leading-tight">
                {settings.store_name}
              </span>
              <span id="navbar-slogan" className="block text-xs font-medium text-sky-600 line-clamp-1">
                {settings.slogan}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              id="btn-nav-shop"
              onClick={() => onNavigate('shop')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentRoute === 'shop'
                  ? 'bg-sky-50 text-sky-700'
                  : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Cửa hàng</span>
            </button>

            <button
              id="btn-nav-admin"
              onClick={() => onNavigate('admin-panel')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentRoute.startsWith('admin')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Quản trị viên</span>
            </button>

            {/* Shopping Cart Trigger */}
            <button
              id="btn-nav-cart"
              onClick={onOpenCart}
              className="relative flex items-center justify-center p-2 rounded-full text-slate-700 hover:text-sky-600 hover:bg-sky-55/10 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-5.5 h-5.5" />
              {cartCount > 0 && (
                <span id="cart-item-badge" className="absolute -top-1 -right-1 bg-red-550 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              id="btn-mobile-cart-trigger"
              onClick={onOpenCart}
              className="relative p-2 text-slate-700 hover:text-sky-600 rounded-full"
            >
              <ShoppingBag className="w-5.5 h-5.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-550 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[17px] text-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-slate-700 focus:outline-none"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {menuOpen && (
        <div id="mobile-menu-drawer" className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-4 space-y-2 animate-fadeIn">
          <button
            id="btn-mobile-nav-shop"
            onClick={() => {
              onNavigate('shop');
              setMenuOpen(false);
            }}
            className="w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Store className="w-5 h-5 text-sky-600" />
            <span>Cửa hàng</span>
          </button>
          <button
            id="btn-mobile-nav-admin"
            onClick={() => {
              onNavigate('admin-panel');
              setMenuOpen(false);
            }}
            className="w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Shield className="w-5 h-5 text-indigo-600" />
            <span>Khu vực Quản lý</span>
          </button>
        </div>
      )}
    </nav>
  );
}
