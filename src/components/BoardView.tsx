import { useUIStore } from '@/lib/store';
import { useItems, useAllComments, useUpdateItem, useApps } from '@/hooks/useData';
import { getTypeColor, getInitials, getPriorityColor, STATUS_ORDER, getUserColor, getSecuritySeverityColor } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';
import { MessageSquare, AlertTriangle, SignalLow, SignalMedium, SignalHigh, Flame } from 'lucide-react';
import { FilterBar } from './FilterBar';

type ItemStatus = Database['public']['Enums']['item_status'];
type ItemPriority = Database['public']['Enums']['item_priority'];

const statusColors: Record<string, string> = {
  'Idea': 'bg-muted-foreground',
  'In Progress': 'bg-warning',
  'In Review': 'bg-primary',
  'Done': 'bg-success',
  'Deployed': 'bg-success',
  'Blocked': 'bg-coral',
};

function PriorityIcon({ priority }: { priority: ItemPriority }) {
  const cls = cn('w-3.5 h-3.5', getPriorityColor(priority));
  switch (priority) {
    case 'Low': return <SignalLow className={cls} />;
    case 'Medium': return <SignalMedium className={cls} />;
    case 'High': return <SignalHigh className={cls} />;
    case 'Critical': return <Flame className={cn('w-3.5 h-3.5 text-coral')} />;
  }
}

export function BoardView() {
  const { activeProjectId, filterType, filterPriority, filterAssignee, filterMilestone, filterOwner, setSelectedItem } = useUIStore();
  const appId = activeProjectId || undefined;
  const { data: allItems = [] } = useItems(appId);
  const { data: apps = [] } = useApps();
  const { data: comments = [] } = useAllComments();
  const updateItem = useUpdateItem();
  const currentApp = activeProjectId ? apps.find((a) => a.id === activeProjectId) : null;

  let items = allItems;
  if (filterType) items = items.filter((i) => i.type === filterType);
  if (filterPriority) items = items.filter((i) => i.priority === filterPriority);
  if (filterAssignee) items = items.filter((i) => i.assignee === filterAssignee);
  if (filterMilestone) items = items.filter((i) => i.roadmap_milestone === filterMilestone);
  if (filterOwner) items = items.filter((i) => i.owner === filterOwner);

  const handleDrop = (itemId: string, status: ItemStatus) => {
    updateItem.mutate({ id: itemId, status });
  };

  return (
    <div>
      <div className="px-6 py-4">
        <h1 className="text-base font-semibold text-foreground">{currentApp ? currentApp.name : 'All Projects'}</h1>
        {currentApp?.description && <p className="text-xs text-muted-foreground mt-0.5">{currentApp.description}</p>}
      </div>
      <FilterBar items={allItems} />
      <div className="grid grid-cols-6 gap-2 px-6 pb-6">
        {STATUS_ORDER.map((status) => {
          const columnItems = items.filter((i) => i.status === status);
          return (
            <div key={status} className="min-w-0">
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className={cn('w-1.5 h-1.5 rounded-full', statusColors[status])} />
                <span className="text-[11px] font-medium text-foreground">{status}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{columnItems.length}</span>
              </div>
              <div className="h-px bg-border mb-2" style={{ opacity: 0.5 }} />
              <div
                className="space-y-1.5 min-h-[200px] p-0.5 rounded"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const itemId = e.dataTransfer.getData('itemId');
                  if (itemId) handleDrop(itemId, status);
                }}
              >
                {columnItems.map((item) => {
                  const typeColor = getTypeColor(item.type);
                  const commentCount = comments.filter((c) => c.item_id === item.id).length;
                  const app = !activeProjectId ? apps.find((a) => a.id === item.app_id) : null;
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('itemId', item.id)}
                      onClick={() => setSelectedItem(item.id)}
                      className="bg-card rounded p-2.5 card-shadow cursor-pointer hover:bg-muted/30 transition-colors border border-border/50"
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', typeColor.dot)} />
                        <span className="text-[10px] text-muted-foreground">{item.type}</span>
                        {item.is_blocker && <AlertTriangle className="w-3 h-3 text-coral ml-auto" />}
                        <span className="ml-auto"><PriorityIcon priority={item.priority} /></span>
                      </div>
                      <p className="text-[13px] font-medium text-foreground mb-2 leading-snug">{item.title}</p>
                      <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        {app && (
                          <span className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: app.color_tag }} />
                            <span className="text-[9px] text-muted-foreground">{app.name}</span>
                          </span>
                        )}
                        {item.roadmap_milestone && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{item.roadmap_milestone}</span>
                        )}
                        {item.type === 'Security' && item.security_severity && (
                          <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded', getSecuritySeverityColor(item.security_severity))}>{item.security_severity}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold text-white" style={{ backgroundColor: getUserColor(item.assignee) }}>
                          {getInitials(item.assignee)}
                        </div>
                        {commentCount > 0 && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MessageSquare className="w-2.5 h-2.5" />
                            <span className="text-[10px]">{commentCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {columnItems.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground text-[11px]">No items</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
