import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Star, Check, ArrowRight } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

export const ProductQuickView: React.FC = () => {
  const { quickViewProduct, closeQuickView } = useProducts();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Sync selected image when modal opens
  React.useEffect(() => {
    if (quickViewProduct) {
      setSelectedImage(
        quickViewProduct.imageUrls?.[0] || quickViewProduct.image || '/images/cigar.png'
      );
      setQuantity(1);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const prodId = quickViewProduct.productId || quickViewProduct.id;
  const images = quickViewProduct.imageUrls?.length
    ? quickViewProduct.imageUrls
    : [quickViewProduct.image || '/images/cigar.png'];

  const hasSale =
    quickViewProduct.salePrice &&
    quickViewProduct.salePrice > 0 &&
    quickViewProduct.salePrice < quickViewProduct.price;

  const currentPrice = hasSale ? quickViewProduct.salePrice! : quickViewProduct.price;

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(quickViewProduct, quantity);
    setTimeout(() => {
      setIsAdding(false);
      closeQuickView();
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeQuickView}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#212121] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Close button */}
          <button
            onClick={closeQuickView}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/70 border border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Left: Image Showcase */}
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-between bg-black/40 border-r border-zinc-800">
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center p-6 mb-4">
              <img
                src={selectedImage}
                alt={quickViewProduct.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-lg overflow-hidden bg-black border p-1 flex items-center justify-center transition-all shrink-0 ${
                      selectedImage === img
                        ? 'border-amber-400 scale-95 shadow-md'
                        : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info and Actions */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-amber-400 font-mono uppercase font-bold tracking-wider">
                  {quickViewProduct.categoryName}
                </span>
                <div className="flex items-center text-amber-400 gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-semibold text-zinc-300">
                    {quickViewProduct.rating || 4.9}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h2 className="font-aldrich text-2xl font-bold text-white mb-3">
                {quickViewProduct.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-aldrich text-2xl font-bold text-amber-400">
                  {formatPrice(currentPrice)}
                </span>
                {hasSale && (
                  <span className="text-sm text-zinc-500 line-through font-aldrich">
                    {formatPrice(quickViewProduct.price)}
                  </span>
                )}
                {quickViewProduct.stock > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    In Stock ({quickViewProduct.stock})
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="font-poppins text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
                {quickViewProduct.description}
              </p>

              {/* Specs */}
              {quickViewProduct.specs && Object.keys(quickViewProduct.specs).length > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-black border border-zinc-800 text-xs space-y-1.5 font-poppins">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Specifications
                  </p>
                  {Object.entries(quickViewProduct.specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-zinc-800/60 last:border-0">
                      <span className="text-zinc-400 font-medium">{k}</span>
                      <span className="text-zinc-200 font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-zinc-700 rounded-lg bg-black overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-aldrich font-bold text-sm text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || quickViewProduct.stock === 0}
                  className={`flex-1 py-3 px-6 rounded font-poppins font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow active:scale-95 ${
                    quickViewProduct.stock === 0
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : isAdding
                      ? 'bg-emerald-500 text-black'
                      : 'bg-amber-400 hover:bg-amber-300 text-black'
                  }`}
                >
                  {isAdding ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart • {formatPrice(currentPrice * quantity)}</span>
                    </>
                  )}
                </button>
              </div>

              <Link
                to={`/product/${prodId}`}
                onClick={closeQuickView}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 font-poppins font-semibold py-1 transition-colors"
              >
                <span>View Full Product Page & Reviews</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
