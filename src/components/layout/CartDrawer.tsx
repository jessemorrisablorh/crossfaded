import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, closeCart, items, itemCount, totalPrice, updateQuantity, removeFromCart } =
    useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const freeDeliveryThreshold = 500;
  const progressPercent = Math.min(100, (totalPrice / freeDeliveryThreshold) * 100);
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - totalPrice);

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleViewCartClick = () => {
    closeCart();
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-[#212121] border-l border-zinc-800 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-black/40">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <h2 className="font-raleway text-lg font-bold text-white">Your Cart</h2>
                  <span className="text-xs bg-amber-400/20 text-amber-400 font-bold px-2 py-0.5 rounded-full font-aldrich">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <button
                  onClick={closeCart}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-black/30 transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Delivery Bar */}
              <div className="p-3.5 sm:p-4 bg-black/30 border-b border-zinc-800 font-poppins">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  {remainingForFreeDelivery === 0 ? (
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Congratulations! You unlocked FREE Delivery!
                    </span>
                  ) : (
                    <span className="text-zinc-300">
                      Add <span className="text-amber-400 font-bold">{formatPrice(remainingForFreeDelivery)}</span> more for Free Delivery
                    </span>
                  )}
                  <span className="text-zinc-400 font-mono text-[11px]">{progressPercent.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-black h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 sm:space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                    <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-4 text-zinc-500">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <p className="text-base font-semibold text-white mb-1 font-aldrich">Your cart is empty</p>
                    <p className="text-xs text-zinc-400 mb-6 font-poppins">
                      Explore our curated collection of premium accessories.
                    </p>
                    <button
                      onClick={() => {
                        closeCart();
                        navigate('/shop');
                      }}
                      className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs rounded transition-all shadow font-poppins"
                    >
                      Browse Our Shop
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 sm:gap-4 p-2.5 sm:p-3 bg-black/50 hover:bg-black/70 border border-zinc-800 rounded-xl transition-all"
                    >
                      <img
                        src={item.productimage || '/images/cigar.png'}
                        alt={item.productname}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg bg-black border border-zinc-800 p-1 shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs sm:text-sm font-semibold text-white truncate font-poppins">
                              {item.productname}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-amber-400 font-aldrich font-semibold mt-1">
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-zinc-700 rounded-md overflow-hidden bg-black">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-semibold text-white font-aldrich">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs font-semibold text-zinc-300 font-aldrich">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer / Summary */}
              {items.length > 0 && (
                <div className="p-3.5 sm:p-5 border-t border-zinc-800 bg-black/60 space-y-3 sm:space-y-4 font-poppins">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400 font-medium font-raleway">Subtotal</span>
                    <span className="text-xl font-bold font-aldrich text-amber-400">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Taxes and delivery calculated at checkout.</p>

                  <div className="space-y-2">
                    <button
                      onClick={handleCheckoutClick}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm rounded tracking-wide transition-all shadow active:scale-[0.99]"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleViewCartClick}
                      className="w-full py-2.5 bg-black hover:bg-zinc-900 text-zinc-300 text-xs font-semibold rounded border border-zinc-700 transition-colors"
                    >
                      View Cart & Edit Note
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
