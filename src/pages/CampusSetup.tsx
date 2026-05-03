import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Logo } from '../components/SharedUI';
import { Building2, Plus, Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const CampusSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'selection' | 'admin' | 'student'>('selection');
  const [campusName, setCampusName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateCampus = async () => {
    if (!user || !campusName) return;
    setLoading(true);
    try {
      const collegeId = campusName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.random().toString(36).substring(2, 6);
      
      // Update user as Admin of this new campus
      await setDoc(doc(db, 'users', user.uid), {
        college: campusName,
        collegeId: collegeId,
        role: 'admin'
      }, { merge: true });

      // Save campus details
      await setDoc(doc(db, 'campuses', collegeId), {
        name: campusName,
        id: collegeId,
        adminId: user.uid,
        createdAt: Date.now()
      });

      window.location.href = '/';
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCampus = async (cId: string, name: string) => {
    if (!user) return;
    setLoading(true);
    try {
      // Students joining an existing campus
      await setDoc(doc(db, 'users', user.uid), {
        college: name,
        collegeId: cId,
        role: 'student'
      }, { merge: true });
      window.location.href = '/';
    } catch (err) {
      setError('Could not join this college.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="vibrant-card p-10 text-center border-2 border-slate-50"
        >
          <Logo size="lg" className="mx-auto mb-10" />
          <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase italic tracking-tighter">Welcome to the App</h1>
          <p className="text-slate-500 font-medium mb-12">Select your role to continue.</p>

          {mode === 'selection' && (
            <div className="space-y-4">
              <button 
                onClick={() => setMode('student')}
                className="w-full p-8 rounded-[2rem] bg-slate-50 border-2 border-transparent hover:border-brand-primary transition-all flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-brand-primary shadow-sm group-hover:scale-110 transition-transform">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="font-black text-slate-900 uppercase italic">I am a Student</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Join my college group</p>
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-300 bg-white px-2">OR</div>
              </div>

              <button 
                onClick={() => setMode('admin')}
                className="w-full p-8 rounded-[2rem] bg-brand-dark hover:bg-black transition-all flex flex-col items-center gap-2 group text-white shadow-xl shadow-indigo-100"
              >
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="font-black uppercase italic">From Administration</h3>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Manage the college app</p>
              </button>
            </div>
          )}

          {mode === 'admin' && (
            <div className="space-y-6">
              <div className="text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">College Name</label>
                <input 
                  type="text" 
                  value={campusName}
                  onChange={(e) => setCampusName(e.target.value)}
                  placeholder="e.g. Harvard University"
                  className="vibrant-input"
                />
              </div>
              <button 
                onClick={handleCreateCampus}
                disabled={loading || !campusName}
                className="vibrant-button w-full py-5 rounded-[2rem]"
              >
                {loading ? 'Creating...' : 'Create College Group'}
              </button>
              <button onClick={() => setMode('selection')} className="text-xs font-bold text-slate-400 hover:text-brand-primary uppercase">Go Back</button>
            </div>
          )}

          {mode === 'student' && (
            <div className="space-y-6">
                <div className="text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Available Colleges</label>
                  <div className="max-h-72 overflow-y-auto space-y-3 p-1">
                    {/* Simplified list for now */}
                    {['Stanford University', 'MIT', 'Harvard University', 'Open Community'].map(name => (
                      <button 
                        key={name}
                        onClick={() => handleJoinCampus(name.toLowerCase().replace(/\s+/g, '_'), name)}
                        className="w-full p-5 rounded-3xl border-2 border-slate-100 hover:border-brand-primary hover:bg-slate-50 flex items-center justify-between group transition-all"
                      >
                        <span className="font-bold text-slate-900 italic text-sm">{name}</span>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-primary transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setMode('selection')} className="text-xs font-bold text-slate-400 hover:text-brand-primary uppercase">Go Back</button>
            </div>
          )}
        </motion.div>
        
        <p className="mt-8 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">Shared only with your college mates</p>
      </div>
    </div>
  );
};
