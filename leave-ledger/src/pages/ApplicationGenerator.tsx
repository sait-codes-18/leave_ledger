import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthContext';
import { ChevronLeft, Printer } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function ApplicationGenerator() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [certUrl, setCertUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [addressee, setAddressee] = useState('The Class Coordinator');
  const [template, setTemplate] = useState<'Formal' | 'Short' | 'Detailed'>('Formal');
  const [bodyText, setBodyText] = useState('');
  const [includeCertText, setIncludeCertText] = useState(true);
  const [attachCert, setAttachCert] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user || !eventId) {
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { data: eventData } = await supabase.from('events').select('*').eq('id', eventId).single();
      const { data: certData } = await supabase.from('certificates').select('*').eq('event_id', eventId);

      setProfile(profileData);
      setEvent(eventData);
      
      if (certData && certData.length > 0) {
        setCertificates(certData);
        // Pre-fetch signed URL for print preview if it's an image
        const path = certData[0].storage_path;
        if (path.match(/\.(jpeg|jpg|png|gif|webp)$/i)) {
          const { data } = await supabase.storage.from('certificates').createSignedUrl(path, 60 * 60);
          if (data?.signedUrl) setCertUrl(data.signedUrl);
        }
      }

      setLoading(false);
    }
    loadData();
  }, [user, eventId]);

  // Generate body text when event, profile or template changes
  useEffect(() => {
    if (!event || !profile) return;

    const startDate = format(parseISO(event.start_date), 'do MMMM yyyy');
    const endDate = format(parseISO(event.end_date), 'do MMMM yyyy');
    const dateRange = startDate === endDate ? startDate : `${startDate} to ${endDate}`;

    let generatedText = '';
    
    if (template === 'Formal') {
      generatedText = `I am writing to formally request a leave of absence from ${dateRange}. I will be representing our college as a ${event.role} at ${event.title}, organized by ${event.organizer}${event.venue ? ` at ${event.venue}` : ''}.\n\nI kindly request you to excuse my absence during these dates and permit me to regularize my attendance. I assure you that I will catch up on all missed coursework promptly.`;
    } else if (template === 'Short') {
      generatedText = `Please grant me leave from ${dateRange} to participate in ${event.title} as a ${event.role}. I will ensure all missed academic work is completed upon my return.`;
    } else {
      generatedText = `I wish to inform you of my upcoming participation in ${event.title}, a recognized event organized by ${event.organizer}. I have been selected/invited to attend as a ${event.role}.\n\nThe event spans from ${dateRange}. Consequently, I will be unable to attend regular classes during this period.\n\nI request you to kindly grant me an official leave of absence. My participation will be a valuable learning experience, and I am committed to covering any missed academic curriculum immediately upon returning.`;
    }

    setBodyText(generatedText);
  }, [event, profile, template]);

  const handlePrint = async () => {
    window.print();

    if (user && event) {
      await supabase.from('applications').insert({
        user_id: user.id,
        event_id: event.id,
        addressee,
        template,
        body_text: bodyText
      });
      navigate('/applications');
    }
  };

  if (loading) return <div className="p-8 text-center text-[var(--color-text-secondary)]">Loading generator...</div>;
  
  if (!profile?.name || !profile?.roll_no) {
    return (
      <div className="editorial-card p-12 text-center max-w-md mx-auto mt-12">
        <h3 className="text-xl text-[var(--color-text-primary)] mb-2">Profile Incomplete</h3>
        <p className="text-[var(--color-text-secondary)] mb-6 text-sm">Please set your Name and Roll Number in settings before generating official letters.</p>
        <button 
          onClick={() => navigate('/settings')}
          className="bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-widest"
        >
          Go to Settings
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-700">Error: Event not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-6rem)] relative max-w-7xl mx-auto py-6">
      
      {/* Left Form Panel - Hidden when printing */}
      <div className="w-full md:w-1/3 flex flex-col editorial-card overflow-hidden print:hidden h-full">
        <div className="p-6 border-b border-[var(--color-border)] bg-[#FDFBF8] flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-xs font-semibold uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="font-serif font-semibold text-[var(--color-text-primary)]">Generator</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] mb-1">To (Addressee)</label>
            <input 
              value={addressee} 
              onChange={e => setAddressee(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[var(--color-border-dark)] focus:border-[var(--color-text-accent)] outline-none transition-colors rounded-sm text-sm" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] mb-1">Tone / Template</label>
            <select 
              value={template} 
              onChange={e => setTemplate(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-[var(--color-border-dark)] focus:border-[var(--color-text-accent)] outline-none transition-colors rounded-sm text-sm"
            >
              <option value="Formal">Formal (Standard)</option>
              <option value="Short">Short & Direct</option>
              <option value="Detailed">Detailed</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] mb-1">Body Text (Editable)</label>
            <textarea 
              value={bodyText} 
              onChange={e => setBodyText(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[var(--color-border-dark)] focus:border-[var(--color-text-accent)] outline-none transition-colors rounded-sm text-sm min-h-[180px] resize-y" 
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" checked={includeCertText} onChange={e => setIncludeCertText(e.target.checked)} className="peer sr-only" />
                <div className="w-4 h-4 border border-[var(--color-border-dark)] rounded-sm bg-white peer-checked:bg-[var(--color-primary)] peer-checked:border-[var(--color-primary)] transition-all"></div>
                <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-xs font-semibold tracking-wide text-[var(--color-text-primary)] group-hover:text-[var(--color-text-accent)] transition-colors">Mention enclosure in text</span>
            </label>

            {certificates.length > 0 && (
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" checked={attachCert} onChange={e => setAttachCert(e.target.checked)} className="peer sr-only" />
                  <div className="w-4 h-4 border border-[var(--color-border-dark)] rounded-sm bg-white peer-checked:bg-[var(--color-primary)] peer-checked:border-[var(--color-primary)] transition-all"></div>
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-xs font-semibold tracking-wide text-[var(--color-text-primary)] group-hover:text-[var(--color-text-accent)] transition-colors">Print certificate as Page 2</span>
              </label>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-[var(--color-border)] bg-[#FDFBF8]">
          <button 
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-4 py-3 hover:bg-[var(--color-primary-hover)] transition-colors text-xs font-semibold tracking-widest uppercase rounded-sm"
          >
            <Printer className="w-4 h-4" />
            Print Application
          </button>
        </div>
      </div>

      {/* Right Preview Panel */}
      <div className="flex-1 overflow-auto bg-[#EAE4D9]/30 border border-[var(--color-border)] rounded-sm p-4 md:p-8 flex justify-center custom-scrollbar print:p-0 print:border-none print:bg-white print:overflow-visible h-full">
        
        {/* The A4 Print Sheet */}
        <div className="print-sheet bg-white shadow-lg max-w-[210mm] w-[210mm] min-h-[297mm] mx-auto text-black font-serif relative border border-[var(--color-border-dark)] print:border-none">
          
          {/* Page 1: Letter */}
          <div className="p-[25mm] text-[12pt] leading-relaxed break-words h-full relative z-10">
            <div className="mb-6 flex justify-between items-start">
              <div className="font-semibold">{format(new Date(), 'dd/MM/yyyy')}</div>
            </div>

            <div className="mb-8 space-y-0.5">
              <p>To</p>
              <p className="font-semibold">{addressee}</p>
              <p>{profile.dept}</p>
              <p>{profile.college}</p>
            </div>

            <div className="mb-8">
              <p className="font-bold underline underline-offset-4 decoration-1">
                Subject: Request for Leave of Absence and Attendance Regularization
              </p>
            </div>

            <div className="mb-6">
              <p>Respected Sir/Madam,</p>
            </div>

            <div className="mb-8 whitespace-pre-wrap text-justify">
              {bodyText}
            </div>

            <div className="mb-8 space-y-1">
              <p>Yours faithfully,</p>
              <div className="h-12"></div> {/* Signature space */}
              <p className="font-semibold">{profile.name}</p>
              <p>Roll No: {profile.roll_no}</p>
              <p>{profile.year}{profile.section ? `, Section ${profile.section}` : ''}</p>
              <p>{profile.dept}</p>
            </div>

            {includeCertText && certificates.length > 0 && (
              <div className="mt-12 text-sm">
                <p className="font-semibold italic">Enclosures:</p>
                <p className="italic">1. Certificate of Participation - {event.title}</p>
              </div>
            )}
          </div>

          {/* Page 2: Certificate (if attached and is image) */}
          {attachCert && certUrl && (
            <div className="w-[210mm] h-[297mm] break-before-page p-[25mm] flex flex-col items-center justify-center relative z-10 bg-white">
              <div className="w-full text-center text-sm font-semibold mb-4 text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2">
                Enclosure: Proof of Event
              </div>
              <img src={certUrl} alt="Certificate" className="max-w-full max-h-[230mm] object-contain" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
