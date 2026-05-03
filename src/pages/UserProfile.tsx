import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { campusService } from '../services/campusService';
import { listingService } from '../services/listingService';
import { reviewService } from '../services/reviewService';
import { chatService } from '../services/chatService';
import { useAuth } from '../hooks/useAuth';
import { User, Listing, Review } from '../types';
import { Star, MessageSquare, ShieldCheck, Clock, ArrowLeft, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BackButton } from '../components/SharedUI';
import { formatDistanceToNow } from 'date-fns';

export const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    if (!userId) return;
    
    const fetch = async () => {
      setLoading(true);
      const [pData, lData, rData] = await Promise.all([
        campusService.getUserProfile(userId),
        listingService.getMyListings(userId),
        reviewService.getUserReviews(userId)
      ]);
      
      setProfile(pData);
      setListings(lData || []);
      setReviews(rData || []);
      setReviewCount(rData?.length || 0);
      setLoading(false);
    };
    
    fetch();
  }, [userId]);

  const handleStartChat = async () => {
    if (!currentUser || !profile) return;
    
    const thread = await chatService.getOrCreateThread(
      currentUser.uid,
      profile.uid,
      undefined,
      {
        [currentUser.uid]: currentUser.name,
        [profile.uid]: profile.name
      }
    );

    if (thread) {
      navigate(`/chat/${thread.id}`);
    }
  };

  const handleLeaveReview = async () => {
    if (!currentUser || !profile) return;
    
    await reviewService.addReview({
      targetUserId: profile.uid,
      reviewerId: currentUser.uid,
      reviewerName: currentUser.name,
      rating: newReview.rating,
      comment: newReview.comment
    });
    
    // Refresh reviews
    const rData = await reviewService.getUserReviews(profile.uid);
    setReviews(rData || []);
    setReviewCount(rData?.length || 0);
    setShowReviewModal(false);
    setNewReview({ rating: 5, comment: '' });
  };

  if (loading) {
    return (
      <div className="pt-32 px-6 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-brand-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Accessing Personnel Profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pt-32 px-6 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-black text-brand-dark uppercase italic">Profile Redacted</h1>
        <p className="text-slate-500 mt-4">The requested user profile does not exist or has been archived.</p>
        <Link to="/" className="vibrant-button inline-block mt-8">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-24 px-6 max-w-5xl mx-auto">
      <div className="mb-12">
        <BackButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="vibrant-card p-8 text-center relative overflow-hidden bg-white border-none shadow-xl">
             <div className="absolute top-0 left-0 w-full h-2 bg-brand-primary"></div>
             <div className="w-24 h-24 bg-indigo-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-4xl font-black text-white shadow-lg ring-8 ring-indigo-50 border-2 border-white">
               {profile.name[0]}
             </div>
             <h1 className="text-3xl font-black text-brand-dark tracking-tighter uppercase italic leading-none mb-2">{profile.name}</h1>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{profile.collegeId}</p>
             
             <div className="flex justify-center gap-6 py-6 border-y border-slate-50 mb-8">
                <div>
                   <p className="text-xl font-black text-brand-dark mb-1">{profile.transactionsCount}</p>
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Trades</p>
                </div>
                <div className="w-px h-10 bg-slate-100"></div>
                <div>
                   <p className="text-xl font-black text-amber-500 mb-1 flex items-center justify-center gap-1">
                     {profile.rating.toFixed(1)} <Star className="w-4 h-4 fill-amber-500" />
                   </p>
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Rating</p>
                </div>
             </div>

             {currentUser?.uid !== profile.uid ? (
               <div className="space-y-3">
                 <button 
                  onClick={handleStartChat}
                  className="vibrant-button w-full flex items-center justify-center gap-3 py-4 shadow-indigo-100"
                 >
                   <MessageSquare className="w-5 h-5" /> 
                   <span className="text-sm font-black uppercase tracking-widest italic">Connect</span>
                 </button>
                 <button 
                  onClick={() => setShowReviewModal(true)}
                  className="w-full py-4 text-slate-400 hover:text-brand-primary text-[10px] font-black uppercase tracking-widest transition-colors"
                 >
                   Write Report/Review
                 </button>
               </div>
             ) : (
               <Link to="/profile" className="vibrant-button w-full block py-4 text-center">Edit My Profile</Link>
             )}
          </div>

          <div className="vibrant-card p-6 bg-slate-50 border-none">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Credentials</h3>
             <ul className="space-y-4">
                <li className="flex items-center gap-3">
                   <ShieldCheck className="w-5 h-5 text-emerald-500" />
                   <span className="text-sm font-bold text-slate-600 italic uppercase tracking-tighter">Verified Student</span>
                </li>
                <li className="flex items-center gap-3">
                   <Clock className="w-5 h-5 text-indigo-400" />
                   <span className="text-xs font-medium text-slate-500">Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                </li>
             </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Inventory */}
          <div>
            <h2 className="text-2xl font-black text-brand-dark uppercase italic tracking-tighter mb-6 flex items-center gap-3">
              Personnel Inventory <span className="text-sm text-slate-300 font-medium">({listings.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {listings.length > 0 ? listings.slice(0, 4).map(listing => (
                 <Link key={listing.id} to="/market" className="vibrant-card p-5 bg-white border-none shadow-md hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-4">
                       <span className="px-3 py-1 bg-slate-100 rounded-full text-[8px] font-black text-slate-400 uppercase tracking-widest">{listing.category}</span>
                       <span className="text-lg font-black text-brand-primary italic">₹{listing.price}</span>
                    </div>
                    <h4 className="font-black text-brand-dark uppercase italic tracking-tight group-hover:text-brand-primary transition-colors leading-tight mb-2">{listing.title}</h4>
                    <div className="flex items-center gap-2 mt-auto">
                       <span className={`w-2 h-2 rounded-full ${listing.status === 'active' ? 'bg-emerald-400' : 'bg-slate-300'}`}></span>
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{listing.status}</span>
                    </div>
                 </Link>
               )) : (
                 <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-black uppercase italic text-sm">No Active Deployments</p>
                 </div>
               )}
            </div>
            {listings.length > 4 && (
              <Link to="/market" className="block text-center mt-6 text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">View All Listings →</Link>
            )}
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-2xl font-black text-brand-dark uppercase italic tracking-tighter mb-6 flex items-center gap-3">
              Sector Feedback <span className="text-sm text-slate-300 font-medium">({reviewCount})</span>
            </h2>
            <div className="space-y-4">
               {reviews.length > 0 ? reviews.map(review => (
                 <div key={review.id} className="vibrant-card p-6 bg-white border-none shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                             {review.reviewerName[0]}
                          </div>
                          <div>
                             <p className="text-xs font-black text-brand-dark uppercase italic">{review.reviewerName}</p>
                             <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-2.5 h-2.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-100'}`} />
                                ))}
                             </div>
                          </div>
                       </div>
                       <span className="text-[9px] font-black text-slate-300 uppercase">{formatDistanceToNow(review.createdAt)} ago</span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed italic">"{review.comment}"</p>
                 </div>
               )) : (
                 <div className="py-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-black uppercase italic text-sm">No Signal Reports Found</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 bg-brand-dark/20 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="vibrant-card p-8 bg-white max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowReviewModal(false)}
                className="absolute top-6 right-6 text-slate-300 hover:text-brand-dark transition-colors"
              >
                <ArrowLeft className="w-5 h-5 rotate-90" />
              </button>
              
              <h3 className="text-3xl font-black text-brand-dark uppercase italic tracking-tighter mb-2">FEEDBACK FORM</h3>
              <p className="text-slate-500 text-sm mb-8 font-medium">Evaluate your interaction with {profile.name}.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Tactical Rating</label>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star} 
                        onClick={() => setNewReview({...newReview, rating: star})}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${newReview.rating >= star ? 'bg-amber-400 text-white shadow-lg' : 'bg-slate-50 text-slate-200 hover:bg-slate-100'}`}
                      >
                        <Star className={`w-6 h-6 ${newReview.rating >= star ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Intelligence Report (Comment)</label>
                  <textarea 
                    className="vibrant-input min-h-[120px] py-4"
                    placeholder="Describe the trade or service quality..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  />
                </div>
                
                <button 
                  onClick={handleLeaveReview}
                  disabled={!newReview.comment}
                  className="vibrant-button w-full flex items-center justify-center gap-3 py-4 disabled:opacity-50"
                >
                  Submit Review <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
