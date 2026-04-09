import { useApps } from '@/hooks/useData';
import { Sparkles, BookOpen } from 'lucide-react';

export function AppDocsView({ appId }: { appId: string }) {
  const { data: apps = [] } = useApps();
  const app = apps.find((a) => a.id === appId) as any;

  if (!app) return null;

  const hasPrompts = !!app.prompts;
  const hasDocs = !!app.documentation;
  const hasNothing = !hasPrompts && !hasDocs;

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: app.color_tag }} />
        <h1 className="text-xl font-bold text-foreground">{app.name}</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Prompts & Documentation</p>

      {hasNothing && (
        <div className="text-center py-16">
          <p className="text-lg font-semibold text-foreground mb-1">Nothing here yet</p>
          <p className="text-sm text-muted-foreground">Admins can add prompts and documentation from Manage Apps.</p>
        </div>
      )}

      <div className="space-y-6">
        {hasPrompts && (
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Prompts
            </p>
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 rounded-lg p-4">
              {app.prompts}
            </div>
          </div>
        )}
        {hasDocs && (
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Documentation
            </p>
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 rounded-lg p-4">
              {app.documentation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
