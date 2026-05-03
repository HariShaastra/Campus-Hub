import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { campusService } from '../services/campusService';
import { CampusEvent } from '../types';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Plus,
  Users,
  Trophy,
  Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BackButton } from '../components/SharedUI';
import { format } from 'date-fns';

export const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CampusEvent>>({
    title: '',
    description: '',
    location: '',
    date: Date.now() + 86400000, // tomorrow
  });

  useEffect(() => {
    if (!user?.collegeId) return;
    const fetch = async () => {
      setLoading(true);
      const data = await campusService.getEvents(user.collegeId);
      setEvents(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.collegeId || !newEvent.title || !newEvent.description) {
      alert("Incomplete clearance: College ID missing.");
      return;
    }
    
    await campusService.createEvent({
      title: newEvent.title,
      description: newEvent.description,
      collegeId: user.collegeId,
      location: newEvent.location || 'Campus Main',
      organizer: user.name,
      date: new Date(newEvent.date!).getTime(),
    });
    
    setNewEvent({ title: '', description: '', location: '', date: Date.now() + 86400000 });
    setIsPosting(false);
    // Refresh
    const data = await campusService.getEvents(user.collegeId);
    setEvents(data || []);
  };

  return (
    <div className="pt-24 md:pt-32 pb-24 px-2 md:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 md:mb-16">
        <div className="space-y-4">
          <BackButton />
          <div className="flex items-center gap-2 pt-2">
             <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
             <span className="text-[10px] font-black tracking-widest text-brand-primary uppercase">College Feed</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-brand-dark tracking-tighter leading-[0.8] italic uppercase">
            COLLEGE<br/>EVENTS
          </h1>
          <p className="text-slate-500 font-medium max-w-sm text-sm">Announcements, club activities, and student events.</p>
        </div>

        <button 
          onClick={() => setIsPosting(true)}
          className="vibrant-button !bg-rose-500 !px-10 flex items-center justify-center gap-3 italic text-white shadow-rose-100"
        >
          <Megaphone className="w-5 h-5" /> 
          <span className="font-black uppercase tracking-widest">Post Event</span>
        </button>
      </div>

      {loading ? (
        <div className="section-grid">
           {[1, 2].map(i => <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[2.5rem]"></div>)}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {events.map((event, idx) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="vibrant-card overflow-hidden bg-white border-none shadow-xl hover:shadow-2xl transition-all group flex flex-col md:flex-row"
            >
               <div className="md:w-48 bg-slate-900 p-8 flex flex-col items-center justify-center text-white text-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{format(event.date, 'MMMM')}</span>
                  <span className="text-5xl font-black tracking-tighter italic">{format(event.date, 'dd')}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{format(event.date, 'EEEE')}</span>
               </div>
               
               <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                     <span className="px-3 py-1 bg-rose-100 text-rose-600 text-[8px] font-black uppercase tracking-widest rounded-full">Coming Up</span>
                  </div>
                  <h3 className="text-2xl font-black text-brand-dark italic uppercase tracking-tighter leading-none mb-4 group-hover:text-brand-primary transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-8 flex-1">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap gap-6 pt-6 border-t border-slate-50">
                     <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-300" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{event.location}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-300" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{event.organizer}</span>
                     </div>
                  </div>
               </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="vibrant-card p-24 text-center bg-white border-dashed border-2">
           <Calendar className="w-16 h-16 mx-auto text-slate-200 mb-6" />
           <p className="text-2xl font-black text-slate-400 italic uppercase">No Events</p>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">No upcoming events scheduled yet.</p>
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
                 <h2 className="text-4xl font-black text-brand-dark italic uppercase tracking-tighter leading-none">POST AN EVENT</h2>
                 <p className="text-slate-400 font-medium text-sm mt-2">Share your event with other students.</p>
              </div>

              <form onSubmit={handlePost} className="space-y-6">
                <div className="space-y-1">
                  <input 
                    required
                    placeholder="Event Title"
                    className="vibrant-input !bg-slate-50 !text-lg"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(p => ({ ...p, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <textarea 
                    required
                    placeholder="Details about the event"
                    rows={4}
                    className="vibrant-input !bg-slate-50 !rounded-[2rem] pt-4"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(p => ({ ...p, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Date</label>
                    <input 
                      type="date"
                      required
                      className="vibrant-input !bg-slate-50"
                      onChange={(e) => setNewEvent(p => ({ ...p, date: e.target.valueAsNumber }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Location</label>
                    <input 
                      placeholder="e.g. Main Hall"
                      className="vibrant-input !bg-slate-50"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent(p => ({ ...p, location: e.target.value }))}
                    />
                  </div>
                </div>

                <button type="submit" className="vibrant-button w-full py-5 text-xl font-black italic uppercase shadow-xl shadow-rose-100 !bg-rose-500">
                   Post Event
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
