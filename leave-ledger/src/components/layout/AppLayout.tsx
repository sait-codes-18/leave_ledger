import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FDFBF8]">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--color-primary)] text-white flex items-center justify-between px-4 z-50 shadow-md">
        <h1 className="font-serif text-lg font-medium tracking-wide">Leave Ledger</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -mr-2">
          {sidebarOpen ? <X className="w-6 h-6 text-[var(--color-text-accent)]" /> : <Menu className="w-6 h-6 text-[var(--color-text-accent)]" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 z-40" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop and Mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        pt-14 md:pt-0 bg-[var(--color-sidebar)] shadow-2xl md:shadow-none
      `}>
        <Sidebar onCloseMobile={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 w-full min-w-0 pt-16 md:pt-0 p-4 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
