import { useUIStore } from '@/lib/store';
import { useApps, useCreateItem, useProfiles } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { MILESTONE_OPTIONS, OWNER_OPTIONS, SECURITY_SEVERITY_OPTIONS } from '@/lib/helpers';
import type { Database } from '@/integrations/supabase/types';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { UserPicker } from '@/components/UserPicker';

type ItemType = Database['public']['Enums']['item_type'];
type ItemPriority = Database['public']['Enums']['item_priority'];
type DeployEnvironment = Database['public']['Enums']['deploy_environment'];

export function QuickAddModal() {
  const { quickAddOpen, setQuickAddOpen, activeProjectId } = useUIStore();
  const { data: apps = [] } = useApps();
  const { data: profiles = [] } = useProfiles();
  const createItem = useCreateItem();
  const { user } = useAuth();

  const defaultAppId = activeProjectId || apps[0]?.id || '';
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ItemType>('Feature');
  const [priority, setPriority] = useState<ItemPriority>('Medium');
  const [appId, setAppId] = useState(defaultAppId);
  const [assignee, setAssignee] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('');
  const [environment, setEnvironment] = useState<DeployEnvironment>('Dev');
  const [owner, setOwner] = useState('');
  const [milestone, setMilestone] = useState('');
  const [securitySeverity, setSecuritySeverity] = useState('');

  useEffect(() => { if (defaultAppId && !appId) setAppId(defaultAppId); }, [defaultAppId]);

  const handleSubmit = () => {
    if (!title.trim() || !appId || !user) return;
    createItem.mutate({
      app_id: appId,
      title: title.trim(),
      type,
      priority,
      assignee: assignee || 'Unassigned',
      description: description.trim(),
      created_by: user.id,
      owner: owner || null,
      roadmap_milestone: milestone || null,
      ...(type === 'Security' ? { security_severity: securitySeverity || null } : {}),
      ...(type === 'Deployment' ? { version: version || undefined, environment } : {}),
    });
    setTitle(''); setDescription(''); setAssignee(''); setVersion(''); setOwner(''); setMilestone(''); setSecuritySeverity('');
    setQuickAddOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const activeProfiles = profiles.filter((p) => p.is_active);
  const selectCls = 'w-full text-xs bg-muted/30 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-primary';

  if (!quickAddOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={() => setQuickAddOpen(false)}
      />
      <div
        className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[480px] bg-background rounded-lg card-shadow border border-border z-50 p-5 max-h-[70vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">New Item</h3>
          <button onClick={() => setQuickAddOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
        </div>
        <div className="space-y-3">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Item title"
            className="w-full text-sm bg-transparent border-b border-border px-0 py-2 focus:outline-none focus:border-primary placeholder:text-muted-foreground"
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Product</label>
              <select value={appId} onChange={(e) => setAppId(e.target.value)} className={selectCls}>
                {apps.filter((a) => a.status !== 'Archived').map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as ItemType)} className={selectCls}>
                {(['Feature', 'Bug', 'Security', 'Decision', 'Deployment'] as const).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as ItemPriority)} className={selectCls}>
                {(['Low', 'Medium', 'High', 'Critical'] as const).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Owner</label>
              <select value={owner} onChange={(e) => setOwner(e.target.value)} className={selectCls}>
                <option value="">Unassigned</option>
                {OWNER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Milestone</label>
              <select value={milestone} onChange={(e) => setMilestone(e.target.value)} className={selectCls}>
                <option value="">None</option>
                {MILESTONE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <UserPicker value={assignee} onChange={setAssignee} profiles={activeProfiles} />
          {type === 'Security' && (
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Security Severity</label>
              <select value={securitySeverity} onChange={(e) => setSecuritySeverity(e.target.value)} className={selectCls}>
                <option value="">Select severity</option>
                {SECURITY_SEVERITY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          {type === 'Deployment' && (
            <div className="grid grid-cols-2 gap-2">
              <input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="Version (e.g. v2.0.0)" className="w-full text-xs bg-muted/30 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" />
              <select value={environment} onChange={(e) => setEnvironment(e.target.value as DeployEnvironment)} className={selectCls}>
                {(['Dev', 'Staging', 'Production'] as const).map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          )}
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={2} className="w-full text-xs bg-muted/30 rounded px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-none" />
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-muted-foreground">{navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Enter to create</span>
            <button onClick={handleSubmit} disabled={createItem.isPending} className="px-4 py-2 rounded bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {createItem.isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
