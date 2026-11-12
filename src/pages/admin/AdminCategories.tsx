import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, Grid } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { firestoreService } from '../../services/firestoreService';
import { useToast } from '../../context/ToastContext';
import { Category } from '../../types';
import { ImageUploader } from '../../components/ui/ImageUploader';

export const AdminCategories: React.FC = () => {
  const { categories } = useProducts();
  const { success, error: toastError } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setImageUrl('');
    setDescription('');
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setImageUrl(cat.imageUrl || cat.image || '');
    setDescription(cat.description || '');
    setModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Category name is required.');
      return;
    }

    setSaving(true);
    try {
      const generatedSlug = slug.trim() || name.toLowerCase().replace(/\s+/g, '-');
      const payload = {
        name: name.trim(),
        slug: generatedSlug,
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?auto=format&fit=crop&w=1200&q=80',
        description: description.trim(),
      };

      if (editingCategory) {
        const catId = editingCategory.categoryId || editingCategory.id!;
        await firestoreService.updateCategory(catId, payload);
        success(`Category "${name}" updated!`);
      } else {
        await firestoreService.addCategory(payload as any);
        success(`Category "${name}" created!`);
      }

      setModalOpen(false);
    } catch (err) {
      console.error(err);
      toastError('Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    const catId = cat.categoryId || cat.id;
    if (!catId) return;

    if (window.confirm(`Delete category "${cat.name}"?`)) {
      try {
        await firestoreService.deleteCategory(catId);
        success(`Category "${cat.name}" deleted.`);
      } catch (err) {
        console.error(err);
        toastError('Failed to delete category.');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-raleway text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Category Management
          </h1>
          <p className="font-poppins text-xs text-zinc-400 mt-1">
            Organize catalog classifications with cover photos and descriptions.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-xl transition-all shadow-md active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.categoryId || cat.id}
            className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800 backdrop-blur space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="h-44 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 mb-4 relative">
                <img
                  src={cat.imageUrl || cat.image || '/images/cigar.png'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-md bg-black/75 backdrop-blur text-amber-400 font-mono text-[11px] font-bold">
                  slug: /{cat.slug}
                </span>
              </div>
              <h3 className="font-aldrich text-lg font-bold text-white">{cat.name}</h3>
              <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{cat.description || 'No description'}</p>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
              <button
                onClick={() => openEditModal(cat)}
                className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-xl transition-colors"
                title="Edit category"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteCategory(cat)}
                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-colors"
                title="Delete category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-raleway text-xl font-bold text-white mb-6">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h2>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Herb Grinders"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. grinders"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <ImageUploader
                label="Category 4K Cover Image"
                value={imageUrl}
                onChange={setImageUrl}
                aspectRatio="video"
              />

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description for storefront display..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
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
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

