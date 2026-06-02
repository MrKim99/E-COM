import React from 'react';
import { Shield, Eye, EyeOff, Loader2, KeyRound, Mail, AlertCircle, Store } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
  onBackToShop: () => void;
}

export default function AdminLogin({ onLoginSuccess, onBackToShop }: AdminLoginProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errMessage, setErrMessage] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const resData = await response.json();
      if (response.ok) {
        localStorage.setItem('admin_token', resData.token);
        onLoginSuccess(resData.token);
      } else {
        setErrMessage(resData.error || 'Email hoặc mật khẩu không chính xác!');
      }
    } catch (err: any) {
      setErrMessage('Không thể kết nối máy chủ quản trị. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login-screen-wrap" className="max-w-md w-full mx-auto bg-white border border-slate-100 rounded-3xl p-8 shadow-xl mt-12 space-y-6 animate-scaleUp">
      
      {/* Branding layout */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3.5 bg-indigo-55/10 text-indigo-600 rounded-2xl border border-indigo-100 shadow-sm">
          <Shield className="w-8 h-8" />
        </div>
        <h2 id="login-heading" className="text-2xl font-black text-slate-900 tracking-tight">Khu Vực Quản Trị Viên</h2>
        <p id="login-description" className="text-xs text-slate-400">Đăng nhập bằng thông tin quản trị viên duy nhất được thiết lập qua hệ thống bảo mật (.env)</p>
      </div>

      {errMessage && (
        <div id="login-error-card" className="p-3.5 bg-red-50 border border-red-150 text-red-700 text-xs rounded-xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <span>{errMessage}</span>
        </div>
      )}

      {/* Form Credentials */}
      <form id="admin-login-form" onSubmit={handleSubmit} className="space-y-4">
        
        {/* Input Email */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>Email Đăng Nhập</span>
          </label>
          <input
            id="login-email-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@ecommerce-mvp.com"
            className="w-full text-xs bg-slate-50 border border-slate-150 focus:border-indigo-500 focus:bg-white rounded-xl p-3 outline-none transition-colors placeholder-slate-400 font-medium"
          />
        </div>

        {/* Input Password */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
            <KeyRound className="w-3.5 h-3.5 text-slate-400" />
            <span>Mật Khẩu Quản Trị</span>
          </label>
          <div className="relative">
            <input
              id="login-password-input"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full text-xs bg-slate-50 border border-slate-150 focus:border-indigo-500 focus:bg-white rounded-xl pl-3 pr-10 p-3 outline-none transition-colors"
            />
            <button
              id="btn-toggle-password"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-655"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* CTA logic */}
        <div className="pt-2 space-y-3">
          <button
            id="btn-submit-admin-login"
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/10 uppercase tracking-wider"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>ĐANG XÁC THỰC...</span>
              </>
            ) : (
              <span>ĐĂNG NHẬP HỆ THỐNG</span>
            )}
          </button>

          <button
            id="btn-login-back-shop"
            type="button"
            onClick={onBackToShop}
            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs py-2.5 rounded-xl transition-all border border-slate-150 flex items-center justify-center space-x-1 cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Quay lại cửa hàng</span>
          </button>
        </div>

      </form>
    </div>
  );
}
