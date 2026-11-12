import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Edit3,
  Sliders,
  LogOut,
  Sparkles,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSiteContent } from '../../context/SiteContentContext';

export const AdminLiveBar: React.FC = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { isEditMode, setIsEditMode, openPageEditor } = useSiteContent();

  // If not signed in as admin, show nothing
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <aside
      aria-label="Admin CMS controls"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 sm:p-2 bg-zinc-950/95 border border-amber-400/60 rounded-full shadow-2xl backdrop-blur-xl animate-fade-in select-none max-w-[95vw]"
    >
      {/* Admin Badge */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/10 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
        <ShieldCheck className="w-3.5 h-3.5 fill-amber-400 text-black" />
        <span className="hidden sm:inline">Admin CMS</span>
      </div>

      {/* Live Edit Mode Toggle */}
      <button
        onClick={() => setIsEditMode(!isEditMode)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-poppins font-semibold transition-all ${
          isEditMode
            ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30 font-bold'
            : 'bg-zinc-900 text-zinc-300 hover:text-white'
        }`}
        title="Toggle Click-to-Edit outlines on text and images"
      >
        {isEditMode ? (
          <>
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editing ON</span>
          </>
        ) : (
          <>
            <Eye className="w-3.5 h-3.5 text-zinc-400" />
            <span>Editing OFF</span>
          </>
        )}
      </button>

      {/* Quick Edit Page Content Button */}
      <button
        onClick={openPageEditor}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-poppins font-semibold transition-all border border-zinc-800"
        title="Edit all captions, contact info, and images on this page in one panel"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden md:inline">Edit Page Content</span>
      </button>

      {/* Link to Admin Dashboard */}
      <Link
        to="/admin/dashboard"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-poppins font-semibold transition-all"
        title="Open Admin Dashboard"
      >
        <Sliders className="w-3.5 h-3.5 text-zinc-400" />
        <span className="hidden lg:inline">Dashboard</span>
      </Link>

      {/* Sign Out */}
      <button
        onClick={() => signOut()}
        className="p-1.5 text-zinc-400 hover:text-red-400 rounded-full hover:bg-zinc-900 transition-colors"
        title="Exit Admin Mode"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </aside>
  );
};
