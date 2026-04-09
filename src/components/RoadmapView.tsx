import React from 'react';
import { useUIStore } from '@/lib/store';
import { useItems, useApps, useUpdateItem } from '@/hooks/useData';
import { getTypeColor, getMilestoneLabel, MILESTONE_OPTIONS, OWNER_OPTIONS, getStatusColor } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { CheckCircle2, ChevronDown } from 'lucide-react';

export function RoadmapView() {
  const { setSelectedItem } = useUIStore();
  const { data: allItems = [] } = useItems();
  const { data: apps = [] } = useApps();
  const updateItem = useUpdateItem();

  const [filterOwner, setFilterOwner] = React.useState<string>('');
  const [filterApp, setFilterApp] = React.useState<string>('');
  const [unassignedOpen, setUnassignedOpen] = React.useState(false);

  let items = allItems.filter((i) => i.roadmap_milestone);
  if (filterOwner) items = items.filter((i) => i.owner === filterOwner);
  if (filterApp) items = items.filter((i) => i.app_id === filterApp);

  const handleDrop = (itemId: string, milestone: string) => {
    updateItem.mutate({ id: itemId, roadmap_milestone: milestone });
  };

  const getAppName = (appId: string) => apps.find((a) => a.id === appId)?.name || 'Unknown';
  const getAppColor = (appId: string) => apps.find((a) => a.id === appId)?.color_tag || '#888';

  const selectCls = 'text-[11px] font-medium px-2 py-1 rounded border border-border bg-transparent text-muted-foreground focus:outline-none focus:border-primary';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-base font-semibold text-foreground">Roadmap</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Track progress across milestones</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterApp} onChange={(e) => setFilterApp(e.target.value)} className={selectCls}>
            <option value="">All products</option>
            {apps.filter((a) => a.status !== 'Archived').map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)} className={selectCls}>
            <option value="">All owners</option>
            {OWNER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {MILESTONE_OPTIONS.map((milestone) => {
          const milestoneItems = items.filter((i) => i.roadmap_milestone === milestone);
          const doneCount = milestoneItems.filter((i) => ['Done', 'Deployed'].includes(i.status)).length;
          const total = milestoneItems.length;
          const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
          return (
            <div key={milestone} className="bg-card rounded border border-border/50 p-3 card-shadow">
              <span className="text-[11px] font-medium text-foreground">{getMilestoneLabel(milestone)}</span>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-muted rounded-full h-1">
                  <div className="bg-primary rounded-full h-1 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground tabular-nums">{doneCount}/{total}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Milestone columns */}
      <div className="grid grid-cols-4 gap-3">
        {MILESTONE_OPTIONS.map((milestone) => {
          const milestoneItems = items.filter((i) => i.roadmap_milestone === milestone);
          const appIds = [...new Set(milestoneItems.map((i) => i.app_id))];
          return (
            <div key={milestone} className="min-w-0">
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-[11px] font-medium text-foreground">{getMilestoneLabel(milestone)}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{milestoneItems.length}</span>
              </div>
              <div className="h-px bg-border mb-2" style={{ opacity: 0.5 }} />
              <div
                className="space-y-1 min-h-[300px] p-0.5 rounded"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const itemId = e.dataTransfer.getData('itemId');
                  if (itemId) handleDrop(itemId, milestone);
                }}
              >
                {appIds.map((appId) => {
                  const appItems = milestoneItems.filter((i) => i.app_id === appId);
                  return (
                    <div key={appId} className="mb-2">
                      <div className="flex items-center gap-1.5 px-1.5 py-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getAppColor(appId) }} />
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{getAppName(appId)}</span>
                      </div>
                      {appItems.map((item) => {
                        const typeColor = getTypeColor(item.type);
                        const isDone = ['Done', 'Deployed'].includes(item.status);
                        return (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('itemId', item.id)}
                            onClick={() => setSelectedItem(item.id)}
                            className={cn('bg-card rounded p-2.5 card-shadow cursor-pointer hover:bg-muted/30 transition-colors mb-1 border border-border/50', isDone && 'opacity-50')}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', typeColor.dot)} />
                              <span className="text-[10px] text-muted-foreground">{item.type}</span>
                              {isDone && <CheckCircle2 className="w-3 h-3 text-success ml-auto" />}
                              {!isDone && <span className={cn('text-[9px] font-medium px-1 py-0.5 rounded ml-auto', getStatusColor(item.status))}>{item.status}</span>}
                            </div>
                            <p className={cn('text-[13px] font-medium text-foreground leading-snug', isDone && 'line-through')}>{item.title}</p>
                            {item.owner && <p className="text-[10px] text-muted-foreground mt-1">{item.owner}</p>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                {milestoneItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-[11px]">No items</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unassigned items - collapsible */}
      {(() => {
        const unassigned = allItems.filter((i) => !i.roadmap_milestone && !['Done', 'Deployed'].includes(i.status));
        if (unassigned.length === 0) return null;
        return (
          <div className="mt-6">
            <button onClick={() => setUnassignedOpen(!unassignedOpen)} className="flex items-center gap-1.5 mb-2 group">
              <ChevronDown className={cn('w-3 h-3 text-muted-foreground transition-transform', !unassignedOpen && '-rotate-90')} />
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Unassigned items ({unassigned.length})
              </span>
            </button>
            {unassignedOpen && (
              <div className="grid grid-cols-4 gap-1.5">
                {unassigned.slice(0, 12).map((item) => {
                  const typeColor = getTypeColor(item.type);
                  return (
                    <div key={item.id} draggable onDragStart={(e) => e.dataTransfer.setData('itemId', item.id)} onClick={() => setSelectedItem(item.id)} className="bg-card rounded p-2 card-shadow cursor-pointer hover:bg-muted/30 transition-colors border border-border/50">
                      <div className="flex items-center gap-1 mb-0.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getAppColor(item.app_id) }} />
                        <div className={cn('w-1.5 h-1.5 rounded-full', typeColor.dot)} />
                        <span className="text-[9px] text-muted-foreground">{item.type}</span>
                      </div>
                      <p className="text-[11px] font-medium text-foreground truncate">{item.title}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
