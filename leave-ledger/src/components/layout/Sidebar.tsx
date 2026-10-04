import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, FileText, Settings, Award, LogOut, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../auth/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const { data } = await supabase.from('profiles').select('name, dept, year').eq('id', user.id).single();
        if (data) setProfile(data);
      }
    }
    loadProfile();
  }, [user]);
  
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/events', icon: Award, label: 'Events' },
    { to: '/applications', icon: FileText, label: 'Applications' },
  ];

  return (
    <aside className="bg-[var(--color-sidebar)] text-[var(--color-sidebar-text)] flex flex-col w-64 h-full">
      
      <div className="p-6 border-b border-[var(--color-sidebar-active)] flex items-center gap-4">
        <div className="w-10 h-10 rounded-full border border-[var(--color-sidebar-accent)] flex items-center justify-center text-[var(--color-sidebar-accent)]">
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <h1 className="font-serif text-xl font-medium text-white tracking-wide">Leave Ledger</h1>
          <p className="text-[0.55rem] uppercase tracking-widest text-[var(--color-sidebar-accent)] mt-0.5">Student Records</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-8">
        <div className="px-8 text-[0.65rem] font-semibold uppercase tracking-widest text-[var(--color-sidebar-text)]/50 mb-6">
          Workspace
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-4 px-8 py-3 text-sm font-medium transition-all duration-200 relative',
                  isActive
                    ? 'bg-[var(--color-sidebar-active)] text-white'
                    : 'text-[var(--color-sidebar-text)] hover:text-white hover:bg-[var(--color-sidebar-active)]/50'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--color-sidebar-accent)]" />}
                  <item.icon className={cn("w-4 h-4", isActive && "text-[var(--color-sidebar-accent)]")} strokeWidth={isActive ? 2 : 1.5} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-[var(--color-sidebar-active)] space-y-1">
        <NavLink
          to="/settings"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-4 px-4 py-2 rounded-sm text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-[var(--color-sidebar-active)] text-white'
                : 'text-[var(--color-sidebar-text)] hover:text-white hover:bg-[var(--color-sidebar-active)]/50'
            )
          }
        >
          <Settings className="w-4 h-4" strokeWidth={1.5} />
          Settings
        </NavLink>
        
        <button
          onClick={signOut}
          className="w-full flex items-center gap-4 px-4 py-2 rounded-sm text-sm font-medium text-[var(--color-sidebar-text)] hover:text-red-400 hover:bg-[var(--color-sidebar-active)]/50 transition-all duration-200 text-left"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          Sign Out
        </button>

        {/* Profile Wedge */}
        <div 
          onClick={() => navigate('/settings')}
          className="mt-4 p-3 border border-[var(--color-sidebar-active)] rounded-sm flex items-center justify-between hover:bg-[var(--color-sidebar-active)]/30 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-sidebar-accent)] text-[var(--color-sidebar)] flex items-center justify-center font-serif font-bold text-sm">
              {profile?.name ? profile.name.charAt(0) : <User className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-white text-xs font-medium">{profile?.name || 'Student'}</div>
              <div className="text-[0.6rem] text-[var(--color-sidebar-text)]">{profile?.dept || 'Set profile'} - {profile?.year || ''}</div>
            </div>
          </div>
          <ChevronRightIcon className="w-4 h-4 text-[var(--color-sidebar-text)]" />
        </div>
      </div>
    </aside>
  );
}

function ChevronRightIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  );
}
