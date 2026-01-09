'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Shield,
  Edit2,
  UserCog,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { UserRole } from '@/lib/admin/types';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [savingRole, setSavingRole] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (response.ok) {
        setUsers(data.data || []);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setSavingRole(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role');
      }

      // Update local state
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setEditingUser(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingRole(false);
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-tactical-red/10 text-tactical-red border-tactical-red/20';
      case 'editor':
        return 'bg-tactical-amber/10 text-tactical-amber border-tactical-amber/20';
      case 'viewer':
        return 'bg-slate-dark/10 text-slate-dark border-slate-dark/20';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'editor':
        return Edit2;
      case 'viewer':
        return Users;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold uppercase tracking-wider text-slate-light">
          User Management
        </h1>
        <p className="text-slate-medium mt-1">
          Manage user accounts and permissions
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Role legend */}
      <div className="bg-midnight-800 rounded-xl border border-midnight-700 p-4">
        <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-dark mb-3">
          Role Permissions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-tactical-red/10">
              <Shield className="h-4 w-4 text-tactical-red" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-light">Admin</p>
              <p className="text-xs text-slate-dark">Full access, user management, delete articles</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-tactical-amber/10">
              <Edit2 className="h-4 w-4 text-tactical-amber" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-light">Editor</p>
              <p className="text-xs text-slate-dark">Create, edit, publish articles</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-dark/10">
              <Users className="h-4 w-4 text-slate-dark" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-light">Viewer</p>
              <p className="text-xs text-slate-dark">View-only access to admin panel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-midnight-800 rounded-xl border border-midnight-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-tactical-red" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-dark">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-midnight-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-heading uppercase tracking-wider text-slate-dark">
                    User
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-heading uppercase tracking-wider text-slate-dark">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-heading uppercase tracking-wider text-slate-dark">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-heading uppercase tracking-wider text-slate-dark">
                    Joined
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-heading uppercase tracking-wider text-slate-dark">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-midnight-700">
                {users.map((u) => {
                  const RoleIcon = getRoleIcon(u.role);
                  const isCurrentUser = u.id === currentUser?.id;

                  return (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-midnight-700/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-tactical-red/20 flex items-center justify-center">
                            <span className="text-sm font-bold text-tactical-red">
                              {u.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-light">
                              {u.full_name || 'No name'}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-tactical-amber">(You)</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-medium">
                        {u.email}
                      </td>
                      <td className="px-4 py-3">
                        {editingUser === u.id ? (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                            disabled={savingRole}
                            className="bg-midnight-700 border border-midnight-500 rounded px-2 py-1 text-sm text-slate-light
                                     focus:border-tactical-red focus:outline-none"
                          >
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border ${getRoleBadgeClass(u.role)}`}>
                            <RoleIcon className="h-3 w-3" />
                            {u.role}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-dark">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!isCurrentUser && (
                          <>
                            {editingUser === u.id ? (
                              <div className="flex items-center justify-end gap-2">
                                {savingRole ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-tactical-red" />
                                ) : (
                                  <button
                                    onClick={() => setEditingUser(null)}
                                    className="p-1.5 rounded hover:bg-midnight-700 text-slate-dark hover:text-slate-light transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingUser(u.id)}
                                className="p-1.5 rounded hover:bg-midnight-700 text-slate-dark hover:text-slate-light transition-colors"
                                title="Change role"
                              >
                                <UserCog className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-midnight-800/50 rounded-xl border border-midnight-700 p-4 text-sm text-slate-dark">
        <p>
          <strong className="text-slate-medium">Note:</strong> New users are created when they sign up via Supabase Auth.
          They start with the &quot;viewer&quot; role by default. Change their role here to grant additional permissions.
        </p>
      </div>
    </div>
  );
}
