import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { ProductCard } from '../shop/ProductCard';
import { EditableText } from '../cms/EditableText';

export const BestsellerGrid: React.FC = () => {
  const { products } = useProducts();

  // Top 4 products
  const bestsellers = products.filter((p) => p.featured).slice(0, 4);
  const displayProducts = bestsellers.length >= 4 ? bestsellers : products.slice(0, 4);

  return (
    <section className="py-10 sm:py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 text-center">
        
        {/* Title & Subtitle */}
        <span className="text-amber-400 font-mono text-[10px] sm:text-xs uppercase tracking-widest font-bold mb-1 sm:mb-2 flex items-center justify-center gap-1.5">
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <EditableText
            contentKey="bestseller_tag"
            defaultValue="Customer Favorites"
            label="Bestseller Tag"
            page="Home"
          />
        </span>
        <h2 className="font-raleway text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-2 sm:mb-3">
          <EditableText
            contentKey="bestseller_title"
            defaultValue="Our Bestsellers"
            label="Bestseller Title"
            page="Home"
          />
        </h2>
        <p className="font-poppins text-xs sm:text-sm text-zinc-400 mb-6 sm:mb-10 max-w-lg mx-auto">
          <EditableText
            contentKey="bestseller_subtitle"
            defaultValue="Collect your favorites with our highest-rated precision crushers, aged vintage cigars, and heavyweight ashtrays."
            label="Bestseller Subtitle"
            page="Home"
          />
        </p>

        {/* Grid of 4 Redesigned Product Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
          {displayProducts.map((prod) => (
            <ProductCard key={prod.productId || prod.id} product={prod} />
          ))}
        </div>

        {/* Amber Action Button */}
        <div className="mt-8 sm:mt-14">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-poppins font-semibold text-xs rounded uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 active:scale-95"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};
