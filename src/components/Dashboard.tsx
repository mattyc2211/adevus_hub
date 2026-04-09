import { useUIStore } from '@/lib/store';
import { useApps, useItems, useAllComments } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { getTypeColor, getInitials, timeAgo, getGreeting, getEnvColor } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Rocket, Bug, ArrowUp, CheckCircle2 } from 'lucide-react';

export function Dashboard() {
  const { setSelectedItem } = useUIStore();
  const { data: items = [] } = useItems();
  const { data: apps = [] } = useApps();
  const { data: comments = [] } = useAllComments();
  const { profile } = useAuth();

  const openItems = items.filter((i) => !['Done', 'Deployed'].includes(i.status));
  const openBugs = items.filter((i) => i.type === 'Bug' && !['Done', 'Deployed'].includes(i.status));
  const now = new Date();
  const thisMonth = items.filter((i) => i.type === 'Deployment' && i.deployed_at && new Date(i.deployed_at).getMonth() === now.getMonth());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const completedThisWeek = items.filter((i) => ['Done', 'Deployed'].includes(i.status) && new Date(i.updated_at) >= weekAgo);

  const recentItems = [...items].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 10);
  const deployments = items.filter((i) => i.type === 'Deployment').sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const stats = [
    { label: 'Open Items', value: openItems.length, iconBg: 'bg-primary/10', iconText: 'text-primary', numColor: 'text-primary', icon: <ArrowUp className="w-4 h-4" /> },
    { label: 'Bugs Open', value: openBugs.length, iconBg: 'bg-coral/10', iconText: 'text-coral', numColor: 'text-coral', icon: <Bug className="w-4 h-4" /> },
    { label: 'Deployments This Month', value: thisMonth.length, iconBg: 'bg-success/10', iconText: 'text-success', numColor: 'text-success', icon: <Rocket className="w-4 h-4" /> },
    { label: 'Completed This Week', value: completedThisWeek.length, iconBg: 'bg-warning/10', iconText: 'text-warning', numColor: 'text-warning', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-foreground mb-1">{getGreeting()}, {profile?.name || 'there'} 👋</h1>
      <p className="text-muted-foreground text-sm mb-8">Here's what's happening across Adevus products.</p>
      <div className="grid grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-lg p-5 card-shadow">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', stat.iconBg, stat.iconText)}>{stat.icon}</div>
            <p className={cn('text-2xl font-bold tabular-nums', stat.numColor)}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-8">
        <div className="col-span-3">
          <h2 className="text-sm font-semibold text-foreground mb-4">Recently Updated</h2>
          <div className="space-y-1">
            {recentItems.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No items yet. Create your first one! ✨</p>}
            {recentItems.map((item) => {
              const app = apps.find((a) => a.id === item.app_id);
              const typeColor = getTypeColor(item.type);
              const commentCount = comments.filter((c) => c.item_id === item.id).length;
              return (
                <button key={item.id} onClick={() => setSelectedItem(item.id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left group">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-background" style={{ backgroundColor: app?.color_tag || 'hsl(var(--muted-foreground))' }} title={app?.name} />
                  <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', typeColor.bg, typeColor.text)}>{item.type}</span>
                  <span className="text-sm text-foreground flex-1 truncate group-hover:text-primary transition-colors">{item.title}</span>
                  {commentCount > 0 && <span className="text-[11px] text-muted-foreground">💬 {commentCount}</span>}
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">{timeAgo(item.updated_at)}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="col-span-2">
          <h2 className="text-sm font-semibold text-foreground mb-4">Deployment Timeline</h2>
          {deployments.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No deployments yet 🚀</p>}
          <div className="relative">
            {deployments.length > 0 && <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />}
            <div className="space-y-0">
              {deployments.slice(0, 8).map((dep) => {
                const app = apps.find((a) => a.id === dep.app_id);
                const envDotColor = dep.environment === 'Production' ? 'hsl(var(--success))' : dep.environment === 'Staging' ? 'hsl(var(--primary))' : 'hsl(var(--warning))';
                return (
                  <div key={dep.id} className="flex gap-3 items-start relative pl-0 py-2">
                    <div className="relative z-10 mt-1.5">
                      <div className="w-[11px] h-[11px] rounded-full ring-[3px] ring-background" style={{ backgroundColor: envDotColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] text-muted-foreground font-medium">{app?.name}</span>
                        {dep.environment && (
                          <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', getEnvColor(dep.environment))}>{dep.environment}</span>
                        )}
                      </div>
                      <button onClick={() => setSelectedItem(dep.id)} className="text-sm font-medium text-foreground hover:text-primary transition-colors text-left truncate block w-full">{dep.title}</button>
                      <div className="flex items-center gap-2 mt-0.5">
                        {dep.version && <span className="text-[11px] text-muted-foreground font-mono">{dep.version}</span>}
                        <span className="text-[11px] text-muted-foreground">{timeAgo(dep.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
