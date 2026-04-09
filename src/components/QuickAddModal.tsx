import { useUIStore } from '@/lib/store';
import { useApps, useCreateItem, useProfiles } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { MILESTONE_OPTIONS, OWNER_OPTIONS, SECURITY_SEVERITY_OPTIONS } from '@/lib/helpers';
import type { Database } from '@/integrations/supabase/types';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPicker } from '@/components/UserPicker';

type ItemType = Database['public']['Enums']['item_type'];
type ItemPriority = Database['public']['Enums']['item_priority'];
type DeployEnvironment = Database['public']['Enums']['deploy_environment'];

export function QuickAddModal() {
  const { quickAddOpen, setQuickAddOpen, selectedAppId } = useUIStore();
  const { data: apps = [] } = useApps();
  const { data: profiles = [] } = useProfiles();
  const createItem = useCreateItem();
  const { user } = useAuth();

  const defaultAppId = selectedAppId && !['all', 'changelog', 'settings', 'roadmap', 'security'].includes(selectedAppId) ? selectedAppId : apps[0]?.id || '';
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

  const activeProfiles = profiles.filter((p) => p.is_active);

  return (
    <AnimatePresence>
      {quickAddOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 z-50" onClick={() => setQuickAddOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} transition={{ duration: 0.12 }} className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[520px] bg-background rounded-xl card-shadow border border-border z-50 p-6 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-foreground">New Item</h3>
              <button onClick={() => setQuickAddOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Item title" className="w-full text-sm bg-muted/30 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Product</label>
                  <select value={appId} onChange={(e) => setAppId(e.target.value)} className="w-full text-sm bg-muted/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary">
                    {apps.filter((a) => a.status !== 'Archived').map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value as ItemType)} className="w-full text-sm bg-muted/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary">
                    {(['Feature', 'Bug', 'Security', 'Decision', 'Deployment'] as const).map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value as ItemPriority)} className="w-full text-sm bg-muted/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary">
                    {(['Low', 'Medium', 'High', 'Critical'] as const).map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Owner</label>
                  <select value={owner} onChange={(e) => setOwner(e.target.value)} className="w-full text-sm bg-muted/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="">Unassigned</option>
                    {OWNER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Milestone</label>
                  <select value={milestone} onChange={(e) => setMilestone(e.target.value)} className="w-full text-sm bg-muted/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="">None</option>
                    {MILESTONE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <UserPicker value={assignee} onChange={setAssignee} profiles={activeProfiles} />
              {type === 'Security' && (
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Security Severity</label>
                  <select value={securitySeverity} onChange={(e) => setSecuritySeverity(e.target.value)} className="w-full text-sm bg-muted/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="">Select severity</option>
                    {SECURITY_SEVERITY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
              {type === 'Deployment' && (
                <div className="grid grid-cols-2 gap-3">
                  <input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="Version (e.g. v2.0.0)" className="w-full text-sm bg-muted/30 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" />
                  <select value={environment} onChange={(e) => setEnvironment(e.target.value as DeployEnvironment)} className="w-full text-sm bg-muted/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary">
                    {(['Dev', 'Staging', 'Production'] as const).map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              )}
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={3} className="w-full text-sm bg-muted/30 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-none" />
              <button onClick={handleSubmit} disabled={createItem.isPending} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                {createItem.isPending ? 'Creating...' : 'Create Item'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
