import React, { useEffect } from 'react';
import { Image as ImageIcon, Pencil } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSiteContent } from '../../context/SiteContentContext';

interface EditableImageProps {
  contentKey: string;
  defaultValue: string;
  label?: string;
  alt?: string;
  className?: string;
  page?: string;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  contentKey,
  defaultValue,
  label,
  alt = 'Store Image',
  className = '',
  page = 'General',
}) => {
  const { isAdmin } = useAuth();
  const { getContent, isEditMode, openEditor, registerField } = useSiteContent();

  const fieldLabel = label || contentKey.replace(/_/g, ' ').toUpperCase();
  const currentSrc = getContent(contentKey, defaultValue);

  useEffect(() => {
    registerField({
      key: contentKey,
      label: fieldLabel,
      defaultValue,
      type: 'image',
      page,
    });
  }, [contentKey, fieldLabel, defaultValue, page, registerField]);

  const handleClick = (e: React.MouseEvent) => {
    if (isAdmin && isEditMode) {
      e.preventDefault();
      e.stopPropagation();
      openEditor(contentKey, fieldLabel, defaultValue, 'image', page);
    }
  };

  if (!isAdmin || !isEditMode) {
    return <img src={currentSrc} alt={alt} className={className} />;
  }

  return (
    <div
      onClick={handleClick}
      className="relative group/editimg cursor-pointer inline-block w-full h-full"
      title={`Click to change image for "${fieldLabel}"`}
    >
      <img src={currentSrc} alt={alt} className={`${className} ring-2 ring-amber-400`} />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/editimg:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 z-20 rounded">
        <span className="px-3 py-1.5 rounded-lg bg-amber-400 text-black text-xs font-poppins font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xl">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Change Image</span>
        </span>
        <span className="text-[10px] text-zinc-300 font-mono">{fieldLabel}</span>
      </div>
    </div>
  );
};

