import { Link, useLocation } from 'react-router-dom';
import { Home, Store, BookOpen, Zap, MessageSquare, User, LogOut, Plus, Briefcase, Megaphone } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { Logo } from './SharedUI';

export const Navigation = () => {
  const { user, logOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Market', path: '/market', icon: Store },
    { name: 'Jobs', path: '/opportunities', icon: Briefcase },
    { name: 'Events', path: '/events', icon: Megaphone },
    { name: 'Notes', path: '/academic', icon: BookOpen },
    { name: 'Help', path: '/urgent', icon: Zap },
    { name: 'Inbox', path: '/messages', icon: MessageSquare },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 z-[60] flex items-center justify-between px-4">
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          <Link to="/post" className="w-8 h-8 bg-brand-primary text-white rounded-xl flex items-center justify-center shadow-lg">
            <Plus className="w-4 h-4" />
          </Link>
          <Link to="/profile" className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center font-black text-[10px] border border-slate-200">
            {user?.name[0]}
          </Link>
        </div>
      </div>

      <nav className="fixed bottom-4 left-4 right-4 md:top-0 md:bottom-auto md:left-0 md:right-0 z-50 bg-brand-dark/95 backdrop-blur-xl md:bg-white/90 md:backdrop-blur-md border border-white/10 md:border-b md:border-l-0 md:border-r-0 md:border-t-0 shadow-2xl md:shadow-sm rounded-[2.5rem] md:rounded-none px-2 md:px-0">
        <div className="max-w-7xl mx-auto px-1 md:px-4 h-16 md:h-20 flex items-center justify-between gap-1 overflow-hidden">
          <Link to="/" className="hidden xl:flex items-center gap-2 shrink-0">
            <Logo size="sm" />
            <div>
              <h1 className="text-lg font-black tracking-tighter text-brand-dark uppercase italic leading-none">CAMPUS<br/>HUB</h1>
            </div>
          </Link>

          {/* Nav Links - Using flex-1 to allow shrinking and wrapping prevention */}
          <div className="flex flex-1 md:flex-none justify-around md:gap-px items-center h-full overflow-x-hidden">
            <Link
              to="/"
              className={cn(
                "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-1.5 md:px-2 lg:px-4 py-2 rounded-2xl transition-all shrink-0",
                location.pathname === '/' ? "text-brand-primary md:bg-indigo-50/50" : "text-slate-400 md:text-slate-500 hover:text-white md:hover:bg-slate-50"
              )}
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              <span className="text-[7px] min-[400px]:text-[8px] md:text-[10px] lg:text-xs font-black uppercase tracking-widest md:tracking-normal hidden min-[360px]:block">Home</span>
            </Link>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-1.5 md:px-2 lg:px-4 py-2 rounded-2xl transition-all shrink-0",
                    isActive ? "text-brand-primary md:bg-indigo-50/50" : "text-slate-400 md:text-slate-500 hover:text-white md:hover:bg-slate-50"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-[7px] min-[400px]:text-[8px] md:text-[10px] lg:text-xs font-black uppercase tracking-widest md:tracking-normal hidden min-[360px]:block">{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-1 lg:gap-3 shrink-0">
            <Link to="/post" className="vibrant-button flex items-center gap-2 !py-2 !px-3 lg:!px-5 text-[9px] lg:text-xs transition-transform hover:scale-105 active:scale-95 whitespace-nowrap">
              <Plus className="w-3 h-3" />
              POST
            </Link>
            <Link to="/profile" className="w-8 h-8 lg:w-10 lg:h-10 bg-indigo-900 border-2 border-slate-100 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-lg shrink-0">
              {user?.name[0]}
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};
