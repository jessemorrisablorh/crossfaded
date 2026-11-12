import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Zap,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Check,
  ChevronRight,
  Share2,
  Sparkles,
  Heart,
  Send,
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { ProductCard } from '../components/shop/ProductCard';
import { firestoreService } from '../services/firestoreService';

interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
}

export const ProductDetailsPage: React.FC = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Support both /product/:id and /product-details?id=...
  const productId = params.id || searchParams.get('id') || '';

  const { products, getProductById } = useProducts();
  const { addToCart } = useCart();
  const { success } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useCurrency();

  const product = getProductById(productId);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  // Customer Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'rev-1',
      name: 'Kwame B. - Verified Buyer',
      rating: 5,
      date: '2 days ago',
      comment: 'Top tier quality. The weight and smoothness of the grind is unreal. Delivered right to my door in East Legon in under 3 hours.',
    },
    {
      id: 'rev-2',
      name: 'Nana Ama S. - Verified Buyer',
      rating: 5,
      date: '1 week ago',
      comment: 'Beautiful design, looks like a piece of art on my living room coffee table. Best vibe store in Ghana.',
    },
  ]);

  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

  // Update selected image on product change
  useEffect(() => {
    if (product) {
      setSelectedImage(product.imageUrls?.[0] || product.image || '/images/cigar.png');
      setQuantity(1);
      window.scrollTo(0, 0);
    }
  }, [product, productId]);

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-black flex flex-col items-center justify-center text-center p-6 text-zinc-400">
        <Sparkles className="w-12 h-12 text-zinc-600 mb-4" />
        <h2 className="font-aldrich text-2xl font-bold text-white mb-2">Product Not Found</h2>
        <p className="text-xs text-zinc-400 mb-6 max-w-sm">
          The requested product may have been moved or is temporarily unavailable.
        </p>
        <Link
          to="/shop"
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-xl transition-all"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const prodId = product.productId || product.id || '';
  const inWishlist = isInWishlist(prodId);
  const images = product.imageUrls?.length
    ? product.imageUrls
    : [product.image || '/images/cigar.png'];

  const hasSale = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
  const currentPrice = hasSale ? product.salePrice! : product.price;

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(product, quantity);
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleBuyNow = async () => {
    await addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      success('Product link copied to clipboard!');
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewText.trim()) return;

    const newRev: ReviewItem = {
      id: 'rev_' + Date.now(),
      name: `${newReviewName.trim()} - Verified Buyer`,
      rating: newReviewRating,
      date: 'Just now',
      comment: newReviewText.trim(),
    };

    setReviews([newRev, ...reviews]);
    const submittedName = newReviewName.trim();
    const submittedText = newReviewText.trim();
    const submittedRating = newReviewRating;

    setNewReviewName('');
    setNewReviewText('');
    setNewReviewRating(5);
    success('Thank you! Your verified review has been posted.');

    // Sync to Firestore and dynamically update product rating
    const targetId = product.productId || product.id || '';
    if (targetId) {
      try {
        await firestoreService.submitProductReview(
          targetId,
          submittedRating,
          submittedText,
          submittedName
        );
      } catch (err) {
        console.warn('Could not sync review to Firestore:', err);
      }
    }
  };

  // Related products from same category
  const relatedProducts = products
    .filter(
      (p) =>
        (p.productId !== product.productId && p.id !== product.id) &&
        (p.categoryName === product.categoryName || p.categoryId === product.categoryId)
    )
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-black py-6 sm:py-10 pb-20 sm:pb-12">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4 sm:mb-8 font-poppins overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-amber-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          <Link to="/shop" className="hover:text-amber-400 transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          <Link
            to={`/products-by-category?category=${encodeURIComponent(product.categoryName)}`}
            className="hover:text-amber-400 transition-colors"
          >
            {product.categoryName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          <span className="text-amber-400 font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Main Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-14 mb-10 sm:mb-20">
          
          {/* Left: Gallery (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#212121] border border-zinc-800 shadow-2xl p-3.5 sm:p-8 flex items-center justify-center">
              <img
                src={selectedImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain transition-all duration-300"
              />

              {hasSale && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-amber-400 text-black text-xs font-bold uppercase rounded shadow-md">
                  SALE
                </div>
              )}

              {/* Action buttons (Wishlist & Share) */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-2.5 rounded-full backdrop-blur border transition-all ${
                    inWishlist
                      ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                      : 'bg-black/60 border-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                  title={inWishlist ? 'Remove from favorites' : 'Save to favorites'}
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-amber-400' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-black/60 backdrop-blur border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
                  title="Share product"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Thumbnail Carousel */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-xl overflow-hidden bg-[#212121] border p-2 flex items-center justify-center transition-all shrink-0 ${
                      selectedImage === img
                        ? 'border-amber-400 scale-95 shadow-lg'
                        : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info, Price, Actions (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-amber-400 font-mono uppercase font-bold tracking-wider">
                  {product.categoryName}
                </span>
                <div className="flex items-center text-amber-400 gap-1">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="font-semibold text-zinc-200">{product.rating || 4.9}</span>
                  <span className="text-zinc-500">({reviews.length} reviews)</span>
                </div>
              </div>

              <h1 className="font-aldrich text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4 leading-snug">
                {product.name}
              </h1>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 mb-6 p-4 rounded-xl bg-[#212121] border border-zinc-800">
                <span className="font-aldrich text-3xl font-bold text-amber-400">
                  {formatPrice(currentPrice)}
                </span>
                {hasSale && (
                  <span className="text-base text-zinc-500 line-through font-aldrich">
                    {formatPrice(product.price)}
                  </span>
                )}
                <div className="ml-auto">
                  {product.stock > 0 ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                      In Stock ({product.stock})
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                      Sold Out
                    </span>
                  )}
                </div>
              </div>

              {/* Description preview */}
              <p className="font-poppins text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Highlights */}
              <div className="space-y-3 p-4 rounded-xl bg-[#212121] border border-zinc-800 text-xs text-zinc-300 mb-8 font-poppins">
                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Free express delivery across Accra on orders over GHS 500</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>100% Guaranteed authentic precision hardware</span>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Cash on Delivery (COD) supported</span>
                </div>
              </div>
            </div>

            {/* Quantity and CTA Buttons */}
            <div className="space-y-3 pt-6 border-t border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-zinc-700 rounded-lg bg-black overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 text-zinc-400 hover:text-white transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-aldrich font-bold text-sm text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-3 text-zinc-400 hover:text-white transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || product.stock === 0}
                  className={`flex-1 py-3.5 px-6 rounded-lg font-poppins font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                    product.stock === 0
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : isAdding
                      ? 'bg-emerald-500 text-black'
                      : 'bg-[#212121] hover:bg-zinc-800 text-white border border-zinc-700'
                  }`}
                >
                  {isAdding ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-amber-400" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>

              {/* Buy Now direct button */}
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="w-full py-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-poppins font-semibold text-xs uppercase tracking-widest rounded transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Instant Buy Now • {formatPrice(currentPrice * quantity)}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Detailed Tabs: Description, Specs, Reviews */}
        <div className="mb-20">
          <div className="flex border-b border-zinc-800 mb-8">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-4 px-6 text-sm font-semibold tracking-wide transition-colors border-b-2 ${
                activeTab === 'desc'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Product Description
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-4 px-6 text-sm font-semibold tracking-wide transition-colors border-b-2 ${
                activeTab === 'specs'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 px-6 text-sm font-semibold tracking-wide transition-colors border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Verified Reviews ({reviews.length})
            </button>
          </div>

          <div className="p-4 sm:p-8 rounded-xl bg-[#212121] border border-zinc-800">
            {activeTab === 'desc' && (
              <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed space-y-4 font-poppins">
                <p>{product.description}</p>
                <p>
                  Every piece in the CrossFaded collection is quality checked by our team in Accra. Whether you're relaxing after hours, rolling for a weekend vibe, or building a home sanctuary, this accessory is manufactured to deliver supreme durability and effortless aesthetics.
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specs && Object.keys(product.specs).length > 0 ? (
                  Object.entries(product.specs).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs"
                    >
                      <span className="text-zinc-400 font-medium">{k}</span>
                      <span className="text-white font-semibold">{v}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 col-span-2">
                    Standard specifications apply for this accessory category.
                  </p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="text-center pr-6 border-r border-zinc-800">
                    <span className="font-aldrich text-3xl font-bold text-amber-400">
                      {product.rating || 4.9}
                    </span>
                    <p className="text-[11px] text-zinc-500 mt-1">out of 5.0</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 text-amber-400 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-zinc-300">
                      100% of customers recommend this CrossFaded accessory.
                    </p>
                  </div>
                </div>

                {/* Submit New Review Form */}
                <form onSubmit={handleAddReview} className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-4">
                  <h4 className="font-raleway text-sm font-bold text-white uppercase tracking-wider">
                    Leave a Verified Customer Review
                  </h4>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-poppins">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReviewRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-4 h-4 ${star <= newReviewRating ? 'fill-amber-400' : 'text-zinc-600'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Your Name (e.g. Samuel K.)"
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <textarea
                    rows={3}
                    required
                    placeholder="Share your experience with this product..."
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Review</span>
                  </button>
                </form>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/60 text-xs space-y-1.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{rev.name}</span>
                        <span className="text-zinc-500">{rev.date}</span>
                      </div>
                      <div className="flex text-amber-400 gap-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-zinc-300 pt-1 font-poppins">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-raleway text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Complete Your Session Vibe
              </h2>
              <Link
                to={`/products-by-category?category=${encodeURIComponent(product.categoryName)}`}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                View all in {product.categoryName}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.productId || p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Mobile Sticky Bottom Buy Bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800 flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={selectedImage}
            alt=""
            className="w-10 h-10 object-cover rounded-lg bg-zinc-900 border border-zinc-800 shrink-0"
          />
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate font-aldrich">{product.name}</p>
            <p className="text-xs text-amber-400 font-mono font-bold">{formatPrice(currentPrice)}</p>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isAdding || product.stock === 0}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 shrink-0 flex items-center gap-1.5"
        >
          {isAdding ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
          <span>{isAdding ? 'Added' : 'Add to Cart'}</span>
        </button>
      </div>

    </div>
  );
};
