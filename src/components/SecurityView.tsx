import { useUIStore } from '@/lib/store';
import { useItems, useApps, useUpdateItem } from '@/hooks/useData';
import { getSecuritySeverityColor, getStatusColor, SECURITY_SEVERITY_OPTIONS, STATUS_ORDER } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { ShieldCheck, ShieldAlert, CheckCircle2, Circle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type ItemStatus = Database['public']['Enums']['item_status'];

export function SecurityView() {
  const { setSelectedItem } = useUIStore();
  const { data: allItems = [] } = useItems();
  const { data: apps = [] } = useApps();
  const updateItem = useUpdateItem();

  const securityItems = allItems.filter((i) => i.type === 'Security');
  const totalItems = securityItems.length;
  const resolvedItems = securityItems.filter((i) => ['Done', 'Deployed'].includes(i.status)).length;
  const overallPct = totalItems > 0 ? Math.round((resolvedItems / totalItems) * 100) : 0;

  const getAppName = (appId: string) => apps.find((a) => a.id === appId)?.name || 'Unknown';

  const handleToggleDone = (item: typeof securityItems[0]) => {
    const newStatus: ItemStatus = ['Done', 'Deployed'].includes(item.status) ? 'Idea' : 'Done';
    updateItem.mutate({ id: item.id, status: newStatus });
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Security Remediation</h1>
          <p className="text-sm text-muted-foreground">Track security items from the Vox Go-Live Audit</p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="bg-card rounded-lg p-5 card-shadow mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-foreground">Overall Progress</span>
          <span className="text-sm font-bold text-primary">{overallPct}%</span>
        </div>
        <div className="bg-muted rounded-full h-3 mb-2">
          <div className={cn('rounded-full h-3 transition-all', overallPct === 100 ? 'bg-success' : 'bg-primary')} style={{ width: `${overallPct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">{resolvedItems} of {totalItems} items resolved</p>
      </div>

      {/* Per-severity sections */}
      <div className="space-y-6">
        {SECURITY_SEVERITY_OPTIONS.map((severity) => {
          const severityItems = securityItems.filter((i) => i.security_severity === severity);
          if (severityItems.length === 0) return null;
          const doneCount = severityItems.filter((i) => ['Done', 'Deployed'].includes(i.status)).length;
          const total = severityItems.length;
          const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

          return (
            <div key={severity}>
              <div className="flex items-center gap-3 mb-3">
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded', getSecuritySeverityColor(severity))}>{severity}</span>
                <div className="flex-1 bg-muted rounded-full h-1.5">
                  <div className={cn('rounded-full h-1.5 transition-all', pct === 100 ? 'bg-success' : severity === 'Critical' ? 'bg-coral' : severity === 'High' ? 'bg-orange-500' : 'bg-primary')} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{doneCount}/{total}</span>
              </div>
              <div className="space-y-1">
                {severityItems.map((item) => {
                  const isDone = ['Done', 'Deployed'].includes(item.status);
                  return (
                    <div key={item.id} className={cn('flex items-center gap-3 px-4 py-3 rounded-lg bg-card card-shadow group', isDone && 'opacity-60')}>
                      <button onClick={() => handleToggleDone(item)} className="flex-shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </button>
                      <button onClick={() => setSelectedItem(item.id)} className="flex-1 text-left min-w-0">
                        <p className={cn('text-sm font-medium text-foreground', isDone && 'line-through')}>{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{getAppName(item.app_id)}</span>
                          {item.owner && <span className="text-[10px] text-muted-foreground">- {item.owner}</span>}
                        </div>
                      </button>
                      <select
                        value={item.status}
                        onChange={(e) => updateItem.mutate({ id: item.id, status: e.target.value as ItemStatus })}
                        className={cn('text-[10px] font-medium px-2 py-0.5 rounded border-0 cursor-pointer', getStatusColor(item.status))}
                      >
                        {STATUS_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Items without severity assigned */}
        {(() => {
          const unclassified = securityItems.filter((i) => !i.security_severity);
          if (unclassified.length === 0) return null;
          return (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-muted text-muted-foreground">Unclassified</span>
                <span className="text-xs text-muted-foreground">{unclassified.length} items</span>
              </div>
              <div className="space-y-1">
                {unclassified.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-card card-shadow">
                    <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <button onClick={() => setSelectedItem(item.id)} className="flex-1 text-left">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <span className="text-[10px] text-muted-foreground">{getAppName(item.app_id)}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {securityItems.length === 0 && (
        <div className="text-center py-16">
          <ShieldCheck className="w-12 h-12 text-success mx-auto mb-3" />
          <p className="text-lg font-semibold text-foreground mb-1">All clear</p>
          <p className="text-sm text-muted-foreground">No security items to track. Add items with type "Security" to see them here.</p>
        </div>
      )}
    </div>
  );
}
