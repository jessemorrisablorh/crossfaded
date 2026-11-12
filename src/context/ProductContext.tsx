import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, Category, SliderItem, CategorySlide } from '../types';
import { firestoreService } from '../services/firestoreService';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, HERO_SLIDERS, DEFAULT_CATEGORY_SLIDERS } from '../data/mockData';

interface ProductContextType {
  products: Product[];
  categories: Category[];
  sliders: SliderItem[];
  categorySliders: CategorySlide[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  getProductById: (id: string) => Product | undefined;
  getCategoryByNameOrSlug: (nameOrSlug: string) => Category | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [sliders, setSliders] = useState<SliderItem[]>(HERO_SLIDERS);
  const [categorySliders, setCategorySliders] = useState<CategorySlide[]>(DEFAULT_CATEGORY_SLIDERS);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    // 1. Subscribe to products
    const unsubProducts = firestoreService.subscribeProducts((items) => {
      setProducts(items.length > 0 ? items : INITIAL_PRODUCTS);
      setLoading(false);
    });

    // 2. Subscribe to categories
    const unsubCategories = firestoreService.subscribeCategories((cats) => {
      setCategories(cats.length > 0 ? cats : INITIAL_CATEGORIES);
    });

    // 3. Subscribe to hero sliders
    const unsubSliders = firestoreService.subscribeSliders((sliderItems) => {
      setSliders(sliderItems.length > 0 ? sliderItems : HERO_SLIDERS);
    });

    // 4. Subscribe to category feature sliders
    const unsubCategorySliders = firestoreService.subscribeCategorySliders((catSlides) => {
      setCategorySliders(catSlides.length > 0 ? catSlides : DEFAULT_CATEGORY_SLIDERS);
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubSliders();
      unsubCategorySliders();
    };
  }, []);

  const openQuickView = (product: Product) => setQuickViewProduct(product);
  const closeQuickView = () => setQuickViewProduct(null);

  const getProductById = (id: string): Product | undefined => {
    return products.find(
      (p) => (p.productId && p.productId === id) || (p.id && p.id === id)
    );
  };

  const getCategoryByNameOrSlug = (nameOrSlug: string): Category | undefined => {
    const target = nameOrSlug.toLowerCase();
    return categories.find(
      (c) =>
        c.name.toLowerCase() === target ||
        c.slug.toLowerCase() === target ||
        c.categoryId.toLowerCase() === target
    );
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        sliders,
        categorySliders,
        loading,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        quickViewProduct,
        openQuickView,
        closeQuickView,
        getProductById,
        getCategoryByNameOrSlug,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};

