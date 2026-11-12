import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, Category, CartItem, Order, UserProfile, SliderItem, CategorySlide, DeliverySettings } from '../types';

export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  googlePlacesApiKey: 'AIzaSyBhMT_jtJCSaZiqUg44CzsKwqXPjgG7Gxc',
  pickupAddress: 'CrossFaded Flagship Store, East Legon, Accra, Ghana',
  pickupLat: 5.6425,
  pickupLng: -0.1582,
  startFare: 3.15,
  baseFee: 3.15,
  ratePerKm: 1.45,
  ratePerMin: 0.54,
  bookingFeePercent: 6.1,
  minimumFee: 15.0,
  minutesPerKm: 2.0,
  freeDeliveryThreshold: 500,
};
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, HERO_SLIDERS, DEFAULT_CATEGORY_SLIDERS } from '../data/mockData';

export const firestoreService = {
  // --------------------------------------------------------------------------
  // PRODUCTS
  // --------------------------------------------------------------------------
  subscribeProducts(callback: (products: Product[]) => void) {
    try {
      const q = query(collection(db, 'products'));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                productId: doc.id,
                id: doc.id,
                name: data.name || '',
                description: data.description || '',
                price: Number(data.price || 0),
                salePrice: data.salePrice ? Number(data.salePrice) : undefined,
                categoryId: data.categoryId || '',
                categoryName: data.categoryName || data.category || '',
                category: data.categoryName || data.category || '',
                imageUrls: Array.isArray(data.imageUrls) && data.imageUrls.length > 0 
                  ? data.imageUrls 
                  : (data.image ? [data.image] : []),
                image: data.image || (data.imageUrls && data.imageUrls[0]) || '',
                stock: Number(data.stock ?? 10),
                featured: Boolean(data.featured),
                rating: Number(data.rating || 4.9),
                reviewsCount: Number(data.reviewsCount || 12),
                specs: data.specs || {},
                createdAt: data.createdAt,
              } as Product;
            });
            callback(items);
          } else {
            callback(INITIAL_PRODUCTS);
          }
        },
        (error) => {
          console.warn('Firestore products stream error, using fallback:', error);
          callback(INITIAL_PRODUCTS);
        }
      );
    } catch (e) {
      console.warn('Subscribe products error:', e);
      callback(INITIAL_PRODUCTS);
      return () => {};
    }
  },

  async addProduct(product: Omit<Product, 'productId'>): Promise<string> {
    const docRef = doc(collection(db, 'products'));
    const data = {
      ...product,
      productId: docRef.id,
      id: docRef.id,
      image: product.imageUrls[0] || '',
      category: product.categoryName,
      createdAt: Timestamp.now(),
    };
    await setDoc(docRef, data);
    return docRef.id;
  },

  async updateProduct(productId: string, updates: Partial<Product>) {
    const ref = doc(db, 'products', productId);
    await updateDoc(ref, {
      ...updates,
      ...(updates.imageUrls?.length ? { image: updates.imageUrls[0] } : {}),
      ...(updates.categoryName ? { category: updates.categoryName } : {}),
    });
  },

  async deleteProduct(productId: string) {
    await deleteDoc(doc(db, 'products', productId));
  },

  /**
   * Submits a customer product rating and review.
   * Dynamically recalculates the weighted average rating and increments review count,
   * updating the product in Firestore so ratings work seamlessly across web and mobile.
   */
  async submitProductReview(
    productId: string,
    rating: number,
    comment: string,
    userName = 'Verified Buyer',
    orderId?: string
  ): Promise<{ newRating: number; newReviewsCount: number }> {
    try {
      const productRef = doc(db, 'products', productId);
      const snap = await getDoc(productRef);
      let currentRating = 4.9;
      let currentCount = 10;

      if (snap.exists()) {
        const data = snap.data();
        currentRating = Number(data.rating ?? 4.9);
        currentCount = Number(data.reviewsCount ?? data.reviewCount ?? 10);
      }

      // Calculate weighted running average
      const newReviewsCount = currentCount + 1;
      const rawAvg = ((currentRating * currentCount) + Number(rating)) / newReviewsCount;
      const newRating = Math.round(rawAvg * 10) / 10;

      // Update product document in Firestore
      await updateDoc(productRef, {
        rating: newRating,
        reviewsCount: newReviewsCount,
      });

      // Save review to top-level reviews collection
      const reviewRef = doc(collection(db, 'reviews'));
      const reviewPayload = {
        reviewId: reviewRef.id,
        productId,
        orderId: orderId || null,
        rating: Number(rating),
        comment: comment.trim(),
        userName: userName.trim() || 'Verified Buyer',
        createdAt: Timestamp.now(),
      };
      await setDoc(reviewRef, reviewPayload);

      // Also persist to subcollection products/{productId}/reviews
      try {
        const subDoc = doc(collection(db, 'products', productId, 'reviews'));
        await setDoc(subDoc, reviewPayload);
      } catch (_) {}

      return { newRating, newReviewsCount };
    } catch (err) {
      console.error('Error submitting product review:', err);
      throw err;
    }
  },

  // --------------------------------------------------------------------------
  // CATEGORIES
  // --------------------------------------------------------------------------
  subscribeCategories(callback: (categories: Category[]) => void) {
    try {
      const q = query(collection(db, 'categories'));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                categoryId: doc.id,
                id: doc.id,
                name: data.name || '',
                slug: data.slug || (data.name ? data.name.toLowerCase().replace(/\s+/g, '-') : ''),
                imageUrl: data.imageUrl || data.image || '',
                image: data.imageUrl || data.image || '',
                description: data.description || '',
                productCount: data.productCount,
                createdAt: data.createdAt,
              } as Category;
            });
            callback(items);
          } else {
            callback(INITIAL_CATEGORIES);
          }
        },
        (error) => {
          console.warn('Firestore categories stream error, using fallback:', error);
          callback(INITIAL_CATEGORIES);
        }
      );
    } catch (e) {
      console.warn('Subscribe categories error:', e);
      callback(INITIAL_CATEGORIES);
      return () => {};
    }
  },

  async addCategory(category: Omit<Category, 'categoryId'>): Promise<string> {
    const docRef = doc(collection(db, 'categories'));
    const data = {
      ...category,
      categoryId: docRef.id,
      id: docRef.id,
      image: category.imageUrl,
      createdAt: Timestamp.now(),
    };
    await setDoc(docRef, data);
    return docRef.id;
  },

  async updateCategory(categoryId: string, updates: Partial<Category>) {
    const ref = doc(db, 'categories', categoryId);
    await updateDoc(ref, {
      ...updates,
      ...(updates.imageUrl ? { image: updates.imageUrl } : {}),
    });
  },

  async deleteCategory(categoryId: string) {
    await deleteDoc(doc(db, 'categories', categoryId));
  },

  // --------------------------------------------------------------------------
  // SLIDERS
  // --------------------------------------------------------------------------
  subscribeSliders(callback: (sliders: SliderItem[]) => void) {
    try {
      const q = query(collection(db, 'sliders'));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                image: data.image || '',
                title: data.title || '',
                subtitle: data.subtitle || '',
                link: data.link || '/shop',
              };
            });
            callback(items);
          } else {
            callback(HERO_SLIDERS);
          }
        },
        () => callback(HERO_SLIDERS)
      );
    } catch {
      callback(HERO_SLIDERS);
      return () => {};
    }
  },

  async addSlider(image: string, title?: string, subtitle?: string, link?: string) {
    const docRef = doc(collection(db, 'sliders'));
    await setDoc(docRef, {
      id: docRef.id,
      image,
      title: title || '',
      subtitle: subtitle || '',
      link: link || '/shop',
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async deleteSlider(sliderId: string) {
    await deleteDoc(doc(db, 'sliders', sliderId));
  },

  // --------------------------------------------------------------------------
  // CATEGORY FEATURE SLIDERS ("GET THE BEST...")
  // --------------------------------------------------------------------------
  subscribeCategorySliders(callback: (sliders: CategorySlide[]) => void) {
    try {
      const q = query(collection(db, 'category_sliders'));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                category: data.category || '',
                tag: data.tag || '',
                title: data.title || 'GET THE BEST',
                highlight: data.highlight || '',
                subtitle: data.subtitle || '',
                description: data.description || '',
                productImage: data.productImage || '',
                backgroundImage: data.backgroundImage || '',
                categoryLink: data.categoryLink || '/shop',
                buttonText: data.buttonText || 'Shop Collection',
                secondaryLink: data.secondaryLink || '/shop',
                secondaryText: data.secondaryText || 'View All Accessories',
                features: Array.isArray(data.features) ? data.features : [],
              };
            });
            callback(items);
          } else {
            callback(DEFAULT_CATEGORY_SLIDERS);
          }
        },
        () => callback(DEFAULT_CATEGORY_SLIDERS)
      );
    } catch {
      callback(DEFAULT_CATEGORY_SLIDERS);
      return () => {};
    }
  },

  async addCategorySlider(slider: Omit<CategorySlide, 'id'>) {
    const docRef = doc(collection(db, 'category_sliders'));
    await setDoc(docRef, {
      id: docRef.id,
      ...slider,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async deleteCategorySlider(sliderId: string) {
    await deleteDoc(doc(db, 'category_sliders', sliderId));
  },

  // --------------------------------------------------------------------------
  // CART
  // --------------------------------------------------------------------------
  subscribeCart(uid: string, callback: (items: CartItem[]) => void) {
    try {
      const q = query(collection(db, 'cart'), where('uid', '==', uid));
      return onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              productId: data.productid || data.productId || doc.id,
              productid: data.productid || data.productId || doc.id,
              productname: data.productname || data.name || '',
              productimage: data.productimage || data.image || '',
              price: Number(data.price || 0),
              quantity: Number(data.quantity || 1),
              uid: data.uid,
            } as CartItem;
          });
          callback(items);
        },
        (error) => {
          console.warn('Subscribe cart error:', error);
          callback([]);
        }
      );
    } catch (e) {
      console.warn('Subscribe cart error:', e);
      callback([]);
      return () => {};
    }
  },

  async addToCartFirestore(uid: string, item: Omit<CartItem, 'id' | 'uid'>) {
    // Check if item already exists in user's cart in Firestore
    const q = query(
      collection(db, 'cart'),
      where('uid', '==', uid),
      where('productid', '==', item.productId)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const existingDoc = snap.docs[0];
      const currentQty = existingDoc.data().quantity || 1;
      await updateDoc(existingDoc.ref, {
        quantity: currentQty + item.quantity,
      });
      return existingDoc.id;
    } else {
      const docRef = doc(collection(db, 'cart'));
      await setDoc(docRef, {
        id: docRef.id,
        uid,
        productid: item.productId,
        productId: item.productId,
        productname: item.productname,
        productimage: item.productimage,
        price: item.price,
        quantity: item.quantity,
        addedAt: Timestamp.now(),
      });
      return docRef.id;
    }
  },

  async updateCartItemQuantity(cartDocId: string, quantity: number) {
    if (quantity <= 0) {
      await deleteDoc(doc(db, 'cart', cartDocId));
    } else {
      await updateDoc(doc(db, 'cart', cartDocId), { quantity });
    }
  },

  async removeFromCartFirestore(cartDocId: string) {
    await deleteDoc(doc(db, 'cart', cartDocId));
  },

  async clearCartFirestore(uid: string) {
    const q = query(collection(db, 'cart'), where('uid', '==', uid));
    const snap = await getDocs(q);
    const promises = snap.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(promises);
  },

  async mergeGuestCart(uid: string, guestItems: CartItem[]): Promise<void> {
    if (!uid || !Array.isArray(guestItems) || guestItems.length === 0) return;
    try {
      for (const item of guestItems) {
        const prodId = item.productId || (item as any).productid || item.id || '';
        if (!prodId) continue;
        await this.addToCartFirestore(uid, {
          productId: prodId,
          productid: prodId,
          productname: item.productname,
          productimage: item.productimage,
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
        });
      }
    } catch (e) {
      console.warn('Error merging guest cart to Firestore:', e);
    }
  },

  // --------------------------------------------------------------------------
  // ORDERS
  // --------------------------------------------------------------------------
  async createOrder(orderData: Omit<Order, 'id'>): Promise<string> {
    const docRef = doc(collection(db, 'orders'));
    const now = new Date();
    const orderNumber = (orderData as any).orderNumber || `CF-${Math.floor(100000 + Math.random() * 900000)}`;
    const data = {
      ...orderData,
      id: docRef.id,
      orderNumber,
      date_created: Timestamp.now(),
      day_created: now.getDate(),
      month_created: now.getMonth() + 1,
      year_created: now.getFullYear(),
      status: 'pending',
      paid: false,
      payment_method: orderData.payment_method || 'cod',
      payment_method_title: orderData.payment_method_title || 'Payment on delivery',
    };
    await setDoc(docRef, data);

    // Clear cart if uid is provided
    if (orderData.uid) {
      try {
        await this.clearCartFirestore(orderData.uid);
      } catch (e) {
        console.warn('Could not clear cart after order:', e);
      }
    }

    return docRef.id;
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const cleanId = orderId ? orderId.trim() : '';
      if (!cleanId) return null;

      // 1. Direct doc lookup by document ID
      const directRef = doc(db, 'orders', cleanId);
      const snap = await getDoc(directRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Order;
      }

      // 2. Query by 'id' field
      const qById = query(collection(db, 'orders'), where('id', '==', cleanId));
      const snapById = await getDocs(qById);
      if (!snapById.empty) {
        const d = snapById.docs[0];
        return { id: d.id, ...d.data() } as Order;
      }

      // 3. Query by 'orderNumber' field (e.g. CF-482915)
      const qByNum = query(collection(db, 'orders'), where('orderNumber', '==', cleanId.toUpperCase()));
      const snapByNum = await getDocs(qByNum);
      if (!snapByNum.empty) {
        const d = snapByNum.docs[0];
        return { id: d.id, ...d.data() } as Order;
      }

      // 4. Flexible match: prefix matching or matching without 'CF-'
      const allQ = query(collection(db, 'orders'));
      const allSnap = await getDocs(allQ);
      const searchTarget = cleanId.toLowerCase().replace(/^cf-/, '').replace(/^#/, '');
      const matched = allSnap.docs.find((d) => {
        const data = d.data() as any;
        const docId = d.id.toLowerCase();
        const num = (data.orderNumber || '').toLowerCase().replace(/^cf-/, '');
        return (
          docId === cleanId.toLowerCase() ||
          docId.startsWith(cleanId.toLowerCase()) ||
          num === searchTarget ||
          (data.orderNumber || '').toLowerCase() === cleanId.toLowerCase()
        );
      });

      if (matched) {
        return { id: matched.id, ...matched.data() } as Order;
      }

      return null;
    } catch (e) {
      console.warn('getOrderById error:', e);
      return null;
    }
  },

  subscribeOrderById(orderId: string, callback: (order: Order | null) => void): () => void {
    try {
      const cleanId = orderId ? orderId.trim() : '';
      if (!cleanId) {
        callback(null);
        return () => {};
      }

      // Check direct doc
      const docRef = doc(db, 'orders', cleanId);
      return onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            callback({ id: snap.id, ...snap.data() } as Order);
          } else {
            // Fallback to query lookup
            this.getOrderById(cleanId)
              .then(callback)
              .catch(() => callback(null));
          }
        },
        () => {
          this.getOrderById(cleanId)
            .then(callback)
            .catch(() => callback(null));
        }
      );
    } catch {
      callback(null);
      return () => {};
    }
  },

  subscribeUserOrders(uid: string, callback: (orders: Order[]) => void) {
    try {
      const q = query(
        collection(db, 'orders'),
        where('uid', '==', uid)
      );
      return onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Order[];
          // Sort descending by date
          items.sort((a, b) => {
            const timeA = a.date_created?.seconds || 0;
            const timeB = b.date_created?.seconds || 0;
            return timeB - timeA;
          });
          callback(items);
        },
        (error) => {
          console.warn('Orders subscribe error:', error);
          callback([]);
        }
      );
    } catch {
      callback([]);
      return () => {};
    }
  },

  subscribeAllOrders(callback: (orders: Order[]) => void) {
    try {
      const q = query(collection(db, 'orders'));
      return onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Order[];
          items.sort((a, b) => (b.date_created?.seconds || 0) - (a.date_created?.seconds || 0));
          callback(items);
        },
        () => callback([])
      );
    } catch {
      callback([]);
      return () => {};
    }
  },

  async updateOrderStatus(orderId: string, status: Order['status']) {
    await updateDoc(doc(db, 'orders', orderId), { status });
  },

  // --------------------------------------------------------------------------
  // USER PROFILE
  // --------------------------------------------------------------------------
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        return { uid, ...snap.data() } as UserProfile;
      }
      return null;
    } catch {
      return null;
    }
  },

  async updateUserProfile(uid: string, data: Partial<UserProfile>) {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, data, { merge: true });
  },

  async checkIsAdmin(uid: string): Promise<boolean> {
    try {
      // Check in 'admins' collection
      const adminSnap = await getDoc(doc(db, 'admins', uid));
      if (adminSnap.exists()) return true;

      // Or check role field in 'users' collection
      const userSnap = await getDoc(doc(db, 'users', uid));
      if (userSnap.exists() && userSnap.data()?.role === 'admin') {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  // --------------------------------------------------------------------------
  // LIVE SITE CONTENT (ON-PAGE CMS)
  // --------------------------------------------------------------------------
  subscribeSiteContent(callback: (content: Record<string, string>) => void) {
    try {
      const docRef = doc(db, 'settings', 'site_content');
      return onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            callback(snapshot.data() as Record<string, string>);
          } else {
            callback({});
          }
        },
        () => callback({})
      );
    } catch {
      callback({});
      return () => {};
    }
  },

  async updateSiteContent(key: string, value: string) {
    const docRef = doc(db, 'settings', 'site_content');
    await setDoc(
      docRef,
      {
        [key]: value,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
  },

  async updateMultipleSiteContent(updates: Record<string, string>) {
    const docRef = doc(db, 'settings', 'site_content');
    await setDoc(
      docRef,
      {
        ...updates,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
  },

  // --------------------------------------------------------------------------
  // GLOBAL DELIVERY & GOOGLE PLACES SETTINGS
  // --------------------------------------------------------------------------
  subscribeDeliverySettings(callback: (settings: DeliverySettings) => void) {
    try {
      const docRef = doc(db, 'settings', 'delivery_settings');
      return onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as Partial<DeliverySettings>;
            const activeKey =
              data.googlePlacesApiKey?.trim() || DEFAULT_DELIVERY_SETTINGS.googlePlacesApiKey;
            if (!data.googlePlacesApiKey?.trim()) {
              setDoc(docRef, { googlePlacesApiKey: activeKey }, { merge: true }).catch(() => {});
            }
            const startFare =
              typeof data.startFare === 'number'
                ? data.startFare
                : typeof data.baseFee === 'number'
                ? data.baseFee
                : DEFAULT_DELIVERY_SETTINGS.startFare;

            callback({
              ...DEFAULT_DELIVERY_SETTINGS,
              ...data,
              startFare,
              baseFee: startFare,
              ratePerKm:
                typeof data.ratePerKm === 'number'
                  ? data.ratePerKm
                  : DEFAULT_DELIVERY_SETTINGS.ratePerKm,
              ratePerMin:
                typeof data.ratePerMin === 'number'
                  ? data.ratePerMin
                  : DEFAULT_DELIVERY_SETTINGS.ratePerMin,
              bookingFeePercent:
                typeof data.bookingFeePercent === 'number'
                  ? data.bookingFeePercent
                  : DEFAULT_DELIVERY_SETTINGS.bookingFeePercent,
              minimumFee:
                typeof data.minimumFee === 'number'
                  ? data.minimumFee
                  : DEFAULT_DELIVERY_SETTINGS.minimumFee,
              minutesPerKm:
                typeof data.minutesPerKm === 'number'
                  ? data.minutesPerKm
                  : DEFAULT_DELIVERY_SETTINGS.minutesPerKm,
              googlePlacesApiKey: activeKey,
            });
          } else {
            setDoc(docRef, DEFAULT_DELIVERY_SETTINGS, { merge: true }).catch(() => {});
            callback(DEFAULT_DELIVERY_SETTINGS);
          }
        },
        () => callback(DEFAULT_DELIVERY_SETTINGS)
      );
    } catch {
      callback(DEFAULT_DELIVERY_SETTINGS);
      return () => {};
    }
  },

  async getDeliverySettings(): Promise<DeliverySettings> {
    try {
      const docRef = doc(db, 'settings', 'delivery_settings');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as Partial<DeliverySettings>;
        const startFare =
          typeof data.startFare === 'number'
            ? data.startFare
            : typeof data.baseFee === 'number'
            ? data.baseFee
            : DEFAULT_DELIVERY_SETTINGS.startFare;
        return {
          ...DEFAULT_DELIVERY_SETTINGS,
          ...data,
          startFare,
          baseFee: startFare,
          ratePerKm:
            typeof data.ratePerKm === 'number'
              ? data.ratePerKm
              : DEFAULT_DELIVERY_SETTINGS.ratePerKm,
          ratePerMin:
            typeof data.ratePerMin === 'number'
              ? data.ratePerMin
              : DEFAULT_DELIVERY_SETTINGS.ratePerMin,
          bookingFeePercent:
            typeof data.bookingFeePercent === 'number'
              ? data.bookingFeePercent
              : DEFAULT_DELIVERY_SETTINGS.bookingFeePercent,
          minimumFee:
            typeof data.minimumFee === 'number'
              ? data.minimumFee
              : DEFAULT_DELIVERY_SETTINGS.minimumFee,
          minutesPerKm:
            typeof data.minutesPerKm === 'number'
              ? data.minutesPerKm
              : DEFAULT_DELIVERY_SETTINGS.minutesPerKm,
          googlePlacesApiKey:
            data.googlePlacesApiKey?.trim() || DEFAULT_DELIVERY_SETTINGS.googlePlacesApiKey,
        };
      }
      return DEFAULT_DELIVERY_SETTINGS;
    } catch {
      return DEFAULT_DELIVERY_SETTINGS;
    }
  },

  async updateDeliverySettings(settings: Partial<DeliverySettings>) {
    const docRef = doc(db, 'settings', 'delivery_settings');
    await setDoc(
      docRef,
      {
        ...settings,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
  },
};

