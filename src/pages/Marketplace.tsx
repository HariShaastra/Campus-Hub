import React, { useState, useEffect } from 'react';
import { listingService } from '../services/listingService';
import { chatService } from '../services/chatService';
import { reportService } from '../services/reportService';
import { useAuth } from '../hooks/useAuth';
import { Listing, Category } from '../types';
import { Tag, MessageSquare, Star, ChevronRight, Store, Search, Flag, Shield, Bookmark as BookmarkIcon, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BackButton } from '../components/SharedUI';
import { campusService } from '../services/campusService';

export const ListingCard: React.FC<{ listing: Listing }> = ({ listing }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!user) return;
    const checkBookmark = async () => {
      const bookmarks = await campusService.getBookmarks(user.uid);
      setIsBookmarked(bookmarks?.some(b => b.targetId === listing.id) || false);
    };
    checkBookmark();
  }, [user, listing.id]);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    const bookmarked = await campusService.toggleBookmark(user.uid, listing.id, 'listing');
    setIsBookmarked(!!bookmarked);
  };

  const handleStartChat = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    if (user.uid === listing.sellerId) {
      return;
    }

    const thread = await chatService.getOrCreateThread(
      user.uid,
      listing.sellerId,
      listing.id,
      {
        [user.uid]: user.name,
        [listing.sellerId]: listing.sellerName
      }
    );

    if (thread) {
      navigate(`/chat/${thread.id}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="vibrant-card overflow-hidden group border-none shadow-lg hover:shadow-2xl flex flex-col transition-all duration-500"
    >
      <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center relative overflow-hidden shrink-0">
        {listing.images && listing.images[0] ? (
          <img 
            src={listing.images[0]} 
            alt={listing.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-slate-300">
             <Store className="w-16 h-16" />
          </div>
        )}
        <div className="absolute top-4 left-4">
           <span className="badge-verified bg-white/95 backdrop-blur-md border-none shadow-sm font-black italic">
             {listing.category}
           </span>
        </div>
        {listing.isUrgent && (
          <div className="absolute top-4 right-4 badge-urgent shadow-lg animate-pulse">Urgent</div>
        )}
        {listing.paymentStatus && (
          <div className={`absolute bottom-4 right-4 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm ${
            listing.paymentStatus === 'escrow' ? 'bg-amber-400 text-amber-900' : 'bg-emerald-400 text-emerald-900'
          }`}>
            {listing.paymentStatus}
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col bg-white">
        <div className="flex justify-between items-start mb-3 gap-4">
          <h3 className="text-xl font-black text-brand-dark leading-tight group-hover:text-brand-primary transition-colors line-clamp-2 uppercase italic">{listing.title}</h3>
          <p className="text-2xl font-black text-brand-primary tracking-tighter italic">
            {listing.type === 'sale' ? `₹${listing.price}` : 'Trade'}
          </p>
        </div>
        <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-8 flex-1">{listing.description}</p>
        
        <div className="flex items-center justify-between pt-5 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Link to={`/user/${listing.sellerId}`} className="w-10 h-10 rounded-2xl bg-indigo-900 flex items-center justify-center text-xs font-black text-white shadow-md border border-white hover:scale-110 transition-transform">
              {listing.sellerName[0]}
            </Link>
            <div>
              <Link to={`/user/${listing.sellerId}`} className="text-[10px] font-black text-slate-400 leading-none mb-1 uppercase tracking-widest hover:text-brand-primary transition-colors block">{listing.sellerName}</Link>
              <div className="flex items-center gap-1">
                <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                <span className="text-[10px] font-black text-slate-500">{listing.sellerRating}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={async (e) => {
                e.preventDefault();
                if (!user) return;
                await reportService.submitReport({
                  reporterId: user.uid,
                  targetId: listing.id,
                  targetType: 'listing',
                  reason: 'Inappropriate content or potential scam',
                  collegeId: user.collegeId
                });
                alert('Incident reported to campus oversight.');
              }}
              className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
              title="Report listing"
            >
              <Flag className="w-4 h-4" />
            </button>
            <button 
              onClick={handleToggleBookmark}
              className={`p-3 transition-colors ${isBookmarked ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'}`}
              title="Save to bookmarks"
            >
              <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            {user?.uid === listing.sellerId && listing.status === 'active' && (
              <button 
                onClick={async (e) => {
                  e.preventDefault();
                  if (window.confirm("Mark as sold? This will archive the post.")) {
                    await listingService.markAsSold(listing.id);
                    window.location.reload(); // Refresh to show changes
                  }
                }}
                className="px-4 py-2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md hover:bg-brand-dark transition-colors italic"
              >
                Mark Sold
              </button>
            )}
            {user?.uid !== listing.sellerId && listing.status === 'active' && (
              <button 
                onClick={handleStartChat} 
                className="vibrant-button !px-6 !py-3 shadow-indigo-100 flex items-center gap-2 group/btn"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Connect</span>
                <MessageSquare className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              </button>
            )}
            {listing.status === 'sold' && (
              <div className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center">
                Archived/Sold
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CATEGORIES: (Category | 'All Items')[] = ['All Items', 'Books & Notes', 'Hostel Essentials', 'Electronics', 'Furniture', 'Services', 'Miscellaneous'];

export const Marketplace = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Category | 'All Items'>('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSold, setShowSold] = useState(false);

  useEffect(() => {
    if (!user?.collegeId) return;

    const fetch = async () => {
      setLoading(true);
      // If showSold is true, we fetch BOTH active and sold, otherwise just active
      const data = await listingService.filterListings(
        user.collegeId,
        filter === 'All Items' ? undefined : filter as Category,
        undefined,
        showSold ? undefined : 'active'
      );
      
      setListings(data || []);
      setLoading(false);
    };
    fetch();
  }, [filter, user, showSold]);

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-24 md:pt-32 pb-24 px-2 md:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 md:gap-10 mb-12 md:mb-16">
        <div className="space-y-4">
          <BackButton />
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
             <span className="text-[10px] font-black tracking-widest text-brand-primary uppercase">College: {user?.college?.toUpperCase()}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-brand-dark tracking-tighter leading-[0.8] italic uppercase">
            COLLEGE<br/>MARKET
          </h1>
          <p className="text-slate-500 font-medium max-w-sm text-sm">Items shared within {user?.college}.</p>
        </div>
        
        <div className="w-full lg:max-w-md space-y-6">
           <div className="relative">
              <input 
                type="text"
                placeholder="Search..."
                className="vibrant-input !bg-white border-2 border-slate-100 focus:border-brand-primary !pl-14 text-lg font-medium shadow-xl shadow-slate-100 transition-all focus:shadow-indigo-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
           </div>

           <div className="flex flex-wrap gap-2 justify-start md:justify-end">
             <button
               onClick={() => setShowSold(!showSold)}
               className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-full transition-all border-2 flex items-center gap-2 ${
                 showSold 
                   ? 'bg-rose-50 text-rose-500 border-rose-200 shadow-lg' 
                   : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-100'
               }`}
             >
               <Clock className="w-3 h-3" />
               {showSold ? 'HIDE ARCHIVED' : 'SHOW ARCHIVED'}
             </button>
             {CATEGORIES.map((c) => (
               <button
                 key={c}
                 onClick={() => setFilter(c)}
                 className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-full transition-all border-2 ${
                   filter === c 
                     ? 'bg-brand-primary text-white border-brand-primary shadow-xl shadow-indigo-100' 
                     : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50'
                 }`}
               >
                 {c === 'All Items' ? 'EVERYTHING' : c}
               </button>
             ))}
           </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="vibrant-card h-96 animate-pulse bg-slate-100/50 rounded-[3rem]" />
          ))}
        </div>
      ) : filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredListings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="vibrant-card p-20 text-center bg-white border-dashed">
          <Store className="w-16 h-16 mx-auto text-slate-200 mb-4" />
          <p className="text-2xl font-black text-slate-800 uppercase italic">No items found.</p>
          <p className="text-slate-400 font-medium mt-2 mb-10">Nothing in this category for {user?.college}.</p>
          <Link to="/post" className="vibrant-button px-10 italic font-black uppercase tracking-widest">Post Item</Link>
        </div>
      )}
    </div>
  );
};
