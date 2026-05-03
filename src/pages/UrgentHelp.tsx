import React, { useState, useEffect } from 'react';
import { urgentService } from '../services/urgentService';
import { chatService } from '../services/chatService';
import { UrgentRequest } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Zap, Clock, MessageSquare, Plus, X, Heart, Home } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BackButton } from '../components/SharedUI';

export const UrgentHelp = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<UrgentRequest[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [newRequest, setNewRequest] = useState({ title: '', description: '' });

  useEffect(() => {
    if (!user?.collegeId) return;
    const unsub = urgentService.listenToActive(user.collegeId, setRequests);
    return () => unsub();
  }, [user]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.collegeId) {
      alert("Incomplete clearance: College ID missing.");
      return;
    }
    await urgentService.createRequest(newRequest.title, newRequest.description, user.uid, user.name, user.collegeId);
    setNewRequest({ title: '', description: '' });
    setIsPosting(false);
  };

  return (
    <div className="pt-24 md:pt-32 pb-24 px-2 md:px-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
        <div className="space-y-4">
          <BackButton />
          <div className="flex items-center gap-2 pt-2">
             <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
             <span className="text-[10px] font-black tracking-widest text-rose-500 uppercase">Urgent Requests</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-brand-dark tracking-tighter leading-[0.8] italic uppercase">
            HELP<br/>CHANNEL
          </h1>
          <p className="text-slate-500 font-medium max-w-sm text-sm">Need help with a printout, a missed lab, or something else? Ask for help now.</p>
        </div>
        
        <button 
          onClick={() => setIsPosting(true)}
          className="vibrant-button !bg-rose-500 !hover:bg-rose-600 flex items-center gap-3 h-16 px-8 shadow-xl shadow-rose-100"
        >
          <Plus className="w-5 h-5" />
          <span className="font-black text-lg uppercase tracking-tight">Ask for Help</span>
        </button>
      </div>

      <AnimatePresence>
        {isPosting && (
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
              <button onClick={() => setIsPosting(false)} className="absolute top-6 right-6 text-slate-300 hover:text-brand-dark transition-colors">
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                 </div>
                 <h2 className="text-3xl font-black text-brand-dark tracking-tight uppercase">Ask for Help</h2>
              </div>
              <form onSubmit={handlePost} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">What do you need?</label>
                  <input 
                    autoFocus
                    required
                    className="vibrant-input !bg-slate-50 border-2 border-transparent focus:border-rose-200" 
                    placeholder="e.g. Need help with notes"
                    value={newRequest.title}
                    onChange={e => setNewRequest(p => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Details</label>
                  <textarea 
                    required
                    rows={3}
                    className="vibrant-input !bg-slate-50 border-2 border-transparent focus:border-rose-200 !rounded-3xl" 
                    placeholder="Provide more info here."
                    value={newRequest.description}
                    onChange={e => setNewRequest(p => ({ ...p, description: e.target.value }))}
                  />
                </div>
                <button type="submit" className="vibrant-button !bg-rose-500 w-full py-5 text-xl font-black shadow-rose-100 shadow-xl uppercase italic tracking-tighter">Post Now</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {requests.length > 0 ? (
          requests.map(req => (
            <motion.div 
              key={req.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="vibrant-card p-8 bg-white hover:bg-rose-50/30 transition-colors group flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-rose-500 text-white rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-rose-100">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-brand-dark leading-none tracking-tight group-hover:text-rose-600 transition-colors uppercase italic">{req.title}</h3>
                    <Link to={`/user/${req.userId}`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 hover:text-brand-primary block">{req.userName}</Link>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black uppercase">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(req.expiresAt)}
                </div>
              </div>
              <p className="text-slate-600 mb-8 font-medium leading-relaxed flex-1">{req.description}</p>
              
              <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400">?</div>
                   ))}
                </div>
                <button 
                  onClick={async () => {
                    if (!user) return;
                    if (user.uid === req.userId) return;
                    const thread = await chatService.getOrCreateThread(
                      user.uid,
                      req.userId,
                      `u-${req.id}`,
                      {
                        [user.uid]: user.name,
                        [req.userId]: req.userName
                      }
                    );
                    if (thread) navigate(`/chat/${thread.id}`);
                  }}
                  className="vibrant-button !bg-rose-500 flex items-center gap-2 group-hover:scale-105 transition-transform"
                >
                  <Heart className="w-4 h-4 fill-white pr-0.5" />
                  Help Hub
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center vibrant-card bg-slate-50/50 border-dashed">
            <Zap className="w-16 h-16 mx-auto text-slate-200 mb-6" />
            <p className="text-2xl font-black text-slate-400 uppercase italic">No urgent needs.</p>
            <p className="text-slate-400 font-medium mt-2">Everyone is doing fine right now.</p>
          </div>
        )}
      </div>
    </div>
  );
};
