import { useUIStore } from '@/lib/store';
import type { Database } from '@/integrations/supabase/types';
import { MILESTONE_OPTIONS, OWNER_OPTIONS } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

type ItemType = Database['public']['Enums']['item_type'];
type ItemPriority = Database['public']['Enums']['item_priority'];
type Item = Database['public']['Tables']['items']['Row'];

export function FilterBar({ items }: { items: Item[] }) {
  const { filterType, filterPriority, filterAssignee, filterMilestone, filterOwner, setFilter, clearFilters } = useUIStore();
  const assignees = [...new Set(items.map((i) => i.assignee).filter(Boolean))].sort();
  const types: ItemType[] = ['Feature', 'Bug', 'Security', 'Decision', 'Deployment'];
  const priorities: ItemPriority[] = ['Low', 'Medium', 'High', 'Critical'];
  const hasFilters = filterType || filterPriority || filterAssignee || filterMilestone || filterOwner;

  const chipBase = 'text-[11px] font-medium px-2 py-1 rounded border transition-colors';
  const chipActive = 'bg-primary/10 text-primary border-primary/30';
  const chipInactive = 'border-border text-muted-foreground hover:border-primary/20 hover:text-foreground';
  const selectCls = 'text-[11px] font-medium px-2 py-1 rounded border border-border bg-transparent text-muted-foreground hover:border-primary/20 focus:outline-none focus:border-primary';

  return (
    <div className="flex items-center gap-1.5 px-6 pb-3 flex-wrap">
      {types.map((t) => (
        <button key={t} onClick={() => setFilter({ type: filterType === t ? null : t })} className={cn(chipBase, filterType === t ? chipActive : chipInactive)}>{t}</button>
      ))}
      <div className="w-px h-4 bg-border mx-0.5" />
      {priorities.map((p) => (
        <button key={p} onClick={() => setFilter({ priority: filterPriority === p ? null : p })} className={cn(chipBase, filterPriority === p ? chipActive : chipInactive)}>{p}</button>
      ))}
      <div className="w-px h-4 bg-border mx-0.5" />
      <select value={filterMilestone || ''} onChange={(e) => setFilter({ milestone: e.target.value || null })} className={selectCls}>
        <option value="">Milestone</option>
        {MILESTONE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
      <select value={filterOwner || ''} onChange={(e) => setFilter({ owner: e.target.value || null })} className={selectCls}>
        <option value="">Owner</option>
        {OWNER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <select value={filterAssignee || ''} onChange={(e) => setFilter({ assignee: e.target.value || null })} className={selectCls}>
        <option value="">Assignee</option>
        {assignees.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
      {hasFilters && (
        <button onClick={clearFilters} className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 ml-1"><X className="w-3 h-3" /> Clear</button>
      )}
    </div>
  );
}
