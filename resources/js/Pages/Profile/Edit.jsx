import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth, authUser, authRoles } = usePage().props;
    const user = authUser || auth?.user;
    const roles = authRoles || (user?.roles ? user.roles.map(r => r.name) : []);

    const userName = user?.name ?? 'User';
    const userEmail = user?.email ?? '';
    const userInitial = userName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

    const getRoleDisplayName = (roles) => {
        if (roles.includes('admin_sistem')) return 'Admin Sistem';
        if (roles.includes('pejabat_pemutus')) return 'Pejabat Pemutus';
        if (roles.includes('manajemen_risiko')) return 'Manajemen Risiko';
        if (roles.includes('compliance')) return 'Unit Kepatuhan';
        if (roles.includes('petugas_kredit')) return 'Petugas Kredit (AO)';
        if (roles.includes('nasabah')) return 'Nasabah';
        return 'Pengguna';
    };

    const roleBadge = getRoleDisplayName(roles);
    const joinDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : '-';

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Profil Pengguna & Keamanan Akun
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Kelola informasi pribadi, identitas staf perbankan, dan keamanan akun Anda.
                    </p>
                </div>
            }
        >
            <Head title="Profil" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">

                    {/* Kartu Identitas Staf BPR */}
                    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-800" />
                        <div className="px-6 pb-6 -mt-12">
                            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                                <div className="w-20 h-20 rounded-xl bg-blue-600 border-4 border-white shadow-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl font-bold text-white">{userInitial}</span>
                                </div>
                                <div className="flex-1 pt-2 sm:pt-0">
                                    <h3 className="text-xl font-bold text-gray-900">{userName}</h3>
                                    <p className="text-sm text-gray-500">{userEmail}</p>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700">
                                            <Icon icon="solar:shield-check-bold-duotone" width={14} />
                                            {roleBadge}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Aktif
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <Icon icon="solar:buildings-3-line-duotone" className="text-gray-500" width={18} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Kantor Cabang</p>
                                        <p className="text-sm font-semibold text-gray-800">{user?.cabang || 'BPR Kantor Operasional'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <Icon icon="solar:card-2-line-duotone" className="text-gray-500" width={18} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">NIP Pegawai</p>
                                        <p className="text-sm font-semibold text-gray-800">{user?.nip || `BPR-${user?.id ?? '0000'}`}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <Icon icon="solar:calendar-line-duotone" className="text-gray-500" width={18} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Bergabung Sejak</p>
                                        <p className="text-sm font-semibold text-gray-800">{joinDate}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid 2 Kolom: Update Profile & Update Password */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                            />
                        </div>

                        <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                            <UpdatePasswordForm />
                        </div>
                    </div>

                    {/* Compliance Card */}
                    <div className="bg-blue-50 border border-blue-200 shadow-sm sm:rounded-lg p-5">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Icon icon="solar:info-circle-line-duotone" className="text-blue-600" width={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-blue-900">Kebijakan Akun Institusi</h4>
                                <p className="text-sm text-blue-800 mt-1 leading-relaxed">
                                    Akun ini merupakan akun resmi operasional kredit BPR. Perubahan hak akses,
                                    perpindahan cabang, atau penonaktifan akun hanya dapat dilakukan melalui
                                    Administrator Sistem (Unit IT) sesuai SOP Perbankan.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}