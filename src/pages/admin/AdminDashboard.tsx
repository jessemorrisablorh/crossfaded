import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Grid,
  ArrowRight,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Sliders,
  Eye,
  Sparkles,
  ArrowUpRight,
  Truck,
  AlertTriangle,
  Calendar,
  Layers,
  Phone,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { firestoreService } from '../../services/firestoreService';
import { Order, Product } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { products, categories } = useProducts();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = firestoreService.subscribeAllOrders((allOrders) => {
      setOrders(allOrders);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Financial & Operational Metrics
  const totalSales = useMemo(() => {
    return orders.reduce((sum, o) => {
      if (o.status === 'cancelled') return sum;
      return sum + Number(o.total || 0);
    }, 0);
  }, [orders]);

  const deliveredSales = useMemo(() => {
    return orders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + Number(o.total || 0), 0);
  }, [orders]);

  const pendingOrders = useMemo(() => orders.filter((o) => o.status === 'pending'), [orders]);
  const processingOrders = useMemo(() => orders.filter((o) => o.status === 'processing'), [orders]);
  const shippedOrders = useMemo(() => orders.filter((o) => o.status === 'shipped'), [orders]);
  const deliveredOrders = useMemo(() => orders.filter((o) => o.status === 'delivered'), [orders]);
  const cancelledOrders = useMemo(() => orders.filter((o) => o.status === 'cancelled'), [orders]);

  const aov = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    if (!validOrders.length) return 0;
    return totalSales / validOrders.length;
  }, [orders, totalSales]);

  // Inventory Health: Low stock products (stock <= 5)
  const lowStockProducts = useMemo(() => {
    return [...products]
      .filter((p) => p.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);
  }, [products]);

  // Filtered Orders for the Table
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (statusFilter !== 'all' && ord.status !== statusFilter) {
        return false;
      }
      if (orderSearch.trim()) {
        const query = orderSearch.toLowerCase().trim();
        const customer = (ord.customerName || `${ord.firstname || ''} ${ord.lastname || ''}`).toLowerCase();
        const idMatch = ord.id.toLowerCase().includes(query);
        const phoneMatch = (ord.phone || '').toLowerCase().includes(query);
        const cityMatch = (ord.city || '').toLowerCase().includes(query);
        if (!customer.includes(query) && !idMatch && !phoneMatch && !cityMatch) {
          return false;
        }
      }
      return true;
    });
  }, [orders, statusFilter, orderSearch]);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingOrderId(orderId);
    try {
      await firestoreService.updateOrderStatus(orderId, newStatus);
      success(`Order #${orderId.slice(0, 6).toUpperCase()} marked as ${newStatus.toUpperCase()}`);
    } catch (e) {
      console.error(e);
      toastError('Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Recently';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8 select-none text-zinc-200">
      
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE COMMAND HEADER WITH LIVE SYSTEM PULSE */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#141414] via-[#0d0d0d] to-black border border-zinc-800/80 p-4 sm:p-7 lg:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        {/* Subtle Warm Amber Scrim */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>STOREFRONT ACTIVE • LIVE DATA STREAM</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Accra: {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'GMT' })} GMT</span>
              </span>
            </div>

            <h1 className="font-anton text-2xl sm:text-4xl lg:text-5xl text-white tracking-wider uppercase leading-tight">
              EXECUTIVE COMMAND CENTER
            </h1>
            <p className="font-poppins text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Real-time administrative control for CrossFaded orders, live catalog items, Accra dispatch logistics, and on-page storefront media.
            </p>
          </div>

          {/* Quick Action Station */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5">
            <Link
              to="/admin/products"
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 bg-amber-400 hover:bg-amber-300 text-black font-poppins font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-amber-400/20 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Product</span>
            </Link>

            <Link
              to="/admin/categories"
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white font-poppins font-semibold text-xs rounded-xl transition-all border border-zinc-700/80 active:scale-95 backdrop-blur"
            >
              <Grid className="w-4 h-4 text-amber-400" />
              <span>Categories</span>
            </Link>

            <Link
              to="/admin/sliders"
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white font-poppins font-semibold text-xs rounded-xl transition-all border border-zinc-700/80 active:scale-95 backdrop-blur"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Banners</span>
            </Link>

            <Link
              to="/admin/settings"
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white font-poppins font-semibold text-xs rounded-xl transition-all border border-zinc-700/80 active:scale-95 backdrop-blur"
              title="Configure Google Places API Key, Pickup Coordinates, and Delivery Pricing"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Delivery</span>
            </Link>

            <Link
              to="/"
              className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 font-poppins font-semibold text-xs rounded-xl transition-all border border-amber-400/40 active:scale-95 backdrop-blur"
              title="Open Public Storefront with Live Edit Mode"
            >
              <Eye className="w-4 h-4" />
              <span>Live CMS</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FIVE LUXURY METRIC KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
        
        {/* Card 1: Gross Sales */}
        <div className="group relative p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#181818] to-[#0f0f0f] border border-zinc-800 hover:border-amber-400/40 transition-all duration-300 shadow-[0_12px_30px_rgba(0,0,0,0.6)] space-y-1.5 sm:space-y-2.5">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/90">
              Gross Store Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-aldrich text-2xl font-bold text-white tracking-wide">
            GHS {totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-poppins text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>GHS {deliveredSales.toFixed(0)} fulfilled</span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="group relative p-5 rounded-2xl bg-gradient-to-b from-[#181818] to-[#0f0f0f] border border-zinc-800 hover:border-emerald-500/40 transition-all duration-300 shadow-[0_12px_30px_rgba(0,0,0,0.6)] space-y-2.5">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400/90">
              Lifetime Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="font-aldrich text-2xl font-bold text-white tracking-wide">{orders.length}</p>
          <div className="flex items-center gap-1.5 text-[11px] font-poppins">
            <span className="text-amber-400 font-semibold">{pendingOrders.length} Pending</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">{deliveredOrders.length} Delivered</span>
          </div>
        </div>

        {/* Card 3: Average Order Value */}
        <div className="group relative p-5 rounded-2xl bg-gradient-to-b from-[#181818] to-[#0f0f0f] border border-zinc-800 hover:border-blue-400/40 transition-all duration-300 shadow-[0_12px_30px_rgba(0,0,0,0.6)] space-y-2.5">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400/90">
              Average Basket Size
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="font-aldrich text-2xl font-bold text-white tracking-wide">
            GHS {aov.toFixed(2)}
          </p>
          <p className="text-[11px] font-poppins text-zinc-400">Per customer checkout</p>
        </div>

        {/* Card 4: Active Catalog */}
        <div className="group relative p-5 rounded-2xl bg-gradient-to-b from-[#181818] to-[#0f0f0f] border border-zinc-800 hover:border-purple-400/40 transition-all duration-300 shadow-[0_12px_30px_rgba(0,0,0,0.6)] space-y-2.5">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400/90">
              Active Products
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="font-aldrich text-2xl font-bold text-white tracking-wide">{products.length}</p>
          <div className="flex items-center gap-1.5 text-[11px] font-poppins">
            {lowStockProducts.length > 0 ? (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{lowStockProducts.length} low stock alerts</span>
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Stock levels optimal</span>
              </span>
            )}
          </div>
        </div>

        {/* Card 5: Collections */}
        <div className="group relative p-5 rounded-2xl bg-gradient-to-b from-[#181818] to-[#0f0f0f] border border-zinc-800 hover:border-amber-400/40 transition-all duration-300 shadow-[0_12px_30px_rgba(0,0,0,0.6)] space-y-2.5">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/90">
              Curated Departments
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-400/20">
              <Grid className="w-4 h-4" />
            </div>
          </div>
          <p className="font-aldrich text-2xl font-bold text-white tracking-wide">{categories.length}</p>
          <p className="text-[11px] font-poppins text-zinc-400">Active store categories</p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. REAL-TIME ORDERS STREAM & DISPATCH CONTROL */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-[#111111] border border-zinc-800/90 shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-6 sm:p-8 space-y-6">
        
        {/* Header with Title and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
          <div>
            <h2 className="font-raleway text-xl font-bold text-white flex items-center gap-2.5">
              <span>Customer Orders Stream</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-black text-amber-400 border border-zinc-800">
                {filteredOrders.length}
              </span>
            </h2>
            <p className="text-xs text-zinc-400 font-poppins mt-0.5">
              Review live customer checkout submissions, customer hotline numbers, and update dispatch stages.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by client, phone, #ID..."
                className="w-full bg-black border border-zinc-700/80 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-poppins"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
            </div>

            <Link
              to="/admin/orders"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-poppins font-semibold text-zinc-200 hover:text-white transition-colors shrink-0 flex items-center gap-1.5 border border-zinc-800"
            >
              <span>Full Manager</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </Link>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Orders', count: orders.length },
            { id: 'pending', label: 'Pending Dispatch', count: pendingOrders.length },
            { id: 'processing', label: 'Processing', count: processingOrders.length },
            { id: 'shipped', label: 'Courier Dispatched', count: shippedOrders.length },
            { id: 'delivered', label: 'Delivered', count: deliveredOrders.length },
            { id: 'cancelled', label: 'Cancelled', count: cancelledOrders.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-poppins font-semibold transition-all flex items-center gap-2 ${
                statusFilter === tab.id
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20 font-bold'
                  : 'bg-black/60 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${statusFilter === tab.id ? 'bg-black text-amber-400' : 'bg-zinc-900 text-zinc-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="py-20 text-center text-xs text-zinc-500 font-mono space-y-2">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Synchronizing real-time order records...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center text-xs text-zinc-500 font-poppins space-y-2">
            <Package className="w-12 h-12 text-zinc-700 mx-auto" />
            <p className="font-semibold text-zinc-400">No orders match the current search or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-3">
                <tr>
                  <th className="pb-3.5 pr-4">Order Reference</th>
                  <th className="pb-3.5 px-4">Client Details</th>
                  <th className="pb-3.5 px-4">Accra Delivery Hub</th>
                  <th className="pb-3.5 px-4">Basket Package</th>
                  <th className="pb-3.5 px-4">Total & Settlement</th>
                  <th className="pb-3.5 pl-4">Fulfillment Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-poppins text-zinc-300">
                {filteredOrders.slice(0, 10).map((ord) => {
                  const customerName =
                    ord.customerName ||
                    `${ord.firstname || ''} ${ord.lastname || ''}`.trim() ||
                    'Customer';

                  return (
                    <tr key={ord.id} className="hover:bg-zinc-900/60 transition-colors">
                      {/* Order ID & Date */}
                      <td className="py-4 pr-4">
                        <span className="font-mono font-bold text-amber-400 text-xs block">
                          #CF-{ord.id.slice(0, 6).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-zinc-600" />
                          <span>{formatDate(ord.date_created)}</span>
                        </span>
                      </td>

                      {/* Client / Contact */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-white block">{customerName}</span>
                        {ord.phone && (
                          <a
                            href={`tel:${ord.phone}`}
                            className="text-zinc-400 hover:text-amber-400 transition-colors text-[11px] font-mono flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="w-3 h-3 text-amber-400" />
                            <span>{ord.phone}</span>
                          </a>
                        )}
                      </td>

                      {/* Delivery Hub */}
                      <td className="py-4 px-4 text-zinc-300">
                        <span className="block font-medium text-xs truncate max-w-[150px]" title={ord.address}>
                          {ord.city || ord.address || 'Accra'}
                        </span>
                        <span className="text-[10px] text-zinc-500 block truncate max-w-[150px]">
                          {ord.region || 'Greater Accra'}
                        </span>
                      </td>

                      {/* Purchased Items */}
                      <td className="py-4 px-4">
                        <span className="text-xs font-semibold text-zinc-200">
                          {ord.cartitems?.length || 1} item{ord.cartitems && ord.cartitems.length > 1 ? 's' : ''}
                        </span>
                        <div className="text-[10px] text-zinc-400 truncate max-w-[180px] mt-0.5">
                          {ord.cartitems && ord.cartitems.length > 0
                            ? ord.cartitems.map((i) => `${i.quantity}x ${i.productname || 'Item'}`).join(', ')
                            : 'Standard order'}
                        </div>
                      </td>

                      {/* Total & Payment */}
                      <td className="py-4 px-4">
                        <span className="font-aldrich font-bold text-white text-sm block">
                          GHS {Number(ord.total || 0).toFixed(2)}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black text-zinc-400 border border-zinc-800 inline-block mt-0.5">
                          {ord.payment_method_title || ord.payment_method?.toUpperCase() || 'COD'}
                        </span>
                      </td>

                      {/* Status & Quick Action Selector */}
                      <td className="py-4 pl-4">
                        <div className="flex items-center gap-2">
                          <select
                            disabled={updatingOrderId === ord.id}
                            value={ord.status}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value as any)}
                            className={`text-xs font-poppins font-semibold rounded-xl px-3 py-1.5 bg-black border focus:outline-none transition-all cursor-pointer ${
                              ord.status === 'delivered'
                                ? 'border-emerald-500/50 text-emerald-400'
                                : ord.status === 'shipped'
                                ? 'border-purple-500/50 text-purple-400'
                                : ord.status === 'processing'
                                ? 'border-blue-500/50 text-blue-400'
                                : ord.status === 'cancelled'
                                ? 'border-red-500/50 text-red-400'
                                : 'border-amber-400/50 text-amber-400'
                            }`}
                          >
                            <option value="pending" className="bg-zinc-950 text-amber-400">Pending Dispatch</option>
                            <option value="processing" className="bg-zinc-950 text-blue-400">Processing</option>
                            <option value="shipped" className="bg-zinc-950 text-purple-400">Dispatched</option>
                            <option value="delivered" className="bg-zinc-950 text-emerald-400">Delivered</option>
                            <option value="cancelled" className="bg-zinc-950 text-red-400">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 4. TWO-COLUMN EXECUTIVE WIDGETS: INVENTORY RADAR & DEPARTMENT HEALTH */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Inventory Radar & Low Stock Alerts (6 Cols) */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#111111] border border-zinc-800 shadow-xl space-y-4 text-left">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h3 className="font-raleway text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Inventory Radar</span>
              </h3>
              <p className="text-xs text-zinc-400 font-poppins">
                Items requiring restock replenishment from the central Accra warehouse.
              </p>
            </div>
            <Link
              to="/admin/products"
              className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>All Products</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-400 space-y-1">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="font-semibold text-white">All inventory stock levels healthy</p>
              <p className="text-[11px] text-zinc-500">Every catalog product has more than 5 units available.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div
                  key={p.productId || p.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-black border border-zinc-850 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.imageUrls?.[0] || p.image || '/images/cigar.png'}
                      alt={p.name}
                      className="w-11 h-11 rounded-xl object-cover bg-zinc-950 shrink-0 border border-zinc-800"
                    />
                    <div className="min-w-0">
                      <h4 className="font-poppins text-xs font-semibold text-white truncate max-w-[200px]">
                        {p.name}
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {p.categoryName || 'General'} • GHS {p.price}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold ${
                        p.stock === 0
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                      }`}
                    >
                      {p.stock === 0 ? 'Out of Stock' : `${p.stock} units left`}
                    </span>
                    <Link
                      to="/admin/products"
                      className="text-xs text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                      title="Edit Product"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Department Performance & Distribution (6 Cols) */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#111111] border border-zinc-800 shadow-xl space-y-4 text-left">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h3 className="font-raleway text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Department Distribution</span>
              </h3>
              <p className="text-xs text-zinc-400 font-poppins">
                Active catalog distribution across curated lifestyle departments.
              </p>
            </div>
            <Link
              to="/admin/categories"
              className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Add Department</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {categories.slice(0, 5).map((cat) => {
              const count = products.filter(
                (p) =>
                  p.categoryName?.toLowerCase().includes(cat.name.toLowerCase()) ||
                  p.category?.toLowerCase().includes(cat.name.toLowerCase())
              ).length;
              const percentage = products.length ? Math.round((count / products.length) * 100) : 0;

              return (
                <div key={cat.categoryId || cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-poppins">
                    <span className="font-semibold text-white">{cat.name}</span>
                    <span className="font-mono text-zinc-400 text-[11px]">
                      {count} items ({percentage}%)
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-black overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              to="/admin/categories"
              className="w-full py-3 rounded-xl bg-black border border-zinc-800 hover:border-zinc-700 text-xs font-poppins font-semibold text-zinc-300 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Grid className="w-4 h-4 text-amber-400" />
              <span>Manage All {categories.length} Categories</span>
            </Link>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. STOREFRONT LIVE CMS QUICK JUMP STATION */}
      {/* ========================================================================= */}
      <div className="p-7 rounded-3xl bg-gradient-to-r from-black via-[#111111] to-black border border-zinc-800/80 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Storefront Live On-Page Editor</span>
            </div>
            <h3 className="font-raleway text-lg font-bold text-white">
              Edit Captions, Contact Info & Media Live
            </h3>
            <p className="font-poppins text-xs text-zinc-400 max-w-xl">
              Open any public storefront page with Live Edit outlines enabled to change hero headlines, product graphics, phone hotlines, and descriptions.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Link
              to="/"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-200 hover:text-white font-poppins font-semibold transition-colors border border-zinc-800"
            >
              Home Page
            </Link>
            <Link
              to="/aboutus"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-200 hover:text-white font-poppins font-semibold transition-colors border border-zinc-800"
            >
              About Page
            </Link>
            <Link
              to="/contactus"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-200 hover:text-white font-poppins font-semibold transition-colors border border-zinc-800"
            >
              Contact Page
            </Link>
            <Link
              to="/shop"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-200 hover:text-white font-poppins font-semibold transition-colors border border-zinc-800"
            >
              Shop Catalog
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};
