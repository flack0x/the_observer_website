'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Eye, EyeOff, Loader2, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/lib/theme';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { signIn } = useAuth();
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message || 'Invalid email or password');
        setIsLoading(false);
        return;
      }

      router.push(`/${locale}/frontline`);
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-900 flex flex-col items-center justify-center px-4 pt-20">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-tactical-red/10 border border-tactical-red/20 mb-4">
            <Shield className="h-8 w-8 text-tactical-red" />
          </div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-wider text-slate-light">
            The Observer
          </h1>
          <p className="text-slate-medium text-sm mt-1">Reader Access</p>
        </div>

        <div className="bg-midnight-800 rounded-xl border border-midnight-700 p-8">
          <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-slate-light mb-6 text-center">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3 text-slate-light focus:border-tactical-red focus:outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3 pr-12 text-slate-light focus:border-tactical-red focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-dark hover:text-slate-medium"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-tactical-red text-white font-heading font-bold uppercase tracking-wider px-6 py-3 rounded-lg hover:bg-tactical-red-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-dark text-sm">
              Don't have an account?{' '}
              <Link href={`/${locale}/signup`} className="text-tactical-red hover:text-tactical-red-hover">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
