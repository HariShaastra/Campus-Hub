import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { academicService } from '../services/academicService';
import { chatService } from '../services/chatService';
import { campusService } from '../services/campusService';
import { AcademicMaterial, AcademicCategory } from '../types';
import { FileText, Download, Plus, X, Bookmark, Search, Filter, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BackButton } from '../components/SharedUI';
import { Link, useNavigate } from 'react-router-dom';

const CATEGORIES: AcademicCategory[] = ['Notes', 'Lab Manual', 'Question Paper', 'Short Notes'];

export const AcademicVault = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<AcademicMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [filter, setFilter] = useState<AcademicCategory | 'All'>('All');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    category: 'Notes' as AcademicCategory
  });

  useEffect(() => {
    if (user?.collegeId) {
      loadMaterials();
      loadBookmarks();
    }
  }, [user, filter]);

  const loadBookmarks = async () => {
    if (!user) return;
    const bData = await campusService.getBookmarks(user.uid);
    setBookmarks(bData?.map(b => b.targetId) || []);
  };

  const handleToggleBookmark = async (id: string) => {
    if (!user) return;
    await campusService.toggleBookmark(user.uid, id, 'academic');
    loadBookmarks();
  };

  const loadMaterials = async () => {
    if (!user?.collegeId) return;
    setLoading(true);
    const data = await academicService.getMaterials(
      user.collegeId, 
      filter === 'All' ? undefined : filter
    );
    setMaterials(data || []);
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.collegeId) {
      alert("Profile incompleted: College ID missing.");
      return;
    }

    await academicService.uploadMaterial({
      authorId: user.uid,
      authorName: user.name,
      collegeId: user.collegeId,
      title: newMaterial.title,
      description: newMaterial.description,
      category: newMaterial.category,
    });

    setNewMaterial({ title: '', description: '', category: 'Notes' });
    setIsUploading(false);
    loadMaterials();
  };

  const handleStartChat = async (doc: AcademicMaterial) => {
    if (!user) return;
    if (user.uid === doc.authorId) return;

    const thread = await chatService.getOrCreateThread(
      user.uid,
      doc.authorId,
      undefined,
      {
        [user.uid]: user.name,
        [doc.authorId]: doc.authorName
      }
    );

    if (thread) {
      navigate(`/chat/${thread.id}`);
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-24 px-2 md:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
        <div className="space-y-4">
          <BackButton />
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
             <span className="text-[10px] font-black tracking-widest text-brand-primary uppercase">College Notes Bank</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-brand-dark tracking-tighter leading-[0.8] italic uppercase">
            STUDY<br/>NOTES
          </h1>
          <p className="text-slate-500 font-medium max-w-sm text-sm">Access notes, manuals, and papers shared by other students at {user?.college}.</p>
        </div>
        
        <button 
          onClick={() => setIsUploading(true)}
          className="vibrant-button flex items-center gap-3 h-16 px-8 shadow-xl shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          <span className="font-black text-lg uppercase tracking-tight">Post Notes</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-8 no-scrollbar">
        {['All', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat as any)}
            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              filter === cat 
                ? 'bg-brand-primary text-white shadow-lg shadow-indigo-100' 
                : 'bg-white text-slate-400 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-brand-dark/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="vibrant-card bg-white p-10 w-full max-w-xl relative border-none shadow-2xl"
            >
              <button onClick={() => setIsUploading(false)} className="absolute top-6 right-6 text-slate-300 hover:text-brand-dark transition-colors">
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-indigo-100 text-brand-primary rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                 </div>
                 <h2 className="text-3xl font-black text-brand-dark tracking-tight uppercase">Upload Notes</h2>
              </div>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Title</label>
                  <input 
                    autoFocus
                    required
                    className="vibrant-input !bg-slate-50" 
                    placeholder="e.g. Maths Unit 2 Notes"
                    value={newMaterial.title}
                    onChange={e => setNewMaterial(p => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Category</label>
                  <select 
                    className="vibrant-input !bg-slate-50"
                    value={newMaterial.category}
                    onChange={e => setNewMaterial(p => ({ ...p, category: e.target.value as AcademicCategory }))}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Description</label>
                  <textarea 
                    required
                    rows={3}
                    className="vibrant-input !bg-slate-50 !rounded-3xl" 
                    placeholder="Briefly describe what this is."
                    value={newMaterial.description}
                    onChange={e => setNewMaterial(p => ({ ...p, description: e.target.value }))}
                  />
                </div>
                <button type="submit" className="vibrant-button w-full py-5 text-xl font-black shadow-indigo-100 shadow-xl uppercase italic tracking-tighter">Post Notes</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1,2,3,4,5,6].map(i => (
            <div key={i} className="vibrant-card h-64 animate-pulse bg-slate-50" />
          ))
        ) : materials.length > 0 ? (
          materials.map((doc, idx) => (
            <motion.div 
              key={doc.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="vibrant-card p-8 bg-white hover:bg-slate-50/50 transition-colors group flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-indigo-100 text-brand-primary rounded-2xl flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                  <FileText className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 px-3 py-1 bg-indigo-50 rounded-full">
                  {doc.category}
                </span>
              </div>
              <h3 className="text-2xl font-black text-brand-dark tracking-tighter uppercase mb-2 group-hover:text-brand-primary transition-colors">{doc.title}</h3>
              <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed flex-1">{doc.description}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Shared By</span>
                  <Link to={`/user/${doc.authorId}`} className="text-xs font-bold text-slate-500 hover:text-brand-primary transition-colors italic">{doc.authorName}</Link>
                </div>
                <div className="flex gap-2">
                   {user?.uid !== doc.authorId && (
                     <button 
                      onClick={() => handleStartChat(doc)}
                      className="p-3 bg-slate-50 text-slate-400 hover:bg-brand-primary hover:text-white rounded-xl transition-all"
                      title="Message Author"
                     >
                        <MessageSquare className="w-4 h-4" />
                     </button>
                   )}
                   <button 
                    onClick={() => handleToggleBookmark(doc.id)}
                    className={`p-3 rounded-xl transition-all ${bookmarks.includes(doc.id) ? 'bg-amber-100 text-amber-500' : 'bg-slate-50 text-slate-400 hover:text-amber-500'}`}
                    title="Bookmark"
                   >
                     <Bookmark className={`w-4 h-4 ${bookmarks.includes(doc.id) ? 'fill-current' : ''}`} />
                   </button>
                   <button className="vibrant-button !py-3 !px-6 !bg-brand-dark flex items-center gap-2 group-hover:scale-105 transition-transform">
                      <Download className="w-4 h-4" />
                      Access
                   </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center vibrant-card bg-slate-50/50 border-dashed">
            <FileText className="w-16 h-16 mx-auto text-slate-200 mb-6" />
            <p className="text-2xl font-black text-slate-400 uppercase italic">Empty Bank</p>
            <p className="text-slate-400 font-medium mt-2">Be the first to share notes with other students!</p>
          </div>
        )}
      </div>
    </div>
  );
};
