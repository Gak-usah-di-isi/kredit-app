import { Icon } from '@iconify/react';
import { usePage, router, Link } from '@inertiajs/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
  const isAdminSistem = roles.includes('admin_sistem');
  const isPeneliti = roles.includes('peneliti');
  const isPetugasKredit = roles.includes('petugas_kredit');
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

        {/* Breadcrumbs: SISTEM > Credit Underwriting */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="text-xs font-semibold tracking-wider text-gray-500 uppercase hover:text-blue-600 transition-colors"
          >
            SISTEM
          </Link>
          <span className="text-gray-400 text-xs font-bold">&gt;</span>
          <Link
            href="/assessments"
            className="text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors"
          >
            Credit Underwriting
          </Link>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative h-9 w-9 flex items-center justify-center rounded-lg transition-colors"
              style={{ color: sub }}
              onMouseEnter={e => e.currentTarget.style.background = hover}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Icon icon="solar:bell-outline" width={20} />
              {/* Dynamic Red Badge Counter */}
              <span className="absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 ring-2 ring-white text-[9px] font-bold text-white">
                3
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-sm text-gray-900">Notifikasi Aktivitas Kredit</h3>
                <p className="text-xs text-gray-500 mt-0.5">3 notifikasi baru belum dibaca</p>
              </div>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-800">
                Tandai Dibaca
              </button>
            </div>
            
            <DropdownMenuItem onClick={() => router.visit('/assessments?status=review_officer')}>
              <div className="flex gap-3 py-1">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Icon icon="solar:document-add-outline" className="text-amber-600" width={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">📝 Asesmen Membutuhkan Review Officer</p>
                  <p className="text-xs text-gray-500">Debitur: Bambang Pamungkas (Skor: 68.5 - Perlu Verif)</p>
                  <p className="text-xs text-gray-400 mt-0.5">15 menit lalu</p>
                </div>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem>
              <div className="flex gap-3 py-1">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Icon icon="solar:check-circle-outline" className="text-green-600" width={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">🎯 Kuesioner Selesai Diisi</p>
                  <p className="text-xs text-gray-500">Debitur: Siti Nurhaliza telah menyelesaikan 40 butir</p>
                  <p className="text-xs text-gray-400 mt-0.5">1 jam lalu</p>
                </div>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => router.visit('/assessments?status=siap_diputus')}>
              <div className="flex gap-3 py-1">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Icon icon="solar:scale-outline" className="text-blue-600" width={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">⚖️ Putusan Kredit Diterbitkan</p>
                  <p className="text-xs text-gray-500">Komite menyetujui pengajuan kredit #CR-2026-089</p>
                  <p className="text-xs text-gray-400 mt-0.5">2 jam lalu</p>
                </div>
              </div>
            </DropdownMenuItem>
            
            <div className="px-4 py-3 border-t border-gray-100 text-center">
              <button 
                onClick={() => router.visit('/assessments')} 
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Lihat Semua Aktivitas Asesmen
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings (sembunyikan untuk role nasabah) */}
        {!isNasabah && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-9 w-9 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: sub }}
                aria-label="Settings"
                onMouseEnter={e => e.currentTarget.style.background = hover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Icon icon="solar:tuning-2-outline" width={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>⚙️ Pengaturan Sistem & Preferensi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {(isAdminSistem || isPeneliti) && (
                <DropdownMenuItem onClick={() => router.visit('/calibration-parameters')}>
                  <div className="flex flex-col py-1">
                    <span className="font-medium text-gray-900 flex items-center gap-2">
                      <Icon icon="solar:graph-up-outline" className="text-gray-500" width={16} />
                      Kalibrasi Parameter Skoring
                    </span>
                    <span className="text-[11px] text-gray-500 ml-6">Bobot dimensi, passing grade, & batas C-W-S</span>
                  </div>
                </DropdownMenuItem>
              )}
              
              {(isAdminSistem || isPetugasKredit) && (
                <DropdownMenuItem onClick={() => router.visit('/item-masters')}>
                  <div className="flex flex-col py-1">
                    <span className="font-medium text-gray-900 flex items-center gap-2">
                      <Icon icon="solar:library-broken" className="text-gray-500" width={16} />
                      Bank Soal & Item Psikometri
                    </span>
                    <span className="text-[11px] text-gray-500 ml-6">Kelola butir soal, dimensi, dan opsi jawaban</span>
                  </div>
                </DropdownMenuItem>
              )}
              
              {isAdminSistem && (
                <DropdownMenuItem onClick={() => router.visit('/users')}>
                  <div className="flex flex-col py-1">
                    <span className="font-medium text-gray-900 flex items-center gap-2">
                      <Icon icon="solar:users-group-two-rounded-outline" className="text-gray-500" width={16} />
                      Manajemen Pengguna & Hak Akses
                    </span>
                    <span className="text-[11px] text-gray-500 ml-6">Kelola akun AO, Supervisor, Pemutus, & IT</span>
                  </div>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={() => router.visit('/profile')}>
                <div className="flex flex-col py-1">
                  <span className="font-medium text-gray-900 flex items-center gap-2">
                    <Icon icon="solar:lock-keyhole-outline" className="text-gray-500" width={16} />
                    Keamanan & Sandi Akun
                  </span>
                  <span className="text-[11px] text-gray-500 ml-6">Ubah password & otentikasi sesi staf</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Help / FAQ icon */}
        <button
          className="h-9 w-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
          style={{ color: sub }}
          aria-label="Pusat Bantuan & FAQ"
          title="Pusat Bantuan & FAQ"
          onClick={() => router.visit('/faq')}
          onMouseEnter={e => e.currentTarget.style.background = hover}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Icon icon="solar:question-circle-outline" width={20} />
        </button>

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
            <DropdownMenuItem onClick={() => router.visit('/profile')} className="cursor-pointer">
              <Icon icon="solar:user-outline" className="mr-2" width={16} />
              Profil Saya
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => router.post('/logout')}>
              <Icon icon="solar:logout-2-outline" className="mr-2" width={16} />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}