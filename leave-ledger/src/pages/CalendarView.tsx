import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthContext';
import { ChevronLeft, ChevronRight, X, ExternalLink, FileText } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import CertificateViewer from '../components/events/CertificateViewer';
import type { EventRecord } from '../types';

const EVENT_COLORS = {
  'Hackathon': { bg: 'bg-[#EBF1FA]', text: 'text-blue-900', border: 'border-blue-200' },
  'Workshop': { bg: 'bg-[#F2F6ED]', text: 'text-emerald-900', border: 'border-emerald-200' },
  'Conference': { bg: 'bg-[#FDF4E5]', text: 'text-amber-900', border: 'border-amber-200' },
  'Sports': { bg: 'bg-[#FDF2F2]', text: 'text-red-900', border: 'border-red-200' },
  'Cultural': { bg: 'bg-[#F7EFFF]', text: 'text-purple-900', border: 'border-purple-200' },
  'Other': { bg: 'bg-[#F3F4F6]', text: 'text-gray-900', border: 'border-gray-200' }
};

export default function CalendarView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [viewingCertEvent, setViewingCertEvent] = useState<EventRecord | null>(null);

  useEffect(() => {
    async function loadEvents() {
      if (!user) return;
      const { data: allEvents } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id);
        
      if (!allEvents) return;

      const { data: apps } = await supabase.from('applications').select('event_id');
      const { data: certs } = await supabase.from('certificates').select('event_id');
      
      const appEventIds = new Set(apps?.map(a => a.event_id));
      const certEventIds = new Set(certs?.map(c => c.event_id));

      const enrichedEvents = allEvents.map(e => ({
        id: e.id,
        title: e.title,
        organizer: e.organizer,
        venue: e.venue,
        type: e.type,
        startDate: e.start_date,
        endDate: e.end_date,
        role: e.role,
        hasApplication: appEventIds.has(e.id),
        hasCertificate: certEventIds.has(e.id)
      }));

      setEvents(enrichedEvents);
    }
    loadEvents();
  }, [user]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const start = parseISO(event.startDate);
      const end = parseISO(event.endDate);
      return day >= start && day <= end;
    });
  };

  const getEventColor = (type: string) => {
    return EVENT_COLORS[type as keyof typeof EVENT_COLORS] || EVENT_COLORS.Other;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewingCertEvent || selectedEvent) return;
      if (e.key === 'ArrowLeft') setCurrentDate(d => subMonths(d, 1));
      if (e.key === 'ArrowRight') setCurrentDate(d => addMonths(d, 1));
      if (e.key === 't' || e.key === 'T') setCurrentDate(new Date());
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingCertEvent, selectedEvent]);

  return (
    <div className="max-w-7xl mx-auto py-6 h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-8">
      
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl text-[var(--color-text-primary)] font-serif">
            {format(currentDate, 'MMMM yyyy')}
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mr-2">
              Keyboard: <kbd className="px-1.5 py-0.5 bg-white border border-[var(--color-border)] rounded-sm">←</kbd> <kbd className="px-1.5 py-0.5 bg-white border border-[var(--color-border)] rounded-sm">→</kbd> for months, <kbd className="px-1.5 py-0.5 bg-white border border-[var(--color-border)] rounded-sm">T</kbd> for today
            </div>
            <div className="flex items-center bg-white border border-[var(--color-border-dark)] rounded-sm shadow-sm overflow-hidden">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-[#F5F1E7] transition-colors border-r border-[var(--color-border-dark)]">
                <ChevronLeft className="w-5 h-5 text-[var(--color-text-primary)]" />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-xs font-semibold tracking-widest uppercase hover:bg-[#F5F1E7] transition-colors text-[var(--color-text-primary)]">
                Today
              </button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-[#F5F1E7] transition-colors border-l border-[var(--color-border-dark)]">
                <ChevronRight className="w-5 h-5 text-[var(--color-text-primary)]" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 border-b border-[var(--color-border)] pb-4">
          {Object.entries(EVENT_COLORS).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${colors.bg} border ${colors.border}`}></div>
              <span className="editorial-subhead text-[var(--color-text-secondary)]">{type}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-2 border-l border-[var(--color-border-dark)] pl-4">
            <div className="w-2 h-2 rounded-full bg-[var(--color-text-accent)]"></div>
            <span className="editorial-subhead text-[var(--color-text-secondary)]">Needs Application</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 editorial-card flex flex-col overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[var(--color-border)] bg-[#FDFBF8]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2.5 text-center text-xs font-semibold tracking-widest uppercase text-[var(--color-text-secondary)]">
                {day}
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 grid-rows-5 auto-rows-fr">
            {days.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isTodayDay = isToday(day);
              
              return (
                <div 
                  key={day.toISOString()} 
                  className={`
                    border-r border-b border-[var(--color-border)] p-1.5 md:p-2 flex flex-col gap-1 transition-colors
                    ${!isCurrentMonth ? 'bg-[#F5F1E7]/50 opacity-60' : 'bg-transparent'}
                    ${idx % 7 === 6 ? 'border-r-0' : ''}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-sm ${isTodayDay ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-primary)]'}`}>
                      {format(day, 'd')}
                    </span>
                    
                    {dayEvents.some(e => !e.hasApplication) && (
                      <div className="w-2 h-2 rounded-full bg-[var(--color-text-accent)] mt-1 mr-1" title="Missing Leave Application"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 mt-1 pr-1 custom-scrollbar">
                    {dayEvents.map(event => {
                      const colors = getEventColor(event.type);
                      const isStart = isSameDay(day, parseISO(event.startDate));
                      const isEnd = isSameDay(day, parseISO(event.endDate));
                      
                      return (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event as EventRecord)}
                          className={`
                            text-[10px] font-semibold truncate px-1.5 py-0.5 cursor-pointer transition-all hover:brightness-95 border
                            ${colors.bg} ${colors.text} ${colors.border}
                            ${isStart ? 'rounded-l-sm ml-1' : '-ml-2 border-l-0'} 
                            ${isEnd ? 'rounded-r-sm mr-1' : '-mr-2 border-r-0'}
                            ${isStart && isEnd ? 'rounded-sm mx-0' : ''}
                          `}
                          title={event.title}
                        >
                          {isStart ? event.title : '\u00A0'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Side Panel */}
      {selectedEvent && (
        <div className="w-80 shrink-0 editorial-card flex flex-col overflow-hidden h-fit mt-16">
          <div className="p-6 border-b border-[var(--color-border)] bg-[#FDFBF8] flex items-start justify-between">
            <div>
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-widest bg-slate-200 text-slate-700 mb-3 inline-block">
                {selectedEvent.type}
              </span>
              <h2 className="text-xl font-serif font-semibold text-[var(--color-text-primary)] leading-tight">{selectedEvent.title}</h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">{selectedEvent.organizer}</p>
            </div>
            <button onClick={() => setSelectedEvent(null)} className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-white border border-[var(--color-border)] rounded-sm">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <div className="space-y-1">
              <div className="editorial-subhead text-[var(--color-text-secondary)]">Date</div>
              <div className="text-sm font-medium text-[var(--color-text-primary)]">
                {format(parseISO(selectedEvent.startDate), 'MMM d, yyyy')}
                {selectedEvent.startDate !== selectedEvent.endDate && ` - ${format(parseISO(selectedEvent.endDate), 'MMM d, yyyy')}`}
              </div>
            </div>

            <div className="space-y-1">
              <div className="editorial-subhead text-[var(--color-text-secondary)]">Role</div>
              <div className="text-sm font-medium text-[var(--color-text-primary)]">{selectedEvent.role}</div>
            </div>

            {selectedEvent.venue && (
              <div className="space-y-1">
                <div className="editorial-subhead text-[var(--color-text-secondary)]">Venue</div>
                <div className="text-sm text-[var(--color-text-primary)]">{selectedEvent.venue}</div>
              </div>
            )}

            {(selectedEvent as any).hasCertificate ? (
              <div className="p-4 bg-emerald-50 rounded-sm border border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs mb-3">
                  <FileText className="w-4 h-4" />
                  Proof Attached
                </div>
                <button 
                  onClick={() => setViewingCertEvent(selectedEvent)}
                  className="w-full bg-white text-emerald-700 px-3 py-2 rounded-sm border border-emerald-300 hover:bg-emerald-100 transition-colors text-xs font-bold tracking-wide uppercase"
                >
                  View Certificate
                </button>
              </div>
            ) : (
              <div className="p-4 bg-[#FDF4E5] rounded-sm border border-amber-200">
                <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs">
                  <FileText className="w-4 h-4" />
                  No proof uploaded
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-[var(--color-border)] bg-[#FDFBF8]">
            <button 
              onClick={() => navigate(`/applications/new?eventId=${selectedEvent.id}`)}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors py-3 px-4 text-xs font-semibold tracking-widest uppercase rounded-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Generate Application
            </button>
          </div>
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {viewingCertEvent && (
        <CertificateViewer
          eventId={viewingCertEvent.id!}
          eventTitle={viewingCertEvent.title}
          onClose={() => setViewingCertEvent(null)}
        />
      )}
    </div>
  );
}
