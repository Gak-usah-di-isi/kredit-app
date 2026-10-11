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
        <AuthenticatedLayout>
            <Head title="Profil" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">

                    {/* Kartu Identitas Staf BPR */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white font-bold text-3xl flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                                    {userInitial}
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                            {userName}
                                        </h2>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700">
                                            <Icon icon="solar:shield-check-bold-duotone" width={14} />
                                            {roleBadge}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Aktif
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                        <Icon icon="solar:letter-line-duotone" width={18} className="text-gray-400 shrink-0" />
                                        <span>{userEmail}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grid 3 Kolom Info Staf */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                            <div className="flex items-center gap-3.5 bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                                    <Icon icon="solar:buildings-3-line-duotone" width={22} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Kantor Cabang</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">{user?.cabang || 'BPR Kantor Operasional'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5 bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                                    <Icon icon="solar:card-2-line-duotone" width={22} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">NIP Pegawai</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">{user?.nip || `BPR-${user?.id ?? '0000'}`}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5 bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                                    <Icon icon="solar:calendar-line-duotone" width={22} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Bergabung Sejak</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">{joinDate}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid 2 Kolom: Update Profile & Update Password */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                            />
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                            <UpdatePasswordForm />
                        </div>
                    </div>

                    {/* Compliance Card */}
                    <div className="bg-blue-50/60 border border-blue-100 shadow-sm rounded-2xl p-5">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Icon icon="solar:info-circle-line-duotone" width={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-blue-900">Kebijakan Akun Institusi</h4>
                                <p className="text-sm text-blue-800/90 mt-1 leading-relaxed">
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