import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Dashboard({ stats }) {
    const { auth } = usePage().props;

    const displayStats = [
        { label: 'Total Asesmen', value: stats?.total || '0', icon: '📄', color: 'bg-blue-50 text-blue-600 border-blue-100' },
        { label: 'Supportive', value: stats?.supportive || '0', icon: '✅', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
        { label: 'Review', value: stats?.review || '0', icon: '⚠️', color: 'bg-amber-50 text-amber-600 border-amber-100' },
        { label: 'Concern', value: stats?.concern || '0', icon: '❌', color: 'bg-rose-50 text-rose-600 border-rose-100' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="p-4 lg:p-6">
                {/* Welcome Banner */}
                <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-sm">
                    <h1 className="text-2xl font-bold">
                        Selamat Datang, {auth?.user?.name ?? 'Pengguna'}! 👋
                    </h1>
                    <p className="mt-1 text-blue-100 text-sm">
                        Ini adalah halaman dashboard PCSM-SOPI. Kelola dan pantau hasil asesmen psikometrik calon debitur Anda di sini.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {displayStats.map((stat) => (
                        <div
                            key={stat.label}
                            className={`bg-white rounded-xl border p-5 flex items-center gap-4 shadow-sm ${stat.color}`}
                        >
                            <div className="text-3xl">{stat.icon}</div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h2>
                    <div className="text-sm text-gray-500 text-center py-12">
                        Belum ada aktivitas untuk ditampilkan.
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
