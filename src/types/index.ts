export interface Product {
  productId: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  categoryId: string;
  categoryName: string;
  category?: string;
  imageUrls: string[];
  image?: string;
  stock: number;
  featured?: boolean;
  rating?: number;
  reviewsCount?: number;
  tags?: string[];
  specs?: Record<string, string>;
  createdAt?: any;
}

export interface Category {
  categoryId: string;
  id?: string;
  name: string;
  slug: string;
  imageUrl: string;
  image?: string;
  description?: string;
  productCount?: number;
  createdAt?: any;
}

export interface CartItem {
  id: string; // cart item doc ID or product ID
  productId: string;
  productid?: string;
  productname: string;
  name?: string;
  productimage: string;
  image?: string;
  price: number;
  quantity: number;
  uid?: string;
}

export interface OrderItem {
  productId: string;
  productname: string;
  productimage: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber?: string;
  uid: string;
  customerName?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone: string;
  address: string;
  placename?: string;
  lat?: number;
  lng?: number;
  distance_km?: number;
  delivery_fee?: number;
  region: string;
  city: string;
  note?: string;
  total: number;
  paid: boolean;
  payment_method: 'cod' | 'card' | 'momo';
  payment_method_title: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  cartitems: OrderItem[];
  date_created?: any;
  day_created?: number;
  month_created?: number;
  year_created?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  address?: string;
  placename?: string;
  lat?: number;
  lng?: number;
  city?: string;
  region?: string;
  role?: 'customer' | 'admin';
  createdAt?: any;
}

export interface DeliverySettings {
  googlePlacesApiKey: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  startFare: number;
  baseFee: number;
  ratePerKm: number;
  ratePerMin: number;
  bookingFeePercent: number;
  minimumFee: number;
  minutesPerKm?: number;
  freeDeliveryThreshold: number;
  updatedAt?: any;
}

export interface SliderWidgetProduct {
  name: string;
  specs: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  link: string;
  tag?: string;
}

export interface SliderItem {
  id: string;
  image: string;
  tag?: string;
  title?: string;
  highlight?: string;
  subtitle?: string;
  badge?: string;
  link?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  featuredProduct?: SliderWidgetProduct;
  features?: string[];
  active?: boolean;
}

export interface CategorySlide {
  id: string;
  category: string;
  tag: string;
  title: string;
  highlight: string;
  subtitle: string;
  description: string;
  productImage: string;
  backgroundImage?: string;
  categoryLink: string;
  buttonText: string;
  secondaryLink?: string;
  secondaryText?: string;
  features: string[];
  createdAt?: any;
}

