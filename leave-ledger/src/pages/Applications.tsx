import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthContext';
import { FileText, Calendar, Trash2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

export default function Applications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select('*, event:events(title)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setApplications(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const handleDelete = async (id: number) => {
    if (confirm('Delete this application record?')) {
      await supabase.from('applications').delete().eq('id', id);
      fetchApplications();
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="border-b border-[var(--color-border)] pb-3 mb-8">
        <h1 className="text-4xl text-[var(--color-text-primary)]">Leave Applications</h1>
        <div className="editorial-subhead text-[var(--color-text-secondary)] mt-2">History of all generated leave letters</div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[var(--color-text-secondary)]">Loading records...</div>
      ) : applications.length === 0 ? (
        <div className="editorial-card p-16 flex flex-col items-center justify-center text-center">
          <FileText className="w-8 h-8 text-[var(--color-border-dark)] mb-4" />
          <h3 className="text-xl text-[var(--color-text-primary)]">No applications generated yet</h3>
          <p className="text-[var(--color-text-secondary)] text-sm max-w-md mt-2 mb-6">
            Generate your first leave application by selecting an event from your calendar and clicking "Generate Application".
          </p>
          <button 
            onClick={() => navigate('/calendar')}
            className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors px-6 py-2.5 text-xs font-semibold tracking-widest uppercase rounded-sm flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Go to Calendar
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map(app => (
            <div key={app.id} className="editorial-card p-6 flex flex-col relative group">
              <button
                onClick={() => handleDelete(app.id)}
                className="absolute top-4 right-4 p-2 text-[var(--color-text-secondary)] hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Record"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-3 mb-5 border-b border-[var(--color-border)] pb-4">
                <div className="w-8 h-8 border border-[var(--color-border-dark)] flex items-center justify-center bg-white text-[var(--color-text-secondary)]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg text-[var(--color-text-primary)] leading-tight">Leave Letter</h3>
                  <p className="editorial-subhead mt-1">{format(parseISO(app.created_at), 'MMM d, yyyy')}</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-[var(--color-text-secondary)] mb-6 flex-1">
                <p><strong className="font-semibold text-[var(--color-text-primary)]">Event:</strong> {app.event?.title || 'Unknown Event'}</p>
                <p><strong className="font-semibold text-[var(--color-text-primary)]">To:</strong> {app.addressee}</p>
                <p><strong className="font-semibold text-[var(--color-text-primary)]">Template:</strong> {app.template}</p>
              </div>
              
              <button 
                onClick={() => navigate(`/applications/new?eventId=${app.event_id}`)}
                className="w-full mt-auto bg-white border border-[var(--color-border-dark)] hover:bg-[#F5F1E7] transition-colors py-2.5 px-4 flex items-center justify-between text-xs font-semibold tracking-widest uppercase text-[var(--color-text-primary)] rounded-sm"
              >
                Regenerate <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
