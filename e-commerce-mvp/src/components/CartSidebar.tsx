import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, CheckCircle2, User, Phone, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface CartItem {
  id: string; // matches product.id
  product: Product;
  quantity: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
}: CartSidebarProps) {
  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [customerAddress, setCustomerAddress] = React.useState('');
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [checkoutResult, setCheckoutResult] = React.useState<any>(null);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((acc, curr) => {
    return acc + (curr.product.price_after_discount * curr.quantity);
  }, 0);

  const formatVND = (num: number) => num.toLocaleString('vi-VN') + ' đ';

  // Order submission
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên nhận hàng');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage('Vui lòng nhập số điện thoại');
      return;
    }
    if (!customerAddress.trim()) {
      setErrorMessage('Vui lòng cung cấp địa chỉ nhận hàng chi tiết');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_address: customerAddress.trim(),
        items: cartItems.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          price_at_purchase: item.product.price_after_discount
        }))
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      const resData = await response.json();
      if (response.ok) {
        setCheckoutResult(resData);
        // Clean cart up on parent
        onClearCart();
        // Clean input details
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
      } else {
        setErrorMessage(resData.error || 'Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại!');
      }
    } catch (err: any) {
      setErrorMessage('Không thể liên kết với máy chủ. Vui lòng kiểm tra lại môi trường mạng.');
      console.error("Checkout issue: ", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="cart-drawer-backdrop" className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div id="cart-drawer-container" className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-slideLeft transform duration-300">
        
        {/* Header toolbar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-sky-600" />
            <h3 id="cart-drawer-title" className="font-extrabold text-slate-900">Giỏ hàng ({cartItems.length} sản phẩm)</h3>
          </div>
          <button
            id="btn-close-cart-drawer"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {checkoutResult ? (
          /* Success Screen view */
          <div id="checkout-success-view" className="flex-1 p-6 flex flex-col justify-center items-center text-center space-y-5 animate-scaleUp">
            <div className="bg-emerald-100 p-4.5 rounded-full text-emerald-600">
              <CheckCircle2 className="w-14 h-14" />
            </div>
            <h4 className="text-xl font-black text-slate-905">ĐẶT HÀNG THÀNH CÔNG!</h4>
            
            <div className="bg-slate-50 p-4 rounded-2xl w-full text-left border border-slate-100 text-xs space-y-2.5 text-slate-700">
              <p>📍 Mã đơn hàng: <strong className="text-sky-600 font-mono text-sm">{checkoutResult.orderId}</strong></p>
              <p>📬 Thông báo gửi Email về: <span className="font-semibold text-slate-800">Admin ({checkoutResult.emailSent ? 'Đã gửi qua Resend' : 'Bản nháp mô phỏng'})</span></p>
              {checkoutResult.simulation && (
                <div className="bg-sky-50 text-sky-750 p-3 rounded-xl flex items-start gap-2 border border-sky-100">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-sky-500" />
                  <span>Hệ thống đã lưu đơn hàng và tạo bản mô phỏng email chuẩn HTML. Bạn có thể mở <b>Khu vực Quản trị viên &gt; Lịch sử gửi thư</b> để xem trực tiếp giao diện Email thông báo sẽ nhận được!</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400">Cảm ơn bạn đã lựa chọn sử dụng dịch vụ của chúng tôi. Nhân viên y khoa sẽ liên hệ trực tiếp cho bạn qua SĐT để xác nhận lịch trình giao vận hành sớm nhất.</p>
            
            <button
              id="btn-success-continue"
              onClick={() => {
                setCheckoutResult(null);
                onClose();
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all cursor-pointer"
            >
              Tiếp tục mua hàng
            </button>
          </div>
        ) : (
          /* Regular list view and form checkout */
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {cartItems.length === 0 ? (
              <div id="cart-empty-view" className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                <ShoppingBag className="w-16 h-16 stroke-1 text-slate-300" />
                <p className="text-sm font-semibold">Giỏ hàng của bạn đang trống</p>
                <button
                  onClick={onClose}
                  className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Tham quan mua sắm ngay
                </button>
              </div>
            ) : (
              <>
                {/* List of items */}
                <div id="cart-items-list" className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      id={`cart-item-row-${item.id}`}
                      className="flex gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 relative group"
                    >
                      {/* Thumbnail */}
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Product titles & total */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1 pr-4">{item.product.name}</h4>
                          <span className="text-[11px] font-extrabold text-sky-600 block mt-0.5">{formatVND(item.product.price_after_discount)}</span>
                        </div>
                        
                        {/* Interactive Quantity Incrementor */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-white border border-slate-150 rounded-lg p-0.5 shadow-2xs">
                            <button
                              id={`cart-btn-dec-${item.id}`}
                              onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-slate-50 text-slate-500 rounded-sm cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span id={`cart-item-qty-${item.id}`} className="px-2.5 text-xs font-bold text-slate-800">{item.quantity}</span>
                            <button
                              id={`cart-btn-inc-${item.id}`}
                              onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-slate-50 text-slate-500 rounded-sm cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            id={`cart-btn-del-${item.id}`}
                            onClick={() => onRemoveItem(item.id)}
                            className="text-slate-400 hover:text-red-500 p-1 rounded-full transition-colors cursor-pointer"
                            title="Xóa khỏi giỏ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="border-slate-100" />

                {/* 4. Checkout Delivery Form */}
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Thông Tin Giao Hàng</span>
                    <span className="text-[10px] text-red-500 font-semibold">* trường bắt buộc</span>
                  </div>

                  {errorMessage && (
                    <div id="checkout-error-block" className="p-3 bg-red-50 border border-red-150 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Customer Full name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Họ và tên nhận hàng <span className="text-red-500">*</span></span>
                    </label>
                    <input
                      id="input-customer-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="w-full text-xs bg-slate-50 border border-slate-150 focus:border-sky-500 focus:bg-white rounded-xl p-2.5 outline-none transition-colors"
                    />
                  </div>

                  {/* Customer Phone number */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Số điện thoại <span className="text-red-500">*</span></span>
                    </label>
                    <input
                      id="input-customer-phone"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ví dụ: 0987654321"
                      className="w-full text-xs bg-slate-50 border border-slate-150 focus:border-sky-500 focus:bg-white rounded-xl p-2.5 outline-none transition-colors"
                    />
                  </div>

                  {/* Customer Address */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Địa chỉ chi tiết nhận hàng <span className="text-red-500">*</span></span>
                    </label>
                    <textarea
                      id="input-customer-address"
                      required
                      rows={2}
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Số nhà, tên đường, xã phường, quận huyện..."
                      className="w-full text-xs bg-slate-50 border border-slate-150 focus:border-sky-500 focus:bg-white rounded-xl p-2.5 outline-none transition-colors resize-none"
                    ></textarea>
                  </div>
                  
                  {/* Total summary Box */}
                  <div className="bg-slate-900 text-white rounded-2xl p-4.5 space-y-3 shadow-md">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 tracking-wider">Tổng cộng ({cartItems.length} sản phẩm)</span>
                      <span id="cart-total-amount" className="text-lg font-black text-sky-400">{formatVND(totalAmount)}</span>
                    </div>

                    <p className="text-[10px] text-slate-400 italic text-center border-t border-slate-800 pt-2">Hủy / Thay đổi hàng linh động ngay trong quá trình phục vụ trước khi điều phối.</p>

                    <button
                      id="btn-confirm-checkout"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 text-slate-950 hover:text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 uppercase tracking-widest shadow-md shadow-sky-500/20 active:scale-95"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          <span>ĐANG GỬI ĐƠN...</span>
                        </>
                      ) : (
                        <span>XÁC NHẬN ĐẶT HÀNG</span>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
