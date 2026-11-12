import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Truck,
  Search,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { Order } from '../types';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'delivered'>('all');
  const [quickTrackId, setQuickTrackId] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsub = firestoreService.subscribeUserOrders(user.uid, (userOrders) => {
      setOrders(userOrders);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTrackId.trim()) return;
    navigate(`/track?orderId=${encodeURIComponent(quickTrackId.trim())}`);
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!user) {
    return (
      <div className="min-h-[80vh] bg-black py-16 flex flex-col items-center justify-center text-center p-6 text-zinc-400">
        <div className="max-w-md w-full space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400">
            <Truck className="w-8 h-8" />
          </div>

          <div>
            <h2 className="font-raleway text-3xl font-bold text-white mb-2">Track Your Orders</h2>
            <p className="text-xs text-zinc-400 font-poppins">
              Sign in to view your complete order history, or enter your Order ID below to track a delivery instantly.
            </p>
          </div>

          {/* Quick Track Input for unauthenticated customers */}
          <form onSubmit={handleQuickTrack} className="p-4 rounded-xl bg-[#212121] border border-zinc-800 space-y-3 text-left">
            <label className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold block">
              Track by Order ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={quickTrackId}
                onChange={(e) => setQuickTrackId(e.target.value)}
                placeholder="Enter Order ID (e.g. CF-482915)..."
                className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2.5 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-poppins font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow active:scale-95 flex items-center justify-center gap-2"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Delivery</span>
            </button>
          </form>

          <div className="relative py-2 flex items-center justify-center">
            <div className="border-t border-zinc-800 w-full absolute" />
            <span className="bg-black px-3 text-[11px] text-zinc-600 font-mono uppercase tracking-wider relative">
              Or Sign In
            </span>
          </div>

          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-zinc-700 shadow"
          >
            Sign In to View Full Account
          </button>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Delivered
          </span>
        );
      case 'processing':
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            Out for Delivery
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            Pending Dispatch
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black py-6 sm:py-12">
      <div className="max-w-6xl mx-auto px-2.5 sm:px-6 lg:px-8">
        
        {/* Header & Quick Track Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <span className="text-amber-500 font-mono text-xs uppercase tracking-widest font-bold block mb-1">
              Purchase History & Dispatch
            </span>
            <h1 className="font-raleway text-2xl sm:text-4xl font-bold text-white tracking-tight">
              My Orders
            </h1>
          </div>

          {/* Quick Track Search form */}
          <form onSubmit={handleQuickTrack} className="flex gap-2 max-w-sm w-full">
            <div className="relative flex-1">
              <input
                type="text"
                value={quickTrackId}
                onChange={(e) => setQuickTrackId(e.target.value)}
                placeholder="Track by Order ID..."
                className="w-full bg-[#212121] border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs rounded-xl transition-all shadow flex items-center gap-1.5 shrink-0"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track</span>
            </button>
          </form>
        </div>

        {/* Filter tabs */}
        <div className="flex bg-[#212121] p-1 rounded-lg border border-zinc-800 mb-8 self-start w-fit">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-1.5 rounded text-xs font-poppins font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-amber-400 text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-1.5 rounded text-xs font-poppins font-semibold transition-all ${
              statusFilter === 'pending'
                ? 'bg-amber-400 text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Pending ({orders.filter((o) => o.status === 'pending').length})
          </button>
          <button
            onClick={() => setStatusFilter('delivered')}
            className={`px-4 py-1.5 rounded text-xs font-poppins font-semibold transition-all ${
              statusFilter === 'delivered'
                ? 'bg-amber-400 text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Delivered ({orders.filter((o) => o.status === 'delivered').length})
          </button>
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-[#212121] rounded-xl animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-[#212121] rounded-xl border border-zinc-800">
            <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="font-aldrich text-xl font-bold text-white mb-2">No orders found</h3>
            <p className="text-xs text-zinc-400 mb-6 font-poppins">
              You haven't placed any orders matching this filter status yet.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-poppins font-semibold text-xs rounded transition-all shadow"
            >
              <span>Explore The Shop</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const formattedDate = order.date_created?.seconds
                ? new Date(order.date_created.seconds * 1000).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : `${order.day_created || ''}/${order.month_created || ''}/${order.year_created || ''}`;

              const displayId = order.orderNumber || order.id;

              return (
                <div
                  key={order.id}
                  className="p-3.5 sm:p-6 rounded-xl bg-[#212121] border border-zinc-800 space-y-4 sm:space-y-6 shadow-xl"
                >
                  {/* Top order bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-sm font-bold text-white">
                          #{displayId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(displayId)}
                          className="text-zinc-500 hover:text-white transition-colors"
                          title="Copy Order ID"
                        >
                          {copiedId === displayId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-zinc-500" />
                          )}
                        </button>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 font-poppins">
                        Placed on {formattedDate} • Payment: {order.payment_method_title || 'Cash on delivery'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-left sm:text-right">
                        <span className="text-xs text-zinc-500 block">Total Amount</span>
                        <span className="font-aldrich text-xl font-bold text-amber-400">
                          GHS {Number(order.total || 0).toFixed(2)}
                        </span>
                      </div>

                      <Link
                        to={`/track?orderId=${displayId}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-poppins font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow active:scale-95"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track Order</span>
                      </Link>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {order.cartitems?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80"
                      >
                        <img
                          src={item.productimage || '/images/cigar.png'}
                          alt={item.productname}
                          className="w-14 h-14 object-cover rounded-xl bg-zinc-900 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate font-poppins">
                            {item.productname}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            Qty: {item.quantity} × GHS {Number(item.price || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Destination info */}
                  <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row justify-between text-xs text-zinc-400 gap-2 font-poppins">
                    <div>
                      <strong className="text-zinc-200">Delivery Address: </strong>
                      {order.placename || order.address}, {order.city}, {order.region} • Contact: {order.phone}
                    </div>
                    {order.note && (
                      <div className="italic text-zinc-400">
                        <strong>Note: </strong>"{order.note}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
