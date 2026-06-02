import React from 'react';
import { StoreSettings } from '../types';
import { Phone, Mail, MapPin, Building, FileText, ExternalLink, HelpCircle } from 'lucide-react';

interface FooterProps {
  settings: StoreSettings;
}

export default function Footer({ settings }: FooterProps) {
  // Safe helper to confirm a link is valid and starts with http or is valid Zalo redirect
  const getCleanUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const hasSocials = !!(settings.shopee_url || settings.tiktok_url || settings.facebook_url || settings.zalo_url);

  return (
    <footer id="app-footer" className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Column 1: Store Intro & Branding */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                id="footer-logo"
                src={settings.logo_url || 'https://images.unsplash.com/photo-1631217818202-90ef7a0c3d93?auto=format&fit=crop&q=80&w=200'}
                alt={settings.store_name}
                className="h-10 w-10 rounded-full object-cover border border-slate-800"
                referrerPolicy="no-referrer"
              />
              <span id="footer-store-name" className="text-xl font-extrabold text-white tracking-wide">
                {settings.store_name}
              </span>
            </div>
            <p id="footer-slogan" className="text-sm text-slate-400 italic">
              "{settings.slogan}"
            </p>
            {hasSocials && (
              <div className="pt-2">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                  Liên kết đa kênh:
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {settings.shopee_url && (
                    <a
                      id="link-shopee"
                      href={getCleanUrl(settings.shopee_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-orange-600/10 text-orange-400 hover:bg-orange-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1"
                    >
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                      <span>Shopee</span>
                    </a>
                  )}
                  {settings.tiktok_url && (
                    <a
                      id="link-tiktok"
                      href={getCleanUrl(settings.tiktok_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-850 text-white hover:bg-white hover:text-black px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 border border-slate-700"
                    >
                      <span className="font-mono text-[9px] bg-red-500 text-white px-0.5 rounded-xs">T</span>
                      <span>TikTok Shop</span>
                    </a>
                  )}
                  {settings.facebook_url && (
                    <a
                      id="link-facebook"
                      href={getCleanUrl(settings.facebook_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1"
                    >
                      <span>Facebook</span>
                    </a>
                  )}
                  {settings.zalo_url && (
                    <a
                      id="link-zalo"
                      href={getCleanUrl(settings.zalo_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-sky-600/10 text-sky-400 hover:bg-sky-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1"
                    >
                      <span>Zalo OA</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Legal Information & Corporate Registration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-sky-500" />
              <span>Thông Tin Doanh Nghiệp</span>
            </h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div id="footer-business-name" className="flex items-start space-x-2.5">
                <Building className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <span><strong className="text-slate-400">Đơn vị:</strong> {settings.business_name || 'Đang cập nhật...'}</span>
              </div>
              <div id="footer-tax-code" className="flex items-center space-x-2.5">
                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                <span><strong className="text-slate-400">Mã số thuế:</strong> {settings.tax_code || 'Chưa cung cấp'}</span>
              </div>
              <div id="footer-tax-address" className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <span><strong className="text-slate-400">Địa chỉ:</strong> {settings.tax_address || 'Chưa cập nhật'}</span>
              </div>
            </div>
          </div>

          {/* Column 3: Contacts & Customer Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-sky-500" />
              <span>Chăm Sóc Khách Hàng</span>
            </h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div id="footer-phone" className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong className="text-slate-400">Hotline:</strong> <a href={`tel:${settings.phone}`} className="hover:text-emerald-400 font-semibold transition-colors">{settings.phone || 'Chưa có'}</a></span>
              </div>
              <div id="footer-email" className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-pink-500 shrink-0" />
                <span><strong className="text-slate-400">Email xử lý:</strong> <a href={`mailto:${settings.email}`} className="hover:text-pink-400 transition-colors">{settings.email || 'Chưa có'}</a></span>
              </div>
              <div className="pt-1.5 border-t border-slate-800 text-xs text-slate-500">
                <span>Vận hành & Hỗ trợ bọc kỹ thuật 24/7. Hóa đơn đỏ VAT xuất theo quy định hiện hành.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Divider / Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p id="footer-copyright">
            © {new Date().getFullYear()} {settings.store_name}. Bảo lưu mọi quyền đối với nội dung và hình ảnh sản phẩm.
          </p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Powered by Supabase SQL & Resend.com system</span>
            <ExternalLink className="w-3 h-3" />
          </p>
        </div>
      </div>
    </footer>
  );
}
