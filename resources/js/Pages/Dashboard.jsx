import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard({ stats, recentAssessments = [] }) {
    const { auth, authRoles = [] } = usePage().props;

    const getRoleName = (roles) => {
        if (roles.includes('admin_sistem')) return 'Admin Sistem';
        if (roles.includes('pejabat_pemutus')) return 'Pejabat Pemutus';
        if (roles.includes('manajemen_risiko')) return 'Manajemen Risiko';
        if (roles.includes('compliance')) return 'Unit Kepatuhan';
        if (roles.includes('petugas_kredit')) return 'Petugas Kredit (AO)';
        if (roles.includes('nasabah')) return 'Nasabah / Debitur';
        return 'Pengguna';
    };

    const displayStats = [
        { label: 'Total Asesmen', value: stats?.total ?? 0, icon: '📄', color: 'bg-blue-50 text-blue-600 border-blue-100' },
        { label: 'Perlu Ditinjau', value: stats?.pending_review ?? 0, icon: '⏳', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
        { label: 'Supportive', value: stats?.supportive ?? 0, icon: '✅', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
        { label: 'Review', value: stats?.review ?? 0, icon: '⚠️', color: 'bg-amber-50 text-amber-600 border-amber-100' },
        { label: 'Concern', value: stats?.concern ?? 0, icon: '❌', color: 'bg-rose-50 text-rose-600 border-rose-100' },
    ];

    const getBadge = (rec) => {
        if (!rec) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Draft</span>;
        if (rec === 'SUPPORTIVE') return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">Supportive</span>;
        if (rec.includes('REVIEW')) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">{rec}</span>;
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800">{rec}</span>;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="p-4 lg:p-6 space-y-6">
                {/* Welcome Banner */}
                <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-medium backdrop-blur-sm mb-2">
                            <span>Peran:</span>
                            <span className="font-bold">{getRoleName(authRoles)}</span>
                        </div>
                        <h1 className="text-2xl font-bold">
                            Selamat Datang, {auth?.user?.name ?? 'Pengguna'}! 👋
                        </h1>
                        <p className="mt-1 text-blue-100 text-sm max-w-2xl">
                            Sistem Pendukung Keputusan Penilaian Kredit Berbasis Psikometrik (PCSM-SOPI).
                        </p>
                    </div>
                    {authRoles.includes('petugas_kredit') && (
                        <Link
                            href={route('assessments.create')}
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-white text-blue-700 font-semibold text-sm rounded-xl shadow-sm hover:bg-blue-50 transition"
                        >
                            + Buat Asesmen Baru
                        </Link>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {displayStats.map((stat) => (
                        <div
                            key={stat.label}
                            className={`bg-white rounded-xl border p-4 flex items-center gap-3 shadow-sm ${stat.color}`}
                        >
                            <div className="text-2xl">{stat.icon}</div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Assessments Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-semibold text-gray-800">Aktivitas Asesmen Terbaru</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Daftar asesmen yang baru diajukan atau diproses</p>
                        </div>
                        <Link
                            href={route('assessments.index')}
                            className="text-xs text-blue-600 font-semibold hover:text-blue-800"
                        >
                            Lihat Semua &rarr;
                        </Link>
                    </div>

                    {recentAssessments.length === 0 ? (
                        <div className="text-sm text-gray-500 text-center py-10">
                            Belum ada aktivitas asesmen untuk ditampilkan.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50/70">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs">ID</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs">Nasabah</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs">Petugas AO</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs">Status</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs">Rekomendasi</th>
                                        <th className="px-4 py-3 text-right font-semibold text-gray-600 text-xs">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {recentAssessments.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/60 transition">
                                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">#{item.id}</td>
                                            <td className="px-4 py-3 font-medium text-gray-900">{item.borrower?.name}</td>
                                            <td className="px-4 py-3 text-gray-600 text-xs">{item.officer?.name || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${
                                                    item.status === 'submitted' ? 'bg-blue-50 text-blue-700' :
                                                    item.status === 'reviewed' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {getBadge(item.decision?.final_recommendation)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={route('assessments.show', item.id)}
                                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                                                >
                                                    Detail &rarr;
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
