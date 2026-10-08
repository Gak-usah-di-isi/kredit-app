import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Icon } from '@iconify/react';

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

    // Helper: dual drift bar (model base vs real distribution)
    const DriftBar = ({ real, model, color }) => {
        const clamp = (v) => Math.min(Math.max(v, 0), 100);
        return (
            <div className="w-full h-2 rounded-full bg-surface-container-high relative overflow-hidden">
                <div
                    className="absolute left-0 top-0 h-full bg-outline-variant rounded-full"
                    style={{ width: `${clamp(model)}%` }}
                />
                <div
                    className={`absolute left-0 top-0 h-full rounded-full opacity-80 ${color}`}
                    style={{ width: `${clamp(real)}%` }}
                />
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
        if (pct > 10) return { label: 'Attention Required', className: 'bg-error-container text-on-error-container' };
        if (pct > 5) return { label: `+${pct}% Drift`, className: 'bg-primary-fixed text-primary' };
        if (pct < -5) return { label: `${pct}% Drift`, className: 'bg-primary-fixed text-primary' };
        return { label: 'Stable Drift', className: 'bg-secondary-fixed text-on-secondary-fixed' };
    };

    const pfrP25Badge = getDriftBadge(pfrP25Drift);
    const ssrP25Badge = getDriftBadge(ssrP25Drift);
    const sdP75Badge = getDriftBadge(sdP75Drift);

    // Overall drift check for recommendation banner
    const maxDrift = Math.max(
        Math.abs(pfrP25Drift), Math.abs(pfrP75Drift),
        Math.abs(ssrP25Drift), Math.abs(ssrP75Drift),
        Math.abs(sdP75Drift), Math.abs(sdP90Drift)
    );
    const needsRecalibration = maxDrift > 10 && sampleCount >= 30;
    const needsAttention = maxDrift > 10;

    const fmtDrift = (pct) => `${pct > 0 ? '+' : ''}${pct}%`;

    return (
        <AuthenticatedLayout>
            <Head title="Parameter Kalibrasi" />

            <div className="w-full min-h-full bg-background font-body-md text-on-surface">
                <div className="flex flex-col w-full gap-space-lg px-space-lg py-space-md pb-12">
                    {/* ===== HEADER HALAMAN ===== */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                        <div>
                            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                                Parameter Kalibrasi &amp; Drift Skor (Step 11)
                            </h1>
                            <p className="font-headline-md text-headline-md font-semibold text-on-surface-variant mt-1">
                                Konfigurasi Model &amp; Rekalibrasi Parameter
                            </p>
                            <p className="font-body-md text-body-md text-outline mt-1">
                                Evaluasi pergeseran distribusi skor (score drift) dan kelola ambang batas persentil (P<sub>25</sub>, P<sub>75</sub>, P<sub>90</sub>).
                            </p>
                        </div>
                        {canManage && (
                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-semibold transition-all shadow-md active:scale-95 shrink-0"
                            >
                                <Icon icon="solar:chart-2-bold-duotone" className="w-[18px] h-[18px]" />
                                + Rekalibrasi Model Baru
                            </button>
                        )}
                    </div>

                    {/* ===== CARD VERSI MODEL AKTIF ===== */}
                    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                                        <Icon icon="solar:tuning-2-outline" className="w-[18px] h-[18px]" />
                                    </div>
                                    <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                                        Versi Model Aktif: {activeModel?.version || 'PCSM-SOPI v1.0'}
                                    </h2>
                                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[10px] font-bold uppercase tracking-wider">
                                        Active
                                    </span>
                                </div>
                                <p className="font-body-md text-body-md text-outline mt-2 md:pl-11">
                                    Initial implementation of Psychometric Credit Scoring &amp; Sustainability-Oriented Personality Index
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-outline-variant text-label-sm font-label-sm bg-surface-container-low px-3 py-1.5 rounded-lg self-start md:self-auto">
                                <Icon icon="solar:history-outline" className="w-[15px] h-[15px] text-secondary" />
                                <span className="text-on-surface-variant font-medium">Kalibrasi Terakhir: {lastCalibration}</span>
                            </div>
                        </div>

                        {/* 4 Metric Highlight Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                            {/* Box 1: PFR Threshold */}
                            <div className="bg-surface-container-low rounded-xl p-4 transition-all hover:bg-surface-container/60">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-label-sm text-label-sm uppercase font-semibold text-outline tracking-wider">
                                        PFR Threshold
                                    </span>
                                    <Icon icon="solar:wallet-money-bold-duotone" className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex items-baseline gap-1.5 flex-wrap">
                                    <span className="font-headline-md text-headline-md font-bold text-on-surface">
                                        P<sub>25</sub>: {activeParams?.pfr_p25}
                                    </span>
                                    <span className="text-outline text-body-sm font-body-sm">|</span>
                                    <span className="font-headline-md text-headline-md font-bold text-on-surface">
                                        P<sub>75</sub>: {activeParams?.pfr_p75}
                                    </span>
                                </div>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Financial Reliability baseline</p>
                            </div>

                            {/* Box 2: SSR Threshold */}
                            <div className="bg-surface-container-low rounded-xl p-4 transition-all hover:bg-surface-container/60">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-label-sm text-label-sm uppercase font-semibold text-outline tracking-wider">
                                        SSR Threshold
                                    </span>
                                    <Icon icon="solar:leaf-outline" className="w-4 h-4 text-secondary" />
                                </div>
                                <div className="flex items-baseline gap-1.5 flex-wrap">
                                    <span className="font-headline-md text-headline-md font-bold text-on-surface">
                                        P<sub>25</sub>: {activeParams?.ssr_p25}
                                    </span>
                                    <span className="text-outline text-body-sm font-body-sm">|</span>
                                    <span className="font-headline-md text-headline-md font-bold text-on-surface">
                                        P<sub>75</sub>: {activeParams?.ssr_p75}
                                    </span>
                                </div>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Sustainability &amp; Green habit</p>
                            </div>

                            {/* Box 3: SD Kredibilitas */}
                            <div className="bg-surface-container-low rounded-xl p-4 transition-all hover:bg-surface-container/60">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-label-sm text-label-sm uppercase font-semibold text-outline tracking-wider">
                                        SD Kredibilitas
                                    </span>
                                    <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-tertiary-container" />
                                </div>
                                <div className="flex items-baseline gap-1.5 flex-wrap">
                                    <span className="font-headline-md text-headline-md font-bold text-on-surface">
                                        P<sub>75</sub>: {activeParams?.sd_p75}
                                    </span>
                                    <span className="text-outline text-body-sm font-body-sm">|</span>
                                    <span className="font-headline-md text-headline-md font-bold text-on-surface">
                                        P<sub>90</sub>: {activeParams?.sd_p90}
                                    </span>
                                </div>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Social Desirability cutoff</p>
                            </div>

                            {/* Box 4: Straightlining & Var */}
                            <div className="bg-surface-container-low rounded-xl p-4 transition-all hover:bg-surface-container/60">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-label-sm text-label-sm uppercase font-semibold text-outline tracking-wider">
                                        Straightlining &amp; Var
                                    </span>
                                    <Icon icon="solar:graph-up-outline" className="w-4 h-4 text-outline" />
                                </div>
                                <div className="flex items-baseline gap-1.5 flex-wrap">
                                    <span className="font-headline-md text-headline-md font-bold text-on-surface">
                                        Ratio: {activeParams?.straightline_threshold}
                                    </span>
                                    <span className="text-outline text-body-sm font-body-sm">|</span>
                                    <span className="font-headline-md text-headline-md font-bold text-on-surface">
                                        Min SD: {activeParams?.low_variability_threshold}
                                    </span>
                                </div>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Response consistency filter</p>
                            </div>
                        </div>
                    </div>

                    {/* ===== SEKSI ANALISIS DRIFT SKOR POPULASI (LIVE MONITORING) ===== */}
                    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                        {/* Section Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-1">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="font-label-sm text-label-sm uppercase font-bold tracking-wider text-on-surface">
                                        Analisis Drift Skor Populasi (Live Monitoring)
                                    </h2>
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                                    </span>
                                </div>
                                <p className="font-body-sm text-body-sm text-outline mt-0.5">
                                    Perbandingan parameter model saat ini vs distribusi riil dari total {sampleCount} asesmen yang telah selesai.
                                </p>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm self-start md:self-auto">
                                <Icon icon="solar:users-group-two-rounded-outline" className="w-[14px] h-[14px]" />
                                <span>Sampel: <strong className="text-on-surface">N = {sampleCount} Nasabah Selesai</strong></span>
                            </div>
                        </div>

                        {/* Grid 3 Card Metrik */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                            {/* --- PFR (FINANCIAL) --- */}
                            <div className="p-5 rounded-xl bg-gradient-to-b from-surface-container-low to-transparent space-y-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-label-sm text-label-sm uppercase font-bold text-on-surface tracking-wider">
                                            PFR (Financial)
                                        </h3>
                                        <span className="font-body-sm text-body-sm text-outline">Psychometric Financial Readiness</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold ${pfrP25Badge.className}`}>
                                        {pfrP25Badge.label}
                                    </span>
                                </div>
                                <div className="p-3 bg-surface-container-lowest rounded-lg flex items-center justify-between shadow-sm">
                                    <span className="font-body-md text-body-md text-on-surface-variant font-medium">Rata-rata Skor</span>
                                    <span className="font-headline-xl text-headline-xl font-extrabold text-primary tracking-tight">
                                        {pfrAvg.toFixed(2)}
                                    </span>
                                </div>
                                <div className="space-y-3 pt-1">
                                    <div className="space-y-1">
                                        <div className="flex justify-between font-label-md text-label-md">
                                            <span className="text-outline">P<sub>25</sub> Riil vs Model:</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-primary font-data-mono text-data-mono">{realPfrP25.toFixed(2)}</span>
                                                <span className="text-outline text-body-sm">vs</span>
                                                <span className="font-medium text-on-surface font-data-mono text-data-mono">{activeParams?.pfr_p25}</span>
                                            </div>
                                        </div>
                                        <DriftBar real={realPfrP25} model={activeParams?.pfr_p25} color="bg-primary" />
                                        <div className="flex justify-between font-label-sm text-[10px] text-outline">
                                            <span>Model Base ({activeParams?.pfr_p25})</span>
                                            <span className="text-primary font-semibold">Riil ({fmtDrift(pfrP25Drift)})</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 pt-1">
                                        <div className="flex justify-between font-label-md text-label-md">
                                            <span className="text-outline">P<sub>75</sub> Riil vs Model:</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-primary font-data-mono text-data-mono">{realPfrP75.toFixed(2)}</span>
                                                <span className="text-outline text-body-sm">vs</span>
                                                <span className="font-medium text-on-surface font-data-mono text-data-mono">{activeParams?.pfr_p75}</span>
                                            </div>
                                        </div>
                                        <DriftBar real={realPfrP75} model={activeParams?.pfr_p75} color="bg-primary" />
                                        <div className="flex justify-between font-label-sm text-[10px] text-outline">
                                            <span>Model Base ({activeParams?.pfr_p75})</span>
                                            <span className="text-primary font-semibold">Riil ({fmtDrift(pfrP75Drift)})</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant border-t border-surface-container">
                                    <div className="flex items-center gap-1.5">
                                        <Icon icon="solar:graph-up-outline" className="w-4 h-4 text-secondary" />
                                        <span className="font-medium">
                                            {pfrP25Drift > 10 ? 'Perlu Perhatian' : pfrP25Drift > 5 ? 'Drift Positif' : 'Normal'}
                                        </span>
                                    </div>
                                    <span className="font-label-sm text-[10px] text-outline uppercase font-semibold">
                                        Drift P25: {fmtDrift(pfrP25Drift)}
                                    </span>
                                </div>
                            </div>

                            {/* --- SSR (SUSTAINABILITY) --- */}
                            <div className="p-5 rounded-xl bg-gradient-to-b from-surface-container-low to-transparent space-y-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-label-sm text-label-sm uppercase font-bold text-on-surface tracking-wider">
                                            SSR (Sustainability)
                                        </h3>
                                        <span className="font-body-sm text-body-sm text-outline">Sustainability-Oriented Index</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold ${ssrP25Badge.className}`}>
                                        {ssrP25Badge.label}
                                    </span>
                                </div>
                                <div className="p-3 bg-surface-container-lowest rounded-lg flex items-center justify-between shadow-sm">
                                    <span className="font-body-md text-body-md text-on-surface-variant font-medium">Rata-rata Skor</span>
                                    <span className="font-headline-xl text-headline-xl font-extrabold text-secondary tracking-tight">
                                        {ssrAvg.toFixed(2)}
                                    </span>
                                </div>
                                <div className="space-y-3 pt-1">
                                    <div className="space-y-1">
                                        <div className="flex justify-between font-label-md text-label-md">
                                            <span className="text-outline">P<sub>25</sub> Riil vs Model:</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-primary font-data-mono text-data-mono">{realSsrP25.toFixed(2)}</span>
                                                <span className="text-outline text-body-sm">vs</span>
                                                <span className="font-medium text-on-surface font-data-mono text-data-mono">{activeParams?.ssr_p25}</span>
                                            </div>
                                        </div>
                                        <DriftBar real={realSsrP25} model={activeParams?.ssr_p25} color="bg-secondary" />
                                        <div className="flex justify-between font-label-sm text-[10px] text-outline">
                                            <span>Model Base ({activeParams?.ssr_p25})</span>
                                            <span className="text-secondary font-semibold">Riil ({fmtDrift(ssrP25Drift)})</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 pt-1">
                                        <div className="flex justify-between font-label-md text-label-md">
                                            <span className="text-outline">P<sub>75</sub> Riil vs Model:</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-primary font-data-mono text-data-mono">{realSsrP75.toFixed(2)}</span>
                                                <span className="text-outline text-body-sm">vs</span>
                                                <span className="font-medium text-on-surface font-data-mono text-data-mono">{activeParams?.ssr_p75}</span>
                                            </div>
                                        </div>
                                        <DriftBar real={realSsrP75} model={activeParams?.ssr_p75} color="bg-secondary" />
                                        <div className="flex justify-between font-label-sm text-[10px] text-outline">
                                            <span>Model Base ({activeParams?.ssr_p75})</span>
                                            <span className="text-secondary font-semibold">Riil ({fmtDrift(ssrP75Drift)})</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant border-t border-surface-container">
                                    <div className="flex items-center gap-1.5">
                                        <Icon icon="solar:shield-check-bold-duotone" className="w-4 h-4 text-secondary" />
                                        <span className="font-medium">
                                            {ssrP25Drift > 10 ? 'Perlu Perhatian' : ssrP25Drift > 5 ? 'Drift Positif' : 'Performa Sesuai Target'}
                                        </span>
                                    </div>
                                    <span className="font-label-sm text-[10px] text-outline uppercase font-semibold">
                                        Drift P25: {fmtDrift(ssrP25Drift)}
                                    </span>
                                </div>
                            </div>

                            {/* --- SD (SOCIAL DESIRABILITY) --- */}
                            <div className="p-5 rounded-xl bg-gradient-to-b from-surface-container-low to-transparent space-y-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-label-sm text-label-sm uppercase font-bold text-on-surface tracking-wider">
                                            SD (Social Desirability)
                                        </h3>
                                        <span className="font-body-sm text-body-sm text-outline">Lie Scale &amp; Overclaim Detector</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold ${sdP75Badge.className}`}>
                                        {sdP75Badge.label}
                                    </span>
                                </div>
                                <div className="p-3 bg-surface-container-lowest rounded-lg flex items-center justify-between shadow-sm">
                                    <span className="font-body-md text-body-md text-on-surface-variant font-medium">Rata-rata Skor</span>
                                    <span className="font-headline-xl text-headline-xl font-extrabold text-on-error-container tracking-tight">
                                        {sdAvg.toFixed(2)}
                                    </span>
                                </div>
                                <div className="space-y-3 pt-1">
                                    <div className="space-y-1">
                                        <div className="flex justify-between font-label-md text-label-md">
                                            <span className="text-outline">P<sub>75</sub> Riil vs Model:</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-primary font-data-mono text-data-mono">{realSdP75.toFixed(2)}</span>
                                                <span className="text-outline text-body-sm">vs</span>
                                                <span className="font-medium text-on-surface font-data-mono text-data-mono">{activeParams?.sd_p75}</span>
                                            </div>
                                        </div>
                                        <DriftBar real={realSdP75} model={activeParams?.sd_p75} color="bg-error" />
                                        <div className="flex justify-between font-label-sm text-[10px] text-outline">
                                            <span>Model Base ({activeParams?.sd_p75})</span>
                                            <span className="text-error font-semibold">Riil ({fmtDrift(sdP75Drift)})</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 pt-1">
                                        <div className="flex justify-between font-label-md text-label-md">
                                            <span className="text-outline">P<sub>90</sub> Riil vs Model:</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-primary font-data-mono text-data-mono">{realSdP90.toFixed(2)}</span>
                                                <span className="text-outline text-body-sm">vs</span>
                                                <span className="font-medium text-on-surface font-data-mono text-data-mono">{activeParams?.sd_p90}</span>
                                            </div>
                                        </div>
                                        <DriftBar real={realSdP90} model={activeParams?.sd_p90} color="bg-error" />
                                        <div className="flex justify-between font-label-sm text-[10px] text-outline">
                                            <span>Model Base ({activeParams?.sd_p90})</span>
                                            <span className="text-error font-semibold">Riil ({fmtDrift(sdP90Drift)})</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant border-t border-surface-container">
                                    <div className="flex items-center gap-1.5">
                                        <Icon icon="solar:danger-triangle-outline" className="w-4 h-4 text-error" />
                                        <span className="font-medium text-error">
                                            {sdP75Drift > 10 ? 'Kecenderungan Faking Good' : sdP75Drift > 5 ? 'Drift Positif' : 'Normal'}
                                        </span>
                                    </div>
                                    <span className="font-label-sm text-[10px] text-outline uppercase font-semibold">
                                        Drift P75: {fmtDrift(sdP75Drift)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ===== BANNER REKOMENDASI AMBANG BATAS OTOMATIS ===== */}
                        {needsAttention && (
                            <div className="mt-6 p-4 rounded-xl bg-surface-container-low flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-outline shrink-0">
                                        <Icon icon="solar:info-circle-linear" className="w-[18px] h-[18px]" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="font-label-md text-label-md font-semibold text-on-surface">
                                            Rekomendasi Ambang Batas Otomatis
                                        </p>
                                        <p className="font-body-sm text-body-sm text-outline">
                                            {needsRecalibration ? (
                                                <>
                                                    Terdapat <strong>pergeseran signifikan (&gt;10%)</strong> pada parameter model dengan {sampleCount} asesmen terkumpul. <strong>Disarankan melakukan rekalibrasi model segera.</strong>
                                                </>
                                            ) : (
                                                <>
                                                    Parameter model mengalami pergeseran di atas 10%. Disarankan melakukan rekalibrasi model setelah minimal 30 asesmen terkumpul (saat ini: {sampleCount}).
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <button
                                        type="button"
                                        title="Segera hadir — endpoint log audit belum tersedia"
                                        className="px-3.5 py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors font-medium cursor-not-allowed opacity-70"
                                    >
                                        Unduh Log Audit (CSV)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ===== MODAL REKALIBRASI BARU (tidak berubah struktur handler) ===== */}
                    {showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                            <div className="relative bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-2xl p-6 z-10 max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                                            <Icon icon="solar:brain-outline" className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                                                Buat Versi Model &amp; Kalibrasi Baru
                                            </h3>
                                            <p className="font-body-sm text-body-sm text-outline">
                                                Mendefinisikan parameter persentil baru hasil rekalibrasi statistik empiris BPR. Versi aktif sebelumnya otomatis dinonaktifkan.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
                                    >
                                        <Icon icon="solar:close-square-outline" className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={submit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold mb-1.5">
                                                Nama Versi Model
                                            </label>
                                            <input
                                                type="text"
                                                value={data.version_name}
                                                onChange={(e) => setData('version_name', e.target.value)}
                                                placeholder="Contoh: v1.1-2026-Q3"
                                                className="w-full px-3 py-2 text-body-md rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary border-0"
                                            />
                                            {errors.version_name && (
                                                <p className="text-error font-label-sm text-[11px] mt-1">{errors.version_name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold mb-1.5">
                                                Keterangan / Rationale
                                            </label>
                                            <input
                                                type="text"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Penyesuaian batas P75 pasca semester 1"
                                                className="w-full px-3 py-2 text-body-md rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary border-0"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-surface-container-low rounded-xl space-y-3">
                                        <div className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                                            Ambang Batas Dimensi (Skala 0-100)
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div>
                                                <label className="block font-label-sm text-[11px] text-on-surface-variant mb-1">PFR P25</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={data.pfr_p25}
                                                    onChange={(e) => setData('pfr_p25', e.target.value)}
                                                    className="w-full text-body-sm rounded-lg bg-surface-container-lowest px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary border-0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-label-sm text-[11px] text-on-surface-variant mb-1">PFR P75</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={data.pfr_p75}
                                                    onChange={(e) => setData('pfr_p75', e.target.value)}
                                                    className="w-full text-body-sm rounded-lg bg-surface-container-lowest px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary border-0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-label-sm text-[11px] text-on-surface-variant mb-1">SSR P25</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={data.ssr_p25}
                                                    onChange={(e) => setData('ssr_p25', e.target.value)}
                                                    className="w-full text-body-sm rounded-lg bg-surface-container-lowest px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary border-0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-label-sm text-[11px] text-on-surface-variant mb-1">SSR P75</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={data.ssr_p75}
                                                    onChange={(e) => setData('ssr_p75', e.target.value)}
                                                    className="w-full text-body-sm rounded-lg bg-surface-container-lowest px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary border-0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-surface-container-low rounded-xl space-y-3">
                                        <div className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                                            Parameter Kredibilitas &amp; Flag
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div>
                                                <label className="block font-label-sm text-[11px] text-on-surface-variant mb-1">SD P75 (Elevated)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={data.sd_p75}
                                                    onChange={(e) => setData('sd_p75', e.target.value)}
                                                    className="w-full text-body-sm rounded-lg bg-surface-container-lowest px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary border-0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-label-sm text-[11px] text-on-surface-variant mb-1">SD P90 (High)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={data.sd_p90}
                                                    onChange={(e) => setData('sd_p90', e.target.value)}
                                                    className="w-full text-body-sm rounded-lg bg-surface-container-lowest px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary border-0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-label-sm text-[11px] text-on-surface-variant mb-1">Straightlining Ratio</label>
                                                <input
                                                    type="number"
                                                    step="0.05"
                                                    value={data.straightline_threshold}
                                                    onChange={(e) => setData('straightline_threshold', e.target.value)}
                                                    className="w-full text-body-sm rounded-lg bg-surface-container-lowest px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary border-0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-label-sm text-[11px] text-on-surface-variant mb-1">Min Variabilitas SD</label>
                                                <input
                                                    type="number"
                                                    step="0.05"
                                                    value={data.low_variability_threshold}
                                                    onChange={(e) => setData('low_variability_threshold', e.target.value)}
                                                    className="w-full text-body-sm rounded-lg bg-surface-container-lowest px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary border-0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-label-md font-medium transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-5 py-2 bg-primary text-on-primary hover:bg-primary-container rounded-lg font-label-md text-label-md font-semibold disabled:opacity-50 transition shadow-sm"
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
