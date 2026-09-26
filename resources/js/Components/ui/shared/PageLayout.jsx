import { useState } from 'react';
import { ThemeProvider, useTheme } from './ThemeContext';
import KreditAppSidebar from '../../../Pages/layout/KreditAppSidebar';
import KreditAppTopbar from '../../../Pages/layout/KreditAppTopbar';

function Layout({ currentPath, children }) {
  const { dark } = useTheme();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div
      className="flex w-full h-screen overflow-hidden"
      style={{ background: dark ? '#0F172A' : '#F4F7FB' }}
    >
      <KreditAppSidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        onStandByMode={() => {}}
        currentPath={currentPath}
      />
      <div className="flex flex-col flex-1 w-full h-screen overflow-hidden">
        <KreditAppTopbar onMobileMenuClick={() => setIsMobileSidebarOpen(true)} />
        <div
          className="flex-1 overflow-y-auto"
          style={{ background: dark ? '#0F172A' : '#F4F7FB' }}
        >
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PageLayout({ currentPath, children }) {
  return (
    <ThemeProvider>
      <Layout currentPath={currentPath}>{children}</Layout>
    </ThemeProvider>
  );
}
