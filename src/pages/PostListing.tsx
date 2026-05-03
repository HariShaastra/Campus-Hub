import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { listingService } from '../services/listingService';
import { Category, ListingType } from '../types';
import { ArrowLeft, Rocket, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { BackButton } from '../components/SharedUI';

const CATEGORIES: Category[] = ['Books & Notes', 'Hostel Essentials', 'Electronics', 'Furniture', 'Services', 'Miscellaneous'];

export const PostListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Books & Notes' as Category,
    type: 'sale' as ListingType,
    isUrgent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.collegeId) {
      alert("Profile incompleted: College ID missing. Please refresh or sign in again.");
      return;
    }
    
    setLoading(true);
    try {
      await listingService.createListing({
        sellerId: user.uid,
        sellerName: user.name,
        sellerRating: user.rating,
        collegeId: user.collegeId,
        title: formData.title,
        description: formData.description,
        price: formData.type === 'sale' ? Number(formData.price) : undefined,
        category: formData.category,
        type: formData.type,
        images: [], 
        status: 'active',
        isUrgent: formData.isUrgent
      });
      navigate('/market');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-24 px-2 md:px-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Help Sidebar */}
        <div className="md:w-72 space-y-6 order-2 md:order-1">
          <BackButton />
          
          <div className="vibrant-card p-6 bg-indigo-50 border-indigo-100">
            <Info className="w-6 h-6 text-brand-primary mb-3" />
            <h3 className="font-black text-brand-dark uppercase tracking-tight mb-2">Tips</h3>
            <ul className="text-[10px] text-slate-600 space-y-3 font-black uppercase tracking-widest leading-relaxed">
              <li>• Clear titles sell faster</li>
              <li>• Be honest about quality</li>
              <li>• Set a fair price</li>
              <li>• Urgent tag = More views</li>
            </ul>
          </div>
          
          <div className="vibrant-card p-8 bg-brand-dark text-white shadow-xl shadow-indigo-100">
             <Rocket className="w-8 h-8 text-amber-400 mb-4" />
             <p className="font-black italic uppercase tracking-tighter text-3xl leading-[0.8]">POST TO<br/>COLLEGE</p>
             <p className="text-[10px] text-indigo-300 font-bold uppercase mt-6 tracking-widest leading-none border-t border-white/10 pt-4">Safe Community</p>
          </div>
        </div>

        {/* Main Form */}
        <div className="flex-1 order-1 md:order-2">
          <div className="mb-10">
            <h1 className="text-6xl font-black text-brand-dark tracking-tighter leading-none uppercase italic mb-3">CREATE<br/>LISTING</h1>
            <p className="text-slate-500 font-medium max-w-sm leading-relaxed">Broadcast your items or services to every verified student at {user?.college}.</p>
          </div>
          
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit} 
            className="vibrant-card p-8 md:p-12 space-y-8 shadow-2xl bg-white border-none"
          >
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Item Identity</label>
              <input
                required
                type="text"
                className="vibrant-input !bg-slate-50 border-2 border-transparent focus:border-indigo-100 !text-lg"
                value={formData.title}
                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g., Engineering Mathematics IV Textbook"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Sector</label>
                <select
                  className="vibrant-input !bg-slate-50 border-2 border-transparent focus:border-indigo-100 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1.5rem_center] bg-no-repeat font-black uppercase italic tracking-tighter"
                  value={formData.category}
                  onChange={(e) => setFormData(p => ({ ...p, category: e.target.value as Category }))}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Transaction Logic</label>
                <select
                  className="vibrant-input !bg-slate-50 border-2 border-transparent focus:border-indigo-100 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1.5rem_center] bg-no-repeat font-black uppercase italic tracking-tighter"
                  value={formData.type}
                  onChange={(e) => setFormData(p => ({ ...p, type: e.target.value as ListingType }))}
                >
                  <option value="sale">Direct Sale</option>
                  <option value="exchange">Resource Swap</option>
                  <option value="service">Skill Offering</option>
                </select>
              </div>
            </div>

            {formData.type === 'sale' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-brand-primary text-2xl italic">₹</span>
                  <input
                    required
                    type="number"
                    className="vibrant-input !bg-slate-50 border-2 border-transparent focus:border-indigo-100 !pl-12 text-2xl font-black text-brand-dark italic"
                    value={formData.price}
                    onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))}
                    placeholder="00"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Details & Condition</label>
              <textarea
                required
                rows={4}
                className="vibrant-input !bg-slate-50 border-2 border-transparent focus:border-indigo-100 !rounded-[2.5rem] pt-6 font-medium"
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="What's the status? Quality, age, reason for selling..."
              />
            </div>

            <div 
              className="p-5 bg-slate-50 rounded-3xl flex items-center justify-between group cursor-pointer border-2 border-transparent hover:border-indigo-100 transition-all active:scale-[0.98]" 
              onClick={() => setFormData(p => ({ ...p, isUrgent: !p.isUrgent }))}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${formData.isUrgent ? 'bg-rose-500 shadow-lg shadow-rose-200' : 'bg-slate-200'}`}>
                  {formData.isUrgent && <div className="w-3 h-3 bg-white rounded-full"></div>}
                </div>
                <span className="text-sm font-black text-slate-600 uppercase italic tracking-tighter">Mark as Urgent (Higher Priority Feed)</span>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="vibrant-button w-full py-6 text-2xl font-black italic uppercase shadow-indigo-100 shadow-2xl tracking-tighter"
            >
              {loading ? 'POSTING...' : 'CREATE POST'}
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};
