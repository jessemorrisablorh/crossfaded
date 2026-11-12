import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

export const WishlistDrawer: React.FC = () => {
  const { wishlist, isWishlistOpen, closeWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const handleMoveToCart = async (product: any) => {
    await addToCart(product, 1);
    removeFromWishlist(product.productId || product.id);
  };

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWishlist}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-[#212121] border-l border-zinc-800 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <h2 className="font-raleway text-lg font-bold text-white">Saved Favorites</h2>
                  <span className="text-xs bg-amber-400/20 text-amber-400 font-bold px-2 py-0.5 rounded-full font-aldrich">
                    {wishlist.length}
                  </span>
                </div>
                <button
                  onClick={closeWishlist}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-black/30 transition-colors"
                  aria-label="Close wishlist"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {wishlist.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                    <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-4 text-zinc-600">
                      <Heart className="w-8 h-8" />
                    </div>
                    <p className="text-base font-semibold text-white mb-1 font-aldrich">Your wishlist is empty</p>
                    <p className="text-xs text-zinc-400 mb-6 font-poppins">
                      Click the heart icon on any accessory to save it for later.
                    </p>
                  </div>
                ) : (
                  wishlist.map((item) => {
                    const price = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
                    const img = item.imageUrls?.[0] || item.image || '/images/cigar.png';

                    return (
                      <div
                        key={item.productId || item.id}
                        className="flex gap-4 p-3 bg-black/50 hover:bg-black/70 border border-zinc-800 rounded-xl transition-all"
                      >
                        <img
                          src={img}
                          alt={item.name}
                          className="w-20 h-20 object-contain rounded-lg bg-black border border-zinc-800 p-1 shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-sm font-semibold text-white truncate font-poppins">
                                {item.name}
                              </h4>
                              <button
                                onClick={() => removeFromWishlist(item.productId || item.id)}
                                className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-xs text-amber-400 font-aldrich font-semibold mt-1">
                              {formatPrice(price)}
                            </p>
                          </div>

                          <button
                            onClick={() => handleMoveToCart(item)}
                            className="mt-2 w-full py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold rounded font-poppins flex items-center justify-center gap-1.5 transition-colors shadow"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Move to Cart</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
