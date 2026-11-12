import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { EditableText } from '../cms/EditableText';

export const CategoryGrid: React.FC = () => {
  const { categories, products } = useProducts();

  return (
    <section className="py-10 sm:py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 text-center">
        
        {/* Title & Subtitle */}
        <span className="text-amber-400 font-mono text-[10px] sm:text-xs uppercase tracking-widest font-bold block mb-1 sm:mb-2">
          <EditableText
            contentKey="categories_tag"
            defaultValue="Curated Collections"
            label="Home Categories Tag"
            page="Home"
          />
        </span>
        <h2 className="font-raleway text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-2 sm:mb-3">
          <EditableText
            contentKey="categories_title"
            defaultValue="Explore by Category"
            label="Home Categories Title"
            page="Home"
          />
        </h2>
        <p className="font-poppins text-xs sm:text-sm text-zinc-400 mb-6 sm:mb-10 max-w-lg mx-auto">
          <EditableText
            contentKey="categories_subtitle"
            defaultValue="Discover medical-grade hardware, hand-rolled cigars, and architectural centerpieces."
            label="Home Categories Subtitle"
            page="Home"
          />
        </p>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
          {categories.slice(0, 4).map((cat) => {
            const count = products.filter(
              (p) =>
                p.categoryName?.toLowerCase().includes(cat.name.toLowerCase()) ||
                p.category?.toLowerCase().includes(cat.name.toLowerCase())
            ).length;

            return (
              <Link
                key={cat.categoryId || cat.id}
                to={`/products-by-category?category=${encodeURIComponent(cat.name)}`}
                className="group relative flex flex-col justify-between bg-gradient-to-b from-[#1c1c1c] to-[#131313] rounded-lg overflow-hidden transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.85),0_0_1px_rgba(255,255,255,0.08)] hover:shadow-[0_22px_45px_rgba(0,0,0,0.95),0_0_24px_rgba(251,191,36,0.16)] hover:-translate-y-1.5 text-left"
              >
                {/* Full-Width Edge-to-Edge Image Container */}
                <div className="relative w-full aspect-square bg-[#0b0b0b] overflow-hidden">
                  <img
                    src={cat.imageUrl || cat.image || '/images/cigar.png'}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-108"
                    loading="lazy"
                  />
                  {/* Subtle bottom vignette gradient for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131313]/90 via-transparent to-transparent pointer-events-none" />

                  {/* Item Count Badge */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1 pointer-events-none z-10">
                    <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded bg-black/80 backdrop-blur-md text-amber-400 text-[9px] sm:text-[10px] font-mono font-bold tracking-wider shadow-lg">
                      {count > 0 ? `${count} Items` : 'Featured'}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-2.5 sm:p-4 md:p-5 flex flex-col flex-1 justify-between space-y-2 sm:space-y-3">
                  <div>
                    {/* Tag */}
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase font-bold tracking-widest text-amber-400/90 block truncate">
                      Collection
                    </span>

                    {/* Category Title */}
                    <h3 className="font-aldrich text-xs sm:text-sm md:text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1 leading-snug mt-0.5 sm:mt-1">
                      {cat.name}
                    </h3>

                    {/* Description */}
                    <p className="font-poppins text-[11px] sm:text-xs text-zinc-400 line-clamp-1 sm:line-clamp-2 mt-1 leading-relaxed">
                      {cat.description || `Premium handcrafted selection of ${cat.name.toLowerCase()}.`}
                    </p>
                  </div>

                  {/* Bottom Action Link */}
                  <div className="pt-1.5 sm:pt-2 flex items-center justify-between text-[11px] sm:text-xs font-poppins">
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-mono text-zinc-500">Shop</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View all categories link */}
        <div className="mt-12">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 px-8 py-3 bg-black hover:bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-700 rounded-lg text-xs font-poppins font-semibold uppercase tracking-wider transition-all"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </Link>
        </div>

      </div>
    </section>
  );
};
