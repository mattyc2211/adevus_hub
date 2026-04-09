import { useState } from 'react';
import { useProfiles, useUserRoles, useUpdateUserRole, useCreateUser } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { getInitials, timeAgo } from '@/lib/helpers';
import { Plus, Shield, User, X } from 'lucide-react';

export function SettingsPage() {
  const { role } = useAuth();
  const { data: profiles = [] } = useProfiles();
  const { data: userRoles = [] } = useUserRoles();
  const updateRole = useUpdateUserRole();
  const createUser = useCreateUser();
  const isAdmin = role === 'admin';

  const [showCreate, setShowCreate] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'member'>('member');
  const [error, setError] = useState('');

  const getRoleForUser = (userId: string) => {
    const r = userRoles.find((ur) => ur.user_id === userId);
    return r?.role === 'admin' ? 'admin' : 'member';
  };

  const handleCreate = async () => {
    if (!email.trim() || !name.trim() || !password.trim()) return;
    setError('');
    try {
      await createUser.mutateAsync({ email: email.trim(), password, name: name.trim(), role: newRole });
      setEmail(''); setName(''); setPassword(''); setNewRole('member'); setShowCreate(false);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleRoleChange = (userId: string, role: 'admin' | 'member') => {
    updateRole.mutate({ userId, role });
  };

  if (!isAdmin) {
    return (
      <div className="p-8">
        <h1 className="text-base font-semibold text-foreground mb-1">Settings</h1>
        <p className="text-xs text-muted-foreground">You need admin access to manage users.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-semibold text-foreground">Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage team members and roles.</p>
        </div>
        {!showCreate && (
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Add User
          </button>
        )}
      </div>

      {/* Create user form */}
      {showCreate && (
        <div className="bg-card rounded p-5 card-shadow mb-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Create New Account</h3>
            <button onClick={() => { setShowCreate(false); setError(''); }} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full text-sm bg-muted/30 rounded px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full text-sm bg-muted/30 rounded px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full text-sm bg-muted/30 rounded px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" />
              <select value={newRole} onChange={(e) => setNewRole(e.target.value as 'admin' | 'member')} className="w-full text-sm bg-muted/30 rounded px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {error && <p className="text-xs text-coral">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={handleCreate} disabled={createUser.isPending} className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                {createUser.isPending ? 'Creating...' : 'Create Account'}
              </button>
              <button onClick={() => { setShowCreate(false); setError(''); }} className="px-4 py-2 rounded border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Users list */}
      <div>
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex-1">User</span>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-24">Role</span>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-20">Status</span>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-24">Joined</span>
        </div>
        {profiles.map((profile) => {
          const userRole = getRoleForUser(profile.id);
          return (
            <div key={profile.id} className="flex items-center gap-3 px-4 py-3 border-b border-border/50 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {getInitials(profile.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{profile.name || 'Unnamed'}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                </div>
              </div>
              <div className="w-24">
                <select
                  value={userRole}
                  onChange={(e) => handleRoleChange(profile.id, e.target.value as 'admin' | 'member')}
                  className={cn(
                    'text-[11px] font-medium px-2 py-1 rounded border-0 cursor-pointer',
                    userRole === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="w-20">
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded', profile.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>
                  {profile.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="w-24">
                <span className="text-[11px] text-muted-foreground">{timeAgo(profile.created_at)}</span>
              </div>
            </div>
          );
        })}
        {profiles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
