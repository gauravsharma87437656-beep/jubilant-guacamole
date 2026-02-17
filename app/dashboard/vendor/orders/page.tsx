"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  StickyNote,
  CalendarDays,
  Hash,
  Layers,
} from "lucide-react";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  rentalDays: number;
}

interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  subtotal: number;
  depositAmount: number;
  deliveryFee: number;
  platformFee: number;
  taxAmount: number;
  createdAt: string;
  startDate: string;
  endDate: string;
  shippingAddress: ShippingAddress | null;
  customerNote: string | null;
  customer: {
    name: string;
    email: string;
    image: string | null;
    phone: string | null;
  };
  items: OrderItem[];
  payment: {
    status: string;
    method: string;
  } | null;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
  PENDING: {
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: <Clock className="w-3.5 h-3.5" />,
    label: "Pending",
  },
  CONFIRMED: {
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    label: "Confirmed",
  },
  ACTIVE: {
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <Package className="w-3.5 h-3.5" />,
    label: "Active",
  },
  SHIPPED: {
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    icon: <Truck className="w-3.5 h-3.5" />,
    label: "Shipped",
  },
  DELIVERED: {
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon: <Truck className="w-3.5 h-3.5" />,
    label: "Delivered",
  },
  COMPLETED: {
    color: "text-gray-700",
    bg: "bg-gray-50",
    border: "border-gray-200",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    label: "Completed",
  },
  CANCELLED: {
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: <XCircle className="w-3.5 h-3.5" />,
    label: "Cancelled",
  },
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter
        ? `/api/vendor/orders?status=${statusFilter}`
        : "/api/vendor/orders";
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/vendor/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusConfig = (status: string) =>
    STATUS_CONFIG[status] || STATUS_CONFIG["PENDING"];

  const formatAddress = (addr: ShippingAddress | null) => {
    if (!addr) return "No address provided";
    const parts = [
      [addr.firstName, addr.lastName].filter(Boolean).join(" "),
      addr.address1,
      addr.address2,
      [addr.city, addr.state, addr.postalCode].filter(Boolean).join(", "),
      addr.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
  const activeOrders = orders.filter((o) => ["ACTIVE", "CONFIRMED", "SHIPPED"].includes(o.status)).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }}>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Orders</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 font-medium">Manage and track your rental orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white rounded-2xl p-3 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">Total</p>
              <p className="text-lg sm:text-2xl font-extrabold text-gray-900">{totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-3 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">Pending</p>
              <p className="text-lg sm:text-2xl font-extrabold text-gray-900">{pendingOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-3 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">Active</p>
              <p className="text-lg sm:text-2xl font-extrabold text-gray-900">{activeOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4.5 w-4.5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-gray-900 placeholder:text-gray-400 bg-white shadow-sm transition-all text-sm sm:text-base"
          />
        </div>
        <div className="relative min-w-[160px] sm:min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-gray-900 bg-white shadow-sm appearance-none cursor-pointer transition-all font-medium text-sm sm:text-base"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="ACTIVE">Active</option>
            <option value="DELIVERED">Delivered</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-gray-500 font-medium">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-7 h-7 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No orders found</h3>
          <p className="mt-1.5 text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            {searchQuery || statusFilter
              ? "Try adjusting your search or filters."
              : "You haven't received any orders yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const statusCfg = getStatusConfig(order.status);
            const itemCount = order.items.length;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded
                    ? "shadow-lg border-blue-200 ring-1 ring-blue-100"
                    : "shadow-sm border-gray-100 hover:shadow-md hover:border-gray-200"
                  }`}
              >
                {/* Compact Card Header — always visible */}
                <div
                  className="p-4 sm:p-5 cursor-pointer select-none"
                  onClick={() => toggleExpand(order.id)}
                >
                  {/* Top Row: Order ID, Date, Status */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg font-mono tracking-wider flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {order.orderNumber || order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className="hidden sm:inline text-xs text-gray-300">•</span>
                      <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                        <CalendarDays className="w-3 h-3" />
                        <span>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border} flex-shrink-0`}
                    >
                      {statusCfg.icon}
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Main Content Row */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Customer Avatar */}
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden shadow-sm">
                        {order.customer.image ? (
                          <img src={order.customer.image} alt={order.customer.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{order.customer.name?.charAt(0)?.toUpperCase() || "?"}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">{order.customer.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <span className="truncate">{order.customer.email}</span>
                          <span className="sm:hidden text-gray-300">•</span>
                          <span className="sm:hidden text-gray-400">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price + Expand */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="flex items-center gap-0.5 text-lg sm:text-xl font-extrabold text-gray-900 justify-end">
                          <span className="text-sm sm:text-base font-bold text-gray-400">₹</span>
                          {Number(order.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                          {itemCount} item{itemCount > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${isExpanded ? "bg-blue-50 text-blue-600 rotate-180" : "bg-gray-50 text-gray-400"}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="border-t border-gray-100">
                    {/* Customer Details Section */}
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-blue-50/30">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <User className="w-3.5 h-3.5" />
                        Customer Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Contact Info */}
                        <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <User className="w-3.5 h-3.5 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Name</p>
                                <p className="text-sm font-semibold text-gray-900 truncate">{order.customer.name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Email</p>
                                <p className="text-sm font-semibold text-gray-900 truncate">{order.customer.email}</p>
                              </div>
                            </div>
                            {order.customer.phone && (
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                                  <Phone className="w-3.5 h-3.5 text-violet-600" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Phone</p>
                                  <p className="text-sm font-semibold text-gray-900">{order.customer.phone}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-orange-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Shipping Address</p>
                              <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                                {formatAddress(order.shippingAddress)}
                              </p>
                              {order.shippingAddress?.phone && (
                                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {order.shippingAddress.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Customer Note */}
                      {order.customerNote && (
                        <div className="mt-3 bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Customer Note</p>
                              <p className="text-sm text-gray-700 leading-relaxed">{order.customerNote}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Items */}
                    <div className="p-4 sm:p-5">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Package className="w-3.5 h-3.5" />
                        Order Items ({itemCount})
                      </h4>
                      <div className="space-y-2.5">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 sm:gap-4 p-3 bg-gray-50/70 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
                              {item.productImage ? (
                                <img
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <Package className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{item.productName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-100">
                                  Qty: {item.quantity}
                                </span>
                                <span className="text-[11px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-100">
                                  {item.rentalDays} Days
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 text-sm font-bold text-gray-900 flex-shrink-0">
                              <span className="text-xs text-gray-400">₹</span>
                              {Number(item.price).toLocaleString("en-IN")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rental Period + Payment Info */}
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Rental Period */}
                        <div className="flex items-center gap-3 bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <CalendarDays className="w-4 h-4 text-blue-700" />
                          </div>
                          <div>
                            <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider">Rental Period</p>
                            <p className="text-sm font-bold text-blue-900">
                              {new Date(order.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              {" — "}
                              {new Date(order.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </div>

                        {/* Payment Info */}
                        {order.payment && (
                          <div className="flex items-center gap-3 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <CreditCard className="w-4 h-4 text-emerald-700" />
                            </div>
                            <div>
                              <p className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">Payment</p>
                              <p className="text-sm font-bold text-emerald-900">
                                {order.payment.method.replace(/_/g, " ")} • {order.payment.status}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Price Breakdown */}
                      <div className="mt-3 bg-gray-50/70 rounded-xl border border-gray-100 p-3.5">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-semibold text-gray-700">₹{Number(order.subtotal).toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Deposit</span>
                            <span className="font-semibold text-gray-700">₹{Number(order.depositAmount).toLocaleString("en-IN")}</span>
                          </div>
                          {Number(order.deliveryFee) > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Delivery Fee</span>
                              <span className="font-semibold text-gray-700">₹{Number(order.deliveryFee).toLocaleString("en-IN")}</span>
                            </div>
                          )}
                          {Number(order.taxAmount) > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Tax</span>
                              <span className="font-semibold text-gray-700">₹{Number(order.taxAmount).toLocaleString("en-IN")}</span>
                            </div>
                          )}
                          <div className="border-t border-gray-200 pt-1.5 mt-1.5 flex justify-between text-sm">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="font-extrabold text-gray-900">₹{Number(order.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        {order.status === "PENDING" && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.id, "CONFIRMED");
                              }}
                              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all font-bold shadow-sm shadow-blue-200 flex items-center justify-center gap-2 text-sm"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Confirm Order
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.id, "CANCELLED");
                              }}
                              className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 active:scale-[0.98] transition-all font-bold flex items-center justify-center gap-2 text-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              Decline
                            </button>
                          </>
                        )}
                        {order.status === "CONFIRMED" && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.id, "ACTIVE");
                              }}
                              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all font-bold shadow-sm shadow-emerald-200 flex items-center justify-center gap-2 text-sm"
                            >
                              <Package className="w-4 h-4" />
                              Mark as Shipped / Active
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.id, "CANCELLED");
                              }}
                              className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all font-bold flex items-center justify-center gap-2 text-sm"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {order.status === "ACTIVE" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, "DELIVERED");
                            }}
                            className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 active:scale-[0.98] transition-all font-bold shadow-sm shadow-violet-200 flex items-center justify-center gap-2 text-sm"
                          >
                            <Truck className="w-4 h-4" />
                            Mark as Delivered
                          </button>
                        )}
                        {order.status === "DELIVERED" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, "COMPLETED");
                            }}
                            className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all font-bold shadow-sm shadow-gray-300 flex items-center justify-center gap-2 text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Complete Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
