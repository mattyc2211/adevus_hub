import React from 'react';
import { useUIStore } from '@/lib/store';
import { useItems, useApps, useUpdateItem } from '@/hooks/useData';
import { getTypeColor, getMilestoneLabel, getMilestoneColor, MILESTONE_OPTIONS, OWNER_OPTIONS, getStatusColor } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Target, CheckCircle2 } from 'lucide-react';

export function RoadmapView() {
  const { setSelectedItem } = useUIStore();
  const { data: allItems = [] } = useItems();
  const { data: apps = [] } = useApps();
  const updateItem = useUpdateItem();

  const [filterOwner, setFilterOwner] = React.useState<string>('');
  const [filterApp, setFilterApp] = React.useState<string>('');

  let items = allItems.filter((i) => i.roadmap_milestone);
  if (filterOwner) items = items.filter((i) => i.owner === filterOwner);
  if (filterApp) items = items.filter((i) => i.app_id === filterApp);

  const handleDrop = (itemId: string, milestone: string) => {
    updateItem.mutate({ id: itemId, roadmap_milestone: milestone });
  };

  const getAppName = (appId: string) => apps.find((a) => a.id === appId)?.name || 'Unknown';
  const getAppColor = (appId: string) => apps.find((a) => a.id === appId)?.color_tag || '#888';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Roadmap</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track progress across Adevus milestones</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterApp} onChange={(e) => setFilterApp(e.target.value)} className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-border bg-transparent text-muted-foreground focus:outline-none focus:border-primary">
            <option value="">All products</option>
            {apps.filter((a) => a.status !== 'Archived').map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)} className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-border bg-transparent text-muted-foreground focus:outline-none focus:border-primary">
            <option value="">All owners</option>
            {OWNER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {MILESTONE_OPTIONS.map((milestone) => {
          const milestoneItems = items.filter((i) => i.roadmap_milestone === milestone);
          const doneCount = milestoneItems.filter((i) => ['Done', 'Deployed'].includes(i.status)).length;
          const total = milestoneItems.length;
          const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
          return (
            <div key={milestone} className="bg-card rounded-lg p-4 card-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{getMilestoneLabel(milestone)}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{doneCount}/{total}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Milestone columns */}
      <div className="grid grid-cols-4 gap-4">
        {MILESTONE_OPTIONS.map((milestone) => {
          const milestoneItems = items.filter((i) => i.roadmap_milestone === milestone);
          // Group by product
          const appIds = [...new Set(milestoneItems.map((i) => i.app_id))];
          return (
            <div key={milestone} className="min-w-0">
              <div className={cn('flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg', getMilestoneColor(milestone))}>
                <span className="text-xs font-semibold">{getMilestoneLabel(milestone)}</span>
                <span className="text-[11px] ml-auto opacity-70">{milestoneItems.length}</span>
              </div>
              <div
                className="space-y-1 min-h-[300px] p-1 rounded-lg"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const itemId = e.dataTransfer.getData('itemId');
                  if (itemId) handleDrop(itemId, milestone);
                }}
              >
                {appIds.map((appId) => {
                  const appItems = milestoneItems.filter((i) => i.app_id === appId);
                  return (
                    <div key={appId} className="mb-3">
                      <div className="flex items-center gap-1.5 px-2 py-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getAppColor(appId) }} />
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">{getAppName(appId)}</span>
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
                            className={cn('bg-card rounded-lg p-3 card-shadow cursor-pointer hover:card-shadow-hover transition-shadow mb-1.5', isDone && 'opacity-60')}
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', typeColor.bg, typeColor.text)}>{item.type}</span>
                              {isDone && <CheckCircle2 className="w-3 h-3 text-success ml-auto" />}
                              {!isDone && <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded ml-auto', getStatusColor(item.status))}>{item.status}</span>}
                            </div>
                            <p className={cn('text-sm font-medium text-foreground leading-snug', isDone && 'line-through')}>{item.title}</p>
                            {item.owner && <p className="text-[10px] text-muted-foreground mt-1">{item.owner}</p>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                {milestoneItems.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground text-xs italic">No items for this milestone</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unassigned items */}
      {(() => {
        const unassigned = allItems.filter((i) => !i.roadmap_milestone && !['Done', 'Deployed'].includes(i.status));
        if (unassigned.length === 0) return null;
        return (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">Items without a milestone ({unassigned.length})</h2>
            <div className="grid grid-cols-4 gap-2">
              {unassigned.slice(0, 12).map((item) => {
                const typeColor = getTypeColor(item.type);
                return (
                  <div key={item.id} draggable onDragStart={(e) => e.dataTransfer.setData('itemId', item.id)} onClick={() => setSelectedItem(item.id)} className="bg-card rounded-lg p-2.5 card-shadow cursor-pointer hover:card-shadow-hover transition-shadow">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getAppColor(item.app_id) }} />
                      <span className={cn('text-[9px] font-medium px-1 py-0.5 rounded', typeColor.bg, typeColor.text)}>{item.type}</span>
                    </div>
                    <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

