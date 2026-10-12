import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Icon as IconifyIcon } from '@iconify/react';
import {
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Download,
    ExternalLink,
    Eye,
    Plus,
    Search,
} from 'lucide-react';

export default function Index({ outcomes = [], assessments = [], stats = {}, canRecord = false }) {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState(() =>
        outcomes[0]?.monitoring_date?.slice(0, 7) || new Date().toISOString().slice(0, 7)
    );
    const [currentPage, setCurrentPage] = useState(1);
    const { data, setData, post, processing, errors, reset } = useForm({
        assessment_id: '',
        collectibility_status: 'Kol 1 (Lancar)',
        dpd_days: 0,
        outstanding_balance: '',
        monitoring_date: new Date().toISOString().substring(0, 10),
        notes: '',
    });

    const months = [...new Set([
        ...outcomes.map((item) => item.monitoring_date?.slice(0, 7)).filter(Boolean),
        selectedMonth,
    ])].sort((first, second) => second.localeCompare(first));
    const filteredOutcomes = outcomes.filter((item) => {
        const borrower = item.assessment?.borrower;
        const query = search.trim().toLowerCase();
        const matchesSearch = !query || [
            borrower?.name,
            borrower?.nik,
            item.assessment_id,
            item.collectibility_status,
        ].some((value) => String(value ?? '').toLowerCase().includes(query));
        const matchesStatus = statusFilter === 'all'
            || (statusFilter === 'lancar' && item.collectibility_status.includes('Lancar'))
            || (statusFilter === 'dpk' && item.collectibility_status.includes('DPK'))
            || (statusFilter === 'npl' && item.is_npl);

        return matchesSearch
            && matchesStatus
            && (selectedMonth === 'all' || item.monitoring_date?.slice(0, 7) === selectedMonth);
    });
    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(filteredOutcomes.length / pageSize));
    const visibleOutcomes = filteredOutcomes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const exportCsv = () => {
        const escapeCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
        const rows = [
            ['Debitur', 'NIK', 'Asesmen', 'Status Kolektibilitas', 'DPD', 'Tanggal Monitoring', 'Petugas'],
            ...filteredOutcomes.map((item) => [
                item.assessment?.borrower?.name,
                item.assessment?.borrower?.nik,
                item.assessment_id,
                item.collectibility_status,
                item.dpd_days,
                item.monitoring_date,
                item.recorder?.name,
            ]),
        ];
        const csv = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n')}`;
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'monitoring-kolektibilitas.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    const formatDate = (date) => new Date(`${date}T00:00:00`).toLocaleDateString('id-ID');

    const submit = (e) => {
        e.preventDefault();
        post(route('outcome.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Monitoring Kolektibilitas" />

            <div className="mx-auto w-full max-w-[1440px] space-y-4 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-[32px] font-semibold leading-tight text-[#11172d]">Monitoring Kolektibilitas Pascacredit (Y₀)</h1>
                        <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-slate-600">
                            Catatan berkala status kredit riil pascacair oleh Unit Manajemen Risiko untuk kalibrasi dan validasi model psikometrik.
                        </p>
                    </div>
                    {canRecord && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-blue-800 px-4 text-xs font-semibold text-white transition hover:bg-blue-900"
                        >
                            <Plus size={16} />
                            Catat Status Kolektibilitas
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[
                        { label: 'Debitur Dimonitor', value: stats.total_monitored ?? 0, icon: 'material-symbols:bar-chart', tone: 'bg-[#e4e8ff] text-[#0c287f]', accent: '#18234b' },
                        { label: 'Kol 1 (Lancar)', value: stats.lancar ?? 0, icon: 'mdi:checkbox-marked', tone: 'bg-[#83ebdc] text-[#064b43]', accent: '#087d70' },
                        { label: 'Kol 2 (DPK)', value: stats.dpk ?? 0, icon: 'mdi:alert', tone: 'bg-[#ffe0c6] text-[#512a0a]', accent: '#8b4513' },
                        { label: 'NPL (Kol 3 - 5)', value: stats.npl ?? 0, icon: 'mdi:close', tone: 'bg-[#ffdada] text-[#b42323]', accent: '#b42323' },
                    ].map(({ label, value, icon, tone, accent }) => (
                        <div key={label} className="flex min-h-[66px] items-center gap-3 rounded-[10px] border border-slate-100 bg-white px-3 py-2.5">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] ${tone}`}>
                                <IconifyIcon icon={icon} width={22} height={22} />
                            </div>
                            <div>
                                <div className="text-[22px] font-bold leading-none text-[#171a26]">{value}</div>
                                <div className="mt-1 text-[11px]" style={{ color: accent }}>{label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <section className="overflow-hidden rounded-xl border border-[#e8e9f4] bg-[#f1f2fc]">
                    <div className="flex flex-col gap-2.5 border-b border-[#e7e8f2] bg-[#f3f4fd] px-3 py-3 sm:flex-row sm:items-center">
                        <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md bg-[#e9ebfa] px-3 text-slate-600 sm:max-w-[420px]">
                            <Search size={15} />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => { setSearch(event.target.value); setCurrentPage(1); }}
                                placeholder="Cari Debitur, NIK, atau ID Asesmen..."
                                className="h-full w-full border-0 bg-transparent p-0 text-xs text-slate-800 placeholder:text-slate-500 focus:ring-0"
                            />
                        </label>
                        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                            <label className="relative flex h-9 min-w-[170px] flex-1 items-center sm:flex-none">
                                <select
                                    value={statusFilter}
                                    onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }}
                                    className="h-full w-full appearance-none rounded-md border-0 bg-[#e9ebfa] pl-3 pr-8 text-xs text-slate-800 focus:ring-2 focus:ring-blue-200"
                                >
                                    <option value="all">Semua Kolektibilitas</option>
                                    <option value="lancar">Kol 1 (Lancar)</option>
                                    <option value="dpk">Kol 2 (DPK)</option>
                                    <option value="npl">NPL (Kol 3 - 5)</option>
                                </select>
                                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 text-slate-600" />
                            </label>
                            <label className="relative flex h-9 min-w-[126px] items-center">
                                <CalendarDays size={14} className="pointer-events-none absolute left-3 text-slate-500" />
                                <select
                                    value={selectedMonth}
                                    onChange={(event) => { setSelectedMonth(event.target.value); setCurrentPage(1); }}
                                    className="h-full w-full appearance-none rounded-md border-0 bg-[#e9ebfa] pl-9 pr-8 text-xs text-slate-800 focus:ring-2 focus:ring-blue-200"
                                    aria-label="Filter bulan monitoring"
                                >
                                    <option value="all">Semua Bulan</option>
                                    {months.map((month) => (
                                        <option key={month} value={month}>
                                            {new Date(`${month}-01T00:00:00`).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 text-slate-600" />
                            </label>
                            <button
                                type="button"
                                onClick={exportCsv}
                                title="Unduh hasil sebagai CSV"
                                aria-label="Unduh hasil sebagai CSV"
                                className="flex h-9 w-9 items-center justify-center rounded-md bg-[#e9ebfa] text-slate-700 transition hover:bg-[#dfe3f5]"
                            >
                                <Download size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto bg-white">
                        <table className="min-w-[780px] w-full divide-y divide-slate-100 text-left">
                            <thead className="bg-[#e9ebf8]">
                                <tr>
                                    <th className="px-3 py-3 text-[10px] font-semibold uppercase text-slate-700">ID / Debitur</th>
                                    <th className="px-3 py-3 text-[10px] font-semibold uppercase text-slate-700">Status Kolektibilitas</th>
                                    <th className="px-3 py-3 text-[10px] font-semibold uppercase text-slate-700">DPD</th>
                                    <th className="px-3 py-3 text-[10px] font-semibold uppercase text-slate-700">Tanggal Monitoring</th>
                                    <th className="px-3 py-3 text-[10px] font-semibold uppercase text-slate-700">Petugas Pemantau</th>
                                    <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase text-slate-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {visibleOutcomes.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-9 text-center text-xs text-slate-500">
                                            {outcomes.length === 0
                                                ? 'Belum ada data monitoring kolektibilitas kredit pascacair.'
                                                : 'Tidak ada data yang cocok dengan pencarian dan filter.'}
                                        </td>
                                    </tr>
                                ) : visibleOutcomes.map((item) => {
                                    const borrower = item.assessment?.borrower;
                                    const initials = (borrower?.name || 'Debitur')
                                        .split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
                                    const isCurrent = item.collectibility_status.includes('Lancar');

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/80">
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-[10px] font-semibold text-blue-900">{initials}</span>
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-xs font-semibold text-slate-900">{borrower?.name || 'Debitur'}</span>
                                                        <span className="mt-0.5 block truncate text-[10px] text-slate-500">Asesmen #{item.assessment_id} | NIK: {borrower?.nik || '-'}</span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                                    item.is_npl ? 'bg-rose-100 text-rose-800' : isCurrent ? 'bg-teal-200 text-teal-950' : 'bg-amber-100 text-amber-900'
                                                }`}>
                                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                    {item.collectibility_status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-xs text-slate-700">{item.dpd_days} hari</td>
                                            <td className="px-3 py-2.5 text-xs text-slate-700">{formatDate(item.monitoring_date)}</td>
                                            <td className="px-3 py-2.5">
                                                <span className="flex items-center gap-2 text-xs text-slate-700">
                                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[8px] font-semibold text-blue-900">
                                                        {(item.recorder?.name || '-').slice(0, 1).toUpperCase()}
                                                    </span>
                                                    {item.recorder?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-right">
                                                <Link
                                                    href={route('assessments.show', item.assessment_id)}
                                                    title="Lihat asesmen"
                                                    aria-label={`Lihat asesmen ${item.assessment_id}`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-blue-800"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col gap-3 px-3 py-2.5 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                        <span>Menampilkan {filteredOutcomes.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredOutcomes.length)} dari {filteredOutcomes.length} debitur dalam pemantauan</span>
                        <div className="flex items-center gap-1 self-end sm:self-auto">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                disabled={currentPage === 1}
                                aria-label="Halaman sebelumnya"
                                className="flex h-7 w-7 items-center justify-center rounded text-slate-600 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={15} />
                            </button>
                            <span className="flex h-7 min-w-7 items-center justify-center rounded bg-white px-2 font-medium text-slate-800">{currentPage}</span>
                            <button
                                type="button"
                                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                disabled={currentPage >= totalPages}
                                aria-label="Halaman berikutnya"
                                className="flex h-7 w-7 items-center justify-center rounded text-slate-600 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronRight size={15} />
                            </button>
                        </div>
                    </div>
                </section>

                <section className="flex flex-col gap-3 rounded-xl bg-indigo-100/80 p-3 sm:flex-row sm:items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[11px] bg-blue-800 text-white">
                        <IconifyIcon icon="mdi:head-lightbulb-outline" width={27} height={27} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-sm font-semibold text-slate-900">Siklus Kalibrasi Model (Y₀ Feedback Loop)</h2>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                            Data kolektibilitas riil secara otomatis dihubungkan dengan model kalibrasi drift untuk menguji validitas prediksi instrumen PCSM-SOPI.
                        </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-indigo-200/80 px-2.5 py-1 text-[10px] font-medium text-slate-700">Y₀ Feedback</span>
                    <Link href={route('calibration.index')} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-900 hover:text-blue-700">
                        Buka Parameter Drift <ExternalLink size={13} />
                    </Link>
                </section>

                {/* Modal Input */}
                    {showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <div className="fixed inset-0 bg-black/40" onClick={() => setShowModal(false)} />
                            <div className="relative bg-white rounded-xl shadow-lg w-full max-w-lg p-6 z-10">
                                <h3 className="text-lg font-bold mb-1">Catat Kolektibilitas Pascakredit (Y₀)</h3>
                                <p className="text-xs text-gray-500 mb-4">Pilih debitur yang sudah menerima fasilitas kredit dan masukkan status kolektibilitas terkininya.</p>

                                <form onSubmit={submit} className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Pilih Asesmen / Debitur</label>
                                        <select
                                            value={data.assessment_id}
                                            onChange={(e) => setData('assessment_id', e.target.value)}
                                            className="w-full text-xs rounded-lg border-gray-300"
                                        >
                                            <option value="">-- Pilih Debitur --</option>
                                            {assessments.map(a => (
                                                <option key={a.id} value={a.id}>
                                                    #{a.id} - {a.borrower?.name} (NIK: {a.borrower?.nik})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.assessment_id && <p className="text-[11px] text-red-600 mt-1">{errors.assessment_id}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status Kolektibilitas</label>
                                        <select
                                            value={data.collectibility_status}
                                            onChange={(e) => setData('collectibility_status', e.target.value)}
                                            className="w-full text-xs rounded-lg border-gray-300"
                                        >
                                            <option value="Kol 1 (Lancar)">Kol 1 (Lancar)</option>
                                            <option value="Kol 2 (DPK)">Kol 2 (Dalam Perhatian Khusus - DPK)</option>
                                            <option value="Kol 3 (Kurang Lancar)">Kol 3 (Kurang Lancar)</option>
                                            <option value="Kol 4 (Diragukan)">Kol 4 (Diragukan)</option>
                                            <option value="Kol 5 (Macet)">Kol 5 (Macet)</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hari Tunggakan (DPD)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.dpd_days}
                                                onChange={(e) => setData('dpd_days', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Baki Debet / Outstanding (Rp)</label>
                                            <input
                                                type="number"
                                                value={data.outstanding_balance}
                                                onChange={(e) => setData('outstanding_balance', e.target.value)}
                                                placeholder="Contoh: 50000000"
                                                className="w-full text-xs rounded-lg border-gray-300"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tanggal Pemantauan</label>
                                        <input
                                            type="date"
                                            value={data.monitoring_date}
                                            onChange={(e) => setData('monitoring_date', e.target.value)}
                                            className="w-full text-xs rounded-lg border-gray-300"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Catatan Analisis Risiko</label>
                                        <textarea
                                            rows="2"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Catatan perkembangan pembayaran cicilan atau kendala usaha..."
                                            className="w-full text-xs rounded-lg border-gray-300"
                                        ></textarea>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                                        >
                                            Simpan Data (Y₀)
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

            </div>
        </AuthenticatedLayout>
    );
}
