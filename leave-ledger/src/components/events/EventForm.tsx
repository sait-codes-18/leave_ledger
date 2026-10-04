import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import { X, Upload, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import type { EventRecord } from '../../types';

interface EventFormProps {
  eventToEdit?: EventRecord;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EventForm({ eventToEdit, onClose, onSuccess }: EventFormProps) {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    organizer: '',
    venue: '',
    type: 'Hackathon',
    role: 'Participant',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        title: eventToEdit.title,
        organizer: eventToEdit.organizer,
        venue: eventToEdit.venue || '',
        type: eventToEdit.type,
        role: eventToEdit.role,
        startDate: eventToEdit.startDate,
        endDate: eventToEdit.endDate
      });
    }
  }, [eventToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let eventId = eventToEdit?.id;

      if (eventToEdit) {
        const { error } = await supabase.from('events').update({
          title: formData.title,
          organizer: formData.organizer,
          venue: formData.venue,
          type: formData.type,
          role: formData.role,
          start_date: formData.startDate,
          end_date: formData.endDate
        }).eq('id', eventId);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('events').insert({
          user_id: user.id,
          title: formData.title,
          organizer: formData.organizer,
          venue: formData.venue,
          type: formData.type,
          role: formData.role,
          start_date: formData.startDate,
          end_date: formData.endDate
        }).select().single();

        if (error) throw error;
        eventId = data.id;
      }

      if (files.length > 0 && eventId) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${eventId}/${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('certificates')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { error: certError } = await supabase.from('certificates').insert([{
            event_id: eventId,
            file_name: file.name,
            mime_type: file.type,
            storage_path: fileName
          }]);
          
          if (certError) throw certError;
        }
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save event:', error);
      setErrorMsg(error.message || 'Failed to save event. Please check the console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17212B]/40 p-4">
      <div className="bg-[#FCFBF9] border border-[var(--color-border)] rounded-sm shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#FCFBF9] border-b border-[var(--color-border)] px-8 py-5 flex items-center justify-between z-10">
          <h2 className="text-xl font-serif text-[var(--color-text-primary)]">
            {eventToEdit ? 'Edit Event' : 'Add New Event'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-white border border-[var(--color-border)] rounded-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">Event Name *</label>
              <input name="title" required value={formData.title} onChange={handleChange} className="w-full px-3 py-2.5 bg-white border border-[var(--color-border-dark)] focus:border-[var(--color-text-accent)] outline-none transition-colors rounded-sm text-sm" placeholder="E.g., InnoHacks 2024" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">Organizer/College *</label>
              <input name="organizer" required value={formData.organizer} onChange={handleChange} className="w-full px-3 py-2.5 bg-white border border-[var(--color-border-dark)] focus:border-[var(--color-text-accent)] outline-none transition-colors rounded-sm text-sm" placeholder="E.g., Tech Club, NIT" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">Venue</label>
              <input name="venue" value={formData.venue} onChange={handleChange} className="w-full px-3 py-2.5 bg-white border border-[var(--color-border-dark)] focus:border-[var(--color-text-accent)] outline-none transition-colors rounded-sm text-sm" placeholder="E.g., Main Auditorium" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">Event Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2.5 bg-white border border-[var(--color-border-dark)] focus:border-[var(--color-text-accent)] outline-none transition-colors rounded-sm text-sm">
                <option value="Hackathon">Hackathon</option>
                <option value="Workshop">Workshop</option>
                <option value="Conference">Conference / Symposium</option>
                <option value="Sports">Sports</option>
                <option value="Cultural">Cultural Fest</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2.5 bg-white border border-[var(--color-border-dark)] focus:border-[var(--color-text-accent)] outline-none transition-colors rounded-sm text-sm">
                <option value="Participant">Participant</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Organizer">Organizer</option>
                <option value="Winner">Winner</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">Start Date *</label>
              <input type="date" name="startDate" required value={formData.startDate} onChange={handleChange} className="w-full px-3 py-2.5 bg-white border border-[var(--color-border-dark)] focus:border-[var(--color-text-accent)] outline-none transition-colors rounded-sm text-sm tabular-nums" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">End Date *</label>
              <input type="date" name="endDate" required value={formData.endDate} onChange={handleChange} className="w-full px-3 py-2.5 bg-white border border-[var(--color-border-dark)] focus:border-[var(--color-text-accent)] outline-none transition-colors rounded-sm text-sm tabular-nums" />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] mb-2">Certificates (Proof)</label>
              <div className="border border-dashed border-[var(--color-border-dark)] rounded-sm p-8 text-center bg-white hover:bg-[#FDFBF8] transition-colors">
                <input type="file" id="cert-upload" multiple accept=".pdf,image/png,image/jpeg" onChange={handleFileChange} className="hidden" />
                <label htmlFor="cert-upload" className="cursor-pointer flex flex-col items-center gap-3">
                  <div className="p-3 border border-[var(--color-border-dark)] rounded-sm text-[var(--color-text-secondary)]">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-[var(--color-text-primary)]">Click to upload</span> or drag and drop
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)]">PDF, PNG, or JPG up to 10MB</div>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-[var(--color-border-dark)] rounded-sm bg-white">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {file.type.includes('image') ? <ImageIcon className="w-4 h-4 text-[var(--color-primary)] shrink-0" /> : <FileText className="w-4 h-4 text-[var(--color-text-accent)] shrink-0" />}
                        <span className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{file.name}</span>
                      </div>
                      <button type="button" onClick={() => removeFile(idx)} className="p-1.5 text-[var(--color-text-secondary)] hover:text-red-700 hover:bg-[#FDF8F8] rounded-sm transition-colors border border-transparent hover:border-red-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-sm bg-[#FDF8F8] border border-[var(--color-text-accent)] text-[var(--color-text-accent)] text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end gap-4 pt-6 border-t border-[var(--color-border)]">
            <button type="button" onClick={onClose} className="px-5 py-3 rounded-sm font-semibold text-xs tracking-widest uppercase text-[var(--color-text-primary)] hover:bg-[#F5F1E7] border border-transparent transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-3 rounded-sm font-semibold text-xs tracking-widest uppercase bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-70 transition-colors">
              {isSubmitting ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
