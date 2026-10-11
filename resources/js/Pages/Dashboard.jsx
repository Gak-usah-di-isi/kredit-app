import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { FileText, Clock3, CircleCheck, AlertTriangle, CircleAlert, Eye, Contact, Download } from 'lucide-react';

export default function Dashboard({ stats, recentAssessments = [] }) {
    const { auth, authRoles = [] } = usePage().props;
    const [activeTab, setActiveTab] = useState('all');

    const filteredAssessments = useMemo(() => {
        if (activeTab === 'pending') {
            return recentAssessments.filter((item) => item.status === 'submitted');
        }
        if (activeTab === 'completed') {
            return recentAssessments.filter(
                (item) => item.status === 'reviewed' || item.status === 'decided'
            );
        }
        return recentAssessments;
    }, [recentAssessments, activeTab]);

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
    { label: 'Total Asesmen', value: stats?.total ?? 0, icon: FileText, iconStyle: 'bg-blue-50 text-blue-700', badge: '+2 mgg', badgeStyle: 'bg-blue-50 text-blue-600', description: 'Siklus audit aktif saat ini' },
    { label: 'Perlu Ditinjau', value: stats?.pending_review ?? 0, icon: Clock3, iconStyle: 'bg-orange-50 text-orange-700', badge: 'Segera', badgeStyle: 'bg-orange-50 text-orange-600', description: 'Butuh verifikasi AO segera' },
    { label: 'Supportive', value: stats?.supportive ?? 0, icon: CircleCheck, iconStyle: 'bg-teal-50 text-teal-700', badge: 'Tinggi', badgeStyle: 'bg-teal-50 text-teal-600', description: 'Skor psikometrik tinggi' },
    { label: 'Review', value: stats?.review ?? 0, icon: AlertTriangle, iconStyle: 'bg-amber-50 text-amber-700', badge: 'Kroscek', badgeStyle: 'bg-amber-50 text-amber-600', description: 'Respon perlu kroscek' },
    { label: 'Concern', value: stats?.concern ?? 0, icon: CircleAlert, iconStyle: 'bg-rose-50 text-rose-700', badge: 'Waspada', badgeStyle: 'bg-rose-50 text-rose-600', description: 'Skor risiko terdeteksi' },
    ];
    const totalRisk =
    (stats?.supportive ?? 0) +
    (stats?.review ?? 0) +
    (stats?.concern ?? 0);

    const supportivePercent = totalRisk
        ? Math.round((stats?.supportive ?? 0) / totalRisk * 100)
        : 0;

    const reviewPercent = totalRisk
        ? Math.round((stats?.review ?? 0) / totalRisk * 100)
        : 0;

    const concernPercent = totalRisk
        ? Math.round((stats?.concern ?? 0) / totalRisk * 100)
        : 0;

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
                <div className="rounded-2xl bg-gradient-to-r from-white via-white to-green-50 p-6 shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                            <Contact size={26} strokeWidth={2} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Selamat Datang kembali, {auth?.user?.name ?? 'Pengguna'}!
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Sistem PCSM-SOPI mendeteksi{' '}
                                <span className="font-semibold text-blue-700">
                                    {stats?.pending_review ?? 0} asesmen psikometrik baru
                                </span>{' '}
                                yang membutuhkan verifikasi Anda hari ini.
                            </p>
                        </div>
                    </div>

                    {authRoles.includes('petugas_kredit') && (
                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                type="button"
                                className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-100 text-gray-900 font-semibold text-sm rounded-xl hover:bg-indigo-100 transition"
                            >
                                <Download size={16} strokeWidth={2} className="mr-2" />
                                Unduh Rekap Harian
                            </button>

                            <Link
                                href={route('assessments.create')}
                                className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:bg-blue-800 transition"
                            >
                                + Buat Asesmen Baru
                            </Link>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {displayStats.map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm min-h-[170px]"
                        >
                        <div className="flex items-center justify-between">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.iconStyle}`}>
                                <stat.icon size={20} strokeWidth={2} />
                            </div>

                            <span className={`px-3 py-1 rounded-full text-[11px] font-semibold min-w-[64px] h-6 flex items-center justify-center ${stat.badgeStyle}`}>
                                {stat.badge ?? ''}
                            </span>
                        </div>
                                <div className="mt-5">
                                    <div className="text-3xl font-bold text-gray-900">
                                        {stat.value}
                                        </div>
                                <div className="text-sm font-semibold text-gray-900 mt-1">
                                    {stat.label}
                                    </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {stat.description}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Recent Assessments */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-700"></div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Aktivitas Asesmen Terbaru
                                </h2>
                            </div>

                            <p className="text-sm text-gray-500 mt-1">
                                Pemberian rekomendasi berbasis psikometrik debitur
                            </p>
                        </div>

                        <div className="flex items-center bg-indigo-50 rounded-xl p-1 gap-1">
                            <button
                                type="button"
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                                    activeTab === 'all'
                                        ? 'bg-blue-700 text-white shadow-sm'
                                        : 'text-gray-700 hover:text-gray-900 hover:bg-white/60'
                                }`}
                            >
                                Semua
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('pending')}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                                    activeTab === 'pending'
                                        ? 'bg-blue-700 text-white shadow-sm'
                                        : 'text-gray-700 hover:text-gray-900 hover:bg-white/60'
                                }`}
                            >
                                Perlu Verifikasi
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('completed')}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                                    activeTab === 'completed'
                                        ? 'bg-blue-700 text-white shadow-sm'
                                        : 'text-gray-700 hover:text-gray-900 hover:bg-white/60'
                                }`}
                            >
                                Selesai
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-indigo-50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        No & Debitur
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Petugas
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Status
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Rekomendasi
                                    </th>

                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredAssessments.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-14 text-sm text-gray-400">
                                            {recentAssessments.length === 0
                                                ? 'Belum ada aktivitas asesmen untuk ditampilkan.'
                                                : 'Tidak ada aktivitas asesmen dengan filter yang dipilih.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAssessments.slice(0, 5).map((item) => {
                                        const borrowerName = item.borrower?.name ?? 'Tanpa Nama';

                                        const initials = borrowerName
                                            .split(' ')
                                            .map((name) => name[0])
                                            .join('')
                                            .slice(0, 2)
                                            .toUpperCase();

                                        const status =
                                            item.status === 'submitted'
                                                ? 'Submitted'
                                                : item.status === 'reviewed'
                                                    ? 'Reviewed'
                                                    : item.status === 'decided'
                                                        ? 'Decided'
                                                        : item.status === 'draft'
                                                            ? 'Draft'
                                                            : item.status;

                                        return (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-gray-50 transition"
                                            >
                                                {/* Debitur */}
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                                            {initials}
                                                        </div>

                                                        <div>
                                                            <div className="font-semibold text-gray-900">
                                                                {borrowerName}
                                                            </div>

                                                            <div className="text-xs text-gray-500 mt-0.5">
                                                                NIK: {item.borrower?.nik ?? '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Petugas */}
                                                <td className="px-4 py-4 text-sm text-gray-700">
                                                    {item.officer?.name || 'Petugas Kredit'}
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex px-3 py-1 rounded-full text-[11px] font-semibold ${
                                                            item.status === 'submitted'
                                                                ? 'bg-indigo-100 text-indigo-800'
                                                                : item.status === 'reviewed'
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : item.status === 'decided'
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>

                                                {/* Rekomendasi */}
                                                <td className="px-4 py-4">
                                                    {item.decision?.final_recommendation ? (
                                                        <span
                                                            className={`inline-flex px-3 py-1 rounded-full text-[11px] font-semibold ${
                                                                item.decision.final_recommendation === 'SUPPORTIVE'
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : item.decision.final_recommendation.includes('REVIEW')
                                                                        ? 'bg-indigo-100 text-indigo-800'
                                                                        : 'bg-rose-100 text-rose-800'
                                                            }`}
                                                        >
                                                            {item.decision.final_recommendation}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold">
                                                            Draft
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Aksi */}
                                                <td className="px-4 py-4 text-center">
                                                    <Link
                                                        href={route('assessments.show', item.id)}
                                                        className="inline-flex items-center justify-center text-blue-800 hover:text-blue-600"
                                                        title="Lihat detail"
                                                    >
                                                        <Eye size={19} strokeWidth={2} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between bg-indigo-50 rounded-xl px-4 py-3 mt-4">
                        <span className="text-xs text-gray-600">
                            Menampilkan {Math.min(filteredAssessments.length, 5)} dari {filteredAssessments.length} data rekaman asesmen
                        </span>

                        <Link
                            href={route('assessments.index')}
                            className="text-sm font-semibold text-blue-800 hover:text-blue-600 inline-flex items-center gap-1"
                        >
                            Lihat Semua Asesmen
                            <span className="text-lg">›</span>
                        </Link>
                    </div>
                </div>
                 
               {/* Risk Distribution */}
                <div className="space-y-4">

                    {/* Distribusi Risiko */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="mb-5 flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Distribusi Risiko
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Rata-rata kalibrasi instrumen psikometrik
                                </p>
                            </div>

                            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-semibold shrink-0">
                                SOPI Core
                            </span>
                        </div>

                        <div className="rounded-xl bg-indigo-50 p-4">
                            <div className="flex items-center gap-4">
                                <div
                                    className="relative w-24 h-24 rounded-full shrink-0"
                                    style={{
                                        background: totalRisk > 0
                                            ? `conic-gradient(
                                                #f59e0b 0% ${reviewPercent}%,
                                                #b91c1c ${reviewPercent}% ${reviewPercent + concernPercent}%,
                                                #0f766e ${reviewPercent + concernPercent}% 100%
                                            )`
                                            : '#e5e7eb'
                                    }}
                                >
                                    <div className="absolute inset-2.5 rounded-full bg-white flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold text-gray-900">
                                            {totalRisk > 0 ? `${reviewPercent}%` : '0%'}
                                        </span>
                                        <span className="text-[9px] font-medium text-gray-500 uppercase">
                                            {totalRisk > 0 ? 'Review' : 'No Data'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                            <span className="text-gray-700">Review</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">
                                            {stats?.review ?? 0}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-red-700"></span>
                                            <span className="text-gray-700">Concern</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">
                                            {stats?.concern ?? 0}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-teal-700"></span>
                                            <span className="text-gray-700">Supportive</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">
                                            {stats?.supportive ?? 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            <div>
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="font-medium text-gray-700">Integritas Finansial</span>
                                    <span className="font-semibold text-blue-800">-</span>
                                </div>
                                <div className="h-2 rounded-full bg-indigo-100">
                                    <div className="h-2 rounded-full bg-blue-800 w-0"></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="font-medium text-gray-700">Konsistensi Jawaban</span>
                                    <span className="font-semibold text-amber-800">-</span>
                                </div>
                                <div className="h-2 rounded-full bg-indigo-100">
                                    <div className="h-2 rounded-full bg-amber-800 w-0"></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="font-medium text-gray-700">Indeks Kehati-hatian</span>
                                    <span className="font-semibold text-teal-700">-</span>
                                </div>
                                <div className="h-2 rounded-full bg-indigo-100">
                                    <div className="h-2 rounded-full bg-teal-700 w-0"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Validasi Berkas */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                                <AlertTriangle size={20} strokeWidth={2} />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-base font-bold text-gray-900">
                                    Validasi Berkas Tertunda
                                </h2>

                                <p className="mt-1 text-sm text-gray-600 leading-5">
                                    Terdapat asesmen yang membutuhkan validasi lebih lanjut.
                                    Diperlukan wawancara klarifikasi.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 mt-5">
                            <button
                                type="button"
                                className="px-4 py-2 rounded-xl bg-indigo-50 text-gray-700 text-sm font-semibold hover:bg-indigo-100 transition"
                            >
                                Abaikan
                            </button>

                            <button
                                type="button"
                                className="px-4 py-2 rounded-xl bg-amber-800 text-white text-sm font-semibold hover:bg-amber-900 transition"
                            >
                                Klarifikasi Sekarang
                            </button>
                        </div>
                    </div>

                </div>

                </div>
                </div>
        </AuthenticatedLayout>
    );
}
