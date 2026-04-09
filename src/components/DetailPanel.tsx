import { useUIStore } from '@/lib/store';
import { useItems, useApps, useComments, useActivity, useUpdateItem, useDeleteItem, useCreateComment, useCreateActivity, useProfiles } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { getTypeColor, getStatusColor, getPriorityColor, getInitials, timeAgo, getEnvColor, STATUS_ORDER, getUserColor, MILESTONE_OPTIONS, OWNER_OPTIONS, SECURITY_SEVERITY_OPTIONS, getMilestoneColor, getSecuritySeverityColor } from '@/lib/helpers';
import type { Database } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';
import { X, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPicker } from '@/components/UserPicker';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

type ItemStatus = Database['public']['Enums']['item_status'];
type ItemPriority = Database['public']['Enums']['item_priority'];

export function DetailPanel() {
  const { selectedItemId, setSelectedItem } = useUIStore();
  const { data: items = [] } = useItems();
  const { data: apps = [] } = useApps();
  const { data: itemComments = [] } = useComments(selectedItemId);
  const { data: itemActivity = [] } = useActivity(selectedItemId);
  const { data: profiles = [] } = useProfiles();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const createComment = useCreateComment();
  const createActivity = useCreateActivity();
  const { user, role } = useAuth();
  const [commentText, setCommentText] = useState('');

  const item = items.find((i) => i.id === selectedItemId);
  if (!item) return null;

  const app = apps.find((a) => a.id === item.app_id);
  const typeColor = getTypeColor(item.type);

  const getProfileName = (userId: string) => profiles.find((p) => p.id === userId)?.name || 'Unknown';

  const handleStatusChange = (newStatus: ItemStatus) => {
    if (user) {
      createActivity.mutate({ item_id: item.id, user_id: user.id, action: 'status_change', old_value: item.status, new_value: newStatus });
    }
    updateItem.mutate({ id: item.id, status: newStatus });
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !user) return;
    createComment.mutate({ item_id: item.id, author: user.id, content: commentText.trim() });
    setCommentText('');
  };

  const handleDelete = () => {
    deleteItem.mutate(item.id, {
      onSuccess: () => {
        setSelectedItem(null);
        toast.success('Item deleted');
      },
      onError: () => toast.error('Failed to delete item'),
    });
  };

  const allEvents = [
    ...itemComments.map((c) => ({ type: 'comment' as const, data: c, date: c.created_at })),
    ...itemActivity.map((a) => ({ type: 'activity' as const, data: a, date: a.created_at })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <AnimatePresence>
      {selectedItemId && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} className="fixed inset-0 bg-foreground/5 z-40" onClick={() => setSelectedItem(null)} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 400 }} className="fixed right-0 top-0 bottom-0 w-[520px] bg-background border-l border-border z-50 flex flex-col panel-shadow">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: app?.color_tag }} />
                <span className="text-xs text-muted-foreground">{app?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {role === 'admin' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete item</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete "{item.title}". This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <button onClick={() => setSelectedItem(null)} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded', typeColor.bg, typeColor.text)}>{item.type}</span>
              <h2 className="text-lg font-bold text-foreground mt-3 mb-4">{item.title}</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Field label="Status">
                  <select value={item.status} onChange={(e) => handleStatusChange(e.target.value as ItemStatus)} className={cn('text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer', getStatusColor(item.status))}>
                    {STATUS_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Priority">
                  <select value={item.priority} onChange={(e) => updateItem.mutate({ id: item.id, priority: e.target.value as ItemPriority })} className={cn('text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer', getPriorityColor(item.priority))}>
                    {(['Low', 'Medium', 'High', 'Critical'] as const).map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Assignee">
                  <UserPicker
                    value={item.assignee}
                    onChange={(name) => updateItem.mutate({ id: item.id, assignee: name || 'Unassigned' })}
                    profiles={profiles.filter((p) => p.is_active)}
                    showLabel={false}
                  />
                </Field>
                <Field label="Owner">
                  <select value={item.owner || ''} onChange={(e) => updateItem.mutate({ id: item.id, owner: e.target.value || null })} className="text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer bg-muted/30">
                    <option value="">Unassigned</option>
                    {OWNER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="Milestone">
                  <select value={item.roadmap_milestone || ''} onChange={(e) => updateItem.mutate({ id: item.id, roadmap_milestone: e.target.value || null })} className={cn('text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer', item.roadmap_milestone ? getMilestoneColor(item.roadmap_milestone) : 'bg-muted/30')}>
                    <option value="">None</option>
                    {MILESTONE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </Field>
                <Field label="Created"><span className="text-sm text-foreground">{timeAgo(item.created_at)}</span></Field>
                <Field label="Blocker">
                  <button onClick={() => updateItem.mutate({ id: item.id, is_blocker: !item.is_blocker })} className={cn('text-xs font-medium px-2 py-1 rounded', item.is_blocker ? 'bg-coral/10 text-coral' : 'bg-muted/30 text-muted-foreground')}>
                    {item.is_blocker ? 'Yes' : 'No'}
                  </button>
                </Field>
                {item.type === 'Security' && (
                  <Field label="Severity">
                    <select value={item.security_severity || ''} onChange={(e) => updateItem.mutate({ id: item.id, security_severity: e.target.value || null })} className={cn('text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer', item.security_severity ? getSecuritySeverityColor(item.security_severity) : 'bg-muted/30')}>
                      <option value="">None</option>
                      {SECURITY_SEVERITY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                )}
                {item.type === 'Deployment' && (
                  <>
                    <Field label="Version"><span className="text-sm text-foreground font-mono">{item.version || '—'}</span></Field>
                    <Field label="Environment">
                      {item.environment ? <span className={cn('text-xs font-medium px-2 py-0.5 rounded', getEnvColor(item.environment))}>{item.environment}</span> : <span className="text-sm text-muted-foreground">—</span>}
                    </Field>
                  </>
                )}
              </div>
              {item.dependency && (
                <div className="mb-4">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Dependency</p>
                  <span className="text-sm text-foreground">{item.dependency}</span>
                </div>
              )}
              <div className="mb-6">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</p>
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 rounded-lg p-4">{item.description || 'No description yet.'}</div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Activity</p>
                <div className="space-y-3">
                  {allEvents.map((event, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[9px] font-semibold text-muted-foreground flex-shrink-0 mt-0.5">
                        {event.type === 'comment' ? getInitials(getProfileName((event.data as any).author)) : '→'}
                      </div>
                      <div className="flex-1">
                        {event.type === 'comment' ? (
                          <>
                            <p className="text-xs"><span className="font-semibold text-foreground">{getProfileName((event.data as any).author)}</span><span className="text-muted-foreground ml-2">{timeAgo(event.date)}</span></p>
                            <p className="text-sm text-foreground mt-0.5">{(event.data as any).content}</p>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Status changed from <span className="font-medium text-foreground">{(event.data as any).old_value}</span> to <span className="font-medium text-foreground">{(event.data as any).new_value}</span>
                            <span className="ml-2">{timeAgo(event.date)}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {allEvents.length === 0 && <p className="text-xs text-muted-foreground">No activity yet.</p>}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border">
              <div className="flex items-center gap-2">
                <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} placeholder="Add a comment..." className="flex-1 text-sm bg-muted/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" />
                <button onClick={handleAddComment} className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"><Send className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>{children}</div>;
}
