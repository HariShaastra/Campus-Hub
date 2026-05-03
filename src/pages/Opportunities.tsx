import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { campusService } from '../services/campusService';
import { chatService } from '../services/chatService';
import { Opportunity } from '../types';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Plus,
  Zap,
  Target,
  Search,
  Filter,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BackButton } from '../components/SharedUI';
import { formatDistanceToNow } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';

export const Opportunities = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<Opportunity['type'] | 'all'>('all');
  const [isPosting, setIsPosting] = useState(false);
  const [newOpp, setNewOpp] = useState<Partial<Opportunity>>({
    type: 'gig',
    title: '',
    description: '',
    reward: ''
  });

  useEffect(() => {
    if (!user?.collegeId) return;
    const fetch = async () => {
      setLoading(true);
      const data = await campusService.getOpportunities(user.collegeId, filterType === 'all' ? undefined : filterType);
      setOpportunities(data || []);
      setLoading(false);
    };
    fetch();
  }, [user, filterType]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.collegeId || !newOpp.title || !newOpp.description) {
      alert("Incomplete clearance: College ID missing.");
      return;
    }
    
    await campusService.createOpportunity({
      posterId: user.uid,
      posterName: user.name,
      collegeId: user.collegeId,
      title: newOpp.title,
      description: newOpp.description,
      type: newOpp.type as any,
      reward: newOpp.reward,
    });
    
    setNewOpp({ type: 'gig', title: '', description: '', reward: '' });
    setIsPosting(false);
    // Refresh
    const data = await campusService.getOpportunities(user.collegeId, filterType === 'all' ? undefined : filterType);
    setOpportunities(data || []);
  };

  const handleStartChat = async (opp: Opportunity) => {
    if (!user) return;
    if (user.uid === opp.posterId) return;

    const thread = await chatService.getOrCreateThread(
      user.uid,
      opp.posterId,
      undefined,
      {
        [user.uid]: user.name,
        [opp.posterId]: opp.posterName
      }
    );

    if (thread) {
      navigate(`/chat/${thread.id}`);
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-24 px-2 md:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8 mb-12 md:mb-16">
        <div className="space-y-4">
          <BackButton />
          <div className="flex items-center gap-2 pt-2">
             <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
             <span className="text-[10px] font-black tracking-widest text-brand-primary uppercase">College Work Board</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-brand-dark tracking-tighter leading-[0.8] italic uppercase">
            STUDENT<br/>JOBS
          </h1>
          <p className="text-slate-500 font-medium max-w-sm text-sm">Find tasks, gigs, and internships from other students.</p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setIsPosting(true)}
            className="vibrant-button !px-10 flex items-center justify-center gap-3 italic"
          >
            <Plus className="w-5 h-5" /> 
            <span className="font-black uppercase tracking-widest">Post a Job</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-12 border-b border-slate-100 pb-8">
         {['all', 'gig', 'internship', 'opportunity'].map((t) => (
           <button
             key={t}
             onClick={() => setFilterType(t as any)}
             className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
               filterType === t 
                 ? 'bg-brand-dark text-white shadow-xl shadow-indigo-100' 
                 : 'bg-white text-slate-400 border border-slate-100 hover:border-brand-primary/20'
             }`}
           >
             {t === 'all' ? 'All Roles' : t + 's'}
           </button>
         ))}
      </div>

      {loading ? (
        <div className="section-grid">
           {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-50 animate-pulse rounded-[2.5rem]"></div>)}
        </div>
      ) : opportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {opportunities.map(opp => (
            <motion.div 
              key={opp.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="vibrant-card p-8 bg-white border-none shadow-lg hover:shadow-2xl transition-all group flex flex-col"
            >
               <div className="flex justify-between items-start mb-6">
                  <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    opp.type === 'gig' ? 'bg-amber-100 text-amber-700' : 
                    opp.type === 'internship' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {opp.type}
                  </div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    {formatDistanceToNow(opp.createdAt)} ago
                  </p>
               </div>

               <h3 className="text-2xl font-black text-brand-dark italic uppercase tracking-tighter leading-none mb-4 group-hover:text-brand-primary transition-colors">
                 {opp.title}
               </h3>
               <p className="text-sm text-slate-500 font-medium line-clamp-3 mb-8 flex-1">
                 {opp.description}
               </p>

               <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Posted By</p>
                    <Link to={`/user/${opp.posterId}`} className="text-sm font-black text-brand-dark uppercase italic tracking-tighter hover:text-brand-primary transition-colors">{opp.posterName}</Link>
                  </div>
                  <div className="flex gap-2">
                    {user?.uid !== opp.posterId && (
                      <button 
                        onClick={() => handleStartChat(opp)}
                        className="w-10 h-10 rounded-2xl bg-indigo-50 text-brand-primary flex items-center justify-center hover:bg-brand-primary hover:text-white shadow-sm transition-all"
                      >
                         <MessageSquare className="w-5 h-5" />
                      </button>
                    )}
                    <button className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg group-hover:bg-brand-primary transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
               </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="vibrant-card p-24 text-center bg-white border-dashed border-2">
           <Briefcase className="w-16 h-16 mx-auto text-slate-200 mb-6" />
           <p className="text-2xl font-black text-slate-400 italic uppercase">No Missions available</p>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">Initialize the first opportunity for your campus grid.</p>
        </div>
      )}

      {/* Post Modal */}
      <AnimatePresence>
        {isPosting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPosting(false)}
              className="absolute inset-0 bg-brand-dark/20 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-10 space-y-8"
            >
              <div>
                 <h2 className="text-4xl font-black text-brand-dark italic uppercase tracking-tighter leading-none">POST A JOB</h2>
                 <p className="text-slate-400 font-medium text-sm mt-2">Find someone to help you.</p>
              </div>

              <form onSubmit={handlePost} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Type</label>
                  <select 
                    value={newOpp.type}
                    onChange={(e) => setNewOpp(p => ({ ...p, type: e.target.value as any }))}
                    className="vibrant-input !bg-slate-50 font-black uppercase italic"
                  >
                    <option value="gig">One-time Job</option>
                    <option value="internship">Internship</option>
                    <option value="opportunity">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <input 
                    required
                    placeholder="Title"
                    className="vibrant-input !bg-slate-50 !text-lg"
                    value={newOpp.title}
                    onChange={(e) => setNewOpp(p => ({ ...p, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <textarea 
                    required
                    placeholder="Details about the work"
                    rows={4}
                    className="vibrant-input !bg-slate-50 !rounded-[2rem] pt-4"
                    value={newOpp.description}
                    onChange={(e) => setNewOpp(p => ({ ...p, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <input 
                    placeholder="Reward (e.g. ₹500, Certificate)"
                    className="vibrant-input !bg-slate-50"
                    value={newOpp.reward}
                    onChange={(e) => setNewOpp(p => ({ ...p, reward: e.target.value }))}
                  />
                </div>

                <button type="submit" className="vibrant-button w-full py-5 text-xl font-black italic uppercase shadow-xl shadow-indigo-100">
                   Post Job
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
