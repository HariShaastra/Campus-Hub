import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatService } from '../services/chatService';
import { useAuth } from '../hooks/useAuth';
import { ChatMessage, ChatThread } from '../types';
import { Send, ArrowLeft, MoreVertical, Store, Clock, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { BackButton } from '../components/SharedUI';

export const ChatRoom = () => {
  const { id: chatId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId || !user) return;
    
    const setup = async () => {
      const threadRef = doc(db, 'chats', chatId);
      const threadSnap = await getDoc(threadRef);
      if (threadSnap.exists()) {
        setThread({ id: chatId, ...threadSnap.data() } as ChatThread);
      }
    };
    setup();

    const unsub = chatService.listenToMessages(chatId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsub();
  }, [chatId, user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !chatId || !user) return;
    
    const text = inputText;
    setInputText('');
    await chatService.sendMessage(chatId, user.uid, text);
  };

  const otherParticipantName = thread 
    ? (user ? Object.entries(thread.participantNames).find(([uid]) => uid !== user.uid)?.[1] : 'Student')
    : 'Chat';

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] md:h-screen bg-slate-50 md:pt-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 md:px-8 flex items-center justify-between z-10 shadow-sm backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="hidden md:block">
            <BackButton />
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="md:hidden w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-900 rounded-2xl flex items-center justify-center font-black text-white shadow-md border-2 border-white shrink-0">
            {otherParticipantName?.[0]}
          </div>
          <div className="min-w-0">
            <h2 className="text-base md:text-xl font-black text-brand-dark tracking-tight leading-none italic uppercase truncate">{otherParticipantName}</h2>
            {thread?.listingTitle && (
              <p className="text-[9px] md:text-[10px] uppercase font-black text-brand-primary mt-1 flex items-center gap-1 truncate">
                <Store className="w-2.5 h-2.5 md:w-3 md:h-3" /> {thread.listingTitle}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="hidden lg:flex flex-col items-end mr-4">
              <span className="text-[8px] font-black uppercase text-slate-300 tracking-widest leading-none mb-1">Private Chat</span>
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter leading-none">Safe Connection</span>
           </div>
           <button className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-300">
             <MoreVertical className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide pb-20">
        <AnimatePresence>
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex flex-col gap-1.5 max-w-[85%] md:max-w-[70%]">
                  <div className={`p-4 md:p-6 rounded-[2.5rem] shadow-sm font-medium text-sm md:text-base leading-relaxed break-words ${
                    isMe 
                      ? 'bg-brand-primary text-white rounded-tr-none shadow-indigo-100/50' 
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-slate-100 shadow-md'
                  }`}>
                    {msg.text}
                  </div>
                  <div className={`flex items-center gap-1.5 px-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
                     <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-300">
                        {format(msg.createdAt, 'hh:mm a')}
                     </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={scrollRef} className="h-4" />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-100 p-4 md:p-8 md:pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3 md:gap-4">
          <div className="flex-1 relative">
            <input 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="vibrant-input !bg-slate-50 !py-4 md:!py-5 !px-6 md:!px-10 text-sm md:text-base shadow-inner border-2 border-transparent focus:border-brand-primary/10" 
              placeholder="Type a message..." 
            />
          </div>
          <button type="submit" className="vibrant-button !px-6 md:!px-12 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group transition-transform active:scale-95">
            <span className="hidden md:inline font-black uppercase italic italic tracking-tighter">Send</span>
            <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};
