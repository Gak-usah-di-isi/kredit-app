import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import KreditAppSidebar from '@/Pages/layout/KreditAppSidebar';
import KreditAppTopbar from '@/Pages/layout/KreditAppTopbar';
import SidebarContentNasabah from '@/Pages/layout/SidebarItemsNasabah';

export default function AuthenticatedLayout({ children, header, sidebarItems }) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const { auth, authUser, authRoles } = usePage().props;
    const currentPath = window.location.pathname;

    const user = authUser || auth?.user;
    const roles = authRoles || (user?.roles ? user.roles.map(r => r.name) : []);
    const isNasabah = roles.includes('nasabah') || roles.length === 0;

    // Untuk role nasabah berikan 1 nama menu (MENU) dan sub menu (Dashboard).
    // Jika ada props sidebarItems eksplisit, gunakan itu; jika tidak, jika role nasabah pakai SidebarContentNasabah
    const items = sidebarItems ?? (isNasabah ? SidebarContentNasabah : undefined);

    return (
        <div className="flex w-full h-screen overflow-hidden bg-[#F4F7FB]">
            {/* Sidebar */}
            <KreditAppSidebar
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
                onStandByMode={() => {}}
                currentPath={currentPath}
                items={items}
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
        </div>
    );
}
