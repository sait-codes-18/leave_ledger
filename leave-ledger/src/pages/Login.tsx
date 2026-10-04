import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, UserPlus, FileText } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (action: 'login' | 'signup', e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (action === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
      <div className="bg-[var(--color-surface)] p-10 border border-[var(--color-border)] w-full max-w-md shadow-2xl shadow-[var(--color-sidebar)]/5 rounded-sm">
        
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 rounded-full border border-[var(--color-text-accent)] flex items-center justify-center text-[var(--color-text-accent)] mb-6 bg-white shadow-sm">
            <FileText className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl text-[var(--color-text-primary)] mb-2 font-serif">Leave Ledger</h1>
          <p className="editorial-subhead text-[var(--color-text-secondary)]">Student Records</p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-[0.65rem] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[var(--color-border)] focus:border-[var(--color-text-accent)] outline-none transition-colors rounded-sm text-sm"
                placeholder="student@college.edu"
              />
            </div>
          </div>

          <div>
            <label className="block text-[0.65rem] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[var(--color-border)] focus:border-[var(--color-text-accent)] outline-none transition-colors rounded-sm text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <div className="text-xs text-[var(--color-text-accent)] bg-[#FDF8F8] border border-[var(--color-text-accent)] p-3 rounded-sm">{error}</div>}
          {message && <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-sm">{message}</div>}

          <div className="flex gap-4 pt-6 mt-6 border-t border-[var(--color-border)]">
            <button
              type="submit"
              onClick={(e) => handleAuth('login', e)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-4 py-3 hover:bg-[var(--color-primary-hover)] disabled:opacity-70 transition-colors text-[0.65rem] font-semibold tracking-widest uppercase rounded-sm"
            >
              Sign In <LogIn className="w-4 h-4" />
            </button>
            <button
              type="submit"
              onClick={(e) => handleAuth('signup', e)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-[var(--color-text-primary)] border border-[var(--color-border-dark)] px-4 py-3 hover:bg-[#F5F1E7] disabled:opacity-70 transition-colors text-[0.65rem] font-semibold tracking-widest uppercase rounded-sm"
            >
              Sign Up <UserPlus className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
