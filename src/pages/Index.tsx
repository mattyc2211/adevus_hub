import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/lib/store';
import { AppSidebar } from '@/components/AppSidebar';
import { Dashboard } from '@/components/Dashboard';
import { AppView } from '@/components/AppView';
import { AppDocsView } from '@/components/AppDocsView';
import { DetailPanel } from '@/components/DetailPanel';
import { QuickAddModal } from '@/components/QuickAddModal';
import { ChangeLog } from '@/components/ChangeLog';
import { AppsManagement } from '@/components/AppsManagement';
import { SettingsPage } from '@/components/SettingsPage';
import { RoadmapView } from '@/components/RoadmapView';
import { SecurityView } from '@/components/SecurityView';
import LoginPage from '@/pages/LoginPage';

const Index = () => {
  const { user, loading } = useAuth();
  const { selectedAppId, setQuickAddOpen } = useUIStore();

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
        <div className="w-8 h-8 rounded-lg bg-primary animate-pulse" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const renderContent = () => {
    if (selectedAppId === null) return <Dashboard />;
    if (selectedAppId === 'roadmap') return <RoadmapView />;
    if (selectedAppId === 'security') return <SecurityView />;
    if (selectedAppId === 'changelog') return <ChangeLog />;
    if (selectedAppId === 'apps-manage') return <AppsManagement />;
    if (selectedAppId === 'settings') return <SettingsPage />;
    if (selectedAppId?.startsWith('docs:')) return <AppDocsView appId={selectedAppId.replace('docs:', '')} />;
    return <AppView />;
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
