import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { EditableText } from '../components/cms/EditableText';

const ITEMS_PER_PAGE = 12;

export const CategoriesPage: React.FC = () => {
  const { categories, products } = useProducts();
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Pagination calculations (12 categories per page)
  const totalPages = Math.max(1, Math.ceil(categories.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedCategories = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return categories.slice(start, start + ITEMS_PER_PAGE);
  }, [categories, safeCurrentPage]);

  // Generate page numbers array
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (safeCurrentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages);
      }
    }
    return pages;
  }, [totalPages, safeCurrentPage]);

  return (
    <div className="min-h-screen bg-black text-white py-6 sm:py-16">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 text-center sm:text-left">
        
        {/* Page Header */}
        <div className="text-center sm:text-left mb-6 sm:mb-14">
          <span className="text-amber-400 font-mono text-xs uppercase tracking-widest font-bold block mb-1 sm:mb-2">
            <EditableText
              contentKey="categories_header_tag"
              defaultValue="Collections Catalog"
              label="Categories Page Tag"
              page="Categories"
              as="span"
            />
          </span>
          <h1 className="font-raleway text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-2 sm:mb-3">
            <EditableText
              contentKey="categories_header_title"
              defaultValue="All Categories"
              label="Categories Page Title"
              page="Categories"
              as="span"
            />
          </h1>
          <p className="font-poppins text-xs sm:text-sm text-zinc-400 max-w-lg">
            <EditableText
              contentKey="categories_header_subtitle"
              defaultValue="Explore our premier accessory departments, from medical-grade alloy crushers to hand-rolled cigars and contemporary ashtrays."
              label="Categories Page Subtitle"
              type="textarea"
              page="Categories"
              as="span"
            />
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
          {paginatedCategories.map((cat) => {
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
                  <div className="absolute top-3 right-3 flex flex-col gap-1 pointer-events-none z-10">
                    <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-amber-400 text-[10px] font-mono font-bold tracking-wider shadow-lg">
                      {count > 0 ? `${count} Products` : 'Featured'}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between space-y-1.5 sm:space-y-3">
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
                    <p className="font-poppins text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed hidden sm:block">
                      {cat.description || `Browse our full selection of ${cat.name.toLowerCase()}.`}
                    </p>
                  </div>

                  {/* Bottom Action Link */}
                  <div className="pt-1 sm:pt-2 flex items-center justify-between text-xs font-poppins">
                    <span className="text-amber-400 font-semibold flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs">
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

        {/* Pagination at the bottom left */}
        {categories.length > 0 && (
          <div className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Bottom Left: Navigation Controls & Page Numbers */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(p - 1, 1));
                  window.scrollTo({ top: 150, behavior: 'smooth' });
                }}
                disabled={safeCurrentPage === 1}
                className="px-3.5 py-2 rounded-lg bg-[#181818] hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-[#181818] disabled:cursor-not-allowed border border-zinc-800 text-xs font-poppins font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all shadow-sm"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Number Buttons */}
              <div className="flex items-center gap-1.5">
                {pageNumbers.map((page, idx) => {
                  if (typeof page === 'string') {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-2 text-xs text-zinc-500 font-mono">
                        ...
                      </span>
                    );
                  }
                  const isActive = page === safeCurrentPage;
                  return (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 150, behavior: 'smooth' });
                      }}
                      className={`min-w-[36px] h-9 px-3 rounded-lg text-xs font-poppins font-semibold transition-all ${
                        isActive
                          ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-bold scale-105'
                          : 'bg-[#181818] text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.min(p + 1, totalPages));
                  window.scrollTo({ top: 150, behavior: 'smooth' });
                }}
                disabled={safeCurrentPage === totalPages}
                className="px-3.5 py-2 rounded-lg bg-[#181818] hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-[#181818] disabled:cursor-not-allowed border border-zinc-800 text-xs font-poppins font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all shadow-sm"
                aria-label="Next Page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Category Count Display */}
            <span className="text-xs text-zinc-500 font-poppins self-start sm:self-auto">
              Showing {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safeCurrentPage * ITEMS_PER_PAGE, categories.length)} of {categories.length} categories
            </span>

          </div>
        )}

      </div>
    </div>
  );
};
