import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export const CartPage: React.FC = () => {
  const { items, itemCount, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [orderNote, setOrderNote] = useState('');

  const freeDeliveryThreshold = 500;
  const isFreeDelivery = totalPrice >= freeDeliveryThreshold;
  const deliveryFee = items.length === 0 ? 0 : isFreeDelivery ? 0 : 35;
  const grandTotal = totalPrice + deliveryFee;

  const handleProceedToCheckout = () => {
    if (orderNote.trim()) {
      sessionStorage.setItem('crossfaded_order_note', orderNote.trim());
    }
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-black text-white py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        
        {/* Header (matching Flutter Cart header) */}
        <div className="mb-6 sm:mb-10 flex items-center justify-between">
          <h1 className="font-raleway text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Cart
          </h1>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-400 hover:text-red-300 font-poppins transition-colors"
            >
              Clear cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-[#212121] rounded-xl max-w-xl mx-auto p-4 sm:p-8">
            <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center mx-auto mb-4 text-zinc-500">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-aldrich text-xl sm:text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
            <p className="font-poppins text-xs text-zinc-400 mb-6">
              You haven't added any accessories to your bag yet.
            </p>
            <Link
              to="/shop"
              className="inline-block px-7 py-3 bg-amber-400 hover:bg-amber-300 text-black font-poppins font-semibold text-xs rounded transition-all shadow"
            >
              Explore our shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-start">
            
            {/* Left: Cart Items List (Colors.grey[900] #212121) */}
            <div className="lg:col-span-8 bg-[#212121] rounded-xl p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
              <div className="divide-y divide-zinc-800">
                {items.map((item) => (
                  <div key={item.id} className="py-4 sm:py-6 first:pt-0 last:pb-0 flex flex-row gap-3 sm:gap-5 items-center">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-lg p-1.5 sm:p-2 flex items-center justify-center shrink-0">
                      <img
                        src={item.productimage || '/images/cigar.png'}
                        alt={item.productname}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Details (matching Flutter layout & typography) */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-poppins text-sm sm:text-base font-semibold text-white truncate">
                        {item.productname}
                      </h3>
                      
                      <p className="text-xs font-poppins text-zinc-300">
                        <span className="font-aldrich text-amber-400 font-semibold mr-2">Quantity:</span>
                        <span>{item.quantity}</span>
                      </p>

                      <p className="text-xs font-poppins text-zinc-300">
                        <span className="font-aldrich text-amber-400 font-semibold mr-2">Price:</span>
                        <span>{formatPrice(item.price)}</span>
                      </p>

                      <p className="text-xs font-poppins text-zinc-300">
                        <span className="font-aldrich text-amber-400 font-semibold mr-2">Total Price:</span>
                        <span className="font-aldrich text-white mr-1">{item.quantity} X {formatPrice(item.price)} = </span>
                        <span className="font-poppins font-semibold text-white">{formatPrice(item.price * item.quantity)}</span>
                      </p>

                      {/* Quantity buttons */}
                      <div className="flex items-center gap-3 pt-2">
                        <div className="flex items-center border border-zinc-700 rounded bg-black">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-zinc-400 hover:text-white"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-mono font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-zinc-400 hover:text-white"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Icon */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-500 hover:text-red-400 transition-colors self-end sm:self-center"
                      title="Delete item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Order Note */}
              <div className="pt-6 border-t border-zinc-800">
                <label className="block text-xs font-semibold text-zinc-300 mb-2 font-poppins">
                  Order Note / Special Delivery Instructions
                </label>
                <textarea
                  rows={3}
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Note..."
                  className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Right: Total Summary (Colors.grey[900] #212121) */}
            <div className="lg:col-span-4 bg-[#212121] rounded-xl p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 sticky top-28">
              <div>
                <span className="font-raleway text-2xl font-bold text-zinc-400 block mb-1">
                  Total:
                </span>
                <span className="font-aldrich text-3xl sm:text-4xl font-bold text-amber-400">
                  {formatPrice(grandTotal)}
                </span>
              </div>

              <div className="space-y-2 text-xs font-poppins pt-2 border-t border-zinc-800 text-zinc-300">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span className="text-white font-mono">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span className="font-mono">
                    {deliveryFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : formatPrice(deliveryFee)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-poppins font-semibold text-xs rounded transition-all shadow flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
