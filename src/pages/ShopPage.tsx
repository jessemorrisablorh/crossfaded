import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ArrowUpDown, X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/shop/ProductCard';
import { EditableText } from '../components/cms/EditableText';

const ITEMS_PER_PAGE = 12;

export const ShopPage: React.FC = () => {
  const { products, categories, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlCategory = searchParams.get('category') || '';
  const urlSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [searchTerm, setSearchTerm] = useState<string>(urlSearch);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sync state with URL
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  // Reset to page 1 on filter or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm, sortBy]);

  const handleCategorySelect = (catName: string) => {
    if (selectedCategory === catName) {
      setSelectedCategory('');
      searchParams.delete('category');
    } else {
      setSelectedCategory(catName);
      searchParams.set('category', catName);
    }
    setSearchParams(searchParams);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setSortBy('featured');
    setSearchParams({});
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory) {
          const matchCat =
            p.categoryName?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
            p.category?.toLowerCase().includes(selectedCategory.toLowerCase());
          if (!matchCat) return false;
        }

        // Search filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          const matchCat = p.categoryName?.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.salePrice && a.salePrice > 0 ? a.salePrice : a.price;
        const priceB = b.salePrice && b.salePrice > 0 ? b.salePrice : b.price;

        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, selectedCategory, searchTerm, sortBy]);

  // Pagination calculations (12 products per page)
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, safeCurrentPage]);

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
    <div className="min-h-screen bg-black text-white py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="mb-6 sm:mb-10 text-center sm:text-left">
          <h1 className="font-raleway text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            <EditableText
              contentKey="shop_header_title"
              defaultValue="Our Shop"
              label="Shop Page Title"
              page="Shop"
              as="span"
            />
          </h1>
          <p className="font-poppins text-xs sm:text-sm text-zinc-400 mt-1 sm:mt-2 max-w-xl">
            <EditableText
              contentKey="shop_header_subtitle"
              defaultValue="Browse our full catalog of medical-grade herb crushers, sculptural ashtrays, fine cigars, and lifestyle accessories."
              label="Shop Page Subtitle"
              type="textarea"
              page="Shop"
              as="span"
            />
          </p>
        </div>

        {/* Filter & Controls Bar (Colors.grey[900] #212121) */}
        <div className="bg-[#212121] rounded-xl p-3.5 sm:p-5 mb-6 sm:mb-10 space-y-3 sm:space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2.5 pl-10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <span className="text-xs text-zinc-300 font-medium whitespace-nowrap flex items-center gap-1.5 font-poppins">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-black border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="featured">Featured & Best</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800">
            <span className="text-xs text-zinc-400 font-semibold mr-1 font-poppins">Categories:</span>
            <button
              onClick={() => handleCategorySelect('')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-poppins font-semibold transition-all ${
                selectedCategory === ''
                  ? 'bg-amber-400 text-black shadow'
                  : 'bg-black text-zinc-300 hover:text-white border border-zinc-700'
              }`}
            >
              All Products ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter(
                (p) =>
                  p.categoryName?.toLowerCase().includes(cat.name.toLowerCase()) ||
                  p.category?.toLowerCase().includes(cat.name.toLowerCase())
              ).length;
              return (
                <button
                  key={cat.categoryId || cat.id}
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-poppins font-semibold transition-all ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-amber-400 text-black shadow'
                      : 'bg-black text-zinc-300 hover:text-white border border-zinc-700'
                  }`}
                >
                  {cat.name} {count > 0 && `(${count})`}
                </button>
              );
            })}

            {(selectedCategory || searchTerm) && (
              <button
                onClick={handleClearFilters}
                className="ml-auto text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium font-poppins"
              >
                <X className="w-3.5 h-3.5" />
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-64 sm:h-80 bg-[#212121] rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-[#212121] rounded-xl p-4 sm:p-8">
            <Sparkles className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
            <h3 className="font-aldrich text-lg sm:text-xl font-bold text-white mb-2">No matching accessories</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6">
              We couldn't find any products matching your active filters. Try adjusting your search term.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs rounded transition-all"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
              {paginatedProducts.map((prod) => (
                <ProductCard key={prod.productId || prod.id} product={prod} />
              ))}
            </div>

            {/* Pagination at the bottom left */}
            {filteredProducts.length > 0 && (
              <div className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Bottom Left: Navigation Controls & Page Numbers */}
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.max(p - 1, 1));
                      window.scrollTo({ top: 200, behavior: 'smooth' });
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
                            window.scrollTo({ top: 200, behavior: 'smooth' });
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
                      window.scrollTo({ top: 200, behavior: 'smooth' });
                    }}
                    disabled={safeCurrentPage === totalPages}
                    className="px-3.5 py-2 rounded-lg bg-[#181818] hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-[#181818] disabled:cursor-not-allowed border border-zinc-800 text-xs font-poppins font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all shadow-sm"
                    aria-label="Next Page"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Item Count Display */}
                <span className="text-xs text-zinc-500 font-poppins self-start sm:self-auto">
                  Showing {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} items
                </span>

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
