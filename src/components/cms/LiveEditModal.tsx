import React, { useState, useEffect } from 'react';
import { X, Check, Image as ImageIcon, Sparkles, Save, Edit3 } from 'lucide-react';
import { useSiteContent } from '../../context/SiteContentContext';
import { ImageUploader } from '../ui/ImageUploader';

export const LiveEditModal: React.FC = () => {
  const {
    activeEditor,
    closeEditor,
    getContent,
    updateContent,
    updateMultipleContent,
    isPageEditorOpen,
    closePageEditor,
    registeredFields,
  } = useSiteContent();

  // Single Item Editor State
  const [val, setVal] = useState('');
  const [saving, setSaving] = useState(false);

  // Page Editor State
  const [pageValues, setPageValues] = useState<Record<string, string>>({});
  const [savingPage, setSavingPage] = useState(false);

  useEffect(() => {
    if (activeEditor) {
      setVal(getContent(activeEditor.key, activeEditor.defaultValue));
    }
  }, [activeEditor, getContent]);

  useEffect(() => {
    if (isPageEditorOpen) {
      const initial: Record<string, string> = {};
      registeredFields.forEach((f) => {
        initial[f.key] = getContent(f.key, f.defaultValue);
      });
      setPageValues(initial);
    }
  }, [isPageEditorOpen, registeredFields, getContent]);

  const handleSaveSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEditor) return;
    setSaving(true);
    await updateContent(activeEditor.key, val);
    setSaving(false);
    closeEditor();
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPage(true);
    await updateMultipleContent(pageValues);
    setSavingPage(false);
    closePageEditor();
  };

  // 1. Single Field Modal
  if (activeEditor) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
        <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          <button
            onClick={closeEditor}
            className="absolute top-5 right-5 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              Admin Live CMS Editor
            </span>
          </div>

          <h2 className="font-aldrich text-lg font-bold text-white mb-1">
            Edit: {activeEditor.label}
          </h2>
          <p className="text-xs text-zinc-400 font-poppins mb-6">
            Key: <code className="text-zinc-300 font-mono">{activeEditor.key}</code>
          </p>

          <form onSubmit={handleSaveSingle} className="space-y-4">
            {activeEditor.type === 'textarea' ? (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-poppins">
                  Content / Caption
                </label>
                <textarea
                  rows={5}
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 leading-relaxed font-poppins"
                  required
                />
              </div>
            ) : activeEditor.type === 'image' ? (
              <ImageUploader
                label={activeEditor.label}
                value={val}
                onChange={setVal}
                required
              />
            ) : (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-poppins">
                  Text Value
                </label>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-poppins"
                  required
                />
              </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setVal(activeEditor.defaultValue)}
                className="text-xs text-zinc-400 hover:text-amber-400 underline font-poppins"
              >
                Reset to Default
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold rounded-xl font-poppins"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Publishing...' : 'Save & Publish'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. Full Page Content Manager Modal
  if (isPageEditorOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
        <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col">
          <button
            onClick={closePageEditor}
            className="absolute top-5 right-5 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              Page Content Manager
            </span>
          </div>

          <h2 className="font-aldrich text-xl font-bold text-white mb-2">
            Edit Current Page Text & Media ({registeredFields.length} Fields)
          </h2>
          <p className="text-xs text-zinc-400 font-poppins mb-6">
            Modify any caption, headline, contact phone/email/address, or image across the page in one place.
          </p>

          <form onSubmit={handleSavePage} className="flex-1 overflow-y-auto space-y-4 pr-1">
            {registeredFields.map((field) => (
              <div
                key={field.key}
                className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-white font-poppins">
                    {field.label}
                  </label>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase px-2 py-0.5 rounded bg-black">
                    {field.type}
                  </span>
                </div>

                {field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={pageValues[field.key] ?? field.defaultValue}
                    onChange={(e) =>
                      setPageValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 leading-relaxed font-poppins"
                  />
                ) : field.type === 'image' ? (
                  <ImageUploader
                    label=""
                    value={pageValues[field.key] ?? field.defaultValue}
                    onChange={(url) =>
                      setPageValues((prev) => ({ ...prev, [field.key]: url }))
                    }
                  />
                ) : (
                  <input
                    type="text"
                    value={pageValues[field.key] ?? field.defaultValue}
                    onChange={(e) =>
                      setPageValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="w-full bg-black border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-poppins"
                  />
                )}
              </div>
            ))}

            <div className="sticky bottom-0 bg-zinc-950 pt-4 flex justify-end gap-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={closePageEditor}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold rounded-xl font-poppins"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingPage}
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingPage ? 'Saving All...' : 'Save All Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
};

