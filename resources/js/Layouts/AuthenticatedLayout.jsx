import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import KreditAppSidebar from '@/Pages/layout/KreditAppSidebar';
import KreditAppTopbar from '@/Pages/layout/KreditAppTopbar';
import SidebarContentNasabah from '@/Pages/layout/SidebarItemsNasabah';
import SidebarContentAO from '@/Pages/layout/SidebarItemsAO';

export default function AuthenticatedLayout({ children, header, sidebarItems }) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const { auth, authUser, authRoles } = usePage().props;
    const currentPath = window.location.pathname;

    const user = authUser || auth?.user;
    const roles = authRoles || (user?.roles ? user.roles.map(r => r.name) : []);
    const isNasabah = roles.includes('nasabah') || roles.length === 0;
    const isAO = roles.includes('petugas_kredit');

    // Menentukan sidebar mana yang dipakai
    let resolvedItems = sidebarItems;
    if (!resolvedItems) {
        if (isNasabah) {
            resolvedItems = SidebarContentNasabah;
        } else if (isAO) {
            resolvedItems = SidebarContentAO;
        }
    }

    return (
        <div className="flex w-full h-screen overflow-hidden bg-[#F4F7FB]">
            {/* Sidebar */}
            <KreditAppSidebar
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
                onStandByMode={() => {}}
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
        </div>
    );
}
