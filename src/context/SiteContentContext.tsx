import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { firestoreService } from '../services/firestoreService';
import { useToast } from './ToastContext';

export interface FieldDefinition {
  key: string;
  label: string;
  defaultValue: string;
  type: 'text' | 'textarea' | 'image';
  page: string;
}

export const DEFAULT_SITE_CONTENT: Record<string, string> = {
  // Global Contact Details
  'contact_phone': '+233 54 323 6328',
  'contact_whatsapp': '+233 54 323 6328',
  'contact_whatsapp_link': 'https://wa.me/233543236328?text=Hello%20CrossFaded!%20I%20have%20an%20inquiry.',
  'contact_email': 'support@crossfadedgh.com',
  'contact_address': 'Accra, Greater Accra Region, Ghana',
  'contact_hours': 'Monday – Sunday: 9:00 AM – 10:00 PM GMT',
  'contact_dispatch_info': 'Serving all 16 regions with express delivery',

  // Footer
  'footer_brand_tagline': 'CrossFaded is a modern smoking accessories brand offering premium grinders, ashtrays, storage solutions, and lifestyle essentials. We combine quality, style, and functionality to deliver products that elevate every smoking experience.',
  'footer_copyright': `© ${new Date().getFullYear()} CROSSFADED. All Rights Reserved.`,
  'footer_vip_title': 'JOIN THE CROSSFADED INNER CIRCLE.',
  'footer_vip_desc': 'Receive private drops, limited humidor vintage arrivals, and exclusive VIP session access in Accra.',
  'footer_warning_notice': '18+ ADULT LUXURY HARDWARE • Strictly intended for legal age adults in Ghana. Please enjoy responsibly.',

  // Home Cigar Feature
  'cigar_feature_badge': 'HUMIDOR-CURED RESERVA • 100% HAND-ROLLED',
  'cigar_feature_title_prefix': 'GET THE BEST',
  'cigar_feature_title_highlight': 'CIGARS.',
  'cigar_feature_subtitle': 'Aged in Spanish cedar humidors for velvety draws & complex aromas.',
  'cigar_feature_desc': 'Carefully cured Nicaraguan and Dominican tobacco leaves, hand-rolled with sun-grown Ecuadorian Habano wrappers. Delivering notes of dark cocoa, roasted espresso, creamy cedar, and a delicate spice on the finish.',
  'cigar_feature_image': '/images/cigar.png',
  'cigar_feature_pill_1': '54 Ring Gauge Grand Toro',
  'cigar_feature_pill_2': '5-Year Humidor Aged',
  'cigar_feature_pill_3': 'Same-Day Discreet Accra Delivery',

  // Home Bestseller Section
  'bestseller_tag': 'Customer Favorites',
  'bestseller_title': 'Our Bestsellers',
  'bestseller_subtitle': 'Collect your favorites with our highest-rated precision crushers, aged vintage cigars, and heavyweight ashtrays.',

  // Home Category Section
  'categories_tag': 'Curated Collections',
  'categories_title': 'Explore by Category',
  'categories_subtitle': 'Discover medical-grade hardware, hand-rolled cigars, and architectural centerpieces.',

  // Shop Page Header
  'shop_header_title': 'Our Shop',
  'shop_header_subtitle': 'Browse our full catalog of medical-grade herb crushers, sculptural ashtrays, fine cigars, and lifestyle accessories.',

  // Categories Page Header
  'categories_header_tag': 'Collections Catalog',
  'categories_header_title': 'All Categories',
  'categories_header_subtitle': 'Explore our premier accessory departments, from medical-grade alloy crushers to hand-rolled cigars and contemporary ashtrays.',

  // About Page Hero
  'about_hero_tag': 'THE CROSSFADED STORY • ACCRA, GHANA',
  'about_hero_title': 'THE ART OF THE',
  'about_hero_highlight': 'ELEVATED SESSION.',
  'about_hero_subtitle': 'We engineer functional art: medical-grade alloy crushers, humidor-cured vintage cigars, and heavyweight architectural ashtrays.',
  'about_hero_desc': 'CrossFaded was founded in Accra with a single standard: to purge cheap, generic, disposable smoke shop hardware from the market and replace it with precision industrial metalwork and timeless craftsmanship that looks stunning on any coffee table.',

  // About Page Feature 1: Grinders
  'about_grinder_badge': 'AEROSPACE 6061 ALLOY • CURVED DIAMOND TEETH',
  'about_grinder_title_prefix': 'ZERO METAL SHAVINGS.',
  'about_grinder_title_highlight': '100% PURE HERB.',
  'about_grinder_subtitle': 'Surgically sharp diamond teeth built for fluffy, aerated consistency.',
  'about_grinder_desc': 'Traditional smoke shop grinders are made from cheap cast zinc alloys that chip toxic metallic residue into your herbs over time. CrossFaded crushers are CNC-machined from single-block aerospace 6061 aluminum with curved diamond-cut teeth that shear with zero friction, accompanied by a 100-micron stainless pollen filtration screen.',
  'about_grinder_image': '/images/crushers.jpeg',
  'about_grinder_pill_1': '63mm Aircraft 6061 Alloy',
  'about_grinder_pill_2': 'Curved Diamond Cutting Teeth',
  'about_grinder_pill_3': '100-Micron Stainless Sifter',

  // About Page Feature 2: Cigars
  'about_cigar_badge': 'HUMIDOR-CURED RESERVA • 100% HAND-ROLLED',
  'about_cigar_title_prefix': 'GET THE BEST',
  'about_cigar_title_highlight': 'CIGARS.',
  'about_cigar_subtitle': 'Aged in Spanish cedar humidors for velvety draws & complex aromas.',
  'about_cigar_desc': 'Carefully cured Nicaraguan and Dominican tobacco leaves, hand-rolled with sun-grown Ecuadorian Habano wrappers. Stored strictly at 70% relative humidity in Spanish cedar cabinets to preserve essential oils — delivering notes of dark cocoa, roasted espresso, creamy cedar, and a delicate spice on the finish.',
  'about_cigar_image': '/images/cigar.png',
  'about_cigar_pill_1': '54 Ring Gauge Grand Toro',
  'about_cigar_pill_2': '5-Year Humidor Aged',
  'about_cigar_pill_3': 'Same-Day Discreet Accra Delivery',

  // About Page Feature 3: Ashtrays
  'about_ashtray_badge': 'HEAVYWEIGHT CRYSTAL • HEAT-RESISTANT BASIN',
  'about_ashtray_title_prefix': 'GET THE BEST',
  'about_ashtray_title_highlight': 'ASHTRAYS.',
  'about_ashtray_subtitle': 'Heavyweight architectural crystal and solid brass resting spots.',
  'about_ashtray_desc': 'Lightweight glass and tin trays flip over in patio breezes and scatter ash everywhere. CrossFaded ashtrays are crafted with 850g solid weighted bases, deep heat-dissipating chambers, and precision cigar rest grooves that remain firmly anchored on coastal Accra patios while looking like museum pieces.',
  'about_ashtray_image': '/images/ashtray.jpeg',
  'about_ashtray_pill_1': 'Heavyweight Solid Base',
  'about_ashtray_pill_2': 'Precision Rest Grooves',
  'about_ashtray_pill_3': 'Heat-Resistant Sealed Basin',

  // About Page Standards
  'about_standards_tag': 'THE CROSSFADED STANDARD',
  'about_standards_title': 'Quality Above Everything',
  'about_standards_subtitle': 'Every item dispatched from our Accra hub is held to strict mechanical and craftsmanship checks.',

  // About Page CTA
  'about_cta_title': 'READY TO UPGRADE YOUR SESSION?',
  'about_cta_desc': 'Explore our curated catalog of precision 6061 crushers, aged Habano cigars, and heavy architectural crystal. Same-day express courier dispatch across Accra with Cash on Delivery and Mobile Money.',

  // Contact Page
  'contact_page_tag': 'CUSTOMER CARE & CONCIERGE',
  'contact_page_title': 'CONNECT WITH',
  'contact_page_highlight': 'CROSSFADED.',
  'contact_page_subtitle': 'Have questions regarding live stock availability in Accra, ring gauge specifications, or same-day dispatch? Our team is available 7 days a week.',
};

interface SiteContentContextType {
  content: Record<string, string>;
  getContent: (key: string, defaultValue?: string) => string;
  updateContent: (key: string, value: string) => Promise<void>;
  updateMultipleContent: (updates: Record<string, string>) => Promise<void>;
  isEditMode: boolean;
  setIsEditMode: (enabled: boolean) => void;
  activeEditor: FieldDefinition | null;
  openEditor: (
    key: string,
    label: string,
    defaultValue: string,
    type?: 'text' | 'textarea' | 'image',
    page?: string
  ) => void;
  closeEditor: () => void;
  isPageEditorOpen: boolean;
  openPageEditor: () => void;
  closePageEditor: () => void;
  isAdminLoginOpen: boolean;
  openAdminLogin: () => void;
  closeAdminLogin: () => void;
  registeredFields: FieldDefinition[];
  registerField: (field: FieldDefinition) => void;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { success, error: toastError } = useToast();
  const [content, setContent] = useState<Record<string, string>>(DEFAULT_SITE_CONTENT);
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [activeEditor, setActiveEditor] = useState<FieldDefinition | null>(null);
  const [isPageEditorOpen, setIsPageEditorOpen] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [registeredFields, setRegisteredFields] = useState<FieldDefinition[]>([]);

  // Subscribe to live site content from Firestore
  useEffect(() => {
    const unsub = firestoreService.subscribeSiteContent((remoteContent) => {
      setContent((prev) => ({
        ...DEFAULT_SITE_CONTENT,
        ...prev,
        ...remoteContent,
      }));
    });
    return () => unsub();
  }, []);

  // Keyboard shortcut: Ctrl+Shift+A or Cmd+Shift+A toggles admin login / live edit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminLoginOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getContent = useCallback(
    (key: string, defaultValue?: string): string => {
      if (content[key] !== undefined && content[key] !== '') {
        return content[key];
      }
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      return DEFAULT_SITE_CONTENT[key] || '';
    },
    [content]
  );

  const updateContent = async (key: string, value: string) => {
    try {
      setContent((prev) => ({ ...prev, [key]: value }));
      await firestoreService.updateSiteContent(key, value);
      success('Changes published live to website!');
    } catch (err) {
      console.error('Failed to update content:', err);
      toastError('Failed to publish changes. Please try again.');
    }
  };

  const updateMultipleContent = async (updates: Record<string, string>) => {
    try {
      setContent((prev) => ({ ...prev, ...updates }));
      await firestoreService.updateMultipleSiteContent(updates);
      success('Page changes published live!');
    } catch (err) {
      console.error('Failed to update content:', err);
      toastError('Failed to publish changes. Please try again.');
    }
  };

  const registerField = useCallback((field: FieldDefinition) => {
    setRegisteredFields((prev) => {
      if (prev.some((f) => f.key === field.key)) return prev;
      return [...prev, field];
    });
  }, []);

  const openEditor = (
    key: string,
    label: string,
    defaultValue: string,
    type: 'text' | 'textarea' | 'image' = 'text',
    page: string = 'General'
  ) => {
    setActiveEditor({ key, label, defaultValue, type, page });
  };

  const closeEditor = () => setActiveEditor(null);

  const openPageEditor = () => setIsPageEditorOpen(true);
  const closePageEditor = () => setIsPageEditorOpen(false);

  const openAdminLogin = () => setIsAdminLoginOpen(true);
  const closeAdminLogin = () => setIsAdminLoginOpen(false);

  return (
    <SiteContentContext.Provider
      value={{
        content,
        getContent,
        updateContent,
        updateMultipleContent,
        isEditMode,
        setIsEditMode,
        activeEditor,
        openEditor,
        closeEditor,
        isPageEditorOpen,
        openPageEditor,
        closePageEditor,
        isAdminLoginOpen,
        openAdminLogin,
        closeAdminLogin,
        registeredFields,
        registerField,
      }}
    >
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  return context;
};
