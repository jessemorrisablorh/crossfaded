import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  MessageCircle,
  Package,
  ArrowRight,
  Truck,
  Copy,
  Check,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  Phone,
  Bike,
  Star,
  Send,
  ThumbsUp,
  Sparkles,
} from 'lucide-react';
import { firestoreService } from '../services/firestoreService';
import { Order } from '../types';

export const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const rawId = searchParams.get('orderId') || '';
  const numParam = searchParams.get('num') || '';
  const [orderId, setOrderId] = useState(numParam || rawId);
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(Boolean(rawId));

  // Post-purchase product ratings state
  const [ratedItems, setRatedItems] = useState<{
    [productId: string]: { rating: number; comment: string; submitted: boolean; newRating?: number };
  }>({});
  const [hoverRating, setHoverRating] = useState<{ [productId: string]: number }>({});
  const [isSubmittingRating, setIsSubmittingRating] = useState<{ [productId: string]: boolean }>({});

  const handleRatingSubmit = async (item: any) => {
    const pId = item.productId || item.productid || item.id;
    if (!pId) return;
    const currentRating = ratedItems[pId]?.rating || 5;
    const currentComment = ratedItems[pId]?.comment || '';

    setIsSubmittingRating((prev) => ({ ...prev, [pId]: true }));
    try {
      const customerName =
        order?.customerName ||
        `${order?.firstname || ''} ${order?.lastname || ''}`.trim() ||
        'Verified Buyer';

      const result = await firestoreService.submitProductReview(
        pId,
        currentRating,
        currentComment,
        customerName,
        order?.id
      );

      setRatedItems((prev) => ({
        ...prev,
        [pId]: {
          rating: currentRating,
          comment: currentComment,
          submitted: true,
          newRating: result.newRating,
        },
      }));

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#10b981', '#ffffff'],
      });
    } catch (err) {
      console.error('Failed to submit product rating:', err);
    } finally {
      setIsSubmittingRating((prev) => ({ ...prev, [pId]: false }));
    }
  };

  useEffect(() => {
    // Launch celebratory confetti burst
    const end = Date.now() + 1800;
    const colors = ['#f59e0b', '#fbbf24', '#ffffff', '#10b981'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  // Fetch / Subscribe to real order details from Cloud Firestore
  useEffect(() => {
    if (!rawId) {
      setLoading(false);
      return;
    }

    const unsub = firestoreService.subscribeOrderById(rawId, (fetchedOrder) => {
      if (fetchedOrder) {
        setOrder(fetchedOrder);
        setOrderId(fetchedOrder.orderNumber || fetchedOrder.id);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [rawId]);

  const displayId = order?.orderNumber || numParam || order?.id || orderId || 'CF-CONFIRMED';

  const handleCopyId = () => {
    navigator.clipboard.writeText(displayId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = order?.date_created?.seconds
    ? new Date(order.date_created.seconds * 1000).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  const whatsappMessage = encodeURIComponent(
    `Hello CrossFaded GH! I just placed order #${displayId}. Please confirm dispatch to ${order?.placename || order?.address || 'my address'}. Total: GHS ${order?.total || ''}.`
  );
  const whatsappUrl = `https://wa.me/233543236328?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-black py-6 sm:py-12 flex items-center justify-center">
      <div className="max-w-3xl w-full mx-auto px-2.5 sm:px-6">
        <div className="p-3.5 sm:p-8 rounded-2xl bg-[#212121] border border-zinc-800 text-center shadow-2xl relative overflow-hidden space-y-5 sm:space-y-7">
          
          {/* Amber luxury gradient accent top bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500" />

          {/* Celebratory Icon & Order Successful Header */}
          <div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-3 sm:mb-4 text-emerald-400 shadow-xl shadow-emerald-500/10 animate-fade-in">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
              <Check className="w-3.5 h-3.5" />
              <span>Purchase Completed</span>
            </div>

            <h1 className="font-raleway text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
              Order Successful!
            </h1>
          </div>

          {/* Prominent Rider On The Way Banner */}
          <div className="p-3 sm:p-5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-black/80 to-amber-950/30 border border-emerald-500/30 text-left flex items-start gap-3 sm:gap-4 shadow-lg animate-fade-in">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xl sm:text-2xl shrink-0 shadow-md">
              🏍️
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-raleway text-sm sm:text-lg font-bold text-white tracking-wide">
                  A rider will be on the way soon
                </h3>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Dispatch Queued
                </span>
              </div>
              <p className="font-poppins text-xs text-zinc-300 mt-1 leading-relaxed">
                Your luxury smoking accessories are being packaged discretely. Our dispatch rider will contact you directly on your phone prior to arrival.
              </p>
            </div>
          </div>

          {/* Prominent Order ID Box for Tracking with Click-to-Copy */}
          <div className="p-3.5 sm:p-6 rounded-xl bg-black/95 border-2 border-amber-400/40 shadow-inner max-w-xl mx-auto text-center space-y-2.5 sm:space-y-3 relative">
            <span className="text-[10px] sm:text-[11px] text-amber-400 uppercase tracking-widest font-mono font-bold block">
              Order ID for Order Tracking
            </span>

            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <span className="font-mono text-xl sm:text-3xl md:text-4xl font-extrabold text-amber-400 tracking-wider select-all">
                #{displayId}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white border border-zinc-700 transition-all active:scale-95 shadow-sm"
                title="Copy Order ID to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] font-poppins text-zinc-400">
              Use your Order ID <strong className="text-amber-400 font-mono">#{displayId}</strong> to track your order anytime at <strong className="text-zinc-200">crossfaded.com/track</strong>.
            </p>
          </div>

          {/* Primary Action Button: Track Order Live */}
          <div className="max-w-xl mx-auto">
            <Link
              to={`/track?orderId=${displayId}`}
              className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2.5 font-raleway"
            >
              <Truck className="w-5 h-5 text-black" />
              <span>Track Order Live with Order ID</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </Link>
          </div>

          {/* Live Dispatch Progression Steps */}
          <div className="p-5 sm:p-6 rounded-2xl bg-black/60 border border-zinc-800 text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <h3 className="font-aldrich text-xs font-bold uppercase tracking-wider text-white">
                  Live Dispatch Progression
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[11px] font-mono font-bold">
                <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                {order?.status === 'shipped'
                  ? 'Out for Delivery'
                  : order?.status === 'processing'
                  ? 'Processing Order'
                  : 'Pending Dispatch'}
              </span>
            </div>

            {/* 4 Steps Visual Timeline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-1">
              <div className="p-3 rounded-xl bg-black/80 border border-emerald-500/40 text-emerald-400">
                <span className="text-xs font-mono font-bold block mb-1">✓ Step 1</span>
                <p className="text-xs font-semibold text-white font-poppins">Order Placed</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Recorded in system</p>
              </div>

              <div className={`p-3 rounded-xl border ${
                order?.status === 'processing' || order?.status === 'shipped' || order?.status === 'delivered'
                  ? 'bg-black/80 border-emerald-500/40 text-emerald-400'
                  : 'bg-black/80 border-amber-400 text-amber-400 animate-pulse'
              }`}>
                <span className="text-xs font-mono font-bold block mb-1">Step 2</span>
                <p className="text-xs font-semibold text-white font-poppins">Packaging</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Discrete wrapping</p>
              </div>

              <div className={`p-3 rounded-xl border ${
                order?.status === 'shipped' || order?.status === 'delivered'
                  ? 'bg-black/80 border-emerald-500/40 text-emerald-400'
                  : 'bg-black/40 border-zinc-800 text-zinc-600'
              }`}>
                <span className="text-xs font-mono font-bold block mb-1">Step 3</span>
                <p className="text-xs font-semibold text-zinc-300 font-poppins">Rider on the Way</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Rider calls on arrival</p>
              </div>

              <div className={`p-3 rounded-xl border ${
                order?.status === 'delivered'
                  ? 'bg-black/80 border-emerald-500/40 text-emerald-400'
                  : 'bg-black/40 border-zinc-800 text-zinc-600'
              }`}>
                <span className="text-xs font-mono font-bold block mb-1">Step 4</span>
                <p className="text-xs font-semibold text-zinc-300 font-poppins">Delivered</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Cash on delivery</p>
              </div>
            </div>
          </div>

          {/* Delivery & Summary Details (if order loaded) */}
          {order && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left">
              
              {/* Delivery Info */}
              <div className="p-3.5 sm:p-5 rounded-xl bg-black/60 border border-zinc-800 space-y-2 font-poppins text-xs text-zinc-300">
                <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-xs font-aldrich uppercase tracking-wider text-white">Delivery Destination</span>
                </div>
                <p className="text-white font-semibold">
                  {order.customerName || `${order.firstname || ''} ${order.lastname || ''}`.trim() || 'Recipient'}
                </p>
                <p className="text-zinc-400 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-amber-400" />
                  <span>{order.phone}</span>
                </p>
                <p className="text-zinc-300 text-xs">
                  {order.placename || order.address}, {order.city}, {order.region}
                </p>
                {typeof order.distance_km === 'number' && order.distance_km > 0 && (
                  <p className="text-[11px] font-mono text-amber-400/90 pt-1">
                    Distance: {order.distance_km} km from Store
                  </p>
                )}
                <div className="pt-2 text-[11px] text-zinc-400 border-t border-zinc-800/80">
                  <span className="text-zinc-500">Payment: </span>
                  <strong className="text-amber-400">Cash on Delivery (Pay rider upon arrival)</strong>
                </div>
              </div>

              {/* Order Financials */}
              <div className="p-3.5 sm:p-5 rounded-xl bg-black/60 border border-zinc-800 space-y-2 font-poppins text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
                  <Package className="w-3.5 h-3.5" />
                  <span className="text-xs font-aldrich uppercase tracking-wider text-white">
                    Order Items ({order.cartitems?.length || 0})
                  </span>
                </div>

                <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                  {order.cartitems?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-zinc-300 text-[11px]">
                      <span className="truncate max-w-[180px]">
                        {item.quantity}× {item.productname}
                      </span>
                      <span className="font-mono text-white">
                        GHS {(Number(item.price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-zinc-800 space-y-1">
                  {typeof order.delivery_fee === 'number' && (
                    <div className="flex justify-between text-zinc-400 text-[11px]">
                      <span>Delivery Fee</span>
                      <span className="font-mono text-white">GHS {order.delivery_fee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-white text-xs pt-1 border-t border-zinc-800">
                    <span>Total Amount (Pay on Delivery)</span>
                    <span className="font-aldrich text-amber-400 text-sm">
                      GHS {Number(order.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Rate Purchased Products Section */}
          {order?.cartitems && order.cartitems.length > 0 && (
            <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-[#1c1c1c] to-black border-2 border-amber-400/40 text-left space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <h3 className="font-raleway text-sm sm:text-base font-bold text-white tracking-wide uppercase">
                    Rate Your Purchased Item{order.cartitems.length > 1 ? 's' : ''}
                  </h3>
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono text-amber-400 font-semibold uppercase px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30">
                  Verified Order
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-poppins">
                Help fellow connoisseurs in Accra & Ghana know how this piece performs. Your rating instantly updates our store catalog score!
              </p>

              <div className="space-y-4 pt-1">
                {order.cartitems.map((item, idx) => {
                  const pId = item.productId || (item as any).productid || (item as any).id || `item-${idx}`;
                  const pImage = item.productimage;
                  const pName = item.productname || 'CrossFaded Item';
                  const state = ratedItems[pId] || { rating: 5, comment: '', submitted: false };
                  const activeHover = hoverRating[pId] || 0;
                  const isSubmitting = Boolean(isSubmittingRating[pId]);

                  return (
                    <div
                      key={idx}
                      className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {pImage && (
                          <img
                            src={pImage}
                            alt={pName}
                            className="w-12 h-12 rounded-lg object-cover bg-black border border-zinc-700 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/crushers.jpeg';
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-xs sm:text-sm font-bold font-raleway truncate">
                            {pName}
                          </h4>
                          <span className="text-[11px] text-zinc-400 font-poppins">
                            Quantity: {item.quantity} · GHS {Number(item.price || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {state.submitted ? (
                        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-emerald-400 animate-fade-in">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-poppins font-semibold">
                              Thank you! You rated this product {state.rating} ★
                            </span>
                          </div>
                          {state.newRating && (
                            <span className="text-[11px] font-mono font-bold text-amber-400 bg-black/60 px-2 py-0.5 rounded border border-amber-400/30">
                              Catalog Score: {state.newRating} ★
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {/* Star picker */}
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const isFilled = (activeHover || state.rating) >= star;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => {
                                    setRatedItems((prev) => ({
                                      ...prev,
                                      [pId]: {
                                        ...prev[pId],
                                        rating: star,
                                        comment: prev[pId]?.comment || '',
                                        submitted: false,
                                      },
                                    }));
                                  }}
                                  onMouseEnter={() => setHoverRating((prev) => ({ ...prev, [pId]: star }))}
                                  onMouseLeave={() => setHoverRating((prev) => ({ ...prev, [pId]: 0 }))}
                                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                                  title={`Rate ${star} Stars`}
                                >
                                  <Star
                                    className={`w-6 h-6 ${
                                      isFilled ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                            <span className="text-xs font-mono font-semibold text-amber-400 ml-2">
                              {(activeHover || state.rating)} / 5 Stars
                            </span>
                          </div>

                          {/* Optional comment */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={state.comment}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRatedItems((prev) => ({
                                  ...prev,
                                  [pId]: {
                                    ...prev[pId],
                                    rating: prev[pId]?.rating || 5,
                                    comment: val,
                                    submitted: false,
                                  },
                                }));
                              }}
                              placeholder="Write a quick comment (e.g. Smooth pull, excellent quality)..."
                              className="flex-1 px-3 py-2 bg-black border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-poppins"
                            />
                            <button
                              type="button"
                              onClick={() => handleRatingSubmit(item)}
                              disabled={isSubmitting}
                              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shrink-0 font-poppins"
                            >
                              {isSubmitting ? (
                                <span className="animate-spin text-xs">⏳</span>
                              ) : (
                                <Send className="w-3.5 h-3.5" />
                              )}
                              <span>Submit Rating</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional Action Buttons */}
          <div className="space-y-3 font-poppins pt-2">
            {/* WhatsApp Priority Dispatch Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Confirm on WhatsApp for Priority Dispatch</span>
            </a>

            {/* Secondary navigation */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/orders"
                className="py-3 bg-black hover:bg-zinc-900 text-zinc-200 font-semibold text-xs rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4 text-amber-400" />
                <span>My Orders History</span>
              </Link>

              <Link
                to="/shop"
                className="py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
