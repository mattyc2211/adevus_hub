import { useUIStore } from '@/lib/store';
import { useItems, useApps, useUpdateItem } from '@/hooks/useData';
import { getTypeColor, getInitials, getPriorityColor, getStatusColor, timeAgo, getUserColor } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { FilterBar } from './FilterBar';
import { ArrowUpDown, Search } from 'lucide-react';
import { useState } from 'react';
import type { Database } from '@/integrations/supabase/types';

type SortKey = 'title' | 'type' | 'status' | 'priority' | 'assignee' | 'updated_at' | 'app_id';
type Item = Database['public']['Tables']['items']['Row'];
type QuickFilter = 'all' | 'security' | 'changelog' | 'bugs' | 'blocked';

const priorityOrder: Record<string, number> = { Low: 0, Medium: 1, High: 2, Critical: 3 };

export function ListView() {
  const { activeProjectId, filterType, filterPriority, filterAssignee, filterMilestone, filterOwner, setSelectedItem, setFilter, clearFilters } = useUIStore();
  const appId = activeProjectId || undefined;
  const { data: allItems = [] } = useItems(appId);
  const { data: apps = [] } = useApps();
  const [sortKey, setSortKey] = useState<SortKey>('updated_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');

  const currentApp = activeProjectId ? apps.find((a) => a.id === activeProjectId) : null;

  const applyQuickFilter = (qf: QuickFilter) => {
    setQuickFilter(qf);
    clearFilters();
    switch (qf) {
      case 'security': setFilter({ type: 'Security' }); break;
      case 'bugs': setFilter({ type: 'Bug' }); break;
      default: break;
    }
  };

  let items = allItems;

  // Quick filter overrides
  if (quickFilter === 'changelog') {
    items = items.filter((i) => i.type === 'Decision' || i.status === 'Deployed');
  } else if (quickFilter === 'blocked') {
    items = items.filter((i) => i.status === 'Blocked');
  } else {
    // Apply standard filters
    if (filterType) items = items.filter((i) => i.type === filterType);
    if (filterPriority) items = items.filter((i) => i.priority === filterPriority);
    if (filterAssignee) items = items.filter((i) => i.assignee === filterAssignee);
    if (filterMilestone) items = items.filter((i) => i.roadmap_milestone === filterMilestone);
    if (filterOwner) items = items.filter((i) => i.owner === filterOwner);
  }

  // Search filter
  if (search.trim()) {
    const q = search.toLowerCase();
    items = items.filter((i) => i.title.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q));
  }

  const sorted = [...items].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'priority') cmp = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
    else if (sortKey === 'updated_at') cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
    else if (sortKey === 'app_id') {
      const aName = apps.find((x) => x.id === a.app_id)?.name || '';
      const bName = apps.find((x) => x.id === b.app_id)?.name || '';
      cmp = aName.localeCompare(bName);
    } else cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
    return sortAsc ? cmp : -cmp;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const headers: { key: SortKey; label: string; width: string }[] = [
    ...(activeProjectId ? [] : [{ key: 'app_id' as SortKey, label: 'Project', width: 'w-32' }]),
    { key: 'title', label: 'Title', width: 'flex-1' },
    { key: 'type', label: 'Type', width: 'w-24' },
    { key: 'status', label: 'Status', width: 'w-28' },
    { key: 'priority', label: 'Priority', width: 'w-20' },
    { key: 'assignee', label: 'Assignee', width: 'w-28' },
    { key: 'updated_at', label: 'Updated', width: 'w-24' },
  ];

  const quickFilters: { key: QuickFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'bugs', label: 'Bugs' },
    { key: 'security', label: 'Security' },
    { key: 'changelog', label: 'Changelog' },
    { key: 'blocked', label: 'Blocked' },
  ];

  return (
    <div>
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground">{currentApp ? currentApp.name : 'All Projects'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="text-xs bg-muted/40 rounded pl-7 pr-3 py-1.5 w-48 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      <div className="px-6 pb-2 flex items-center gap-1">
        {quickFilters.map((qf) => (
          <button
            key={qf.key}
            onClick={() => applyQuickFilter(qf.key)}
            className={cn(
              'text-[11px] font-medium px-2.5 py-1 rounded transition-colors',
              quickFilter === qf.key
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {qf.label}
          </button>
        ))}
      </div>

      {quickFilter === 'all' && <FilterBar items={allItems} />}

      <div className="px-6 pb-6">
        <div className="flex items-center gap-3 px-3 py-1.5 border-b border-border">
          {headers.map((h) => (
            <button key={h.key} onClick={() => toggleSort(h.key)} className={cn('flex items-center gap-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground', h.width)}>
              {h.label} <ArrowUpDown className="w-2.5 h-2.5" />
            </button>
          ))}
        </div>
        {sorted.map((item) => {
          const typeColor = getTypeColor(item.type);
          const app = apps.find((a) => a.id === item.app_id);
          return (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2 border-b border-border/40 hover:bg-muted/30 transition-colors text-left"
            >
              {!activeProjectId && (
                <div className="w-32 flex items-center gap-1.5 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: app?.color_tag }} />
                  <span className="text-[11px] text-muted-foreground truncate">{app?.name}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[13px] text-foreground truncate block">{item.title}</span>
              </div>
              <div className="w-24">
                <span className="flex items-center gap-1">
                  <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', typeColor.dot)} />
                  <span className="text-[11px] text-muted-foreground">{item.type}</span>
                </span>
              </div>
              <div className="w-28">
                <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', getStatusColor(item.status))}>{item.status}</span>
              </div>
              <div className="w-20">
                <span className={cn('text-[11px]', getPriorityColor(item.priority))}>{item.priority}</span>
              </div>
              <div className="w-28 flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-semibold flex-shrink-0 text-white" style={{ backgroundColor: getUserColor(item.assignee) }}>
                  {getInitials(item.assignee)}
                </div>
                <span className="text-[11px] text-muted-foreground truncate">{item.assignee}</span>
              </div>
              <div className="w-24">
                <span className="text-[10px] text-muted-foreground">{timeAgo(item.updated_at)}</span>
              </div>
            </button>
          );
        })}
        {sorted.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No items found</p>
          </div>
        )}
        <div className="flex items-center justify-between px-3 py-2 text-[10px] text-muted-foreground">
          <span>{sorted.length} item{sorted.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
