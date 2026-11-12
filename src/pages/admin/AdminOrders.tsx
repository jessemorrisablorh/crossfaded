import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, AlertCircle, Phone, MapPin, Eye, X } from 'lucide-react';
import { firestoreService } from '../../services/firestoreService';
import { useToast } from '../../context/ToastContext';
import { Order } from '../../types';

export const AdminOrders: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'delivered' | 'cancelled'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const unsub = firestoreService.subscribeAllOrders((allOrders) => {
      setOrders(allOrders);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await firestoreService.updateOrderStatus(orderId, newStatus);
      success(`Order status updated to ${newStatus}`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.error(err);
      toastError('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-raleway text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Order Fulfillment Center
          </h1>
          <p className="font-poppins text-xs text-zinc-400 mt-1">
            Track customer deliveries, update fulfillment stages, and review order notes.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              statusFilter === 'all' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              statusFilter === 'pending' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Pending ({orders.filter((o) => o.status === 'pending').length})
          </button>
          <button
            onClick={() => setStatusFilter('delivered')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              statusFilter === 'delivered' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Delivered ({orders.filter((o) => o.status === 'delivered').length})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              statusFilter === 'cancelled' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Cancelled ({orders.filter((o) => o.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800 overflow-hidden backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-[11px] text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-4">Ref #</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Delivery Destination</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Update Status</th>
                <th className="p-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-amber-400">
                    #{ord.id.slice(0, 7).toUpperCase()}
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-white font-poppins">
                      {ord.customerName || `${ord.firstname || ''} ${ord.lastname || ''}` || 'Customer'}
                    </p>
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      {ord.phone}
                    </p>
                  </td>
                  <td className="p-4 max-w-xs">
                    <p className="text-zinc-200 truncate">{ord.address}</p>
                    <p className="text-[11px] text-zinc-500">{ord.city}, {ord.region}</p>
                  </td>
                  <td className="p-4 font-mono text-zinc-400">
                    {ord.cartitems?.length || 1} items
                  </td>
                  <td className="p-4 font-mono font-bold text-white">
                    GHS {Number(ord.total || 0).toFixed(2)}
                  </td>
                  <td className="p-4">
                    <select
                      value={ord.status}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value as any)}
                      className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Inspect full order"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-zinc-800 pb-4 mb-6">
              <span className="text-amber-500 font-mono text-xs uppercase tracking-widest font-bold">
                Order Details
              </span>
              <h2 className="font-raleway text-xl font-bold text-white mt-1">
                #{selectedOrder.id}
              </h2>
            </div>

            <div className="space-y-6 text-xs font-poppins">
              {/* Customer info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div>
                  <p className="text-[11px] text-zinc-500 font-bold uppercase">Customer</p>
                  <p className="text-sm font-semibold text-white mt-1">
                    {selectedOrder.customerName || `${selectedOrder.firstname || ''} ${selectedOrder.lastname || ''}`}
                  </p>
                  <p className="text-zinc-400">{selectedOrder.phone}</p>
                  {selectedOrder.email && <p className="text-zinc-500">{selectedOrder.email}</p>}
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500 font-bold uppercase">Delivery Destination</p>
                  <p className="text-zinc-200 mt-1 font-medium">{selectedOrder.placename || selectedOrder.address}</p>
                  <p className="text-zinc-400">{selectedOrder.city}, {selectedOrder.region}</p>
                  {typeof selectedOrder.distance_km === 'number' && selectedOrder.distance_km > 0 && (
                    <p className="text-amber-400 font-mono text-[11px] mt-1">
                      Distance: {selectedOrder.distance_km} km | Delivery Fee: GHS {selectedOrder.delivery_fee?.toFixed(2) || '0.00'}
                    </p>
                  )}
                  {typeof selectedOrder.lat === 'number' && typeof selectedOrder.lng === 'number' && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedOrder.lat},${selectedOrder.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:underline mt-1.5 font-mono"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Open in Google Maps ({selectedOrder.lat.toFixed(3)}, {selectedOrder.lng.toFixed(3)})</span>
                    </a>
                  )}
                  {selectedOrder.note && (
                    <p className="text-amber-400 mt-2 italic">Note: "{selectedOrder.note}"</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Purchased Items ({selectedOrder.cartitems?.length || 0})
                </p>
                <div className="space-y-2 divide-y divide-zinc-800">
                  {selectedOrder.cartitems?.map((item, idx) => (
                    <div key={idx} className="pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productimage || '/images/cigar.png'}
                          alt={item.productname}
                          className="w-12 h-12 object-cover rounded-xl bg-zinc-900 border border-zinc-800"
                        />
                        <div>
                          <p className="font-semibold text-white">{item.productname}</p>
                          <p className="text-[11px] text-zinc-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-amber-400">
                        GHS {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-zinc-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Grand Total Amount Due</span>
                <span className="font-aldrich text-2xl font-bold text-amber-400">
                  GHS {Number(selectedOrder.total || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

