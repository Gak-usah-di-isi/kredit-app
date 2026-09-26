import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ activeModel, activeParams, allVersions = [], driftStats = {}, canManage = false }) {
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        version_name: '',
        description: '',
        pfr_p25: activeParams?.pfr_p25 ?? 60,
        pfr_p75: activeParams?.pfr_p75 ?? 75,
        ssr_p25: activeParams?.ssr_p25 ?? 50,
        ssr_p75: activeParams?.ssr_p75 ?? 70,
        sd_p75: activeParams?.sd_p75 ?? 75,
        sd_p90: activeParams?.sd_p90 ?? 85,
        straightline_threshold: activeParams?.straightline_threshold ?? 0.80,
        low_variability_threshold: activeParams?.low_variability_threshold ?? 0.50,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('calibration.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            }
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Parameter Kalibrasi & Drift Skor (Step 11)</h2>}>
            <Head title="Parameter Kalibrasi" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Konfigurasi Model & Rekalibrasi Parameter</h3>
                            <p className="text-sm text-gray-500">
                                Evaluasi pergeseran distribusi skor (score drift) dan kelola ambang batas persentil (P₂₅, P₇₅, P₉₀).
                            </p>
                        </div>
                        {canManage && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
                            >
                                + Rekalibrasi Model Baru
                            </button>
                        )}
                    </div>

                    {/* Active Parameter Card */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between border-b pb-4 mb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-base font-bold text-gray-900">Versi Model Aktif: {activeModel?.version || 'Default'}</h4>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                                        Active
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{activeModel?.description || 'Model PCSM-SOPI BPR standar'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="text-gray-400 block font-semibold uppercase">PFR Threshold</span>
                                <div className="text-sm font-bold text-gray-900 mt-1">
                                    P₂₅: {activeParams?.pfr_p25} | P₇₅: {activeParams?.pfr_p75}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="text-gray-400 block font-semibold uppercase">SSR Threshold</span>
                                <div className="text-sm font-bold text-gray-900 mt-1">
                                    P₂₅: {activeParams?.ssr_p25} | P₇₅: {activeParams?.ssr_p75}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="text-gray-400 block font-semibold uppercase">SD Kredibilitas</span>
                                <div className="text-sm font-bold text-gray-900 mt-1">
                                    P₇₅: {activeParams?.sd_p75} | P₉₀: {activeParams?.sd_p90}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="text-gray-400 block font-semibold uppercase">Straightlining & Var</span>
                                <div className="text-sm font-bold text-gray-900 mt-1">
                                    Ratio: {activeParams?.straightline_threshold} | Min SD: {activeParams?.low_variability_threshold}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Drift Score Real-Time Analysis */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                    Analisis Drift Skor Populasi (Live Monitoring)
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Perbandingan parameter model saat ini vs distribusi riil dari total {driftStats.total_scored ?? 0} asesmen yang telah selesai.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* PFR Drift */}
                            <div className="border rounded-xl p-4 bg-gray-50/50">
                                <span className="text-xs font-bold text-gray-700 uppercase">PFR (Financial)</span>
                                <div className="mt-2 space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Rata-rata Skor:</span>
                                        <span className="font-bold text-gray-900">{driftStats.pfr_avg}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">P₂₅ Riil vs Model:</span>
                                        <span className="font-bold text-blue-700">{driftStats.real_pfr_p25} vs {activeParams?.pfr_p25}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">P₇₅ Riil vs Model:</span>
                                        <span className="font-bold text-blue-700">{driftStats.real_pfr_p75} vs {activeParams?.pfr_p75}</span>
                                    </div>
                                </div>
                            </div>

                            {/* SSR Drift */}
                            <div className="border rounded-xl p-4 bg-gray-50/50">
                                <span className="text-xs font-bold text-gray-700 uppercase">SSR (Sustainability)</span>
                                <div className="mt-2 space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Rata-rata Skor:</span>
                                        <span className="font-bold text-gray-900">{driftStats.ssr_avg}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">P₂₅ Riil vs Model:</span>
                                        <span className="font-bold text-blue-700">{driftStats.real_ssr_p25} vs {activeParams?.ssr_p25}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">P₇₅ Riil vs Model:</span>
                                        <span className="font-bold text-blue-700">{driftStats.real_ssr_p75} vs {activeParams?.ssr_p75}</span>
                                    </div>
                                </div>
                            </div>

                            {/* SD Drift */}
                            <div className="border rounded-xl p-4 bg-gray-50/50">
                                <span className="text-xs font-bold text-gray-700 uppercase">SD (Social Desirability)</span>
                                <div className="mt-2 space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Rata-rata Skor:</span>
                                        <span className="font-bold text-gray-900">{driftStats.sd_avg}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">P₇₅ Riil vs Model:</span>
                                        <span className="font-bold text-blue-700">{driftStats.real_sd_p75} vs {activeParams?.sd_p75}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">P₉₀ Riil vs Model:</span>
                                        <span className="font-bold text-blue-700">{driftStats.real_sd_p90} vs {activeParams?.sd_p90}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Rekalibrasi Baru */}
                    {showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <div className="fixed inset-0 bg-black/40" onClick={() => setShowModal(false)} />
                            <div className="relative bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 z-10 max-h-[90vh] overflow-y-auto">
                                <h3 className="text-lg font-bold mb-1">Buat Versi Model & Kalibrasi Baru</h3>
                                <p className="text-xs text-gray-500 mb-4">
                                    Mendefinisikan parameter persentil baru hasil rekalibrasi statistik empiris BPR. Versi aktif sebelumnya otomatis dinonaktifkan.
                                </p>

                                <form onSubmit={submit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nama Versi Model</label>
                                            <input
                                                type="text"
                                                value={data.version_name}
                                                onChange={(e) => setData('version_name', e.target.value)}
                                                placeholder="Contoh: v1.1-2026-Q3"
                                                className="w-full text-xs rounded-lg border-gray-300"
                                            />
                                            {errors.version_name && <p className="text-[11px] text-red-600 mt-1">{errors.version_name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Keterangan / Rationale</label>
                                            <input
                                                type="text"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Penyesuaian batas P75 pasca semester 1"
                                                className="w-full text-xs rounded-lg border-gray-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-3 bg-gray-50 rounded-xl space-y-3">
                                        <div className="text-xs font-bold text-gray-700 uppercase">Ambang Batas Dimensi (Skala 0-100)</div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div>
                                                <label className="block text-[11px] text-gray-600 mb-1">PFR P₂₅</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={data.pfr_p25}
                                                    onChange={(e) => setData('pfr_p25', e.target.value)}
                                                    className="w-full text-xs rounded-lg border-gray-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] text-gray-600 mb-1">PFR P₇₅</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={data.pfr_p75}
                                                    onChange={(e) => setData('pfr_p75', e.target.value)}
                                                    className="w-full text-xs rounded-lg border-gray-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] text-gray-600 mb-1">SSR P₂₅</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={data.ssr_p25}
                                                    onChange={(e) => setData('ssr_p25', e.target.value)}
                                                    className="w-full text-xs rounded-lg border-gray-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] text-gray-600 mb-1">SSR P₇₅</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={data.ssr_p75}
                                                    onChange={(e) => setData('ssr_p75', e.target.value)}
                                                    className="w-full text-xs rounded-lg border-gray-300"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-gray-50 rounded-xl space-y-3">
                                        <div className="text-xs font-bold text-gray-700 uppercase">Parameter Kredibilitas & Flag</div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div>
                                                <label className="block text-[11px] text-gray-600 mb-1">SD P₇₅ (Elevated)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={data.sd_p75}
                                                    onChange={(e) => setData('sd_p75', e.target.value)}
                                                    className="w-full text-xs rounded-lg border-gray-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] text-gray-600 mb-1">SD P₉₀ (High)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={data.sd_p90}
                                                    onChange={(e) => setData('sd_p90', e.target.value)}
                                                    className="w-full text-xs rounded-lg border-gray-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] text-gray-600 mb-1">Straightlining Ratio</label>
                                                <input
                                                    type="number"
                                                    step="0.05"
                                                    value={data.straightline_threshold}
                                                    onChange={(e) => setData('straightline_threshold', e.target.value)}
                                                    className="w-full text-xs rounded-lg border-gray-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] text-gray-600 mb-1">Min Variabilitas SD</label>
                                                <input
                                                    type="number"
                                                    step="0.05"
                                                    value={data.low_variability_threshold}
                                                    onChange={(e) => setData('low_variability_threshold', e.target.value)}
                                                    className="w-full text-xs rounded-lg border-gray-300"
                                                />
                                            </div>
                                        </div>
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
                                            Simpan & Aktifkan Versi
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
