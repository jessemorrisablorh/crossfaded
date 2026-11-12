import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/shop/ProductCard';

export const CategoryProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryName = searchParams.get('category') || 'All';
  const { products, getCategoryByNameOrSlug } = useProducts();

  const category = getCategoryByNameOrSlug(categoryName);

  const filteredProducts = products.filter((p) => {
    if (!categoryName || categoryName === 'All') return true;
    return (
      p.categoryName?.toLowerCase().includes(categoryName.toLowerCase()) ||
      p.category?.toLowerCase().includes(categoryName.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-black text-white py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4 sm:mb-8 font-poppins">
          <Link to="/" className="hover:text-amber-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <Link to="/categories" className="hover:text-amber-400 transition-colors">
            Categories
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-amber-400 font-semibold">{categoryName}</span>
        </div>

        {/* Category Header Card (Colors.grey[900] #212121) */}
        <div className="bg-[#212121] rounded-2xl p-4 sm:p-8 mb-6 sm:mb-12 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="max-w-xl text-center sm:text-left">
            <h1 className="font-raleway text-2xl sm:text-4xl font-bold text-white tracking-tight">
              {categoryName}
            </h1>
            <p className="font-poppins text-xs sm:text-sm text-zinc-300 mt-2">
              {category?.description ||
                `Browse our collection of ${categoryName.toLowerCase()} crafted for optimal performance and luxury style.`}
            </p>
            <div className="mt-3 inline-block px-3 py-1 bg-black/60 rounded-full text-amber-400 text-xs font-mono font-semibold">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
            </div>
          </div>

          {category?.imageUrl && (
            <div className="w-24 h-24 sm:w-40 sm:h-40 rounded-xl bg-black/40 p-2 sm:p-4 flex items-center justify-center shrink-0">
              <img
                src={category.imageUrl}
                alt={categoryName}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-[#212121] rounded-xl p-4 sm:p-8">
            <Sparkles className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
            <h3 className="font-aldrich text-lg sm:text-xl font-bold text-white mb-2">No products found</h3>
            <p className="text-xs text-zinc-400 mb-6 font-poppins">
              There are currently no products under "{categoryName}".
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs rounded transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Shop</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.productId || prod.id} product={prod} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
