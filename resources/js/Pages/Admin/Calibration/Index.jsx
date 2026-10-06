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

    // Helper: progress bar visual
    const ProgressBar = ({ value, max, color, bgClass = 'bg-gray-200' }) => {
        const pct = Math.min(Math.max((value / max) * 100, 0), 100);
        return (
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
        );
    };

    // Sample count fallback
    const sampleCount = driftStats.total_scored ?? 0;
    const lastCalibration = activeModel?.calibrated_at
        ? new Date(activeModel.calibrated_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Belum ada kalibrasi';

    // Real drift stats from controller
    const realPfrP25 = driftStats.real_pfr_p25 ?? 0;
    const realPfrP75 = driftStats.real_pfr_p75 ?? 0;
    const realSsrP25 = driftStats.real_ssr_p25 ?? 0;
    const realSsrP75 = driftStats.real_ssr_p75 ?? 0;
    const realSdP75 = driftStats.real_sd_p75 ?? 0;
    const realSdP90 = driftStats.real_sd_p90 ?? 0;
    const pfrAvg = driftStats.pfr_avg ?? 0;
    const ssrAvg = driftStats.ssr_avg ?? 0;
    const sdAvg = driftStats.sd_avg ?? 0;

    // Calculate drift percentages
    const getDriftPct = (realVal, modelVal) => {
        if (!modelVal || modelVal === 0) return 0;
        return Number(((realVal - modelVal) / modelVal * 100).toFixed(2));
    };

    const pfrP25Drift = getDriftPct(realPfrP25, activeParams?.pfr_p25);
    const pfrP75Drift = getDriftPct(realPfrP75, activeParams?.pfr_p75);
    const ssrP25Drift = getDriftPct(realSsrP25, activeParams?.ssr_p25);
    const ssrP75Drift = getDriftPct(realSsrP75, activeParams?.ssr_p75);
    const sdP75Drift = getDriftPct(realSdP75, activeParams?.sd_p75);
    const sdP90Drift = getDriftPct(realSdP90, activeParams?.sd_p90);

    // Determine drift status badges
    const getDriftBadge = (pct) => {
        if (pct > 10) return { label: 'Attention Required', className: 'bg-rose-100 text-rose-700 ring-rose-200' };
        if (pct > 5) return { label: `+${pct}% Drift`, className: 'bg-amber-100 text-amber-700 ring-amber-200' };
        if (pct < -5) return { label: `${pct}% Drift`, className: 'bg-blue-100 text-blue-700 ring-blue-200' };
        return { label: 'Stable Drift', className: 'bg-emerald-100 text-emerald-700 ring-emerald-200' };
    };

    const pfrP25Badge = getDriftBadge(pfrP25Drift);
    const pfrP75Badge = getDriftBadge(pfrP75Drift);
    const ssrP25Badge = getDriftBadge(ssrP25Drift);
    const ssrP75Badge = getDriftBadge(ssrP75Drift);
    const sdP75Badge = getDriftBadge(sdP75Drift);
    const sdP90Badge = getDriftBadge(sdP90Drift);

    // Overall drift check for recommendation banner
    const maxDrift = Math.max(
        Math.abs(pfrP25Drift), Math.abs(pfrP75Drift),
        Math.abs(ssrP25Drift), Math.abs(ssrP75Drift),
        Math.abs(sdP75Drift), Math.abs(sdP90Drift)
    );
    const needsRecalibration = maxDrift > 10 && sampleCount >= 30;
    const needsAttention = maxDrift > 10;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Parameter Kalibrasi & Drift Skor (Step 11)</h2>}>
            <Head title="Parameter Kalibrasi" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* ===== HEADER HALAMAN ===== */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                Konfigurasi Model & Rekalibrasi Parameter
                            </h3>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Evaluasi pergeseran distribusi skor (score drift) dan kelola ambang batas persentil (P25, P75, P90).
                            </p>
                        </div>
                        {canManage && (
                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 active:scale-[0.98] transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                + Rekalibrasi Model Baru
                            </button>
                        )}
                    </div>

                    {/* ===== CARD VERSI MODEL AKTIF ===== */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-sm font-bold text-gray-900">
                                            Versi Model Aktif: <span className="text-gray-600 font-normal">{activeModel?.version || 'PCSM-SOPI v1.0'}</span>
                                        </h4>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Active
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1.5 max-w-md">
                                        Initial implementation of Psychometric Credit Scoring & Sustainability-Oriented Personality Index
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[11px] text-gray-400 block">Kalibrasi Terakhir</span>
                                    <span className="text-xs font-semibold text-gray-700">{lastCalibration}</span>
                                </div>
                            </div>
                        </div>

                        {/* Grid 4 Kolom Thresholds */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
                            {/* PFR Threshold */}
                            <div className="p-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">PFR Threshold</span>
                                <div className="mt-2 text-center">
                                    <div className="text-lg font-extrabold text-gray-900">
                                        P25: <span className="text-gray-500">{activeParams?.pfr_p25}</span>
                                        <span className="mx-1 text-gray-300">|</span>
                                        P75: <span className="text-gray-500">{activeParams?.pfr_p75}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Financial Reliability baseline</p>
                                </div>
                            </div>
                            {/* SSR Threshold */}
                            <div className="p-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">SSR Threshold</span>
                                <div className="mt-2 text-center">
                                    <div className="text-lg font-extrabold text-gray-900">
                                        P25: <span className="text-gray-500">{activeParams?.ssr_p25}</span>
                                        <span className="mx-1 text-gray-300">|</span>
                                        P75: <span className="text-gray-500">{activeParams?.ssr_p75}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Sustainability & Green habit</p>
                                </div>
                            </div>
                            {/* SD Kredibilitas */}
                            <div className="p-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">SD Kredibilitas</span>
                                <div className="mt-2 text-center">
                                    <div className="text-lg font-extrabold text-gray-900">
                                        P75: <span className="text-gray-500">{activeParams?.sd_p75}</span>
                                        <span className="mx-1 text-gray-300">|</span>
                                        P90: <span className="text-gray-500">{activeParams?.sd_p90}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Social Desirability cutoff</p>
                                </div>
                            </div>
                            {/* Straightlining & Var */}
                            <div className="p-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Straightling & Var</span>
                                <div className="mt-2 text-center">
                                    <div className="text-lg font-extrabold text-gray-900">
                                        Ratio: <span className="text-gray-500">{activeParams?.straightline_threshold}</span>
                                        <span className="mx-1 text-gray-300">|</span>
                                        Min SD: <span className="text-gray-500">{activeParams?.low_variability_threshold}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Response consistency filter</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== SEKSI ANALISIS DRIFT SKOR POPULASI (LIVE MONITORING) ===== */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
                        {/* Section Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-2">
                                {/* Live indicator */}
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                                </span>
                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">
                                    Analisis Drift Skor Populasi (Live Monitoring)
                                </h4>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="hidden sm:inline text-xs text-gray-400">Sampel:</span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 ring-1 ring-gray-200">
                                    N = {sampleCount} Nasabah Selesai
                                </span>
                            </div>
                        </div>

                        {/* Subtitle */}
                        <div className="px-6 pt-4 pb-2">
                            <p className="text-xs text-gray-500">
                                Perbandingan parameter model saat ini vs distribusi riil dari asesmen yang telah selesai.
                            </p>
                        </div>

                        {/* Grid 3 Card Metrik */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-6 pb-6">

                            {/* --- PFR (FINANCIAL) --- */}
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="px-4 pt-4 pb-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-700 uppercase">PFR (Financial)</span>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ring-1 ${pfrP25Badge.className}`}>
                                            {pfrP25Badge.label}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-baseline gap-1">
                                        <span className="text-3xl font-extrabold text-gray-900">{pfrAvg.toFixed(2)}</span>
                                        <span className="text-xs text-gray-400 ml-1">Rata-rata Skor</span>
                                    </div>
                                </div>

                                <div className="px-4 pb-4 space-y-3">
                                    {/* P25 Comparison */}
                                    <div>
                                        <div className="flex justify-between text-[11px] mb-1">
                                            <span className="text-gray-500">P25 Riil vs Model</span>
                                            <span className="font-semibold text-gray-700">{realPfrP25.toFixed(2)} <span className="text-gray-400 mx-0.5">vs</span> {activeParams?.pfr_p25}</span>
                                        </div>
                                        <ProgressBar value={realPfrP25} max={100} color="bg-indigo-500" />
                                    </div>
                                    {/* P75 Comparison */}
                                    <div>
                                        <div className="flex justify-between text-[11px] mb-1">
                                            <span className="text-gray-500">P75 Riil vs Model</span>
                                            <span className="font-semibold text-gray-700">{realPfrP75.toFixed(2)} <span className="text-gray-400 mx-0.5">vs</span> {activeParams?.pfr_p75}</span>
                                        </div>
                                        <ProgressBar value={realPfrP75} max={100} color="bg-indigo-400" />
                                    </div>
                                </div>

                                {/* Footer Info */}
                                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                                        {pfrP25Drift > 10 ? 'Perlu Perhatian' : pfrP25Drift > 5 ? 'Drift Positif' : 'Normal'}
                                    </span>
                                    <span className="text-[10px] font-mono font-semibold text-gray-500">
                                        Drift P25: {pfrP25Drift > 0 ? '+' : ''}{pfrP25Drift}%
                                    </span>
                                </div>
                            </div>

                            {/* --- SSR (SUSTAINABILITY) --- */}
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="px-4 pt-4 pb-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-700 uppercase">SSR (Sustainability)</span>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ring-1 ${ssrP25Badge.className}`}>
                                            {ssrP25Badge.label}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-baseline gap-1">
                                        <span className="text-3xl font-extrabold text-gray-900">{ssrAvg.toFixed(2)}</span>
                                        <span className="text-xs text-gray-400 ml-1">Rata-rata Skor</span>
                                    </div>
                                </div>

                                <div className="px-4 pb-4 space-y-3">
                                    {/* P25 Comparison */}
                                    <div>
                                        <div className="flex justify-between text-[11px] mb-1">
                                            <span className="text-gray-500">P25 Riil vs Model</span>
                                            <span className="font-semibold text-gray-700">{realSsrP25.toFixed(2)} <span className="text-gray-400 mx-0.5">vs</span> {activeParams?.ssr_p25}</span>
                                        </div>
                                        <ProgressBar value={realSsrP25} max={100} color="bg-emerald-500" />
                                    </div>
                                    {/* P75 Comparison */}
                                    <div>
                                        <div className="flex justify-between text-[11px] mb-1">
                                            <span className="text-gray-500">P75 Riil vs Model</span>
                                            <span className="font-semibold text-gray-700">{realSsrP75.toFixed(2)} <span className="text-gray-400 mx-0.5">vs</span> {activeParams?.ssr_p75}</span>
                                        </div>
                                        <ProgressBar value={realSsrP75} max={100} color="bg-emerald-400" />
                                    </div>
                                </div>

                                {/* Footer Info */}
                                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                                        {ssrP25Drift > 10 ? 'Perlu Perhatian' : ssrP25Drift > 5 ? 'Drift Positif' : 'Normal'}
                                    </span>
                                    <span className="text-[10px] font-mono font-semibold text-gray-500">
                                        Drift P25: {ssrP25Drift > 0 ? '+' : ''}{ssrP25Drift}%
                                    </span>
                                </div>
                            </div>

                            {/* --- SD (SOCIAL DESIRABILITY) --- */}
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="px-4 pt-4 pb-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-700 uppercase">SD (Social Desirability)</span>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ring-1 ${sdP75Badge.className}`}>
                                            {sdP75Badge.label}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-baseline gap-1">
                                        <span className="text-3xl font-extrabold text-gray-900">{sdAvg.toFixed(2)}</span>
                                        <span className="text-xs text-gray-400 ml-1">Rata-rata Skor</span>
                                    </div>
                                </div>

                                <div className="px-4 pb-4 space-y-3">
                                    {/* P75 Comparison */}
                                    <div>
                                        <div className="flex justify-between text-[11px] mb-1">
                                            <span className="text-gray-500">P75 Riil vs Model</span>
                                            <span className="font-semibold text-gray-700">{realSdP75.toFixed(2)} <span className="text-gray-400 mx-0.5">vs</span> {activeParams?.sd_p75}</span>
                                        </div>
                                        <ProgressBar value={realSdP75} max={100} color="bg-rose-500" />
                                    </div>
                                    {/* P90 Comparison */}
                                    <div>
                                        <div className="flex justify-between text-[11px] mb-1">
                                            <span className="text-gray-500">P90 Riil vs Model</span>
                                            <span className="font-semibold text-gray-700">{realSdP90.toFixed(2)} <span className="text-gray-400 mx-0.5">vs</span> {activeParams?.sd_p90}</span>
                                        </div>
                                        <ProgressBar value={realSdP90} max={100} color="bg-rose-400" />
                                    </div>
                                </div>

                                {/* Footer Info */}
                                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                                        {sdP75Drift > 10 ? 'Kecenderungan Faking Good' : sdP75Drift > 5 ? 'Drift Positif' : 'Normal'}
                                    </span>
                                    <span className="text-[10px] font-mono font-semibold text-gray-500">
                                        Drift P75: {sdP75Drift > 0 ? '+' : ''}{sdP75Drift}%
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* ===== BANNER REKOMENDASI AMBANG BATAS OTOMATIS ===== */}
                    {needsAttention && (
                        <div className={`rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 ${
                            needsRecalibration 
                                ? 'bg-rose-50 border border-rose-200' 
                                : 'bg-amber-50 border border-amber-200'
                        }`}>
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                            </div>
                            <p className={`text-sm flex-1 ${
                                needsRecalibration ? 'text-rose-800' : 'text-amber-800'
                            }`}>
                                {needsRecalibration ? (
                                    <>
                                        Terdapat <span className="font-semibold">pergeseran signifikan (&gt;10%)</span> pada parameter model 
                                        dengan {sampleCount} asesmen terkumpul. 
                                        <strong>Disarankan melakukan rekalibrasi model segera.</strong>
                                    </>
                                ) : (
                                    <>
                                        Terdapat <span className="font-semibold">pergeseran parameter (&gt;10%)</span> yang perlu dipantau. 
                                        Disarankan rekalibrasi setelah minimal 30 asesmen terkumpul 
                                        (saat ini: {sampleCount}).
                                    </>
                                )}
                            </p>
                            <button
                                type="button"
                                className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition shadow-sm ${
                                    needsRecalibration
                                        ? 'border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 hover:border-rose-400'
                                        : 'border border-amber-300 bg-white text-amber-700 hover:bg-amber-50 hover:border-amber-400'
                                }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                Unduh Log Audit (CSV)
                            </button>
                        </div>
                    )}

                    {/* ===== MODAL REKALIBRASI BARU (tidak berubah struktur handler) ===== */}
                    {showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <div className="fixed inset-0 bg-black/40" onClick={() => setShowModal(false)} />
                            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 z-10 max-h-[90vh] overflow-y-auto">
                                <h3 className="text-base font-bold text-gray-900 mb-1">Buat Versi Model & Kalibrasi Baru</h3>
                                <p className="text-xs text-gray-500 mb-5">
                                    Mendefinisikan parameter persentil baru hasil rekalibrasi statistik empiris BPR. Versi aktif sebelumnya otomatis dinonaktifkan.
                                </p>

                                <form onSubmit={submit} className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nama Versi Model</label>
                                            <input
                                                type="text"
                                                value={data.version_name}
                                                onChange={(e) => setData('version_name', e.target.value)}
                                                placeholder="Contoh: v1.1-2026-Q3"
                                                className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                                className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                                        <div className="text-xs font-bold text-gray-700 uppercase">Ambang Batas Dimensi (Skala 0-100)</div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div>
                                                <label className="block text-[11px] text-gray-600 mb-1">PFR P25</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={data.pfr_p25}
                                                    onChange={(e) => setData('pfr_p25', e.target.value)}
                                                    className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] text-gray-600 mb-1">PFR P75</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={data.pfr_p75}
                                                    onChange={(e) => setData('pfr_p75', e.target.value)}
                                                    className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] text-gray-600 mb-1">SSR P25</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={data.ssr_p25}
                                                    onChange={(e) => setData('ssr_p25', e.target.value)}
                                                    className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] text-gray-600 mb-1">SSR P75</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={data.ssr_p75}
                                                    onChange={(e) => setData('ssr_p75', e.target.value)}
                                                    className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                                        <div className="text-xs font-bold text-gray-700 uppercase">Parameter Kredibilitas & Flag</div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div>
                                                <label className="block text-[11px] text-gray-600 mb-1">SD P75 (Elevated)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={data.sd_p75}
                                                    onChange={(e) => setData('sd_p75', e.target.value)}
                                                    className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] text-gray-600 mb-1">SD P90 (High)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={data.sd_p90}
                                                    onChange={(e) => setData('sd_p90', e.target.value)}
                                                    className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] text-gray-600 mb-1">Straightlining Ratio</label>
                                                <input
                                                    type="number"
                                                    step="0.05"
                                                    value={data.straightline_threshold}
                                                    onChange={(e) => setData('straightline_threshold', e.target.value)}
                                                    className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] text-gray-600 mb-1">Min Variabilitas SD</label>
                                                <input
                                                    type="number"
                                                    step="0.05"
                                                    value={data.low_variability_threshold}
                                                    onChange={(e) => setData('low_variability_threshold', e.target.value)}
                                                    className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition shadow-sm"
                                        >
                                            {processing ? 'Menyimpan...' : 'Simpan & Aktifkan Versi'}
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
