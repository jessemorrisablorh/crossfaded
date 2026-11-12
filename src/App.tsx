import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { SiteContentProvider, useSiteContent } from './context/SiteContentContext';

// Components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { FloatingWhatsApp } from './components/layout/FloatingWhatsApp';
import { CartDrawer } from './components/layout/CartDrawer';
import { WishlistDrawer } from './components/layout/WishlistDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { ProductQuickView } from './components/shop/ProductQuickView';
import { AgeVerificationModal } from './components/ui/AgeVerificationModal';
import { AdminLiveBar } from './components/cms/AdminLiveBar';
import { LiveEditModal } from './components/cms/LiveEditModal';
import { QuickAdminLoginModal } from './components/cms/QuickAdminLoginModal';

// Storefront Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryProductsPage } from './pages/CategoryProductsPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrdersPage } from './pages/OrdersPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AccountPage } from './pages/AccountPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AuthPage } from './pages/AuthPage';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminSliders } from './pages/admin/AdminSliders';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminSettings } from './pages/admin/AdminSettings';

// Storefront layout wrapper
const StorefrontLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAdminLoginOpen, closeAdminLogin } = useSiteContent();

  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      <MobileDrawer isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      <main className="flex-1">{children}</main>

      <Footer />
      <FloatingWhatsApp />
      <CartDrawer />
      <WishlistDrawer />
      <AuthModal />
      <ProductQuickView />
      <AgeVerificationModal />
      <AdminLiveBar />
      <LiveEditModal />
      <QuickAdminLoginModal isOpen={isAdminLoginOpen} onClose={closeAdminLogin} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CurrencyProvider>
          <AuthProvider>
            <ProductProvider>
              <SiteContentProvider>
                <CartProvider>
                  <WishlistProvider>
                    <StorefrontLayout>
                    <Routes>
                      {/* Storefront Customer Routes */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/shop" element={<ShopPage />} />
                      <Route path="/categories" element={<CategoriesPage />} />
                      <Route path="/products-by-category" element={<CategoryProductsPage />} />
                      <Route path="/category/:slug" element={<CategoryProductsPage />} />
                      <Route path="/product/:id" element={<ProductDetailsPage />} />
                      <Route path="/product-details" element={<ProductDetailsPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/success" element={<OrderSuccessPage />} />
                      <Route path="/track" element={<TrackOrderPage />} />
                      <Route path="/track-order" element={<TrackOrderPage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/account" element={<AccountPage />} />
                      <Route path="/login" element={<AuthPage />} />
                      <Route path="/register" element={<AuthPage />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/aboutus" element={<AboutPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contactus" element={<ContactPage />} />
                      <Route path="/contact" element={<ContactPage />} />

                      {/* Admin Routes */}
                      <Route path="/admin/login" element={<AdminLoginPage />} />
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="sliders" element={<AdminSliders />} />
                        <Route path="settings" element={<AdminSettings />} />
                      </Route>

                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </StorefrontLayout>
                </WishlistProvider>
              </CartProvider>
            </SiteContentProvider>
          </ProductProvider>
        </AuthProvider>
        </CurrencyProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
