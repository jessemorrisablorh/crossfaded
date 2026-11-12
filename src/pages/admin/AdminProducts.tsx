import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, X, Check, Eye } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { firestoreService } from '../../services/firestoreService';
import { useToast } from '../../context/ToastContext';
import { Product } from '../../types';
import { ImageUploader } from '../../components/ui/ImageUploader';

export const AdminProducts: React.FC = () => {
  const { products, categories } = useProducts();
  const { success, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stock, setStock] = useState<number>(10);
  const [featured, setFeatured] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice(0);
    setSalePrice(0);
    setCategoryId(categories[0]?.categoryId || '');
    setCategoryName(categories[0]?.name || '');
    setImageUrl('');
    setStock(10);
    setFeatured(false);
    setModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price);
    setSalePrice(prod.salePrice || 0);
    setCategoryId(prod.categoryId || '');
    setCategoryName(prod.categoryName || '');
    setImageUrl(prod.imageUrls?.[0] || prod.image || '');
    setStock(prod.stock || 0);
    setFeatured(Boolean(prod.featured));
    setModalOpen(true);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = categories.find((c) => c.categoryId === e.target.value || c.name === e.target.value);
    if (selected) {
      setCategoryId(selected.categoryId || selected.id || '');
      setCategoryName(selected.name);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0) {
      toastError('Please enter a valid product name and price.');
      return;
    }

    setSaving(true);
    try {
      const productPayload = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        salePrice: salePrice > 0 ? Number(salePrice) : undefined,
        categoryId: categoryId || (categories[0]?.categoryId || 'cat-grinders'),
        categoryName: categoryName || (categories[0]?.name || 'Herb Grinders'),
        category: categoryName || (categories[0]?.name || 'Herb Grinders'),
        imageUrls: imageUrl.trim() ? [imageUrl.trim()] : ['https://images.unsplash.com/photo-1568644396922-5c3bfae12521?auto=format&fit=crop&w=1200&q=80'],
        stock: Number(stock),
        featured: Boolean(featured),
        rating: 4.9,
        reviewsCount: 15,
      };

      if (editingProduct) {
        const pId = editingProduct.productId || editingProduct.id!;
        await firestoreService.updateProduct(pId, productPayload);
        success(`Product "${name}" updated successfully!`);
      } else {
        await firestoreService.addProduct(productPayload as any);
        success(`Product "${name}" created successfully!`);
      }

      setModalOpen(false);
    } catch (err) {
      console.error(err);
      toastError('Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (prod: Product) => {
    const pId = prod.productId || prod.id;
    if (!pId) return;

    if (window.confirm(`Are you sure you want to delete "${prod.name}"?`)) {
      try {
        await firestoreService.deleteProduct(pId);
        success(`Product "${prod.name}" removed from catalog.`);
      } catch (err) {
        console.error(err);
        toastError('Failed to delete product.');
      }
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-raleway text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Product Management
          </h1>
          <p className="font-poppins text-xs text-zinc-400 mt-1">
            Create, update stock, modify pricing, and configure 4K images.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-xl transition-all shadow-md active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Filter products by title or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
        />
        <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800 overflow-hidden backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-[11px] text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-4">Item</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Featured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {filteredProducts.map((p) => {
                const img = p.imageUrls?.[0] || p.image || '/images/cigar.png';
                return (
                  <tr key={p.productId || p.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={img}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-xl bg-zinc-950 border border-zinc-800 shrink-0"
                      />
                      <div className="min-w-0 max-w-xs">
                        <p className="font-semibold text-white truncate font-poppins">{p.name}</p>
                        <p className="text-[11px] text-zinc-500 truncate">{p.description}</p>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-amber-400">{p.categoryName}</td>
                    <td className="p-4 font-mono font-bold text-white">
                      GHS {p.price.toFixed(2)}
                      {p.salePrice && p.salePrice > 0 && (
                        <span className="block text-[10px] text-emerald-400">
                          Sale: GHS {p.salePrice.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.stock > 0
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      {p.featured ? (
                        <span className="text-amber-400 font-bold">Yes</span>
                      ) : (
                        <span className="text-zinc-600">No</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p)}
                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-raleway text-xl font-bold text-white mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vortex 4-Piece Matte Herb Grinder"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Regular Price (GHS) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Sale Price (GHS) (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={handleCategoryChange}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.categoryId || c.id} value={c.categoryId || c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <ImageUploader
                label="Product 4K Image"
                value={imageUrl}
                onChange={setImageUrl}
                aspectRatio="square"
                required
              />

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="text-amber-500 rounded focus:ring-amber-500"
                />
                <label htmlFor="featuredToggle" className="text-xs text-zinc-300 cursor-pointer">
                  Feature this product on homepage bestsellers
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase rounded-xl transition-all shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

