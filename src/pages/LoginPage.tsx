import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

import { supabase } from '@/integrations/supabase/client';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = isSignUp
      ? await signUp(email, password, name)
      : await signIn(email, password);
    if (result.error) setError(result.error.message);
    setLoading(false);
  };

  const handleTestLogin = async (testEmail: string, testName: string, testRole: 'admin' | 'member') => {
    setTestLoading(testEmail);
    setError('');
    const testPassword = 'testpass123!';

    // Try sign in first
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: testEmail, password: testPassword });
    if (!signInErr) {
      setTestLoading(null);
      return;
    }

    // If user doesn't exist, sign up
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: { data: { name: testName } },
    });
    if (signUpErr) {
      setError(signUpErr.message);
      setTestLoading(null);
      return;
    }

    // Assign role if admin
    if (signUpData.user && testRole === 'admin') {
      await supabase.from('user_roles').insert({ user_id: signUpData.user.id, role: 'admin' });
    }
    setTestLoading(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-sm mx-auto px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded bg-primary flex items-center justify-center mb-3">
            <span className="text-sm font-bold text-primary-foreground">A</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground">Adevus</h1>
          <p className="text-xs text-muted-foreground mt-1">Product development tracker</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full text-sm bg-muted/30 rounded px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full text-sm bg-muted/30 rounded px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full text-sm bg-muted/30 rounded px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            required
          />
          {error && <p className="text-xs text-coral">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </form>

        {/* Test login buttons */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">
            Test Accounts (Development Only)
          </p>
          <div className="space-y-2">
            <button
              onClick={() => handleTestLogin('matty@adevus.com.au', 'Matty', 'admin')}
              disabled={testLoading !== null}
              className="w-full py-2 rounded border border-primary/20 text-sm font-medium text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
            >
              {testLoading === 'matty@adevus.com.au' ? 'Logging in...' : 'Login as Matty (Admin)'}
            </button>
            <button
              onClick={() => handleTestLogin('paul@adevus.com.au', 'Paul', 'admin')}
              disabled={testLoading !== null}
              className="w-full py-2 rounded border border-border text-sm font-medium text-muted-foreground hover:bg-muted/30 transition-colors disabled:opacity-50"
            >
              {testLoading === 'paul@adevus.com.au' ? 'Logging in...' : 'Login as Paul (Admin)'}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-8">
          Adevus Launchpad is for authorised Adevus team members only.
        </p>
      </div>
    </div>
  );
}
