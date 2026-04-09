import { useUIStore } from '@/lib/store';
import { useItems, useAllComments, useUpdateItem } from '@/hooks/useData';
import { getTypeColor, getInitials, getPriorityColor, STATUS_ORDER, getUserColor, getStatusBorderColor, getMilestoneColor, getSecuritySeverityColor } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';
import { MessageSquare, AlertTriangle } from 'lucide-react';
import { FilterBar } from './FilterBar';

type ItemStatus = Database['public']['Enums']['item_status'];

const emptyMessages: Record<ItemStatus, string> = {
  'Idea': 'No ideas yet. Hit N to add one.',
  'In Progress': 'Nothing in flight.',
  'In Review': 'Nothing to review.',
  'Done': 'No wins yet. You\'ve got this.',
  'Deployed': 'Nothing shipped yet.',
  'Blocked': 'All clear here.',
};


export function BoardView() {
  const { selectedAppId, filterType, filterPriority, filterAssignee, filterMilestone, filterOwner, setSelectedItem } = useUIStore();
  const appId = selectedAppId === 'all' ? undefined : selectedAppId;
  const { data: allItems = [] } = useItems(appId);
  const { data: comments = [] } = useAllComments();
  const updateItem = useUpdateItem();

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
      <FilterBar items={allItems} />
      <div className="grid grid-cols-6 gap-3 px-6 pb-6">
        {STATUS_ORDER.map((status) => {
          const columnItems = items.filter((i) => i.status === status);
          return (
            <div key={status} className="min-w-0">
              <div className="flex items-center gap-2 mb-3 px-1">
                <StatusDot status={status} />
                <span className="text-xs font-semibold text-foreground">{status}</span>
                <span className="text-[11px] text-muted-foreground ml-auto">{columnItems.length}</span>
              </div>
              <div
                className="space-y-2 min-h-[200px] p-1 rounded-lg"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const itemId = e.dataTransfer.getData('itemId');
                  if (itemId) handleDrop(itemId, status);
                }}
              >
                {columnItems.map((item) => {
                  const typeColor = getTypeColor(item.type);
                  const commentCount = comments.filter((c) => c.item_id === item.id).length;
                  return (
                    <div key={item.id} draggable onDragStart={(e) => e.dataTransfer.setData('itemId', item.id)} onClick={() => setSelectedItem(item.id)} className={cn("bg-card rounded-lg p-3.5 card-shadow cursor-pointer hover:card-shadow-hover transition-shadow hover:scale-[1.02] transition-transform duration-100 border-l-[3px]", getStatusBorderColor(status))}>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', typeColor.bg, typeColor.text)}>{item.type}</span>
                        {item.is_blocker && <AlertTriangle className="w-3 h-3 text-coral" />}
                        <span className={cn('text-[10px] ml-auto', getPriorityColor(item.priority))}>{item.priority}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-2 leading-snug">{item.title}</p>
                      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                        {item.roadmap_milestone && (
                          <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded', getMilestoneColor(item.roadmap_milestone))}>{item.roadmap_milestone}</span>
                        )}
                        {item.type === 'Security' && item.security_severity && (
                          <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded', getSecuritySeverityColor(item.security_severity))}>{item.security_severity}</span>
                        )}
                        {item.owner && (
                          <span className="text-[9px] text-muted-foreground">{item.owner}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white" style={{ backgroundColor: getUserColor(item.assignee) }}>{getInitials(item.assignee)}</div>
                        {commentCount > 0 && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MessageSquare className="w-3 h-3" />
                            <span className="text-[11px]">{commentCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {columnItems.length === 0 && <div className="text-center py-8 text-muted-foreground text-xs italic">{emptyMessages[status]}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: ItemStatus }) {
  const colors: Record<string, string> = { 'Idea': 'bg-muted-foreground', 'In Progress': 'bg-warning', 'In Review': 'bg-primary', 'Done': 'bg-success', 'Deployed': 'bg-success', 'Blocked': 'bg-coral' };
  return <div className={cn('w-2 h-2 rounded-full', colors[status])} />;
}
