import { Activity, Phone, MapPin, ClipboardList, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Order, OrderItem } from "../types";

// Extends local type with extra inner items array for display
export interface OrderWithItems extends Order {
  items?: OrderItem[];
}

interface AdminOrderListProps {
  orders: OrderWithItems[];
}

export default function AdminOrderList({ orders }: AdminOrderListProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-250">
            <CheckCircle className="h-3 w-3" /> Thành công
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600 border border-red-200">
            <XCircle className="h-3 w-3" /> Đã huỷ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3 animate-pulse" /> Đang xử lý
          </span>
        );
    }
  };

  return (
    <div className="space-y-4" id="admin-orders-list-root">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Danh Sách Đơn Hàng</h2>
        <p className="text-xs text-slate-500">Xem và xử lý các đơn đặt hàng từ khách hàng trực tiếp đổ về</p>
      </div>

      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-205 p-12 text-center text-slate-400">
            <ClipboardList className="mx-auto h-12 w-12 text-slate-300 mb-2" />
            Chưa có đơn hàng nào đổ về hệ thống.
          </div>
        ) : (
          orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const formattedDate = new Date(order.created_at).toLocaleString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            });

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow"
                id={`order-row-container-${order.id}`}
              >
                {/* Header Summary Row */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 cursor-pointer hover:bg-slate-50/50 transition"
                  id={`order-summary-tab-${order.id}`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-sm font-bold text-slate-900">
                        {order.customer_name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">
                        ID: {order.id.slice(0, 13)}...
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-slate-550 flex items-center gap-1">
                      Thời gian: {formattedDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-medium">Tổng giá trị thanh toán</p>
                      <p className="text-base font-extrabold text-[#df1b1b]">
                        {order.total_amount.toLocaleString("vi-VN")} đ
                      </p>
                    </div>
                    <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-150 transition">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Customer metrics */}
                      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Thông Tin Liên Hệ Khách Hàng
                        </h4>
                        <div className="space-y-2 text-xs text-slate-700">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                            <a
                              href={`tel:${order.customer_phone}`}
                              className="font-bold text-blue-600 hover:underline"
                            >
                              {order.customer_phone}
                            </a>
                            <span className="text-[10px] text-slate-400 font-medium">(Nhấp để gọi)</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                            <p>{order.customer_address}</p>
                          </div>
                          {order.customer_notes && (
                            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-2.5 text-amber-800 text-[11px] italic">
                              <strong>Yêu cầu riêng/Ghi chú:</strong> "{order.customer_notes}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items table list */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Sản phẩm đã đặt ({order.items?.length || 0})
                        </h4>
                        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between gap-3 p-3 text-xs"
                              >
                                <div className="flex-1">
                                  <p className="font-semibold text-slate-900">
                                    {item.product_name}
                                  </p>
                                  <p className="text-[10px] text-slate-400">
                                    Số lượng: <span className="font-bold text-slate-700">{item.quantity}</span> x {item.unit_price.toLocaleString("vi-VN")} đ
                                  </p>
                                </div>
                                <span className="font-bold text-slate-800">
                                  {(item.quantity * item.unit_price).toLocaleString("vi-VN")} đ
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="p-4 text-center text-[10px] text-slate-400">
                              (Lỗi liên kết: Không tìm được items của đơn hàng này trong database)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
