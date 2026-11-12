import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useCurrency();

  const prodId = product.productId || product.id || '';
  const mainImage = product.imageUrls?.[0] || product.image || '/images/cigar.png';
  const inWishlist = isInWishlist(prodId);

  const hasSale =
    product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
  const currentPrice = hasSale ? product.salePrice! : product.price;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative flex flex-col justify-between bg-gradient-to-b from-[#1c1c1c] to-[#131313] rounded-lg overflow-hidden transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.85),0_0_1px_rgba(255,255,255,0.08)] hover:shadow-[0_22px_45px_rgba(0,0,0,0.95),0_0_24px_rgba(251,191,36,0.16)] hover:-translate-y-1.5">
      
      {/* Full-Width Edge-to-Edge Image Container */}
      <div className="relative w-full aspect-square bg-[#0b0b0b] overflow-hidden">
        <Link to={`/product/${prodId}`} className="block w-full h-full">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-108"
            loading="lazy"
          />
          {/* Subtle bottom vignette gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#131313]/90 via-transparent to-transparent pointer-events-none" />
        </Link>

        {/* Badges: Sale / Hot */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none z-10">
          {hasSale ? (
            <span className="px-2.5 py-1 rounded bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider shadow-lg">
              SALE
            </span>
          ) : product.featured ? (
            <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider shadow-lg">
              HOT
            </span>
          ) : null}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg ${
            inWishlist
              ? 'bg-amber-400 text-black shadow-amber-400/30 scale-105'
              : 'bg-black/60 text-zinc-300 hover:text-white hover:scale-105'
          }`}
          title={inWishlist ? 'Remove from favorites' : 'Add to favorites'}
          aria-label="Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-black' : ''}`} />
        </button>
      </div>

      {/* Product Details Section */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between space-y-2">
        <div>
          {/* Category Tag */}
          <span className="text-[9px] sm:text-[10px] font-mono uppercase font-bold tracking-widest text-amber-400/90 block truncate">
            {product.categoryName || 'Accessories'}
          </span>

          {/* Product Title */}
          <Link to={`/product/${prodId}`} className="block mt-0.5 sm:mt-1">
            <h3 className="font-aldrich text-xs sm:text-sm md:text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Star Rating */}
          <div className="flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-[10px] sm:text-[11px] text-zinc-400 font-mono">
              {product.rating || 4.9}
            </span>
          </div>
        </div>

        {/* Pricing & Stock Status */}
        <div className="pt-1.5 sm:pt-2 flex items-center justify-between gap-1 flex-wrap">
          <div className="flex items-baseline gap-1.5">
            <span className="font-aldrich text-sm sm:text-base md:text-lg font-bold text-amber-400">
              {formatPrice(currentPrice)}
            </span>
            {hasSale && (
              <span className="font-aldrich text-[10px] sm:text-xs text-zinc-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {product.stock > 0 && product.stock <= 5 ? (
            <span className="text-[9px] sm:text-[10px] font-mono text-amber-400 font-semibold px-1.5 py-0.5 rounded bg-amber-400/10">
              {product.stock} left
            </span>
          ) : product.stock === 0 ? (
            <span className="text-[9px] sm:text-[10px] font-mono text-zinc-500 font-semibold">
              Sold Out
            </span>
          ) : (
            <span className="text-[9px] sm:text-[10px] font-mono text-emerald-400/90 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              In Stock
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
