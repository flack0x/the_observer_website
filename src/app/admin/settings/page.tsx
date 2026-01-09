'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Settings, User, Lock, Save, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage(null);

    // Profile update would go here
    // For now, just simulate a save
    await new Promise(resolve => setTimeout(resolve, 1000));

    setMessage({ type: 'success', text: 'Profile updated successfully!' });
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold uppercase tracking-wider text-slate-light">
          Settings
        </h1>
        <p className="text-slate-medium mt-1">
          Manage your account settings
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-earth-olive/10 border border-earth-olive/20 text-earth-olive'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile section */}
      <div className="bg-midnight-800 rounded-xl border border-midnight-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-tactical-red/10">
            <User className="h-5 w-5 text-tactical-red" />
          </div>
          <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-slate-light">
            Profile
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-medium mb-2">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full bg-midnight-700/50 border border-midnight-600 rounded-lg px-4 py-3
                       text-slate-dark cursor-not-allowed"
            />
            <p className="text-xs text-slate-dark mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm text-slate-medium mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-midnight-700 border border-midnight-500 rounded-lg px-4 py-3
                       text-slate-light placeholder:text-slate-dark
                       focus:border-tactical-red focus:ring-1 focus:ring-tactical-red focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-medium mb-2">Role</label>
            <div className="px-4 py-3 bg-midnight-700/50 border border-midnight-600 rounded-lg">
              <span className={`inline-flex items-center gap-1.5 text-sm capitalize ${
                profile?.role === 'admin' ? 'text-tactical-red' :
                profile?.role === 'editor' ? 'text-tactical-amber' :
                'text-slate-medium'
              }`}>
                {profile?.role || 'viewer'}
              </span>
            </div>
            <p className="text-xs text-slate-dark mt-1">Contact an admin to change your role</p>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="flex items-center gap-2 bg-tactical-red text-white font-heading font-bold uppercase tracking-wider
                     px-4 py-2.5 rounded-lg hover:bg-tactical-red-hover
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Security section */}
      <div className="bg-midnight-800 rounded-xl border border-midnight-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-tactical-amber/10">
            <Lock className="h-5 w-5 text-tactical-amber" />
          </div>
          <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-slate-light">
            Security
          </h2>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-medium">
            Password management is handled through Supabase Auth. To reset your password,
            use the &quot;Forgot Password&quot; option on the login page.
          </p>
        </div>
      </div>
    </div>
  );
}
