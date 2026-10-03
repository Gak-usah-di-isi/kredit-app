import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { usePage, router } from '@inertiajs/react';
import SidebarContent from './SidebarItems';

// same palette language as the BADGE map in Pages/Admin/Summary/Index.jsx
const BADGE_TONES = {
  red:   { bg: 'rgba(239,68,68,0.1)',  color: '#EF4444' },
  green: { bg: 'rgba(19,222,185,0.1)', color: '#10B981' },
  amber: { bg: 'rgba(255,174,31,0.1)', color: '#F59E0B' },
  cyan:  { bg: 'rgba(73,190,255,0.12)', color: '#0EA5E9' },
  blue:  { bg: 'rgba(1,82,234,0.1)',   color: '#0152EA' },
  gray:  { bg: 'rgba(107,114,128,0.1)', color: '#6B7280' },
};

function SidebarBadge({ badge }) {
  if (!badge) return null;
  const { count = 0, tone = 'gray' } = badge;
  const { bg, color } = BADGE_TONES[tone] ?? BADGE_TONES.gray;
  return (
    <span
      className="flex-shrink-0 text-xs font-semibold rounded-full px-2 py-0.5"
      style={{ background: bg, color, fontFamily: 'Manrope,sans-serif' }}
    >
      {count}
    </span>
  );
}

export default function KreditAppSidebar({
  isMobileOpen = false,
  onMobileClose,
  onStandByMode,
  currentPath,
  items,
}) {
  const { logoPath, auth, authUser, authRoles } = usePage().props;
  const userForRole = authUser || auth?.user;
  const rolesForSidebar = authRoles || (userForRole?.roles ? userForRole.roles.map(r => r.name) : []);

  const getRoleDisplayName = (roles) => {
    if (roles.includes('admin_sistem')) return 'Admin Sistem';
    if (roles.includes('pejabat_pemutus')) return 'Pejabat Pemutus';
    if (roles.includes('manajemen_risiko')) return 'Manajemen Risiko';
    if (roles.includes('compliance')) return 'Unit Kepatuhan';
    if (roles.includes('petugas_kredit')) return 'Account Officer';
    if (roles.includes('nasabah')) return 'Akun Nasabah';
    return 'Pengguna';
  };

  const menuItems = items ?? SidebarContent;
  const [expandedSections, setExpandedSections] = useState(new Set());

  // Auto-expand section yang berisi route aktif, fallback ke DASHBOARD
  useEffect(() => {
    let activeHeading = null;
    menuItems.forEach((section) => {
      section.items?.forEach((item) => {
        const hasActiveChild = item.children?.some((child) => child.url === currentPath);
        if (hasActiveChild && item.heading) activeHeading = item.heading;
      });
    });
    const defaultHeading = menuItems[0]?.items?.[0]?.heading ?? 'DASHBOARD';
    setExpandedSections(new Set([activeHeading ?? defaultHeading]));
  }, [currentPath, menuItems]);

  const handleSectionToggle = (heading) => {
    setExpandedSections((prev) => {
      const next = new Set();
      if (!prev.has(heading)) next.add(heading);
      return next;
    });
  };

  const handleItemClick = () => {
    if (isMobileOpen && onMobileClose) onMobileClose();
  };

  // theme tokens
  const bg    = '#ffffff';
  const bord  = '#e5e7eb';
  const text  = '#374151';
  const sub   = '#6B7280';
  const hover = '#F9FAFB';
  const activeBg   = '#EFF3FF';
  const activeText = '#0152EA';
  const clinicBg   = '#ffffff';
  const clinicBord = '#e5e7eb';

  const sidebarContent = (
    <>
      {/* Logo & Brand */}
      <div className="h-[64px] px-5 flex items-center gap-3" style={{ borderBottom: `1px solid ${bord}` }}>
        <img src={logoPath || '/images/logo.png'} alt="PCSM-SOPI" className="h-8 w-auto object-contain flex-shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-bold leading-tight tracking-tight truncate" style={{ color: text, fontFamily: 'Manrope, sans-serif' }}>
            PCSM-SOPI
          </span>
          <span className="text-[10px] leading-tight font-medium truncate" style={{ color: sub, fontFamily: 'Manrope, sans-serif' }}>
            Sistem Keputusan Kredit
          </span>
        </div>
      </div>

      {/* Account Status — role info */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200/70">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
            <span className="text-xs font-semibold text-gray-700 truncate">
              {getRoleDisplayName(rolesForSidebar)}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#D7F5F5] text-[#0E7490]">
            TERVERIFIKASI
          </span>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto pb-4 pt-2">
        {menuItems.map((section) => (
          <div key={section.id}>
            {section.items?.map((item) => {
              const heading = item.heading;
              if (!heading || !item.children?.length) return null;
              const isExpanded = expandedSections.has(heading);

              return (
                <div key={heading} className="px-4 mb-2 pl-5 pr-4">
                  <button
                    onClick={() => handleSectionToggle(heading)}
                    className="w-full flex items-center justify-between py-3 rounded-lg px-2 -mx-2 transition-colors pr-1.5 cursor-pointer"
                    onMouseEnter={e => e.currentTarget.style.background = hover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <h3 className="font-bold uppercase tracking-wide text-xs" style={{ color: sub }}>
                      {heading}
                    </h3>
                    <Icon
                      icon={isExpanded ? 'solar:alt-arrow-down-line-duotone' : 'solar:alt-arrow-right-line-duotone'}
                      width={16} style={{ color: sub }}
                    />
                  </button>

                  {isExpanded && (
                    <div className="space-y-1 mt-2">
                      {item.children.map((child) => {
                        const isActive = currentPath === child.url;
                        return (
                          <a
                            key={child.id}
                            href={child.url}
                            onClick={handleItemClick}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer"
                            style={{
                              background: isActive ? activeBg : 'transparent',
                              color: isActive ? activeText : text,
                              fontWeight: isActive ? 600 : 400,
                            }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = hover; }}
                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                          >
                            {child.icon && (
                              <Icon
                                icon={child.icon}
                                width={20}
                                className="flex-shrink-0"
                                style={{ color: isActive ? activeText : text }}
                              />
                            )}
                            <span className="flex-1" style={{ color: isActive ? activeText : text }}>
                              {child.name}
                            </span>
                            <SidebarBadge badge={child.badge} />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Area: Sesi Aman + Standby + Logout */}
      <div className="p-3.5 space-y-2 border-t border-gray-100 mt-auto">
        {/* Sesi Aman Box */}
        <div className="p-2.5 bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Icon icon="solar:shield-check-outline" width={18} />
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-xs font-bold text-gray-900 leading-tight">Sesi Aman</span>
              <span className="text-[10px] text-gray-400 font-medium leading-tight truncate">Enkripsi Perbankan</span>
            </div>
          </div>
          <Icon icon="solar:lock-outline" width={16} className="text-gray-400 flex-shrink-0" />
        </div>

        {/* Buttons Row: Standby + Logout */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onStandByMode?.()}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#EEF2FF] hover:bg-indigo-100 text-[#1E1B4B] text-xs font-semibold transition-colors border border-indigo-100/70"
          >
            <Icon icon="solar:moon-sleep-outline" width={16} className="text-indigo-700" />
            <span>Standby</span>
          </button>
          <button
            type="button"
            onClick={() => router.post('/logout')}
            title="Keluar / Logout"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-rose-600 border border-red-100 transition-colors flex-shrink-0"
          >
            <Icon icon="solar:logout-2-outline" width={18} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <div
        className="hidden lg:flex w-[255px] flex-col h-full"
        style={{ background: bg, borderRight: `1px solid ${bord}` }}
      >
        {sidebarContent}
      </div>

      {/* Mobile */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={onMobileClose} />
          <div
            className="relative flex flex-col w-80 max-w-xs h-full overflow-y-auto"
            style={{ background: bg, borderRight: `1px solid ${bord}` }}
          >
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${bord}` }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <img src={logoPath || '/images/logo.png'} alt="PCSM-SOPI" className="h-7 w-auto object-contain flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[12px] font-bold leading-tight tracking-tight truncate" style={{ color: text, fontFamily: 'Manrope, sans-serif' }}>
                    PCSM-SOPI
                  </span>
                  <span className="text-[9px] leading-tight font-medium truncate" style={{ color: sub, fontFamily: 'Manrope, sans-serif' }}>
                    Sistem Keputusan Kredit
                  </span>
                </div>
              </div>
              <button
                onClick={onMobileClose}
                className="p-1 rounded"
                style={{ color: sub }}
                onMouseEnter={e => e.currentTarget.style.background = hover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Icon icon="solar:close-circle-line-duotone" width={20} />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
