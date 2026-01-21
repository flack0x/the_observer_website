'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Eye, EyeOff, Loader2, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface SignUpPageProps {
  params: {
    locale: string;
  };
}

export default function SignUpPage({ params }: SignUpPageProps) {
  const router = useRouter();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, fullName);

      if (error) {
        setError(error.message || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-midnight-900 flex flex-col items-center justify-center px-4 pt-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="relative w-full max-w-md">
          <div className="bg-midnight-800 rounded-xl border border-midnight-700 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-earth-olive/10 border border-earth-olive/20 mb-4">
              <CheckCircle className="h-8 w-8 text-earth-olive" />
            </div>
            <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-slate-light mb-3">
              Account Created
            </h2>
            <p className="text-slate-medium text-sm mb-6">
              Your account has been created successfully.
            </p>
            <Link
              href={`/${params.locale}/login`}
              className="inline-block bg-tactical-red text-white font-heading font-bold uppercase tracking-wider px-6 py-3 rounded-lg hover:bg-tactical-red-hover transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-slate-medium text-sm mt-1">Join the Community</p>
        </div>

        <div className="bg-midnight-800 rounded-xl border border-midnight-700 p-8">
          <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-slate-light mb-6 text-center">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-medium mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3 text-slate-light focus:border-tactical-red focus:outline-none transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-medium mb-2">Email Address</label>
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
              <label className="block text-sm font-medium text-slate-medium mb-2">Password</label>
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

            <div>
              <label className="block text-sm font-medium text-slate-medium mb-2">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3 text-slate-light focus:border-tactical-red focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-tactical-red text-white font-heading font-bold uppercase tracking-wider px-6 py-3 rounded-lg hover:bg-tactical-red-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-dark text-sm">
              Already have an account?{' '}
              <Link href={`/${params.locale}/login`} className="text-tactical-red hover:text-tactical-red-hover">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
