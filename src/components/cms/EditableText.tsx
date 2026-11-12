import React, { useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSiteContent } from '../../context/SiteContentContext';

interface EditableTextProps {
  contentKey: string;
  defaultValue: string;
  label?: string;
  type?: 'text' | 'textarea';
  page?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div';
  className?: string;
  children?: React.ReactNode;
}

export const EditableText: React.FC<EditableTextProps> = ({
  contentKey,
  defaultValue,
  label,
  type = 'text',
  page = 'General',
  as = 'span',
  className = '',
  children,
}) => {
  const { isAdmin } = useAuth();
  const { getContent, isEditMode, openEditor, registerField } = useSiteContent();

  const fieldLabel = label || contentKey.replace(/_/g, ' ').toUpperCase();
  const currentText = getContent(contentKey, defaultValue);

  useEffect(() => {
    registerField({
      key: contentKey,
      label: fieldLabel,
      defaultValue,
      type,
      page,
    });
  }, [contentKey, fieldLabel, defaultValue, type, page, registerField]);

  const handleClick = (e: React.MouseEvent) => {
    if (isAdmin && isEditMode) {
      e.preventDefault();
      e.stopPropagation();
      openEditor(contentKey, fieldLabel, defaultValue, type, page);
    }
  };

  const Component = as as any;

  if (!isAdmin || !isEditMode) {
    return <Component className={className}>{children || currentText}</Component>;
  }

  return (
    <Component
      onClick={handleClick}
      className={`relative group/editable cursor-pointer transition-all ${className} ring-1 ring-amber-400/50 hover:ring-2 hover:ring-amber-400 rounded-sm hover:bg-amber-400/5`}
      title={`Click to edit "${fieldLabel}"`}
    >
      {children || currentText}
      <span className="opacity-0 group-hover/editable:opacity-100 transition-opacity absolute -top-3 -right-2 z-30 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-mono font-bold shadow-md pointer-events-none">
        <Pencil className="w-2.5 h-2.5" />
        <span>Edit</span>
      </span>
    </Component>
  );
};

