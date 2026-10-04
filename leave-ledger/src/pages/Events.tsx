import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthContext';
import { Search, Calendar, MapPin, Award, Trash2, Edit2, ChevronRight, FileBadge } from 'lucide-react';
import EventForm from '../components/events/EventForm';
import CertificateViewer from '../components/events/CertificateViewer';
import { format, parseISO } from 'date-fns';
import type { EventRecord } from '../types';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEvent, setEditingEvent] = useState<EventRecord | undefined>();
  const [viewingCertEvent, setViewingCertEvent] = useState<EventRecord | null>(null);

  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    
    const { data: allEvents, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });
      
    if (error || !allEvents) {
      console.error(error);
      setLoading(false);
      return;
    }

    const { data: allCerts } = await supabase.from('certificates').select('event_id');
    const certEventIds = new Set(allCerts?.map(c => c.event_id));

    const eventsWithCertStatus = allEvents.map(event => ({
      id: event.id,
      title: event.title,
      organizer: event.organizer,
      venue: event.venue,
      type: event.type,
      startDate: event.start_date,
      endDate: event.end_date,
      role: event.role,
      result: event.result,
      notes: event.notes,
      createdAt: event.created_at,
      hasCertificate: certEventIds.has(event.id)
    }));

    setEvents(eventsWithCertStatus);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this event? This will also delete its certificates and applications.')) {
      const { data: certs } = await supabase.from('certificates').select('storage_path').eq('event_id', id);
      if (certs && certs.length > 0) {
        const paths = certs.map(c => c.storage_path);
        await supabase.storage.from('certificates').remove(paths);
      }
      await supabase.from('events').delete().eq('id', id);
      fetchEvents();
    }
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    event.organizer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[var(--color-border)] pb-3 mb-8 gap-4">
        <div>
          <h1 className="text-4xl text-[var(--color-text-primary)]">Events & Records</h1>
          <div className="editorial-subhead text-[var(--color-text-secondary)] mt-2">Manage your attended events and certificates</div>
        </div>
        <button
          onClick={() => { setEditingEvent(undefined); setIsFormOpen(true); }}
          className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors px-6 py-2.5 text-xs font-semibold tracking-widest uppercase rounded-sm flex items-center gap-2 whitespace-nowrap"
        >
          <span>+</span> Add Event
        </button>
      </div>

      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] w-4 h-4" />
          <input
            type="text"
            placeholder="Search events by name or organizer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-sm border border-[var(--color-border-dark)] bg-white text-sm focus:outline-none focus:border-[var(--color-text-accent)] transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[var(--color-text-secondary)] text-sm">Loading events...</div>
      ) : (
        <div className="editorial-card divide-y divide-[var(--color-border)]">
          {filteredEvents.map(event => (
            <div key={event.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#F8F7F3] transition-colors relative group">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="border border-[var(--color-border)] text-[var(--color-text-secondary)] text-[0.65rem] uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-white">
                    {event.type}
                  </span>
                  {!event.hasCertificate && (
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--color-text-accent)]">
                      Missing Proof
                    </span>
                  )}
                </div>
                
                <h3 className="text-2xl text-[var(--color-text-primary)] mb-1">{event.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] font-medium">{event.organizer}</p>
                
                <div className="flex flex-wrap gap-5 mt-4 text-xs text-[var(--color-text-secondary)]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {format(parseISO(event.startDate), 'MMM d, yyyy')}
                      {event.startDate !== event.endDate && ` - ${format(parseISO(event.endDate), 'MMM d, yyyy')}`}
                    </span>
                  </div>
                  {event.venue && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{event.venue}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>{event.role}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 shrink-0">
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingEvent(event); setIsFormOpen(true); }}
                    className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors border border-transparent hover:border-[var(--color-border)] rounded-sm"
                    title="Edit Event"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id!)}
                    className="p-1.5 text-[var(--color-text-secondary)] hover:text-red-700 transition-colors border border-transparent hover:border-[var(--color-border)] rounded-sm"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {event.hasCertificate ? (
                  <button 
                    onClick={() => setViewingCertEvent(event)}
                    className="bg-white border border-[var(--color-border-dark)] hover:bg-[#F5F1E7] transition-colors py-2 px-4 flex items-center justify-between text-xs font-semibold tracking-widest uppercase text-[var(--color-text-primary)] rounded-sm gap-2"
                  >
                    View Proof <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={() => { setEditingEvent(event); setIsFormOpen(true); }}
                    className="bg-white border border-[var(--color-text-accent)] hover:bg-[#Fdf8f8] transition-colors py-2 px-4 flex items-center justify-between text-xs font-semibold tracking-widest uppercase text-[var(--color-text-accent)] rounded-sm gap-2"
                  >
                    Upload Proof <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {filteredEvents.length === 0 && (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <FileBadge className="w-8 h-8 text-[var(--color-border-dark)] mb-4" />
              <h3 className="text-xl text-[var(--color-text-primary)]">No events found</h3>
              <p className="text-[var(--color-text-secondary)] text-sm max-w-sm mt-2">
                You haven't added any events yet, or none match your search. 
              </p>
            </div>
          )}
        </div>
      )}

      {isFormOpen && (
        <EventForm
          eventToEdit={editingEvent}
          onClose={() => setIsFormOpen(false)}
          onSuccess={fetchEvents}
        />
      )}

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
