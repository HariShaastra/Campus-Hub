import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Navigation } from './components/Navigation';
import { motion } from 'motion/react';

import { Home } from './pages/Home';
import { Marketplace } from './pages/Marketplace';
import { PostListing } from './pages/PostListing';
import { UrgentHelp } from './pages/UrgentHelp';
import { MessageList } from './pages/MessageList';
import { ChatRoom } from './pages/ChatRoom';
import { AcademicVault } from './pages/AcademicVault';
import { Profile } from './pages/Profile';
import { UserProfile } from './pages/UserProfile';
import { Opportunities } from './pages/Opportunities';
import { Events } from './pages/Events';
import { AdminPanel } from './pages/AdminPanel';
import { CampusSetup } from './pages/CampusSetup';
import { Logo } from './components/SharedUI';
import { LogOut, Download, FileText, Bookmark, Shield, Info, AlertOctagon } from 'lucide-react';

const Guide = () => (
  <div className="pt-24 md:pt-32 pb-24 px-6 max-w-4xl mx-auto">
    <h1 className="text-6xl font-black text-brand-dark tracking-tighter italic uppercase mb-8">THE GUIDE</h1>
    <div className="vibrant-card p-10 space-y-8 bg-white border-none shadow-xl">
      <section>
        <h2 className="text-xl font-black text-brand-primary uppercase mb-3 flex items-center gap-2 italic">
          <Info className="w-5 h-5" /> Staying Safe
        </h2>
        <p className="text-slate-600 font-medium leading-relaxed">
          Always meet in public areas (Library, Canteen, Student Center) to swap items. Use UPI or Cash after seeing the item. Never share private details.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-black text-indigo-500 uppercase mb-3 flex items-center gap-2 italic">
          <Bookmark className="w-5 h-5" /> Rules
        </h2>
        <p className="text-slate-600 font-medium leading-relaxed">
          No illegal things, no pirated apps, and no exam papers. Everything must be your own or allowed to be shared. Bad behavior will get you banned.
        </p>
      </section>
      <div className="pt-8 border-t border-slate-100 italic">
        <p className="text-[10px] font-black uppercase text-slate-400">Disclaimer</p>
        <p className="text-xs text-slate-400 mt-2">
          Campus Exchange is a peer-to-peer platform. We facilitate connections but are not responsible for the quality of goods or services. Use at your own discretion.
        </p>
      </div>
    </div>
  </div>
);

const Login = () => {
  const { signIn } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[120px] opacity-40"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-100 rounded-full blur-[120px] opacity-40"></div>
<div className="vibrant-card p-8 md:p-16 max-w-xl w-full bg-white/70 backdrop-blur-xl text-center relative z-10 shadow-3xl border-none mx-4">
        <Logo size="lg" className="mx-auto mb-8" />
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-brand-dark mb-4 leading-[0.8] uppercase italic">CAMPUS<br/>HUB</h1>
        <div className="h-1.5 w-24 bg-brand-primary mx-auto mb-8 rounded-full"></div>
        <p className="text-slate-500 mb-10 text-lg font-medium leading-relaxed max-w-sm mx-auto">
          The private app for students to share things within their <span className="text-brand-dark font-black italic">College Group.</span>
        </p>
        <button onClick={signIn} className="vibrant-button w-full py-5 text-lg shadow-2xl flex items-center justify-center gap-4 group">
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5 invert pr-1 group-hover:scale-110 transition-transform" alt="Google" referrerPolicy="no-referrer" />
          <span className="font-black uppercase italic tracking-tighter italic">Login with Google</span>
        </button>
        <div className="mt-10 flex flex-col items-center gap-4">
           <span className="badge-verified !px-4 italic">Verified College Network</span>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Private & Secure</p>
        </div>
      </div>
    </div>
  );
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Logo size="lg" className="animate-pulse mb-8" />
      <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
         <motion.div 
          animate={{ x: [-48, 48] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-12 h-full bg-brand-primary"
         />
      </div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  // If user is logged in but hasn't set up their campus (generic email users)
  // We allow them to go to /setup or force them if they try to access other private routes
  if (user.collegeId === 'setup_required' && window.location.pathname !== '/setup') {
    return <Navigate to="/setup" />;
  }
  
  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-slate-50">
      <Navigation />
      <main className="md:pt-0">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<PrivateRoute><CampusSetup /></PrivateRoute>} />
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/market" element={<PrivateRoute><Marketplace /></PrivateRoute>} />
          <Route path="/opportunities" element={<PrivateRoute><Opportunities /></PrivateRoute>} />
          <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
          <Route path="/academic" element={<PrivateRoute><AcademicVault /></PrivateRoute>} />
          <Route path="/urgent" element={<PrivateRoute><UrgentHelp /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><MessageList /></PrivateRoute>} />
          <Route path="/chat/:id" element={<PrivateRoute><ChatRoom /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/user/:userId" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
          <Route path="/post" element={<PrivateRoute><PostListing /></PrivateRoute>} />
          <Route path="/guide" element={<PrivateRoute><Guide /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
