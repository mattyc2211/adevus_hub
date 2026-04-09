import { useUIStore } from '@/lib/store';
import { useItems, useApps, useComments, useActivity, useUpdateItem, useDeleteItem, useCreateComment, useCreateActivity, useProfiles } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { getTypeColor, getStatusColor, getPriorityColor, getInitials, timeAgo, getEnvColor, STATUS_ORDER, getUserColor, MILESTONE_OPTIONS, OWNER_OPTIONS, SECURITY_SEVERITY_OPTIONS, getMilestoneColor, getSecuritySeverityColor } from '@/lib/helpers';
import type { Database } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';
import { X, Send, Trash2, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
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
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [activityOpen, setActivityOpen] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  const item = items.find((i) => i.id === selectedItemId);

  // Handle click outside
  useEffect(() => {
    if (!selectedItemId) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setSelectedItem(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [selectedItemId, setSelectedItem]);

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
      onSuccess: () => { setSelectedItem(null); toast.success('Item deleted'); },
      onError: () => toast.error('Failed to delete item'),
    });
  };

  const handleTitleUpdate = (newTitle: string) => {
    if (newTitle.trim() && newTitle !== item.title) {
      updateItem.mutate({ id: item.id, title: newTitle.trim() });
    }
  };

  const handleDescriptionUpdate = (newDesc: string) => {
    if (newDesc !== (item.description || '')) {
      updateItem.mutate({ id: item.id, description: newDesc });
    }
  };

  const allEvents = [
    ...itemComments.map((c) => ({ type: 'comment' as const, data: c, date: c.created_at })),
    ...itemActivity.map((a) => ({ type: 'activity' as const, data: a, date: a.created_at })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <>
      {selectedItemId && <div className="fixed inset-0 z-40" />}
      <div
        ref={panelRef}
        className={cn(
          'fixed right-0 top-0 bottom-0 w-[480px] bg-background border-l border-border z-50 flex flex-col panel-shadow transition-transform duration-150 ease-out',
          selectedItemId ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: app?.color_tag }} />
            <span className="text-[11px] text-muted-foreground">{app?.name}</span>
            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded ml-1', typeColor.bg, typeColor.text)}>{item.type}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {role === 'admin' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="text-muted-foreground hover:text-destructive transition-colors p-1"><Trash2 className="w-3.5 h-3.5" /></button>
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
            <button onClick={() => setSelectedItem(null)} className="text-muted-foreground hover:text-foreground transition-colors p-1"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Title - inline editable */}
          <input
            defaultValue={item.title}
            key={item.id + '-title'}
            onBlur={(e) => handleTitleUpdate(e.target.value)}
            className="text-base font-semibold text-foreground w-full bg-transparent border-0 outline-none focus:ring-0 p-0 mb-1"
          />

          {/* Description - inline editable */}
          <textarea
            defaultValue={item.description || ''}
            key={item.id + '-desc'}
            onBlur={(e) => handleDescriptionUpdate(e.target.value)}
            placeholder="Add a description..."
            rows={3}
            className="text-sm text-foreground/80 w-full bg-transparent border-0 outline-none focus:ring-0 p-0 mb-4 resize-none placeholder:text-muted-foreground leading-relaxed"
          />

          {/* Properties section */}
          <Section title="Properties" open={propertiesOpen} onToggle={() => setPropertiesOpen(!propertiesOpen)}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Status">
                <select value={item.status} onChange={(e) => handleStatusChange(e.target.value as ItemStatus)} className={cn('text-[11px] font-medium px-2 py-1 rounded cursor-pointer bg-transparent', getStatusColor(item.status))}>
                  {STATUS_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Priority">
                <select value={item.priority} onChange={(e) => updateItem.mutate({ id: item.id, priority: e.target.value as ItemPriority })} className={cn('text-[11px] font-medium px-2 py-1 rounded cursor-pointer bg-transparent', getPriorityColor(item.priority))}>
                  {(['Low', 'Medium', 'High', 'Critical'] as const).map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Assignee">
                <UserPicker value={item.assignee} onChange={(name) => updateItem.mutate({ id: item.id, assignee: name || 'Unassigned' })} profiles={profiles.filter((p) => p.is_active)} showLabel={false} />
              </Field>
              <Field label="Owner">
                <select value={item.owner || ''} onChange={(e) => updateItem.mutate({ id: item.id, owner: e.target.value || null })} className="text-[11px] font-medium px-2 py-1 rounded cursor-pointer bg-muted/30">
                  <option value="">Unassigned</option>
                  {OWNER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Milestone">
                <select value={item.roadmap_milestone || ''} onChange={(e) => updateItem.mutate({ id: item.id, roadmap_milestone: e.target.value || null })} className={cn('text-[11px] font-medium px-2 py-1 rounded cursor-pointer', item.roadmap_milestone ? getMilestoneColor(item.roadmap_milestone) : 'bg-muted/30')}>
                  <option value="">None</option>
                  {MILESTONE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Blocker">
                <button onClick={() => updateItem.mutate({ id: item.id, is_blocker: !item.is_blocker })} className={cn('text-[11px] font-medium px-2 py-1 rounded', item.is_blocker ? 'bg-coral/8 text-coral' : 'bg-muted/30 text-muted-foreground')}>
                  {item.is_blocker ? 'Yes' : 'No'}
                </button>
              </Field>
              <Field label="Created"><span className="text-[11px] text-muted-foreground">{timeAgo(item.created_at)}</span></Field>
              {item.type === 'Security' && (
                <Field label="Severity">
                  <select value={item.security_severity || ''} onChange={(e) => updateItem.mutate({ id: item.id, security_severity: e.target.value || null })} className={cn('text-[11px] font-medium px-2 py-1 rounded cursor-pointer', item.security_severity ? getSecuritySeverityColor(item.security_severity) : 'bg-muted/30')}>
                    <option value="">None</option>
                    {SECURITY_SEVERITY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              )}
              {item.type === 'Deployment' && (
                <>
                  <Field label="Version"><span className="text-[11px] text-foreground font-mono">{item.version || '--'}</span></Field>
                  <Field label="Environment">
                    {item.environment ? <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', getEnvColor(item.environment))}>{item.environment}</span> : <span className="text-[11px] text-muted-foreground">--</span>}
                  </Field>
                </>
              )}
            </div>
            {item.dependency && (
              <div className="mt-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Dependency</p>
                <span className="text-[11px] text-foreground">{item.dependency}</span>
              </div>
            )}
          </Section>

          {/* Activity section */}
          <Section title="Activity" open={activityOpen} onToggle={() => setActivityOpen(!activityOpen)}>
            <div className="space-y-2.5">
              {allEvents.map((event, i) => (
                <div key={i} className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[8px] font-semibold text-muted-foreground flex-shrink-0 mt-0.5">
                    {event.type === 'comment' ? getInitials(getProfileName((event.data as any).author)) : '\u2192'}
                  </div>
                  <div className="flex-1 min-w-0">
                    {event.type === 'comment' ? (
                      <>
                        <p className="text-[11px]"><span className="font-medium text-foreground">{getProfileName((event.data as any).author)}</span><span className="text-muted-foreground ml-1.5">{timeAgo(event.date)}</span></p>
                        <p className="text-[12px] text-foreground mt-0.5">{(event.data as any).content}</p>
                      </>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">
                        Status: <span className="font-medium text-foreground">{(event.data as any).old_value}</span> {'\u2192'} <span className="font-medium text-foreground">{(event.data as any).new_value}</span>
                        <span className="ml-1.5">{timeAgo(event.date)}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {allEvents.length === 0 && <p className="text-[11px] text-muted-foreground">No activity yet.</p>}
            </div>
          </Section>
        </div>

        {/* Comment input */}
        <div className="px-5 py-3 border-t border-border">
          <div className="flex items-center gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder="Add a comment..."
              className="flex-1 text-xs bg-muted/30 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
            <button onClick={handleAddComment} className="w-7 h-7 rounded bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <button onClick={onToggle} className="flex items-center gap-1.5 mb-2 group">
        <ChevronDown className={cn('w-3 h-3 text-muted-foreground transition-transform', !open && '-rotate-90')} />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">{title}</span>
      </button>
      {open && children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-muted-foreground mb-0.5">{label}</p>
      {children}
    </div>
  );
}
