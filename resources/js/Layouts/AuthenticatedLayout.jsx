import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import KreditAppSidebar from '@/Pages/layout/KreditAppSidebar';
import KreditAppTopbar from '@/Pages/layout/KreditAppTopbar';
import { getSidebarItemsByRole } from '@/Pages/layout/getSidebarItems';
import { ToastProvider } from '@/Components/ui/Toast';
import StandbyModal from '@/Components/StandbyModal';

export default function AuthenticatedLayout({ children, header, sidebarItems }) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isStandby, setIsStandby] = useState(() => {
        return sessionStorage.getItem('kredit_standby_mode') === 'true';
    });
    const { auth, authUser, authRoles } = usePage().props;
    const currentPath = window.location.pathname;

    const user = authUser || auth?.user;
    const roles = authRoles || (user?.roles ? user.roles.map(r => r.name) : []);

    // Menentukan sidebar berdasarkan role
    const resolvedItems = sidebarItems || getSidebarItemsByRole(roles);

    const activateStandby = () => {
        setIsStandby(true);
        sessionStorage.setItem('kredit_standby_mode', 'true');
    };

    const deactivateStandby = () => {
        setIsStandby(false);
        sessionStorage.removeItem('kredit_standby_mode');
    };

    return (
        <ToastProvider>
            <div className="flex w-full h-screen overflow-hidden bg-[#F4F7FB]">
                {/* Sidebar */}
                <KreditAppSidebar
                    isMobileOpen={isMobileSidebarOpen}
                    onMobileClose={() => setIsMobileSidebarOpen(false)}
                    onStandByMode={activateStandby}
                    currentPath={currentPath}
                    items={resolvedItems}
                />

                {/* Main Content */}
                <div className="flex flex-col flex-1 w-full h-screen overflow-hidden">
                    {/* Topbar */}
                    <KreditAppTopbar onMobileMenuClick={() => setIsMobileSidebarOpen(true)} />

                    {/* Optional Page Header */}
                    {header && (
                        <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
                            {header}
                        </div>
                    )}

                    {/* Page Content */}
                    <div className="flex-1 overflow-y-auto">
                        {children}
                    </div>
                </div>

                <StandbyModal isOpen={isStandby} onClose={deactivateStandby} />
            </div>
        </ToastProvider>
    );
}
