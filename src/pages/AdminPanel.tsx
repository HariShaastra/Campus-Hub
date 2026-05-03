import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { reportService } from '../services/reportService';
import { Report } from '../types';
import { 
  Shield, 
  Flag, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  ChevronRight,
  Eye,
  ShieldCheck,
  UserX
} from 'lucide-react';
import { motion } from 'motion/react';
import { BackButton } from '../components/SharedUI';
import { formatDistanceToNow } from 'date-fns';

export const AdminPanel = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ((!user?.isAdmin && user?.role !== 'admin') || !user?.collegeId) return;
    const fetch = async () => {
      setLoading(true);
      const data = await reportService.getPendingReports(user.collegeId);
      setReports(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleAction = async (reportId: string, action: 'reviewed' | 'dismissed') => {
    await reportService.updateReportStatus(reportId, action);
    setReports(p => p.map(r => r.id === reportId ? { ...r, status: action } as Report : r));
  };

  if (!user?.isAdmin && user?.role !== 'admin') {
    return (
      <div className="pt-32 pb-24 px-6 max-w-xl mx-auto text-center">
        <Shield className="w-16 h-16 mx-auto text-slate-100 mb-6" />
        <h1 className="text-4xl font-black text-brand-dark italic uppercase tracking-tighter">No Access</h1>
        <p className="text-slate-500 font-medium mt-4">Only administrators can see this page.</p>
        <div className="mt-10">
          <BackButton />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="mb-16 space-y-4">
        <BackButton />
        <div className="flex items-center gap-2 pt-2">
           <ShieldCheck className="w-4 h-4 text-emerald-500" />
           <span className="text-[10px] font-black tracking-widest text-brand-primary uppercase">Admin Controls</span>
        </div>
        <h1 className="text-6xl font-black text-brand-dark tracking-tighter leading-[0.8] italic uppercase">
          ADMIN<br/>PANEL
        </h1>
        <p className="text-slate-500 font-medium max-w-sm">Manage reports and keep the app safe for everyone.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
         <div className="vibrant-card p-6 bg-white border-none shadow-lg">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Reports</p>
            <p className="text-4xl font-black text-rose-500 tracking-tighter italic">{reports.filter(r => r.status === 'pending').length}</p>
         </div>
         <div className="vibrant-card p-6 bg-white border-none shadow-lg">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Reports</p>
            <p className="text-4xl font-black text-brand-dark tracking-tighter italic">{reports.length}</p>
         </div>
         <div className="vibrant-card p-6 bg-slate-900 text-white border-none shadow-lg">
            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Safety Score</p>
            <p className="text-4xl font-black text-green-400 tracking-tighter italic">98.2%</p>
         </div>
      </div>

      <div className="space-y-6">
         <h2 className="text-2xl font-black text-brand-dark italic uppercase tracking-tighter flex items-center gap-3">
            <Flag className="w-5 h-5 text-rose-500" /> Recent Reports
         </h2>

         {loading ? (
           <div className="space-y-4">
             {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-3xl"></div>)}
           </div>
         ) : reports.length > 0 ? (
           <div className="space-y-4">
             {reports.map(report => (
               <motion.div 
                 key={report.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className={`vibrant-card p-6 md:p-8 bg-white border-none shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 ${report.status !== 'pending' ? 'opacity-60 grayscale' : ''}`}
               >
                  <div className="flex items-start gap-6">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                       report.targetType === 'user' ? 'bg-indigo-100 text-indigo-600' : 
                       report.targetType === 'listing' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                     }`}>
                        {report.targetType === 'user' ? <UserX className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                           <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">{report.targetType}</span>
                           <span className="text-xs text-slate-300">•</span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDistanceToNow(report.createdAt)} ago</span>
                        </div>
                        <h4 className="text-xl font-black text-brand-dark italic uppercase tracking-tighter truncate max-w-md">{report.reason}</h4>
                        <p className="text-[10px] font-medium text-slate-400 mt-2">ID: {report.targetId}</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-3">
                     {report.status === 'pending' ? (
                       <>
                         <button 
                           onClick={() => handleAction(report.id, 'reviewed')}
                           className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:scale-105 active:scale-95 transition-all"
                         >
                           Fixed
                         </button>
                         <button 
                           onClick={() => handleAction(report.id, 'dismissed')}
                           className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                         >
                           Ignore
                         </button>
                       </>
                     ) : (
                       <div className="flex items-center gap-2 text-slate-400 px-4 py-2 bg-slate-50 rounded-xl">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{report.status}</span>
                       </div>
                     )}
                  </div>
               </motion.div>
             ))}
           </div>
         ) : (
           <div className="vibrant-card p-24 text-center bg-white border-dashed border-2">
              <ShieldCheck className="w-16 h-16 mx-auto text-slate-100 mb-6" />
              <p className="text-2xl font-black text-slate-400 italic uppercase">All Good</p>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">No reports right now. Everything is safe.</p>
           </div>
         )}
      </div>
    </div>
  );
};
