import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { campusService } from '../services/campusService';
import { listingService } from '../services/listingService';
import { Bookmark, Listing, Opportunity } from '../types';
import { 
  User, 
  Bookmark as BookmarkIcon, 
  TrendingUp, 
  Award, 
  Share2, 
  Settings, 
  LogOut,
  ChevronRight,
  Store,
  Briefcase,
  Star,
  Shield
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../components/SharedUI';

export const Profile = () => {
  const { user, logOut } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookmarks' | 'analytics'>('overview');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      const [bData, lData] = await Promise.all([
        campusService.getBookmarks(user.uid),
        listingService.getMyListings(user.uid)
      ]);
      setBookmarks(bData || []);
      setListings(lData || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleGenerateReferral = () => {
    const referralLink = `${window.location.origin}/login?ref=${user?.uid}`;
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied! Share it with your friends.");
  };

  if (!user) return null;

  return (
    <div className="pt-24 md:pt-32 pb-24 px-2 md:px-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Sidebar */}
        <div className="md:w-72 space-y-4">
          <BackButton />
          <div className="vibrant-card p-8 text-center bg-white border-none shadow-xl">
            <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-900 mx-auto flex items-center justify-center text-3xl font-black text-white shadow-2xl border-4 border-white mb-6">
              {user.name[0]}
            </div>
            <h2 className="text-2xl font-black text-brand-dark tracking-tighter uppercase italic">{user.name}</h2>
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mt-2">{user.college}</p>
            
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="text-center">
                <p className="text-xl font-black text-brand-dark">{user.rating}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase">Rating</p>
              </div>
              <div className="w-px h-8 bg-slate-100"></div>
              <div className="text-center">
                <p className="text-xl font-black text-brand-dark">{user.transactionsCount}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase">Sales</p>
              </div>
              {user.role === 'admin' && (
                <>
                  <div className="w-px h-8 bg-slate-100"></div>
                  <div className="text-center">
                    <p className="text-xl font-black text-brand-primary">★</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Admin</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="vibrant-card p-4 space-y-1 bg-white border-none shadow-lg">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'overview' ? 'bg-indigo-50 text-brand-primary' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <User className="w-4 h-4" /> Overview
            </button>
            <button 
              onClick={() => setActiveTab('bookmarks')}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'bookmarks' ? 'bg-indigo-50 text-brand-primary' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <BookmarkIcon className="w-4 h-4" /> Bookmarks
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'analytics' ? 'bg-indigo-50 text-brand-primary' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <TrendingUp className="w-4 h-4" /> Analytics
            </button>
            <div className="h-px bg-slate-50 my-2"></div>
            {user.role === 'admin' && (
              <button 
                onClick={() => navigate('/admin')}
                className="w-full flex items-center gap-3 p-3 rounded-2xl text-xs font-black uppercase tracking-wider text-brand-primary hover:bg-indigo-50 transition-all font-sans italic"
              >
                <Shield className="w-4 h-4" /> Admin Panel
              </button>
            )}
            <button 
              onClick={() => navigate('/setup')}
              className="w-full flex items-center gap-3 p-3 rounded-2xl text-xs font-black uppercase tracking-wider text-indigo-500 hover:bg-indigo-50 transition-all font-sans italic"
            >
              <Settings className="w-4 h-4" /> Change College
            </button>
            <button 
              onClick={logOut}
              className="w-full flex items-center gap-3 p-3 rounded-2xl text-xs font-black uppercase tracking-wider text-rose-500 hover:bg-rose-50 transition-all"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="vibrant-card p-8 bg-indigo-900 text-white border-none shadow-2xl relative overflow-hidden group">
                    <Share2 className="absolute top-[-10px] right-[-10px] w-24 h-24 text-white/5 group-hover:scale-110 transition-transform duration-700" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2">Invite Friends</p>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-4">EARN<br/>REWARDS</h3>
                    <p className="text-xs font-medium text-indigo-100 opacity-80 mb-6">Invite your classmates to the app and earn special badges.</p>
                    <button 
                      onClick={handleGenerateReferral}
                      className="vibrant-button !bg-white !text-indigo-900 italic font-black uppercase tracking-widest text-[10px]"
                    >
                      Copy Link
                    </button>
                 </div>

                 <div className="vibrant-card p-8 bg-white border-2 border-dashed border-slate-200 flex flex-col justify-center items-center text-center">
                    <Award className="w-12 h-12 text-slate-200 mb-4" />
                    <h3 className="text-xl font-black text-slate-400 italic uppercase">Locked</h3>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Make 5 sales to unlock</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-2xl font-black text-brand-dark italic uppercase tracking-tighter">Your Items</h3>
                 {listings.length > 0 ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {listings.map(l => (
                        <div key={l.id} className="vibrant-card p-6 bg-white border-none shadow-md flex justify-between items-center group">
                           <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{l.category}</p>
                              <h4 className="font-black text-brand-dark uppercase italic group-hover:text-brand-primary transition-colors">{l.title}</h4>
                              <p className="text-sm font-black text-brand-primary tracking-tighter mt-1 italic">₹{l.price}</p>
                           </div>
                           <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${l.status === 'active' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                              {l.status}
                           </span>
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="vibrant-card p-12 text-center bg-slate-50/50 border-none">
                      <p className="text-slate-400 font-medium">You have no active listings at the moment.</p>
                   </div>
                 )}
              </div>
            </motion.div>
          )}

          {activeTab === 'bookmarks' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h1 className="text-5xl font-black text-brand-dark tracking-tighter uppercase italic">SAVED<br/>ITEMS</h1>
              {bookmarks.length === 0 ? (
                <div className="vibrant-card p-16 text-center bg-white border-dashed">
                  <BookmarkIcon className="w-12 h-12 mx-auto text-slate-200 mb-4" />
                  <p className="text-xl font-black text-slate-400 uppercase italic">Nothing Saved</p>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">Save things you like and visit them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {bookmarks.map(b => (
                    <div key={b.id} className="vibrant-card p-6 bg-white flex items-center justify-between border-none shadow-md hover:shadow-xl transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                             {b.targetType === 'listing' ? <Store className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">{b.targetType}</p>
                             <h4 className="text-lg font-black text-brand-dark italic uppercase">Saved Item</h4>
                          </div>
                       </div>
                       <ChevronRight className="w-5 h-5 text-slate-300" />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
               <h1 className="text-5xl font-black text-brand-dark tracking-tighter uppercase italic">YOUR<br/>STATS</h1>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="vibrant-card p-6 bg-white border-none shadow-lg">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Value</p>
                     <p className="text-4xl font-black text-brand-primary tracking-tighter italic">₹{listings.reduce((acc, curr) => acc + (curr.price || 0), 0)}</p>
                     <p className="text-[9px] font-bold text-green-500 uppercase mt-2">Value of your items</p>
                  </div>
                  <div className="vibrant-card p-6 bg-white border-none shadow-lg">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Items</p>
                     <p className="text-4xl font-black text-indigo-900 tracking-tighter italic">{listings.length}</p>
                     <p className="text-[9px] font-bold text-indigo-400 uppercase mt-2">Total posts</p>
                  </div>
                  <div className="vibrant-card p-6 bg-white border-none shadow-lg">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Score</p>
                     <p className="text-4xl font-black text-amber-500 tracking-tighter italic">{(user?.rating || 0) * 20}%</p>
                     <p className="text-[9px] font-bold text-amber-500 uppercase mt-2">Reputation</p>
                  </div>
               </div>

               <div className="vibrant-card p-8 bg-slate-900 text-white border-none shadow-2xl">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-brand-primary" /> Activity Graph
                  </h3>
                  <div className="h-48 flex items-end justify-between gap-2 px-4">
                     {[40, 20, 60, 30, 80, 45, 90].map((h, i) => (
                       <div key={i} className="flex-1 bg-white/10 rounded-t-lg transition-all hover:bg-brand-primary cursor-pointer" style={{ height: `${h}%` }}></div>
                     ))}
                  </div>
                  <div className="flex justify-between mt-4 px-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                     <span>Mon</span>
                     <span>Tue</span>
                     <span>Wed</span>
                     <span>Thu</span>
                     <span>Fri</span>
                     <span>Sat</span>
                     <span>Sun</span>
                  </div>
               </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
