import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listingService } from '../services/listingService';
import { urgentService } from '../services/urgentService';
import { campusService } from '../services/campusService';
import { chatService } from '../services/chatService';
import { Listing, UrgentRequest, CampusEvent, User } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Zap, Store, BookOpen, Plus, Clock, ChevronRight, Info, ShieldCheck, Megaphone, Users, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

export const Home = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [urgent, setUrgent] = useState<UrgentRequest[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [people, setPeople] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.collegeId) return;
    
    const fetch = async () => {
      const [lData, eData, pData] = await Promise.all([
        listingService.getRecentListings(user.collegeId, 5),
        campusService.getEvents(user.collegeId),
        chatService.searchUsersByCollege(user.collegeId)
      ]);

      urgentService.listenToActive(user.collegeId, (data) => {
        setUrgent(data.slice(0, 3));
      });

      setListings(lData || []);
      setEvents(eData?.slice(0, 2) || []);
      setPeople(pData?.filter(p => p.uid !== user.uid).slice(0, 5) || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <div className="pt-24 md:pt-32 pb-20 md:pb-12 px-2 md:px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 items-start">
        
        {/* Left Col: Campus Guide / Stats */}
        <aside className="lg:col-span-3 space-y-6 order-2 lg:order-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="vibrant-card p-6 bg-white border-none shadow-xl"
          >
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-brand-primary" /> App Navigation
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {[
                { name: 'Market', path: '/market', emoji: '📦' },
                { name: 'Jobs & Gigs', path: '/opportunities', emoji: '💼' },
                { name: 'College Events', path: '/events', emoji: '📣' },
                { name: 'Study Notes', path: '/academic', emoji: '📚' },
                { name: 'Need Help', path: '/urgent', emoji: '⚡' },
                { name: 'Messages', path: '/messages', emoji: '💬' },
              ].map((cat) => (
                <Link 
                  key={cat.name} 
                  to={cat.path}
                  className="flex items-center justify-between group p-3 md:px-4 md:py-3 rounded-2xl hover:bg-indigo-50 transition-all border border-slate-50 hover:border-indigo-100"
                >
                  <div className="flex items-center gap-2 md:gap-3 font-bold text-[10px] md:text-sm text-slate-700">
                    <span className="text-lg">{cat.emoji}</span>
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <ChevronRight className="hidden md:block w-4 h-4 text-slate-300 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="vibrant-card p-8 bg-brand-dark text-white relative overflow-hidden group border-none shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="text-2xl font-black tracking-tight leading-none mb-2 relative z-10 italic uppercase">Sell or<br/>Post</h3>
            <p className="text-[10px] text-indigo-200 font-black uppercase tracking-widest mb-6 relative z-10 leading-relaxed">Share with classmates</p>
            <Link to="/post" className="vibrant-button w-full flex items-center justify-center gap-2 bg-white text-brand-dark hover:bg-indigo-50 py-4 relative z-10 border-none shadow-none font-black italic uppercase tracking-tighter text-xs">
              <Plus className="w-4 h-4" /> Create New Post
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="vibrant-card p-6 bg-slate-50 border-none"
          >
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <Users className="w-3 h-3 text-brand-primary" /> Active Students
            </h3>
            <div className="space-y-4">
               {people.length > 0 ? people.map(person => (
                 <Link key={person.uid} to={`/messages`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-indigo-900 flex items-center justify-center text-white font-black text-xs shadow-sm border border-white group-hover:scale-110 transition-transform shrink-0">
                      {person.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-brand-dark uppercase italic text-xs truncate group-hover:text-brand-primary transition-colors">{person.name}</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">{person.college}</p>
                    </div>
                 </Link>
               )) : (
                 <p className="text-[10px] font-black text-slate-300 uppercase italic">Loading students...</p>
               )}
               <Link to="/messages" className="block text-center pt-2 text-[9px] font-black text-brand-primary uppercase tracking-widest hover:underline">Find more people →</Link>
            </div>
          </motion.div>
        </aside>

        {/* Center Col: Primary Activity Hub */}
        <main className="lg:col-span-6 space-y-8 md:space-y-12 order-1 lg:order-2">
          {/* Welcome Screen */}
          <section className="bg-white rounded-[2.5rem] p-6 md:p-12 shadow-2xl shadow-indigo-100/50 border border-slate-50 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
             <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-4 italic">
                   College: {user?.college}
                </div>
                <h2 className="text-3xl md:text-6xl font-black text-brand-dark tracking-tighter leading-[0.85] uppercase italic mb-4">
                  CAMPUS<br/><span className="text-brand-primary">HUB</span>
                </h2>
                <p className="text-slate-500 font-medium max-w-sm mb-6 leading-relaxed italic text-sm md:text-base">
                  Buy, sell, and share things easily with other students at your college.
                </p>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  <Link to="/market" className="vibrant-button px-4 md:px-10 py-3 md:py-4 font-black italic tracking-tighter uppercase whitespace-nowrap text-xs md:text-base">Marketplace</Link>
                  <Link to="/post" className="vibrant-button px-4 md:px-10 py-3 md:py-4 bg-brand-dark text-white font-black italic tracking-tighter uppercase border-none shadow-none hover:bg-black whitespace-nowrap transition-transform hover:scale-105 active:scale-95 text-xs md:text-base">Post Item</Link>
                </div>
             </div>
          </section>

          {/* Special Mission: Campus Creation Facility */}
          <section className="vibrant-card p-6 md:p-12 bg-slate-900 border-none relative overflow-hidden group shadow-2xl shadow-indigo-200">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-primary/20 to-transparent opacity-30"></div>
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="shrink-0">
                   <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center text-brand-primary">
                      <Users className="w-6 h-6 md:w-8 md:h-8" />
                   </div>
                </div>
                <div className="text-center md:text-left flex-1">
                   <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter mb-2 leading-none">ADD YOUR COLLEGE</h3>
                   <p className="text-slate-400 font-medium text-[10px] md:text-sm italic mb-4 md:mb-6">Create a private group for your college. Only students from your college can join.</p>
                   <Link to="/setup" className="vibrant-button !py-2.5 md:!py-3 !px-6 md:!px-8 text-[9px] md:text-[10px] bg-white text-brand-dark hover:bg-slate-100 italic font-black uppercase tracking-widest inline-block">Create Now</Link>
                </div>
             </div>
          </section>

          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand-primary rounded-full animate-ping"></div>
                  <span className="text-[10px] font-black tracking-widest text-brand-primary uppercase">New Items feed</span>
                </div>
                <Link to="/market" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-primary transition-colors">See All</Link>
             </div>
             <h3 className="text-3xl md:text-4xl font-black text-brand-dark tracking-tighter leading-none italic uppercase">WHAT'S NEW<br/>IN COLLEGE</h3>
          </div>

          <div className="space-y-6">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="vibrant-card p-6 h-64 animate-pulse bg-slate-100/50 rounded-[3rem]" />
              ))
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {listings.length > 0 ? (
                  listings.map((listing, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      key={listing.id}
                    >
                      <Link to={`/market?id=${listing.id}`} className="vibrant-card p-5 md:p-6 flex flex-col sm:flex-row gap-6 group hover:bg-slate-50/50 border-none shadow-lg">
                        <div className="w-full sm:w-40 md:w-48 h-48 sm:h-auto bg-slate-100 rounded-[2rem] overflow-hidden shrink-0 border border-slate-100 shadow-sm relative">
                          {listing.images?.[0] ? (
                            <img 
                              src={listing.images[0]} 
                              alt={listing.title} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                              referrerPolicy="no-referrer" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Store className="w-10 h-10 md:w-12 md:h-12" />
                            </div>
                          )}
                          <div className="absolute top-4 left-4">
                             <div className="px-3 py-1 bg-white/90 backdrop-blur text-[8px] font-black uppercase tracking-widest rounded-full shadow-sm">
                               {listing.category}
                             </div>
                          </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col min-w-0">
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-2xl md:text-3xl font-black text-brand-primary tracking-tighter italic">₹{listing.price}</span>
                             {listing.isUrgent && <span className="px-2 py-1 bg-rose-100 text-rose-500 font-black text-[8px] uppercase tracking-widest rounded-lg animate-pulse">Critical</span>}
                          </div>
                          <h4 className="text-xl md:text-2xl font-black text-brand-dark leading-tight tracking-tight mb-2 group-hover:text-brand-primary transition-colors uppercase italic truncate">{listing.title}</h4>
                          <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6 italic">{listing.description}</p>
                          
                          <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-indigo-900 border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                                {listing.sellerName[0]}
                              </div>
                              <div className="min-w-0">
                                 <p className="text-[10px] font-bold text-slate-800 leading-none mb-1 uppercase tracking-tight truncate">{listing.sellerName}</p>
                                 <div className="flex items-center gap-1">
                                   <Clock className="w-3 h-3 text-slate-300" />
                                   <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Active Status</span>
                                 </div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-primary group-hover:translate-x-1 transition-all shrink-0" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="vibrant-card p-12 md:p-20 text-center bg-white border-dashed">
                    <Store className="w-16 h-16 mx-auto text-slate-100 mb-4" />
                    <h3 className="text-xl font-black text-slate-800 uppercase italic">Sector Idle</h3>
                    <p className="text-slate-400 mt-2 font-medium italic">Broadcast your first listing to initialize the exchange grid.</p>
                  </div>
                )}
              </div>
            )}
            
            <Link to="/market" className="vibrant-button w-full py-4 md:py-5 text-center block bg-slate-50 border-none text-slate-400 hover:text-brand-primary hover:bg-white shadow-none font-black uppercase italic tracking-widest transition-all text-[10px] md:text-xs">
              See All Items
            </Link>
          </div>
        </main>

        {/* Right Col: Priority Alerts & Campus State */}
        <aside className="lg:col-span-3 space-y-6 order-3">
          {urgent.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="vibrant-card p-6 bg-rose-50 border-none relative overflow-hidden group shadow-xl shadow-rose-100"
            >
              <Zap className="w-10 h-10 text-rose-500 mb-4 animate-bounce" />
              <h3 className="text-xl font-black text-rose-900 leading-none mb-2 italic uppercase">PRIORITY<br/>REPORTS</h3>
              <div className="space-y-4 mb-8 mt-6">
                {urgent.map(req => (
                  <Link key={req.id} to="/urgent" className="block group/item relative pl-4 border-l-2 border-rose-200">
                    <p className="text-sm font-black text-rose-900 line-clamp-1 group-hover/item:text-rose-500 transition-colors uppercase italic truncate">{req.title}</p>
                    <p className="text-[8px] text-rose-600 font-bold uppercase tracking-widest mt-1">Verified Urgent</p>
                  </Link>
                ))}
              </div>
              <Link to="/urgent" className="vibrant-button w-full border-none shadow-rose-200 shadow-xl bg-rose-600 hover:bg-rose-700 text-center flex items-center justify-center gap-2 font-black italic uppercase tracking-tighter text-sm">
                Access Help Grid
              </Link>
            </motion.div>
          )}

          {events.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="vibrant-card p-6 bg-indigo-50/50 border-none relative overflow-hidden group shadow-lg"
            >
              <Megaphone className="w-8 h-8 text-brand-primary mb-4" />
              <h3 className="text-xl font-black text-brand-dark leading-none mb-6 italic uppercase">EVENT<br/>HORIZON</h3>
              <div className="space-y-6 mb-8">
                {events.map(event => (
                  <Link key={event.id} to="/events" className="block group/item">
                    <p className="text-sm font-black text-brand-dark group-hover/item:text-brand-primary transition-colors italic uppercase leading-tight">{event.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <div className="w-px h-3 bg-slate-300"></div>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{event.location}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/events" className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] hover:tracking-widest transition-all italic block text-center">Open Calendar Feed →</Link>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="vibrant-card p-8 bg-indigo-900 text-white border-none shadow-2xl relative overflow-hidden group"
          >
            <BookOpen className="w-10 h-10 text-white/20 mb-6 absolute -top-2 -right-2 rotate-12 group-hover:rotate-45 transition-transform" />
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 font-sans italic">Resource Subsystem</p>
            <h4 className="text-3xl font-black italic uppercase tracking-tighter leading-[0.8] mb-6">ACADEMIC<br/>VAULT</h4>
            <p className="text-xs font-medium text-indigo-200 leading-relaxed mb-8 opacity-80">Peer-verified knowledge modules and resource dumps for current coursework.</p>
            <Link to="/academic" className="vibrant-button !bg-white !text-indigo-900 w-full flex items-center justify-center shadow-none border-none py-4 font-black italic uppercase tracking-widest text-[10px]">Access Vault</Link>
          </motion.div>
        </aside>

      </div>
    </div>
  );
};
