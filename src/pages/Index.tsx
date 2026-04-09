import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/lib/store';
import { AppSidebar } from '@/components/AppSidebar';
import { Dashboard } from '@/components/Dashboard';
import { BoardView } from '@/components/BoardView';
import { ListView } from '@/components/ListView';
import { DetailPanel } from '@/components/DetailPanel';
import { QuickAddModal } from '@/components/QuickAddModal';
import { AppsManagement } from '@/components/AppsManagement';
import { SettingsPage } from '@/components/SettingsPage';
import { RoadmapView } from '@/components/RoadmapView';
import LoginPage from '@/pages/LoginPage';

const Index = () => {
  const { user, loading } = useAuth();
  const { activeView, setQuickAddOpen } = useUIStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement) && !(e.target instanceof HTMLSelectElement)) {
        e.preventDefault();
        setQuickAddOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setQuickAddOpen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-7 h-7 rounded bg-primary animate-pulse" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'board': return <BoardView />;
      case 'table': return <ListView />;
      case 'roadmap': return <RoadmapView />;
      case 'apps-manage': return <AppsManagement />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-[240px]">{renderContent()}</main>
      <DetailPanel />
      <QuickAddModal />
    </div>
  );
};

export default Index;
