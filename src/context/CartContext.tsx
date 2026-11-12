import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { CartItem, Product } from '../types';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  isCartLoading: boolean;
  itemCount: number;
  totalPrice: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, newQuantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'crossfaded_guest_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartLoading, setIsCartLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync with Firestore if logged in, or localStorage if guest
  useEffect(() => {
    let unsubscribe = () => {};

    if (!user) {
      // Guest local storage cart
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        setItems(saved ? JSON.parse(saved) : []);
      } catch {
        setItems([]);
      }
      setIsCartLoading(false);
      return;
    }

    // User is logged in
    setIsCartLoading(true);

    const syncUserCart = async () => {
      // Check for any guest items in localStorage or existing state that need to be migrated
      let guestItems: CartItem[] = [];
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          guestItems = JSON.parse(saved);
        }
      } catch {}

      // If localStorage had no items, check if in-memory items has guest items
      if (guestItems.length === 0 && items.length > 0) {
        guestItems = items.filter((i) => !i.uid || i.uid !== user.uid);
      }

      if (guestItems.length > 0) {
        // Merge guest items into Firestore
        await firestoreService.mergeGuestCart(user.uid, guestItems);
        // Clear local storage guest key
        try {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch {}
      }

      // Subscribe to user's cart in Firestore
      unsubscribe = firestoreService.subscribeCart(user.uid, (firestoreItems) => {
        setItems(firestoreItems);
        setIsCartLoading(false);
      });
    };

    syncUserCart();

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Persist guest cart to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, user]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [items]);

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  }, [items]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const addToCart = async (product: Product, quantity = 1) => {
    try {
      const price = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
      const imageUrl = product.imageUrls?.[0] || product.image || '';

      if (user) {
        await firestoreService.addToCartFirestore(user.uid, {
          productId: product.productId || product.id || '',
          productid: product.productId || product.id || '',
          productname: product.name,
          productimage: imageUrl,
          price,
          quantity,
        });
      } else {
        // Guest local storage cart
        setItems((prev) => {
          const prodId = product.productId || product.id;
          const existingIndex = prev.findIndex((i) => (i.productId || i.productid) === prodId);
          if (existingIndex > -1) {
            const updated = [...prev];
            updated[existingIndex].quantity += quantity;
            return updated;
          } else {
            return [
              ...prev,
              {
                id: 'guest_' + Math.random().toString(36).substring(2, 9),
                productId: prodId || '',
                productid: prodId || '',
                productname: product.name,
                productimage: imageUrl,
                price,
                quantity,
              },
            ];
          }
        });
      }

      success(`Added "${product.name}" to cart`);
      setIsCartOpen(true);
    } catch (e) {
      console.error('Add to cart error:', e);
      error('Failed to add item to cart');
    }
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      if (user) {
        await firestoreService.updateCartItemQuantity(cartItemId, newQuantity);
      } else {
        if (newQuantity <= 0) {
          setItems((prev) => prev.filter((i) => i.id !== cartItemId));
        } else {
          setItems((prev) =>
            prev.map((i) => (i.id === cartItemId ? { ...i, quantity: newQuantity } : i))
          );
        }
      }
    } catch (e) {
      console.error('Update quantity error:', e);
      error('Failed to update quantity');
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      if (user) {
        await firestoreService.removeFromCartFirestore(cartItemId);
      } else {
        setItems((prev) => prev.filter((i) => i.id !== cartItemId));
      }
      success('Item removed from cart');
    } catch (e) {
      console.error('Remove from cart error:', e);
      error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      if (user) {
        await firestoreService.clearCartFirestore(user.uid);
      } else {
        setItems([]);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Clear cart error:', e);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isCartLoading,
        itemCount,
        totalPrice,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

