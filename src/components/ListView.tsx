import { useUIStore } from '@/lib/store';
import { useItems, useApps } from '@/hooks/useData';
import { getTypeColor, getInitials, getPriorityColor, getStatusColor, timeAgo, getUserColor, getStatusBorderColor } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { FilterBar } from './FilterBar';
import { ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
import type { Database } from '@/integrations/supabase/types';

type SortKey = 'title' | 'type' | 'status' | 'priority' | 'assignee' | 'updated_at';
type Item = Database['public']['Tables']['items']['Row'];

const priorityOrder: Record<string, number> = { Low: 0, Medium: 1, High: 2, Critical: 3 };

export function ListView() {
  const { selectedAppId, filterType, filterPriority, filterAssignee, filterMilestone, filterOwner, setSelectedItem } = useUIStore();
  const appId = selectedAppId === 'all' ? undefined : selectedAppId;
  const { data: allItems = [] } = useItems(appId);
  const { data: apps = [] } = useApps();
  const [sortKey, setSortKey] = useState<SortKey>('updated_at');
  const [sortAsc, setSortAsc] = useState(false);

  let items = allItems;
  if (filterType) items = items.filter((i) => i.type === filterType);
  if (filterPriority) items = items.filter((i) => i.priority === filterPriority);
  if (filterAssignee) items = items.filter((i) => i.assignee === filterAssignee);
  if (filterMilestone) items = items.filter((i) => i.roadmap_milestone === filterMilestone);
  if (filterOwner) items = items.filter((i) => i.owner === filterOwner);

  const sorted = [...items].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'priority') cmp = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
    else if (sortKey === 'updated_at') cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
    else cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
    return sortAsc ? cmp : -cmp;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const headers: { key: SortKey; label: string; width: string }[] = [
    { key: 'title', label: 'Title', width: 'flex-1' },
    { key: 'type', label: 'Type', width: 'w-24' },
    { key: 'status', label: 'Status', width: 'w-28' },
    { key: 'priority', label: 'Priority', width: 'w-20' },
    { key: 'assignee', label: 'Assignee', width: 'w-32' },
    { key: 'updated_at', label: 'Updated', width: 'w-24' },
  ];

  return (
    <div>
      <FilterBar items={allItems} />
      <div className="px-6 pb-6">
        <div className="flex items-center gap-3 px-3 py-2 border-b border-border">
          {headers.map((h) => (
            <button key={h.key} onClick={() => toggleSort(h.key)} className={cn('flex items-center gap-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground', h.width)}>
              {h.label} <ArrowUpDown className="w-3 h-3" />
            </button>
          ))}
        </div>
        {sorted.map((item) => {
          const typeColor = getTypeColor(item.type);
          const app = apps.find((a) => a.id === item.app_id);
          return (
            <button key={item.id} onClick={() => setSelectedItem(item.id)} className={cn("w-full flex items-center gap-3 px-3 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors text-left border-l-[3px]", getStatusBorderColor(item.status))}>
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: app?.color_tag }} />
                <span className="text-sm text-foreground truncate">{item.title}</span>
              </div>
              <div className="w-24"><span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', typeColor.bg, typeColor.text)}>{item.type}</span></div>
              <div className="w-28"><span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', getStatusColor(item.status))}>{item.status}</span></div>
              <div className="w-20"><span className={cn('text-xs', getPriorityColor(item.priority))}>{item.priority}</span></div>
              <div className="w-32 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0 text-white" style={{ backgroundColor: getUserColor(item.assignee) }}>{getInitials(item.assignee)}</div>
                <span className="text-xs text-muted-foreground truncate">{item.assignee}</span>
              </div>
              <div className="w-24"><span className="text-[11px] text-muted-foreground">{timeAgo(item.updated_at)}</span></div>
            </button>
          );
        })}
        {sorted.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg font-semibold text-foreground mb-1">Nothing here yet</p>
            <p className="text-sm text-muted-foreground">Create your first item to get started ✨</p>
          </div>
        )}
      </div>
    </div>
  );
}
