import { useUIStore } from '@/lib/store';
import { useApps, useItems, useAllComments } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { getTypeColor, getInitials, timeAgo, getGreeting, getEnvColor, getUserColor } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Bug, ArrowUp, Rocket, CheckCircle2, MessageSquare } from 'lucide-react';

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
  const activeApps = apps.filter((a) => a.status !== 'Archived');

  const stats = [
    { label: 'Open Items', value: openItems.length, icon: <ArrowUp className="w-3.5 h-3.5" /> },
    { label: 'Bugs Open', value: openBugs.length, icon: <Bug className="w-3.5 h-3.5" /> },
    { label: 'Deployed This Month', value: thisMonth.length, icon: <Rocket className="w-3.5 h-3.5" /> },
    { label: 'Completed This Week', value: completedThisWeek.length, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-base font-semibold text-foreground">{getGreeting()}, {profile?.name || 'there'}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Overview across all products.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded border border-border/50 p-4 card-shadow">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-muted-foreground">{stat.icon}</span>
              <span className="text-[11px] text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-semibold text-foreground tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Project Summary */}
      {activeApps.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Projects</h2>
          <div className="border border-border/50 rounded overflow-hidden">
            <div className="flex items-center gap-3 px-3 py-1.5 bg-muted/30 border-b border-border/50">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex-1">Project</span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-16 text-center">Open</span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-16 text-center">Bugs</span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-24 text-right">Last Deploy</span>
            </div>
            {activeApps.map((app) => {
              const appItems = items.filter((i) => i.app_id === app.id);
              const appOpen = appItems.filter((i) => !['Done', 'Deployed'].includes(i.status)).length;
              const appBugs = appItems.filter((i) => i.type === 'Bug' && !['Done', 'Deployed'].includes(i.status)).length;
              const lastDeploy = appItems
                .filter((i) => i.type === 'Deployment' && i.deployed_at)
                .sort((a, b) => new Date(b.deployed_at!).getTime() - new Date(a.deployed_at!).getTime())[0];
              return (
                <div key={app.id} className="flex items-center gap-3 px-3 py-2 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: app.color_tag }} />
                    <span className="text-[13px] text-foreground truncate">{app.name}</span>
                  </div>
                  <span className="text-[12px] text-foreground w-16 text-center tabular-nums">{appOpen}</span>
                  <span className={cn('text-[12px] w-16 text-center tabular-nums', appBugs > 0 ? 'text-coral font-medium' : 'text-muted-foreground')}>{appBugs}</span>
                  <span className="text-[11px] text-muted-foreground w-24 text-right">{lastDeploy ? timeAgo(lastDeploy.deployed_at!) : '--'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-5 gap-6">
        {/* Recently Updated */}
        <div className="col-span-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recently Updated</h2>
          <div className="space-y-0.5">
            {recentItems.length === 0 && <p className="text-xs text-muted-foreground py-6 text-center">No items yet.</p>}
            {recentItems.map((item) => {
              const app = apps.find((a) => a.id === item.app_id);
              const typeColor = getTypeColor(item.type);
              const commentCount = comments.filter((c) => c.item_id === item.id).length;
              return (
                <button key={item.id} onClick={() => setSelectedItem(item.id)} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-muted/40 transition-colors text-left">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: app?.color_tag || 'hsl(var(--muted-foreground))' }} />
                  <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', typeColor.dot)} />
                  <span className="text-[13px] text-foreground flex-1 truncate">{item.title}</span>
                  {commentCount > 0 && (
                    <span className="flex items-center gap-0.5 text-muted-foreground">
                      <MessageSquare className="w-2.5 h-2.5" />
                      <span className="text-[10px]">{commentCount}</span>
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{timeAgo(item.updated_at)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Deployment Timeline */}
        <div className="col-span-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Deployments</h2>
          {deployments.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No deployments yet.</p>}
          <div className="space-y-0.5">
            {deployments.slice(0, 8).map((dep) => {
              const app = apps.find((a) => a.id === dep.app_id);
              return (
                <button key={dep.id} onClick={() => setSelectedItem(dep.id)} className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded hover:bg-muted/40 transition-colors text-left">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: app?.color_tag }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[11px] text-muted-foreground">{app?.name}</span>
                      {dep.environment && (
                        <span className={cn('text-[9px] font-medium px-1 py-0.5 rounded', getEnvColor(dep.environment))}>{dep.environment}</span>
                      )}
                    </div>
                    <p className="text-[13px] text-foreground truncate">{dep.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {dep.version && <span className="text-[10px] text-muted-foreground font-mono">{dep.version}</span>}
                      <span className="text-[10px] text-muted-foreground">{timeAgo(dep.updated_at)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
