import { Rocket, LayoutDashboard, FileText, Settings, Plus, Boxes, BookOpen, ChevronRight, Map, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useUIStore } from '@/lib/store';
import { useApps, useItems } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const { selectedAppId, setSelectedApp, setQuickAddOpen } = useUIStore();
  const { data: apps = [] } = useApps();
  const { data: items = [] } = useItems();
  const { signOut, profile } = useAuth();
  const activeApps = apps.filter((a) => a.status !== 'Archived');

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-sidebar text-sidebar-foreground flex flex-col z-30">
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Rocket className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-base tracking-tight">Adevus Launchpad</span>
      </div>
      <div className="px-3 mb-2">
        <button onClick={() => setQuickAddOpen(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-ring/20 transition-colors">
          <Plus className="w-4 h-4" /> New Item
        </button>
      </div>
      <nav className="flex-1 px-3 overflow-y-auto">
        <div className="mb-4">
          <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">Overview</p>
          <SidebarItem icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" active={selectedAppId === null} onClick={() => setSelectedApp(null)} />
          <SidebarItem icon={<Map className="w-4 h-4" />} label="Roadmap" active={selectedAppId === 'roadmap'} onClick={() => setSelectedApp('roadmap')} />
          <SidebarItem icon={<ShieldCheck className="w-4 h-4" />} label="Security" active={selectedAppId === 'security'} onClick={() => setSelectedApp('security')} />
        </div>
        <div className="mb-4">
          <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">Products</p>
          <SidebarItem icon={<div className="w-2 h-2 rounded-full bg-sidebar-muted" />} label="All Products" active={selectedAppId === 'all'} onClick={() => setSelectedApp('all')} count={items.length} />
          {activeApps.map((app) => {
            const hasDocsContent = !!(app as any).prompts || !!(app as any).documentation;
            return (
              <AppSidebarItem
                key={app.id}
                app={app}
                hasDocsContent={hasDocsContent}
                itemCount={items.filter((i) => i.app_id === app.id).length}
                isActive={selectedAppId === app.id}
                isDocsActive={selectedAppId === `docs:${app.id}`}
                onSelect={() => setSelectedApp(app.id)}
                onSelectDocs={() => setSelectedApp(`docs:${app.id}`)}
              />
            );
          })}
        </div>
        <div>
          <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">More</p>
          <SidebarItem icon={<FileText className="w-4 h-4" />} label="Change Log" active={selectedAppId === 'changelog'} onClick={() => setSelectedApp('changelog')} />
          <SidebarItem icon={<Boxes className="w-4 h-4" />} label="Manage Products" active={selectedAppId === 'apps-manage'} onClick={() => setSelectedApp('apps-manage')} />
          <SidebarItem icon={<Settings className="w-4 h-4" />} label="Settings" active={selectedAppId === 'settings'} onClick={() => setSelectedApp('settings')} />
        </div>
      </nav>
      <div className="px-5 py-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <p className="text-xs text-sidebar-muted truncate">{profile?.name || profile?.email}</p>
          <button onClick={signOut} className="text-[11px] text-sidebar-muted hover:text-sidebar-foreground transition-colors">Sign out</button>
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({ icon, label, active, onClick, count, indent }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; count?: number; indent?: boolean }) {
  return (
    <button onClick={onClick} className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors', indent && 'pl-10 py-1.5', active ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground')}>
      <span className="flex items-center justify-center w-4">{icon}</span>
      <span className={cn('flex-1 text-left', indent && 'text-xs')}>{label}</span>
      {count !== undefined && <span className="text-[11px] text-sidebar-muted">{count}</span>}
    </button>
  );
}

function AppSidebarItem({ app, hasDocsContent, itemCount, isActive, isDocsActive, onSelect, onSelectDocs }: {
  app: any; hasDocsContent: boolean; itemCount: number;
  isActive: boolean; isDocsActive: boolean; onSelect: () => void; onSelectDocs: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div className="flex items-center">
        {hasDocsContent ? (
          <button onClick={() => setExpanded(!expanded)} className="p-1 text-sidebar-muted hover:text-sidebar-foreground transition-colors">
            <ChevronRight className={cn('w-3 h-3 transition-transform', expanded && 'rotate-90')} />
          </button>
        ) : (
          <div className="w-5" />
        )}
        <button onClick={onSelect} className={cn('flex-1 flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground')}>
          <span className="flex items-center justify-center w-4"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: app.color_tag }} /></span>
          <span className="flex-1 text-left">{app.name}</span>
          <span className="text-[11px] text-sidebar-muted">{itemCount}</span>
        </button>
      </div>
      {expanded && hasDocsContent && (
        <SidebarItem icon={<BookOpen className="w-3 h-3 ml-0.5" />} label="Docs" active={isDocsActive} onClick={onSelectDocs} indent />
      )}
    </div>
  );
}
