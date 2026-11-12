import React, { useState } from 'react';
import { Plus, Trash2, X, ExternalLink, Sparkles, Flame, Check } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { firestoreService } from '../../services/firestoreService';
import { useToast } from '../../context/ToastContext';
import { SliderItem, CategorySlide } from '../../types';
import { ImageUploader } from '../../components/ui/ImageUploader';

export const AdminSliders: React.FC = () => {
  const { sliders, categorySliders, categories } = useProducts();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'category' | 'hero'>('category');

  // Hero Slider Modal State
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroLink, setHeroLink] = useState('/shop');
  const [savingHero, setSavingHero] = useState(false);

  // Category Feature Slider Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catHighlight, setCatHighlight] = useState('');
  const [catTag, setCatTag] = useState('');
  const [catSubtitle, setCatSubtitle] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catProductImage, setCatProductImage] = useState('');
  const [catBackgroundImage, setCatBackgroundImage] = useState('');
  const [catLink, setCatLink] = useState('');
  const [catButtonText, setCatButtonText] = useState('Shop Collection');
  const [catFeaturesInput, setCatFeaturesInput] = useState('');
  const [savingCat, setSavingCat] = useState(false);

  // Add Hero Slider
  const handleAddHeroSlider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroImageUrl.trim()) {
      toastError('Image URL is required.');
      return;
    }

    setSavingHero(true);
    try {
      await firestoreService.addSlider(
        heroImageUrl.trim(),
        heroTitle.trim(),
        heroSubtitle.trim(),
        heroLink.trim()
      );
      success('Hero slider banner added!');
      setHeroModalOpen(false);
      setHeroImageUrl('');
      setHeroTitle('');
      setHeroSubtitle('');
      setHeroLink('/shop');
    } catch (err) {
      console.error(err);
      toastError('Failed to add slider. Please try again.');
    } finally {
      setSavingHero(false);
    }
  };

  const handleDeleteHeroSlider = async (slider: SliderItem) => {
    if (window.confirm('Delete this slider image from homepage carousel?')) {
      try {
        await firestoreService.deleteSlider(slider.id);
        success('Slider banner deleted.');
      } catch (err) {
        console.error(err);
        toastError('Failed to delete slider.');
      }
    }
  };

  // Add Category Feature Slider
  const handleAddCategorySlider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catProductImage.trim()) {
      toastError('Product image URL is required.');
      return;
    }
    if (!catName.trim()) {
      toastError('Category name is required.');
      return;
    }

    setSavingCat(true);
    try {
      const targetCategory = catName.trim();
      const features = catFeaturesInput
        .split(',')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const targetLink =
        catLink.trim() || `/products-by-category?category=${encodeURIComponent(targetCategory)}`;

      await firestoreService.addCategorySlider({
        category: targetCategory,
        tag: catTag.trim() || `${targetCategory.toUpperCase()} • PREMIUM STORE EDITION`,
        title: 'GET THE BEST',
        highlight: catHighlight.trim() || `${targetCategory.toUpperCase()}.`,
        subtitle: catSubtitle.trim() || `Finest handcrafted selection of ${targetCategory}.`,
        description:
          catDescription.trim() ||
          `Engineered from medical-grade materials to deliver flawless performance and elevated sessions.`,
        productImage: catProductImage.trim(),
        backgroundImage:
          catBackgroundImage.trim() ||
          'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?auto=format&fit=crop&w=3840&q=85',
        categoryLink: targetLink,
        buttonText: catButtonText.trim() || `Shop ${targetCategory}`,
        secondaryLink: '/shop',
        secondaryText: 'Explore Collection',
        features:
          features.length > 0
            ? features
            : ['Medical-Grade Craftsmanship', 'Precision Engineered', 'Same-Day Accra Delivery'],
      });

      success(`Feature slide for ${targetCategory} added!`);
      setCatModalOpen(false);
      setCatName('');
      setCatHighlight('');
      setCatTag('');
      setCatSubtitle('');
      setCatDescription('');
      setCatProductImage('');
      setCatBackgroundImage('');
      setCatLink('');
      setCatButtonText('Shop Collection');
      setCatFeaturesInput('');
    } catch (err) {
      console.error(err);
      toastError('Failed to add category feature slider.');
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategorySlider = async (slide: CategorySlide) => {
    if (window.confirm(`Delete the "${slide.highlight || slide.category}" feature slider?`)) {
      try {
        await firestoreService.deleteCategorySlider(slide.id);
        success('Category feature slider deleted.');
      } catch (err) {
        console.error(err);
        toastError('Failed to delete category slider.');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-raleway text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Storefront Banners & Sliders
          </h1>
          <p className="font-poppins text-xs text-zinc-400 mt-1">
            Manage both the full-screen 4K hero carousel and the featured category sliders.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('category')}
            className={`px-4 py-2 text-xs font-poppins font-semibold rounded-xl transition-all ${
              activeTab === 'category'
                ? 'bg-amber-400 text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            "GET THE BEST..." Category Sliders
          </button>
          <button
            onClick={() => setActiveTab('hero')}
            className={`px-4 py-2 text-xs font-poppins font-semibold rounded-xl transition-all ${
              activeTab === 'hero'
                ? 'bg-amber-400 text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Top Hero 4K Sliders
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CATEGORY FEATURE SLIDERS ("GET THE BEST...") */}
      {/* ========================================================================= */}
      {activeTab === 'category' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-aldrich text-lg font-bold text-white">
                Featured Category Sliders ({categorySliders.length})
              </h2>
              <p className="text-xs text-zinc-400 font-poppins">
                Continuous auto-advancing banner on homepage (Grinders, Ashtrays, etc.). Indicators & controls hidden for clean luxury.
              </p>
            </div>

            <button
              onClick={() => setCatModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs rounded-xl transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category Slide</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categorySliders.map((slide) => (
              <div
                key={slide.id}
                className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 backdrop-blur space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Tag Pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-mono font-semibold uppercase">
                    <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{slide.tag || slide.category}</span>
                  </div>

                  {/* Headline & Subtitle */}
                  <div>
                    <h3 className="font-anton text-2xl text-white">
                      {slide.title}{' '}
                      <span className="text-amber-400">{slide.highlight}</span>
                    </h3>
                    <p className="font-aldrich text-xs text-zinc-300 mt-1 font-semibold">
                      {slide.subtitle}
                    </p>
                  </div>

                  {/* Image & Description */}
                  <div className="flex gap-4 items-center bg-black/60 p-3 rounded-2xl border border-zinc-850">
                    <img
                      src={slide.productImage}
                      alt={slide.category}
                      className="w-20 h-20 object-contain rounded-xl bg-zinc-950 p-1 border border-zinc-800 shrink-0"
                    />
                    <p className="text-xs text-zinc-400 font-poppins line-clamp-3">
                      {slide.description}
                    </p>
                  </div>

                  {/* Feature Bullet Points */}
                  {slide.features && slide.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {slide.features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-zinc-800/80 text-[10px] text-zinc-300 font-poppins"
                        >
                          <Check className="w-3 h-3 text-amber-400" />
                          <span>{feat}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-xs font-mono text-zinc-400">
                  <span className="truncate max-w-[200px]">Link: {slide.categoryLink}</span>
                  <button
                    onClick={() => handleDeleteCategorySlider(slide)}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-colors"
                    title="Delete category slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TOP 4K HERO SLIDERS */}
      {/* ========================================================================= */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-aldrich text-lg font-bold text-white">
                Homepage 4K Hero Sliders ({sliders.length})
              </h2>
              <p className="text-xs text-zinc-400 font-poppins">
                Full-screen carousel photography displayed at the very top of the storefront.
              </p>
            </div>

            <button
              onClick={() => setHeroModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs rounded-xl transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add 4K Slide</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sliders.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800 backdrop-blur space-y-4"
              >
                <div className="relative h-60 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800">
                  <img src={s.image} alt={s.title || 'Slide'} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-anton text-xl text-amber-400 truncate">{s.title || 'NO TITLE'}</p>
                    <p className="text-xs text-zinc-300 line-clamp-1">{s.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-zinc-400 font-mono">Link: {s.link || '/shop'}</span>
                  <button
                    onClick={() => handleDeleteHeroSlider(s)}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-colors"
                    title="Delete slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD CATEGORY FEATURE SLIDER */}
      {/* ========================================================================= */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setCatModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="font-raleway text-xl font-bold text-white">
                Add Category Feature Slider ("GET THE BEST...")
              </h2>
            </div>

            <form onSubmit={handleAddCategorySlider} className="space-y-4">
              {/* Category Name & Quick Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => {
                      setCatName(e.target.value);
                      if (!catHighlight) {
                        setCatHighlight(`${e.target.value.toUpperCase()}.`);
                      }
                      if (!catLink) {
                        setCatLink(`/products-by-category?category=${encodeURIComponent(e.target.value)}`);
                      }
                    }}
                    placeholder="e.g. Rolling Papers or Lighters"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Select From Existing
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setCatName(e.target.value);
                        setCatHighlight(`${e.target.value.toUpperCase()}.`);
                        setCatLink(`/products-by-category?category=${encodeURIComponent(e.target.value)}`);
                      }
                    }}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-400"
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Highlight Word (Anton font in amber) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Headline Highlight (e.g. "HERB GRINDERS." / "ASHTRAYS.")
                </label>
                <input
                  type="text"
                  value={catHighlight}
                  onChange={(e) => setCatHighlight(e.target.value)}
                  placeholder="e.g. ULTRA-FINE CRUSHERS."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Monospace Badge Tag */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Top Monospace Badge Tag
                </label>
                <input
                  type="text"
                  value={catTag}
                  onChange={(e) => setCatTag(e.target.value)}
                  placeholder="e.g. MEDICAL ALLOY • RAZOR DIAMOND TEETH"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Subtitle (Aldrich font)
                </label>
                <input
                  type="text"
                  value={catSubtitle}
                  onChange={(e) => setCatSubtitle(e.target.value)}
                  placeholder="e.g. Engineered for velvety smooth sessions and clean burns."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Description (Poppins font)
                </label>
                <textarea
                  rows={2}
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="Describe the craftsmanship, materials, and smoke experience..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUploader
                  label="Product Cutout Image"
                  value={catProductImage}
                  onChange={setCatProductImage}
                  required
                />

                <ImageUploader
                  label="Ambient Background Image (Optional)"
                  value={catBackgroundImage}
                  onChange={setCatBackgroundImage}
                  aspectRatio="video"
                />
              </div>

              {/* Route & Button Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Target Category Route
                  </label>
                  <input
                    type="text"
                    value={catLink}
                    onChange={(e) => setCatLink(e.target.value)}
                    placeholder="/products-by-category?category=Herb%20Grinders"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={catButtonText}
                    onChange={(e) => setCatButtonText(e.target.value)}
                    placeholder="Shop Category Collection"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Features list */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Key Features (Comma-Separated)
                </label>
                <input
                  type="text"
                  value={catFeaturesInput}
                  onChange={(e) => setCatFeaturesInput(e.target.value)}
                  placeholder="63mm Aircraft 6061 Alloy, Curved Diamond Teeth, Same-Day Accra Delivery"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCat}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase rounded-xl transition-all shadow-md active:scale-95"
                >
                  {savingCat ? 'Saving Slide...' : 'Save Category Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD HERO SLIDER */}
      {/* ========================================================================= */}
      {heroModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setHeroModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-raleway text-xl font-bold text-white mb-6">
              Add New 4K Hero Banner
            </h2>

            <form onSubmit={handleAddHeroSlider} className="space-y-4">
              <ImageUploader
                label="Hero 4K Banner Image"
                value={heroImageUrl}
                onChange={setHeroImageUrl}
                aspectRatio="wide"
                required
              />

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Banner Headline (Anton Bold)
                </label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="e.g. GOOD TREATS."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="e.g. Curated premium smoking accessories crafted for refined taste."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Target Route
                </label>
                <input
                  type="text"
                  value={heroLink}
                  onChange={(e) => setHeroLink(e.target.value)}
                  placeholder="/shop or /products-by-category?category=Herb%20Grinders"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setHeroModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingHero}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase rounded-xl transition-all shadow-md active:scale-95"
                >
                  {savingHero ? 'Adding...' : 'Add 4K Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
