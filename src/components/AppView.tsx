import { useUIStore } from '@/lib/store';
import { useApps } from '@/hooks/useData';
import { BoardView } from './BoardView';
import { ListView } from './ListView';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppView() {
  const { selectedAppId, viewMode, setViewMode } = useUIStore();
  const { data: apps = [] } = useApps();
  const appKey = selectedAppId || 'all';
  const mode = viewMode[appKey] || 'board';
  const app = selectedAppId && selectedAppId !== 'all' ? apps.find((a) => a.id === selectedAppId) : null;

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">{app ? app.name : 'All Apps'}</h1>
          {app && <p className="text-sm text-muted-foreground mt-0.5">{app.description}</p>}
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          <button onClick={() => setViewMode(appKey, 'board')} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors', mode === 'board' ? 'bg-background text-foreground card-shadow' : 'text-muted-foreground hover:text-foreground')}>
            <LayoutGrid className="w-3.5 h-3.5" /> Board
          </button>
          <button onClick={() => setViewMode(appKey, 'list')} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors', mode === 'list' ? 'bg-background text-foreground card-shadow' : 'text-muted-foreground hover:text-foreground')}>
            <List className="w-3.5 h-3.5" /> List
          </button>
        </div>
      </div>
      {mode === 'board' ? <BoardView /> : <ListView />}
    </div>
  );
}
