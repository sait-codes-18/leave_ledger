import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, Save } from 'lucide-react';

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMessage('Password updated successfully! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="border-b border-[var(--color-border)] pb-3 mb-8">
        <h1 className="text-4xl text-[var(--color-text-primary)]">Update Password</h1>
        <div className="editorial-subhead text-[var(--color-text-secondary)] mt-2">Secure your account</div>
      </div>

      <div className="editorial-card p-8">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--color-border)] focus:border-[var(--color-text-accent)] outline-none transition-colors rounded-sm text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <div className="text-xs text-[var(--color-text-accent)] bg-[#FDF8F8] border border-[var(--color-text-accent)] p-3 rounded-sm">{error}</div>}
          {message && <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-sm">{message}</div>}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-3 hover:bg-[var(--color-primary-hover)] disabled:opacity-70 transition-colors text-xs font-semibold tracking-widest uppercase rounded-sm"
          >
            <Save className="w-4 h-4" />
            Save New Password
          </button>
        </form>
      </div>
    </div>
  );
}
