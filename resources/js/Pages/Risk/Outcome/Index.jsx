import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Index({ outcomes = [], assessments = [], stats = {}, canRecord = false }) {
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        assessment_id: '',
        collectibility_status: 'Kol 1 (Lancar)',
        dpd_days: 0,
        outstanding_balance: '',
        monitoring_date: new Date().toISOString().substring(0, 10),
        notes: '',
    });

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
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Monitoring Kolektibilitas Pascakredit (Y₀)</h2>}>
            <Head title="Monitoring Kolektibilitas" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Outcome Monitoring Kolektibilitas (Y₀)</h3>
                            <p className="text-sm text-gray-500">
                                Catatan berkala status kredit riil pascacair oleh Unit Manajemen Risiko untuk kalibrasi dan validasi model psikometrik.
                            </p>
                        </div>
                        {canRecord && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
                            >
                                + Catat Status Kolektibilitas
                            </button>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                            <div className="text-2xl">📊</div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{stats.total_monitored ?? 0}</div>
                                <div className="text-xs text-gray-500">Debitur Dimonitor</div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm flex items-center gap-3">
                            <div className="text-2xl">✅</div>
                            <div>
                                <div className="text-2xl font-bold text-emerald-700">{stats.lancar ?? 0}</div>
                                <div className="text-xs text-gray-500">Kol 1 (Lancar)</div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-sm flex items-center gap-3">
                            <div className="text-2xl">⚠️</div>
                            <div>
                                <div className="text-2xl font-bold text-amber-700">{stats.dpk ?? 0}</div>
                                <div className="text-xs text-gray-500">Kol 2 (DPK)</div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-red-100 bg-red-50/20 shadow-sm flex items-center gap-3">
                            <div className="text-2xl">❌</div>
                            <div>
                                <div className="text-2xl font-bold text-rose-700">{stats.npl ?? 0}</div>
                                <div className="text-xs text-gray-500">NPL (Kol 3 - 5)</div>
                            </div>
                        </div>
                    </div>

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

                    {/* Table */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-xl border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50/80">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">ID / Debitur</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status Kolektibilitas</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">DPD</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Tanggal Monitoring</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Petugas Pemantau</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {outcomes.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">
                                            Belum ada data monitoring kolektibilitas kredit pascacair yang dicatat.
                                        </td>
                                    </tr>
                                ) : (
                                    outcomes.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/60 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">
                                                    {item.assessment?.borrower?.name}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Asesmen #{item.assessment_id} | NIK: {item.assessment?.borrower?.nik}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    item.is_npl ? 'bg-red-100 text-red-800' :
                                                    item.collectibility_status.includes('Lancar') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {item.collectibility_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs">
                                                {item.dpd_days} hari
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-600">
                                                {new Date(item.monitoring_date).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-600">
                                                {item.recorder?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs font-semibold">
                                                <Link
                                                    href={route('assessments.show', item.assessment_id)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    Lihat Asesmen &rarr;
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
