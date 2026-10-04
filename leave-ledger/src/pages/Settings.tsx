import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthContext';
import { Save, UserCircle } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    dept: '',
    year: '',
    section: '',
    college: '',
    phone: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (data) {
        setFormData({
          name: data.name || '',
          rollNo: data.roll_no || '',
          dept: data.dept || '',
          year: data.year || '',
          section: data.section || '',
          college: data.college || '',
          phone: data.phone || ''
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: formData.name,
          roll_no: formData.rollNo,
          dept: formData.dept,
          year: formData.year,
          section: formData.section,
          college: formData.college,
          phone: formData.phone
        });

      if (error) throw error;
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save profile', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-[var(--color-text-secondary)]">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="border-b border-[var(--color-border)] pb-3 mb-8">
        <h1 className="text-4xl text-[var(--color-text-primary)] font-serif">Student Profile</h1>
        <p className="editorial-subhead text-[var(--color-text-secondary)] mt-2">
          This information is used to generate your official leave letters.
        </p>
      </div>

      <div className="editorial-card p-8 md:p-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full border border-[var(--color-border-dark)] flex items-center justify-center bg-[#FDFBF8] text-[var(--color-text-secondary)]">
              <UserCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl text-[var(--color-text-primary)] font-serif">{formData.name || 'Anonymous Student'}</h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">{formData.rollNo || 'No Roll Number Set'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">Full Name</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 bg-white border border-[var(--color-border-dark)] focus:border-[var(--color-text-accent)] outline-none transition-colors rounded-sm text-sm"
                placeholder="E.g., Ananya Sharma"
              />
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="rollNo" className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">Roll / Register Number</label>
              <input
                id="rollNo"
                name="rollNo"
                value={formData.rollNo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 bg-white border border-[var(--color-border-dark)] focus:border-[var(--color-text-accent)] outline-none transition-colors rounded-sm text-sm tabular-nums"
                placeholder="E.g., 20BCE10234"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="college" className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">College Name</label>
              <input
                id="college"
                name="college"
                value={formData.college}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 bg-white border border-[var(--color-border-dark)] focus:border-[var(--color-text-accent)] outline-none transition-colors rounded-sm text-sm"
                placeholder="E.g., National Institute of Technology"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="dept" className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">Department / Branch</label>
              <input
                id="dept"
                name="dept"
                value={formData.dept}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 bg-white border border-[var(--color-border-dark)] focus:border-[var(--color-text-accent)] outline-none transition-colors rounded-sm text-sm"
                placeholder="E.g., Computer Science"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="year" className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">Year / Semester</label>
              <input
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 bg-white border border-[var(--color-border-dark)] focus:border-[var(--color-text-accent)] outline-none transition-colors rounded-sm text-sm"
                placeholder="E.g., 3rd Year, 5th Sem"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="section" className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">Section (Optional)</label>
              <input
                id="section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-white border border-[var(--color-border-dark)] focus:border-[var(--color-text-accent)] outline-none transition-colors rounded-sm text-sm"
                placeholder="E.g., A"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">Phone Number (Optional)</label>
              <input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-white border border-[var(--color-border-dark)] focus:border-[var(--color-text-accent)] outline-none transition-colors rounded-sm text-sm tabular-nums"
                placeholder="+91"
              />
            </div>
          </div>

          <div className="pt-6 mt-8 border-t border-[var(--color-border)] flex items-center gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-6 py-3 hover:bg-[var(--color-primary-hover)] disabled:opacity-70 transition-colors text-xs font-semibold tracking-widest uppercase rounded-sm"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
            
            {showSuccess && (
              <span className="text-xs font-semibold tracking-widest uppercase text-emerald-700 flex items-center gap-1.5 animate-in slide-in-from-left-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved successfully
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
