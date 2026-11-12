import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Copy,
  Check,
  MapPin,
  Phone,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  RefreshCw,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';

export const TrackOrderPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('orderId') || '';

  const { user } = useAuth();
  const [searchInput, setSearchInput] = useState(initialId);
  const [searchedId, setSearchedId] = useState(initialId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(Boolean(initialId));
  const [hasSearched, setHasSearched] = useState(Boolean(initialId));
  const [copied, setCopied] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  // If user is logged in, fetch their recent orders for quick one-tap tracking
  useEffect(() => {
    if (!user) return;
    const unsub = firestoreService.subscribeUserOrders(user.uid, (orders) => {
      setUserOrders(orders.slice(0, 5));
    });
    return () => unsub();
  }, [user]);

  // Synchronize when searchParams change (e.g. from /track?orderId=xyz)
  useEffect(() => {
    const q = searchParams.get('orderId');
    if (q) {
      setSearchInput(q);
      setSearchedId(q);
      setHasSearched(true);
    }
  }, [searchParams]);

  // Subscribe to live order updates whenever searchedId changes
  useEffect(() => {
    if (!searchedId.trim()) {
      setOrder(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = firestoreService.subscribeOrderById(searchedId.trim(), (foundOrder) => {
      setOrder(foundOrder);
      setLoading(false);
    });

    return () => unsub();
  }, [searchedId]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = searchInput.trim();
    if (!clean) return;

    setSearchedId(clean);
    setHasSearched(true);
    setSearchParams({ orderId: clean });
  };

  const handleCopyId = (idToCopy: string) => {
    navigator.clipboard.writeText(idToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Tracking steps configuration
  const getTimelineSteps = (status: Order['status'] = 'pending') => {
    const isCancelled = status === 'cancelled';
    const isPending = status === 'pending';
    const isProcessing = status === 'processing';
    const isShipped = status === 'shipped';
    const isDelivered = status === 'delivered';

    return [
      {
        id: 1,
        title: 'Order Placed',
        description: 'Order confirmed and registered in CrossFaded system.',
        completed: !isCancelled,
        current: isPending,
        icon: ShoppingBag,
      },
      {
        id: 2,
        title: 'Fulfillment & Luxury Packaging',
        description: 'Discrete tamper-proof packaging & quality verification.',
        completed: isProcessing || isShipped || isDelivered,
        current: isProcessing,
        icon: Package,
      },
      {
        id: 3,
        title: 'Out for Delivery',
        description: 'Assigned to trusted dispatch driver. Driver calls on arrival.',
        completed: isShipped || isDelivered,
        current: isShipped,
        icon: Truck,
      },
      {
        id: 4,
        title: 'Delivered & Inspected',
        description: 'Package handed over. Payment completed via Cash on Delivery.',
        completed: isDelivered,
        current: isDelivered,
        icon: CheckCircle2,
      },
    ];
  };

  const formattedDate = order?.date_created?.seconds
    ? new Date(order.date_created.seconds * 1000).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : `${order?.day_created || ''}/${order?.month_created || ''}/${order?.year_created || ''}`;

  const whatsappMessage = encodeURIComponent(
    `Hello CrossFaded GH! I am tracking order #${order?.orderNumber || order?.id || searchedId}. Please provide dispatch updates.`
  );
  const whatsappUrl = `https://wa.me/233543236328?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-black py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-2.5 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider mb-3 sm:mb-4">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Live Dispatch Tracker</span>
          </div>
          <h1 className="font-raleway text-2xl sm:text-4xl font-bold text-white tracking-tight mb-2 sm:mb-3">
            Track Your Order
          </h1>
          <p className="font-poppins text-xs sm:text-sm text-zinc-400">
            Enter your CrossFaded Order ID to check real-time packaging, dispatch status, and driver delivery updates.
          </p>
        </div>

        {/* Search Bar Card */}
        <div className="p-3.5 sm:p-6 rounded-xl bg-[#212121] border border-zinc-800 shadow-2xl mb-6 sm:mb-8 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500" />

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 absolute left-3.5 top-3 sm:top-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Order ID (e.g. CF-482915)..."
                className="w-full bg-black/80 border border-zinc-700 rounded-xl pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono transition-all uppercase tracking-wider"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchInput.trim()}
              className="px-5 sm:px-8 py-2.5 sm:py-3.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-poppins font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Tracking...</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span>Track Order</span>
                </>
              )}
            </button>
          </form>

          {/* Quick select pills from user recent orders */}
          {userOrders.length > 0 && (
            <div className="mt-4 pt-4 border-t border-zinc-800/80">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
                Your Recent Orders:
              </span>
              <div className="flex flex-wrap gap-2">
                {userOrders.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      setSearchInput(o.orderNumber || o.id);
                      setSearchedId(o.orderNumber || o.id);
                      setHasSearched(true);
                      setSearchParams({ orderId: o.orderNumber || o.id });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                      searchedId === (o.orderNumber || o.id)
                        ? 'bg-amber-400 text-black border-amber-400 font-bold shadow'
                        : 'bg-black/60 text-zinc-300 border-zinc-700 hover:border-amber-400/60 hover:text-white'
                    }`}
                  >
                    #{o.orderNumber || o.id.slice(0, 8).toUpperCase()} ({o.status})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="p-8 rounded-2xl bg-[#212121] border border-zinc-800 text-center space-y-4 animate-pulse">
            <div className="w-12 h-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
            <p className="font-poppins text-xs text-zinc-400">
              Connecting to live dispatch network for Order #{searchedId}...
            </p>
          </div>
        )}

        {/* Not Found State */}
        {!loading && hasSearched && !order && (
          <div className="p-8 sm:p-12 rounded-2xl bg-[#212121] border border-zinc-800 text-center shadow-xl">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="font-aldrich text-xl sm:text-2xl font-bold text-white mb-2">
              Order Not Found
            </h3>
            <p className="font-poppins text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mb-6">
              We couldn't locate an order with Reference ID <span className="text-amber-400 font-mono font-bold">"{searchedId}"</span>. Please double-check your Order ID from your confirmation screen or receipts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 font-poppins">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Ask Support on WhatsApp</span>
              </a>
              <Link
                to="/orders"
                className="w-full sm:w-auto px-6 py-3 bg-black hover:bg-zinc-900 text-zinc-300 font-semibold text-xs uppercase tracking-wider rounded-xl border border-zinc-700 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>View My Orders</span>
              </Link>
            </div>
          </div>
        )}

        {/* Order Found Details */}
        {!loading && order && (
          <div className="space-y-6">

            {/* Top Order Reference Card */}
            <div className="p-3.5 sm:p-6 rounded-xl bg-[#212121] border border-zinc-800 shadow-xl space-y-4 sm:space-y-6">
              
              {/* Header bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-zinc-400 font-poppins uppercase tracking-wider font-semibold">
                      Order Reference
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyId(order.orderNumber || order.id)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 hover:bg-zinc-800 text-[10px] font-mono text-zinc-400 hover:text-white border border-zinc-700 transition-colors"
                      title="Copy Order ID"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-amber-400" />
                          <span>Copy ID</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h2 className="font-mono text-xl sm:text-2xl font-bold text-amber-400 flex items-center gap-2">
                    <span>#{order.orderNumber || order.id}</span>
                  </h2>

                  <p className="text-xs text-zinc-400 font-poppins mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Placed on {formattedDate}</span>
                  </p>
                </div>

                {/* Status Pill */}
                <div className="self-start sm:self-auto text-left sm:text-right">
                  <span className="text-xs text-zinc-500 block mb-1 font-poppins">Current Status</span>
                  {order.status === 'delivered' ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-poppins">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Delivered Successfully
                    </span>
                  ) : order.status === 'shipped' ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold font-poppins animate-pulse">
                      <Truck className="w-4 h-4 text-blue-400" />
                      Out for Delivery
                    </span>
                  ) : order.status === 'processing' ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-bold font-poppins">
                      <Package className="w-4 h-4 text-indigo-400" />
                      Packaging & Quality Check
                    </span>
                  ) : order.status === 'cancelled' ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold font-poppins">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      Order Cancelled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold font-poppins animate-pulse">
                      <Clock className="w-4 h-4 text-amber-400" />
                      Pending Dispatch
                    </span>
                  )}
                </div>
              </div>

              {/* Visual 4-Step Timeline */}
              <div className="py-4">
                <h3 className="font-aldrich text-sm font-bold text-white uppercase tracking-wider mb-6">
                  Live Dispatch Progression
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                  {getTimelineSteps(order.status).map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <div
                        key={step.id}
                        className={`p-4 rounded-xl border transition-all ${
                          step.completed
                            ? 'bg-black/80 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/5'
                            : step.current
                            ? 'bg-black/90 border-amber-400/80 text-amber-400 shadow-lg shadow-amber-500/10'
                            : 'bg-black/40 border-zinc-800 text-zinc-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                              step.completed
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : step.current
                                ? 'bg-amber-400 text-black font-extrabold'
                                : 'bg-zinc-800 text-zinc-500'
                            }`}
                          >
                            {step.completed ? '✓' : idx + 1}
                          </span>
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold font-poppins text-white mb-1">
                          {step.title}
                        </h4>
                        <p className="text-[11px] font-poppins text-zinc-400 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-poppins font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message Dispatch on WhatsApp</span>
                </a>
                <Link
                  to="/shop"
                  className="py-3.5 px-6 bg-black hover:bg-zinc-900 text-zinc-300 font-poppins font-semibold text-xs uppercase tracking-wider rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>Continue Shopping</span>
                </Link>
              </div>

            </div>

            {/* Grid: Delivery Destination & Items Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

              {/* Delivery Information Card */}
              <div className="p-3.5 sm:p-6 rounded-xl bg-[#212121] border border-zinc-800 space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-800 text-amber-400">
                  <MapPin className="w-4 h-4" />
                  <h3 className="font-aldrich text-xs font-bold uppercase tracking-wider text-white">
                    Delivery Destination
                  </h3>
                </div>

                <div className="space-y-3 font-poppins text-xs text-zinc-300">
                  <div>
                    <span className="text-zinc-500 text-[11px] block">Recipient Name</span>
                    <strong className="text-white text-sm">
                      {order.customerName || `${order.firstname || ''} ${order.lastname || ''}`.trim() || 'Valued Customer'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-zinc-500 text-[11px] block">Contact Phone Number</span>
                    <strong className="text-white">{order.phone}</strong>
                  </div>

                  <div>
                    <span className="text-zinc-500 text-[11px] block">Delivery Address</span>
                    <p className="text-zinc-200">
                      {order.placename || order.address}
                    </p>
                    <p className="text-zinc-400 text-[11px]">
                      {order.city}, {order.region}
                    </p>
                  </div>

                  {typeof order.distance_km === 'number' && order.distance_km > 0 && (
                    <div className="p-2.5 rounded-lg bg-black/60 border border-zinc-800 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-zinc-400">Calculated Distance:</span>
                      <span className="text-amber-400 font-bold">{order.distance_km} km from Flagship Store</span>
                    </div>
                  )}

                  {order.note && (
                    <div className="p-2.5 rounded-lg bg-black/60 border border-zinc-800">
                      <span className="text-[11px] text-zinc-500 block font-semibold">Delivery Note:</span>
                      <p className="italic text-zinc-300 text-xs">"{order.note}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div className="p-3.5 sm:p-6 rounded-xl bg-[#212121] border border-zinc-800 space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-800 text-amber-400">
                  <Package className="w-4 h-4" />
                  <h3 className="font-aldrich text-xs font-bold uppercase tracking-wider text-white">
                    Package Items ({order.cartitems?.length || 0})
                  </h3>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {order.cartitems?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-black/60 border border-zinc-800"
                    >
                      <img
                        src={item.productimage || '/images/cigar.png'}
                        alt={item.productname}
                        className="w-12 h-12 object-cover rounded-lg bg-zinc-900 shrink-0"
                      />
                      <div className="min-w-0 flex-1 font-poppins">
                        <p className="text-xs font-semibold text-white truncate">
                          {item.productname}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          Qty: {item.quantity} × GHS {Number(item.price || 0).toFixed(2)}
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        GHS {(Number(item.price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals Summary */}
                <div className="pt-3 border-t border-zinc-800 space-y-1.5 font-poppins text-xs">
                  {typeof order.delivery_fee === 'number' && (
                    <div className="flex justify-between text-zinc-400">
                      <span>Delivery Fee</span>
                      <span className="text-white font-mono">GHS {order.delivery_fee.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-zinc-800">
                    <span>Total (Pay on Delivery)</span>
                    <span className="font-aldrich text-amber-400 text-base">
                      GHS {Number(order.total || 0).toFixed(2)}
                    </span>
                  </div>

                  <p className="text-[10px] text-zinc-500 font-poppins text-right">
                    Payment Method: {order.payment_method_title || 'Cash on Delivery'}
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

