import React, { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { campusService } from '../services/campusService';
import { useAuth } from '../hooks/useAuth';
import { ChatThread, Notification, User } from '../types';
import { MessageSquare, Clock, ArrowRight, ChevronRight, Bell, BellOff, Search, UserPlus, User as UserIcon, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { BackButton } from '../components/SharedUI';

export const MessageList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications'>('messages');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [campusStudents, setCampusStudents] = useState<User[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const unsubThreads = chatService.listenToUserThreads(user.uid, (data) => {
      setThreads(data);
      if (activeTab === 'messages') setLoading(false);
    });

    const unsubNotifs = campusService.listenToNotifications(user.uid, (data) => {
      setNotifications(data);
      if (activeTab === 'notifications') setLoading(false);
    });
    
    return () => {
      unsubThreads();
      unsubNotifs();
    };
  }, [user, activeTab]);

  const fetchCampusStudents = async () => {
    if (!user?.collegeId) return;
    const students = await chatService.searchUsersByCollege(user.collegeId);
    setCampusStudents(students?.filter(s => s.uid !== user.uid) || []);
  };

  useEffect(() => {
    if (showUserSearch) fetchCampusStudents();
  }, [showUserSearch]);

  const handleStartChat = async (targetUser: User) => {
    if (!user) return;
    const thread = await chatService.getOrCreateThread(
      user.uid,
      targetUser.uid,
      undefined,
      {
        [user.uid]: user.name,
        [targetUser.uid]: targetUser.name
      }
    );
    if (thread) navigate(`/chat/${thread.id}`);
  };

  return (
    <div className="pt-24 md:pt-32 pb-24 px-2 md:px-6 max-w-5xl mx-auto min-h-screen">
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8">
        <div className="space-y-4">
          <BackButton />
          <div className="flex items-center gap-2 pt-2">
             <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
             <span className="text-[10px] font-black tracking-widest text-brand-primary uppercase">Your Messages</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-brand-dark tracking-tighter leading-[0.8] italic uppercase">
            INBOX
          </h1>
          <p className="text-slate-500 font-medium max-w-sm">Chat with other students and check your notifications.</p>
        </div>

        {activeTab === 'messages' && (
          <button 
            onClick={() => setShowUserSearch(true)}
            className="vibrant-button !px-6 !py-4 flex items-center gap-3 group whitespace-nowrap"
          >
            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">New Chat</span>
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-10 border-b border-slate-100 pb-6 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
            activeTab === 'messages' ? 'bg-brand-dark text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Chats
        </button>
        <button 
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
            activeTab === 'notifications' ? 'bg-brand-dark text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'
          }`}
        >
          <Bell className="w-4 h-4" /> Updates
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px]">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="vibrant-card h-24 animate-pulse bg-slate-100/50 rounded-3xl" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'messages' ? (
            <motion.div 
              key="messages"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {threads.length > 0 ? threads.map((thread) => {
                const otherName = user ? Object.entries(thread.participantNames).find(([uid]) => uid !== user.uid)?.[1] : 'Student';
                return (
                  <Link 
                    key={thread.id}
                    to={`/chat/${thread.id}`}
                    className="vibrant-card block bg-white hover:bg-slate-50/50 transition-all group border-none shadow-md hover:shadow-lg overflow-hidden"
                  >
                    <div className="p-5 md:p-8 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 md:gap-6 min-w-0">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-900 border-2 border-white rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl text-white shadow-md shrink-0">
                          {otherName?.[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                            <h3 className="text-lg md:text-xl font-black text-brand-dark tracking-tight leading-none italic uppercase truncate">{otherName}</h3>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-full">
                              <Clock className="w-2.5 h-2.5 text-slate-400" />
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">
                                {formatDistanceToNow(thread.lastMessageAt)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-500 font-medium truncate italic">
                            {thread.lastMessage || 'Channel established...'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform shrink-0" />
                    </div>
                  </Link>
                );
              }) : (
                <div className="vibrant-card p-12 md:p-20 text-center bg-white border-dashed">
                  <MessageSquare className="w-12 h-12 mx-auto text-slate-100 mb-4" />
                  <p className="text-xl font-black text-slate-400 uppercase italic">No Chats</p>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">Start a conversation from the marketplace or student list.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {notifications.length > 0 ? notifications.map((n) => (
                <div 
                  key={n.id}
                  className={`vibrant-card p-5 md:p-6 border-none shadow-md flex items-center justify-between gap-4 md:gap-6 transition-all ${n.read ? 'bg-white opacity-60' : 'bg-indigo-50/50 ring-2 ring-brand-primary/10'}`}
                >
                  <div className="flex items-center gap-4 md:gap-6 min-w-0">
                     <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${n.read ? 'bg-slate-100 text-slate-400' : 'bg-brand-primary text-white'}`}>
                        <Bell className="w-5 h-5" />
                     </div>
                     <div className="min-w-0">
                        <h4 className="text-md md:text-lg font-black text-brand-dark italic uppercase tracking-tighter leading-none mb-1 md:mb-2 truncate">{n.title}</h4>
                        <p className="text-xs md:text-sm text-slate-500 font-medium line-clamp-2">{n.message}</p>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2">{formatDistanceToNow(n.createdAt)} ago</p>
                     </div>
                  </div>
                  {!n.read && (
                    <button 
                      onClick={() => campusService.markAsRead(n.id)}
                      className="text-[9px] font-black uppercase tracking-widest text-brand-primary hover:underline shrink-0"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              )) : (
                <div className="vibrant-card p-12 md:p-20 text-center bg-white border-dashed">
                  <BellOff className="w-12 h-12 mx-auto text-slate-100 mb-4" />
                  <p className="text-xl font-black text-slate-400 uppercase italic">No Notifications</p>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">You're all caught up with college updates.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* User Search Modal */}
      <AnimatePresence>
        {showUserSearch && (
          <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="vibrant-card !p-0 w-full max-w-md bg-white overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xl font-black text-brand-dark uppercase italic tracking-tighter">Student List</h3>
                <button 
                  onClick={() => setShowUserSearch(false)} 
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="p-4 border-b border-slate-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search by name..."
                    className="vibrant-input !pl-10 !py-3 !rounded-xl uppercase text-[10px] font-black tracking-widest"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                {campusStudents.filter(s => s.name.toLowerCase().includes(studentSearchQuery.toLowerCase())).length > 0 ? 
                 campusStudents.filter(s => s.name.toLowerCase().includes(studentSearchQuery.toLowerCase())).map(s => (
                  <button 
                    key={s.uid}
                    onClick={() => handleStartChat(s)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-indigo-50 rounded-2xl transition-all group text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-black text-slate-400 group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                      {s.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-brand-dark uppercase italic tracking-tight text-sm">{s.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.collegeId}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                  </button>
                )) : (
                  <div className="py-12 text-center">
                    <p className="text-slate-300 font-black uppercase text-[10px] tracking-widest italic">No personnel matches found</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

