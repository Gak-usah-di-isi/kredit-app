import { Icon } from '@iconify/react';
import { usePage, router } from '@inertiajs/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../../Components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '../../Components/ui/avatar';
import { useTheme } from '../../Components/ui/shared/ThemeContext';

const PARTICIPANT_ROLES = ['indonesia-presenter', 'foreign-presenter', 'indonesia-participants', 'foreign-participants'];

export default function KreditAppTopbar({ onMobileMenuClick }) {
  const { dark, toggle } = useTheme();
  const { auth, authUser, authRoles } = usePage().props;

  const user = authUser || auth?.user;
  const roles = authRoles || (user?.roles ? user.roles.map(r => r.name) : []);

  const userName    = user?.name ?? 'User';
  const userEmail   = user?.email ?? '';
  const userInitial = userName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const userRole    = roles?.[0]
    ? roles[0].replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Nasabah';
  const isNasabah   = roles.includes('nasabah') || roles.length === 0;
  const isParticipant = (roles ?? []).some(r => PARTICIPANT_ROLES.includes(r));

  const bar  = dark ? '#1E293B' : '#ffffff';
  const bord = dark ? '#334155' : '#e5e7eb';
  const text  = dark ? '#E2E8F0' : '#374151';
  const sub   = dark ? '#94A3B8' : '#6B7280';
  const hover = dark ? 'rgba(255,255,255,0.06)' : '#F9FAFB';

  return (
    <div
      className="h-[64px] flex items-center justify-between px-6 flex-shrink-0"
      style={{ background: bar, borderBottom: `1px solid ${bord}` }}
    >
      {/* Left — mobile hamburger + view selector */}
      <div className="flex items-center gap-6">
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden h-10 w-10 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: text }}
          onMouseEnter={e => e.currentTarget.style.background = hover}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Icon icon="solar:hamburger-menu-line-duotone" height={24} />
        </button>

        {/* View label (static, no dropdown) */}
        <div className="hidden lg:flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ color: sub }}>
          <Icon icon="solar:compass-outline" width={20} style={{ color: sub }} />
          <span className="text-sm" style={{ color: text }}>Dashboard View</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="h-9 w-9 flex items-center justify-center rounded-lg transition-colors"
              style={{ color: sub }}
              onMouseEnter={e => e.currentTarget.style.background = hover}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Icon icon="solar:bell-outline" width={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
              <p className="text-xs text-gray-500 mt-0.5">You have 3 unread messages</p>
            </div>
            <DropdownMenuItem>
              <div className="flex gap-3 py-1">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Icon icon="solar:calendar-outline" className="text-blue-600" width={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New appointment</p>
                  <p className="text-xs text-gray-500">Patient scheduled for tomorrow</p>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex gap-3 py-1">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Icon icon="solar:check-circle-outline" className="text-green-600" width={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Payment received</p>
                  <p className="text-xs text-gray-500">Rp 500.000 from patient #123</p>
                </div>
              </div>
            </DropdownMenuItem>
            <div className="px-4 py-3 border-t border-gray-100">
              <button className="text-xs text-blue-600 hover:underline font-medium">
                View all notifications
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings (sembunyikan untuk role nasabah) */}
        {!isNasabah && (
          <a
            href="/template/pengaturan"
            className="h-9 w-9 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: sub }}
            aria-label="Settings"
            onMouseEnter={e => e.currentTarget.style.background = hover}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Icon icon="solar:settings-outline" width={20} />
          </a>
        )}

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors ml-1 cursor-pointer"
              onMouseEnter={e => e.currentTarget.style.background = hover}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium" style={{ color: text }}>{userName}</div>
                <div className="text-xs" style={{ color: sub }}>{userRole}</div>
              </div>
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-blue-600 text-white text-sm">{userInitial}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{userRole}</p>
              {userEmail && <p className="text-xs text-gray-400 mt-0.5">{userEmail}</p>}
            </div>
            <DropdownMenuItem>
              <Icon icon="solar:user-outline" className="mr-2" width={16} />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => router.post('/logout')}>
              <Icon icon="solar:logout-2-outline" className="mr-2" width={16} />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
