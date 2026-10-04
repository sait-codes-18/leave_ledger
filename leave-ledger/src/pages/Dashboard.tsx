import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Bell, Upload, FileText, ChevronRight, FileBadge, ArrowRight, Calendar as CalendarIcon, MapPin } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalCerts: 0,
    totalApps: 0,
    daysMissed: 0
  });
  
  const [needsAttention, setNeedsAttention] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;
      try {
        const { data: prof } = await supabase.from('profiles').select('name').eq('id', user.id).single();
        if (prof) setProfile(prof);

        const { data: events } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false });
          
        const { data: certs } = await supabase.from('certificates').select('event_id');
        const { data: apps } = await supabase.from('applications').select('event_id');
        
        if (!events) return;

        const certEventIds = new Set(certs?.map(c => c.event_id) || []);
        const appEventIds = new Set(apps?.map(a => a.event_id) || []);

        let daysMissedCount = 0;
        const attentionList: any[] = [];
        const pastEvents: any[] = [];

        events.forEach(event => {
          const start = parseISO(event.start_date);
          const end = parseISO(event.end_date);
          daysMissedCount += (differenceInDays(end, start) + 1);

          const missingCert = !certEventIds.has(event.id);
          const missingApp = !appEventIds.has(event.id);

          if (missingCert || missingApp) {
            attentionList.push({
              id: event.id,
              title: event.title,
              date: event.start_date,
              type: event.type,
              missingCert,
              missingApp
            });
          }

          pastEvents.push({
            id: event.id,
            title: event.title,
            date: event.start_date,
            type: event.type,
            venue: event.venue,
            hasCert: !missingCert,
            hasApp: !missingApp
          });
        });

        setStats({
          totalEvents: events.length,
          totalCerts: certEventIds.size,
          totalApps: appEventIds.size,
          daysMissed: daysMissedCount
        });

        setNeedsAttention(attentionList);
        setRecentEvents(pastEvents.slice(0, 3));
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  if (loading) {
    return <div className="p-12 text-[var(--color-text-secondary)]">Loading workspace...</div>;
  }

  const firstName = profile?.name ? profile.name.split(' ')[0] : 'Student';

  return (
    <div className="max-w-6xl mx-auto py-6">
      
      {/* Header */}
      <div className="mb-10 flex justify-between items-start">
        <div>
          <div className="editorial-subhead mb-3">Student Workspace / 2025-26</div>
          <h1 className="text-4xl text-[var(--color-text-primary)] mb-3">Good morning, {firstName}</h1>
          <p className="text-[var(--color-text-secondary)] text-sm max-w-xl">
            A quiet place to keep your participation records in order and your attendance requests ready.
          </p>
        </div>
        <button 
          onClick={() => navigate('/events')}
          className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors px-6 py-2.5 text-xs font-semibold tracking-widest uppercase rounded-sm flex items-center gap-2"
        >
          <span>+</span> Add Event
        </button>
      </div>

      {/* Stats Block (Single Row) */}
      <div className="editorial-card grid grid-cols-1 md:grid-cols-4 mb-14">
        <div className="p-6 border-b md:border-b-0 md:border-r border-[var(--color-border)]">
          <div className="flex justify-between items-start mb-4">
            <span className="editorial-subhead text-[var(--color-text-secondary)]">Events Attended</span>
            <FileBadge className="w-4 h-4 text-[var(--color-text-accent)]" />
          </div>
          <div className="text-3xl font-serif text-[var(--color-text-primary)] mb-1">
            {stats.totalEvents.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-[var(--color-text-secondary)]">This academic year</div>
        </div>
        
        <div className="p-6 border-b md:border-b-0 md:border-r border-[var(--color-border)]">
          <div className="flex justify-between items-start mb-4">
            <span className="editorial-subhead text-[var(--color-text-secondary)]">Certificates Stored</span>
            <FileText className="w-4 h-4 text-[var(--color-text-accent)]" />
          </div>
          <div className="text-3xl font-serif text-[var(--color-text-primary)] mb-1">
            {stats.totalCerts.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-[var(--color-text-secondary)]">
            {stats.totalEvents - stats.totalCerts} needs attention
          </div>
        </div>

        <div className="p-6 border-b md:border-b-0 md:border-r border-[var(--color-border)]">
          <div className="flex justify-between items-start mb-4">
            <span className="editorial-subhead text-[var(--color-text-secondary)]">Applications Sent</span>
            <FileText className="w-4 h-4 text-[var(--color-text-accent)]" />
          </div>
          <div className="text-3xl font-serif text-[var(--color-text-primary)] mb-1">
            {stats.totalApps.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-[var(--color-text-secondary)]">
            {stats.totalEvents - stats.totalApps} drafts ready
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="editorial-subhead text-[var(--color-text-secondary)]">Days Missed</span>
            <CalendarIcon className="w-4 h-4 text-[var(--color-text-accent)]" />
          </div>
          <div className="text-3xl font-serif text-[var(--color-text-primary)] mb-1">
            {stats.daysMissed.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-[var(--color-text-secondary)]">Total across events</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Recent Events */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-end border-b border-[var(--color-border)] pb-3 mb-6">
            <div>
              <h2 className="text-2xl text-[var(--color-text-primary)]">Recent events</h2>
              <div className="editorial-subhead text-[var(--color-text-secondary)] mt-1">Participation Record</div>
            </div>
            <button onClick={() => navigate('/events')} className="editorial-subhead flex items-center gap-1 hover:text-[var(--color-primary)] transition-colors">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="editorial-card divide-y divide-[var(--color-border)]">
            {recentEvents.length === 0 ? (
              <div className="p-8 text-center text-[var(--color-text-secondary)] text-sm">No events recorded yet.</div>
            ) : (
              recentEvents.map((event) => {
                const needsAction = !event.hasCert || !event.hasApp;
                return (
                  <div key={event.id} className="p-4 flex items-center gap-6 hover:bg-[#F8F7F3] transition-colors cursor-default">
                    {/* Date Box */}
                    <div className="border border-[var(--color-border)] p-2 min-w-[3.5rem] flex flex-col items-center justify-center bg-white rounded-sm shadow-sm">
                      <span className="editorial-subhead">{format(parseISO(event.date), 'MMM')}</span>
                      <span className="text-xl font-serif text-[var(--color-text-primary)] leading-none mt-1">{format(parseISO(event.date), 'dd')}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg text-[var(--color-text-primary)]">{event.title}</h3>
                        <span className="border border-[var(--color-border)] text-[var(--color-text-secondary)] text-[0.65rem] uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-white">
                          {event.type}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {event.venue || 'No venue specified'}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end justify-center">
                      <span className={`editorial-subhead ${needsAction ? 'text-[var(--color-text-accent)]' : 'text-emerald-700'}`}>
                        {needsAction ? 'Needs Action' : 'Ready'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-secondary)] mt-1" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Action Needed */}
        <div>
          <div className="border-b border-[var(--color-border)] pb-3 mb-6">
            <h2 className="text-2xl text-[var(--color-text-primary)]">Action needed</h2>
            <div className="editorial-subhead text-[var(--color-text-secondary)] mt-1">Before you send</div>
          </div>
          
          {needsAttention.length === 0 ? (
            <div className="editorial-card p-6 text-center">
              <p className="text-[var(--color-text-secondary)] text-sm">All records are complete and filed.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {needsAttention.slice(0, 1).map((item) => (
                <div key={item.id} className="editorial-card p-6 bg-[#FAF8F3] border-[#E8E1D3]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full border border-[var(--color-border-dark)] flex items-center justify-center bg-white text-[var(--color-text-secondary)]">
                      <Bell className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg text-[var(--color-text-primary)]">{item.title}</h3>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-6 pl-11">
                    Your attendance request is missing details.
                  </p>
                  
                  <div className="space-y-3">
                    {item.missingCert && (
                      <button onClick={() => navigate('/events')} className="w-full bg-white border border-[var(--color-border-dark)] hover:bg-[#F5F1E7] transition-colors py-3 px-4 flex items-center justify-between text-xs font-semibold tracking-widest uppercase text-[var(--color-text-primary)] rounded-sm">
                        Upload Certificate <Upload className="w-4 h-4" />
                      </button>
                    )}
                    {item.missingApp && (
                      <button onClick={() => navigate(`/applications/new?eventId=${item.id}`)} className="w-full bg-white border border-[var(--color-text-accent)] hover:bg-[#Fdf8f8] transition-colors py-3 px-4 flex items-center justify-between text-xs font-semibold tracking-widest uppercase text-[var(--color-text-accent)] rounded-sm">
                        Generate Application <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="bg-[#EFEAE0] p-5 border-l-2 border-[var(--color-text-accent)]">
                <div className="editorial-subhead mb-2">A small reminder</div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  Add certificates as soon as you receive them. Your future self will thank you.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
