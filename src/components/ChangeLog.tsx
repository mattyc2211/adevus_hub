import { useItems, useApps } from '@/hooks/useData';
import { getTypeColor, timeAgo } from '@/lib/helpers';
import { cn } from '@/lib/utils';

export function ChangeLog() {
  const { data: items = [] } = useItems();
  const { data: apps = [] } = useApps();

  const logItems = items.filter((i) => i.type === 'Decision' || i.status === 'Deployed')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const groups: Record<string, typeof logItems> = {};
  logItems.forEach((item) => {
    const d = new Date(item.updated_at);
    const key = d.toLocaleDateString('en-AU', { year: 'numeric', month: 'long' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground mb-1">Change Log</h1>
      <p className="text-sm text-muted-foreground mb-8">Decisions and deployments across all apps.</p>
      {Object.entries(groups).map(([month, entries]) => (
        <div key={month} className="mb-8">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{month}</h2>
          <div className="space-y-2">
            {entries.map((item) => {
              const app = apps.find((a) => a.id === item.app_id);
              const typeColor = getTypeColor(item.type);
              return (
                <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-card card-shadow">
                  <span className="text-[11px] text-muted-foreground tabular-nums w-16">{new Date(item.updated_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</span>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: app?.color_tag }} />
                  <span className="text-xs text-muted-foreground w-24 truncate">{app?.name}</span>
                  <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', typeColor.bg, typeColor.text)}>{item.type}</span>
                  <span className="text-sm text-foreground flex-1 truncate">{item.title}</span>
                  {item.version && <span className="text-[11px] text-muted-foreground font-mono">{item.version}</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {logItems.length === 0 && (
        <div className="text-center py-16">
          <p className="text-lg font-semibold text-foreground mb-1">No entries yet</p>
          <p className="text-sm text-muted-foreground">Decisions and deployments will appear here automatically.</p>
        </div>
      )}
    </div>
  );
}
