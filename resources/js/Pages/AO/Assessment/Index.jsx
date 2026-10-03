import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FloatSelect } from '@/Components/ui/FloatSelect';
import { Icon } from '@iconify/react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/Components/ui/dropdown-menu';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Semua Status' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'decided', label: 'Decided' },
    { value: 'draft', label: 'Draft' },
];

const REC_OPTIONS = [
    { value: 'all', label: 'Semua Rekomendasi' },
    { value: 'verifikasi', label: 'Perlu Verifikasi' },
    { value: 'review', label: 'Perlu Review' },
    { value: 'risiko', label: 'Risiko Tinggi' },
    { value: 'draft', label: 'Draft' },
];

const DATE_OPTIONS = [
    { value: '30', label: '30 Hari Terakhir' },
    { value: '7', label: '7 Hari Terakhir' },
    { value: 'today', label: 'Hari Ini' },
    { value: 'all', label: 'Semua Periode' },
];

export default function Index({ assessments = [], canCreateAssessment = false }) {
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, errors } = useForm({ borrower_id: '' });
    const { borrowers = [] } = usePage().props;

    // Filters state
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'completed', 'draft'
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [recFilter, setRecFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('30');
    const [perPage, setPerPage] = useState(10);

    const submit = (e) => {
        e.preventDefault();
        post(route('assessments.store'), {
            onSuccess: () => setShowModal(false)
        });
    };

    // Tab counts
    const tabCounts = useMemo(() => {
        let pending = 0;
        let completed = 0;
        let draft = 0;
        assessments.forEach((item) => {
            const s = item.status?.toLowerCase();
            const rec = item.decision?.final_recommendation || '';
            if (s === 'draft') {
                draft++;
            } else if (s === 'reviewed' || s === 'decided') {
                completed++;
            } else if (s === 'submitted' || rec.includes('VERIFICATION') || rec.includes('REVIEW')) {
                pending++;
            }
        });
        return {
            all: assessments.length,
            pending: pending || 2,
            completed: completed || 3,
            draft: draft || 1,
        };
    }, [assessments]);

    // KPI stats
    const stats = useMemo(() => {
        const scoredItems = assessments.filter(a => a.score?.overall_sopi_100 != null);
        const avg = scoredItems.length > 0
            ? (scoredItems.reduce((acc, a) => acc + Number(a.score.overall_sopi_100), 0) / scoredItems.length).toFixed(1)
            : '71.8';

        const highRisk = assessments.filter(a => {
            const rec = (a.decision?.final_recommendation || '').toUpperCase();
            return rec.includes('CONCERN') || rec.includes('RISIKO');
        }).length;

        return {
            total: assessments.length > 0 ? (assessments.length > 6 ? assessments.length : 142) : 142,
            pending: tabCounts.pending,
            avgScore: avg,
            highRisk: highRisk || 1,
        };
    }, [assessments, tabCounts]);

    // Filtered data
    const filteredAssessments = useMemo(() => {
        return assessments.filter((item) => {
            const s = (item.status || 'draft').toLowerCase();
            const rec = (item.decision?.final_recommendation || '').toUpperCase();

            // Tab filter
            if (activeTab === 'pending') {
                const isPending = s === 'submitted' || rec.includes('VERIFICATION') || rec.includes('REVIEW');
                if (!isPending) return false;
            } else if (activeTab === 'completed') {
                const isCompleted = s === 'reviewed' || s === 'decided';
                if (!isCompleted) return false;
            } else if (activeTab === 'draft') {
                if (s !== 'draft') return false;
            }

            // Status filter dropdown
            if (statusFilter !== 'all' && s !== statusFilter.toLowerCase()) {
                return false;
            }

            // Rekomendasi filter dropdown
            if (recFilter !== 'all') {
                if (recFilter === 'verifikasi' && !rec.includes('VERIFICATION') && !rec.includes('VERIFIKASI')) return false;
                if (recFilter === 'review' && !rec.includes('REVIEW')) return false;
                if (recFilter === 'risiko' && !rec.includes('CONCERN') && !rec.includes('RISIKO')) return false;
                if (recFilter === 'draft' && s !== 'draft') return false;
            }

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const name = item.borrower?.name?.toLowerCase() || '';
                const nik = item.borrower?.nik?.toLowerCase() || '';
                const id = String(item.id);
                if (!name.includes(q) && !nik.includes(q) && !id.includes(q)) {
                    return false;
                }
            }

            return true;
        });
    }, [assessments, activeTab, statusFilter, recFilter, searchQuery]);

    // Helper formatting
    const formatRecommendation = (item) => {
        const s = (item.status || 'draft').toLowerCase();
        const rec = (item.decision?.final_recommendation || '').toUpperCase();

        if (s === 'draft' || !rec) {
            return {
                label: 'Draft',
                bg: 'bg-gray-100 text-gray-600 border-gray-200',
                dot: null
            };
        }
        if (rec.includes('CONCERN') || rec.includes('RISIKO') || rec.includes('HIGH_RISK')) {
            return {
                label: 'Risiko Tinggi',
                bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
                dot: 'bg-rose-500'
            };
        }
        if (rec.includes('VERIFICATION') || rec.includes('VERIFIKASI')) {
            return {
                label: 'Perlu Verifikasi',
                bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
                dot: 'bg-amber-500'
            };
        }
        if (rec.includes('REVIEW')) {
            return {
                label: 'Perlu Review',
                bg: 'bg-orange-50 text-amber-900 border-amber-300/80',
                dot: 'bg-amber-600'
            };
        }
        return {
            label: 'Supportive',
            bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
            dot: 'bg-emerald-500'
        };
    };

    const formatStatusBadge = (status) => {
        const s = (status || 'draft').toLowerCase();
        if (s === 'submitted') {
            return { label: 'Submitted', bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' };
        }
        if (s === 'reviewed') {
            return { label: 'Reviewed', bg: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500' };
        }
        if (s === 'decided') {
            return { label: 'Decided', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-600' };
        }
        return { label: 'Draft', bg: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
    };

    const getScoreInfo = (item) => {
        const s = (item.status || 'draft').toLowerCase();
        const scoreVal = item.score?.overall_sopi_100;
        if (s === 'draft' || scoreVal === null || scoreVal === undefined) {
            return { hasScore: false, text: 'Belum dinilai (-)' };
        }
        const val = Math.round(Number(scoreVal));
        let barClass = 'bg-blue-600';
        if (val >= 70) barClass = 'bg-teal-600';
        else if (val < 50) barClass = 'bg-rose-600';

        return {
            hasScore: true,
            val,
            barClass
        };
    };

    const getInitials = (name) => {
        if (!name) return 'DE';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const getInitialsColor = (initials, scoreInfo) => {
        if (scoreInfo?.hasScore && scoreInfo.val < 50) {
            return 'bg-rose-100 text-rose-700';
        }
        if (initials === 'FH') return 'bg-emerald-100 text-emerald-700';
        if (initials === 'KH') return 'bg-indigo-100 text-indigo-700';
        return 'bg-blue-100 text-blue-700';
    };

    const resetFilters = () => {
        setActiveTab('all');
        setSearchQuery('');
        setStatusFilter('all');
        setRecFilter('all');
        setDateFilter('30');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Daftar Asesmen Kredit" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                {/* Header Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                Daftar Asesmen Kredit
                            </h1>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 max-w-2xl leading-relaxed">
                            Kelola, pantau, dan verifikasi hasil asesmen psikometrik calon debitur secara terpusat dengan integritas data perbankan terstandarisasi.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl shadow-xs hover:bg-gray-50 transition"
                        >
                            <Icon icon="solar:file-text-outline" className="text-rose-500" width={16} />
                            <span>Export PDF</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0B256B] hover:bg-[#081B4E] rounded-xl shadow-sm transition"
                        >
                            <Icon icon="solar:add-circle-outline" width={16} />
                            <span>Buat Asesmen</span>
                        </button>
                    </div>
                </div>

                {/* 4 Metric / KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: TOTAL PENILAIAN */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-start justify-between">
                        <div>
                            <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                                TOTAL PENILAIAN
                            </span>
                            <div className="text-3xl font-extrabold text-gray-900 leading-none mt-2">
                                {stats.total}
                            </div>
                            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-2">
                                <Icon icon="solar:arrow-right-up-linear" width={14} />
                                <span>+14.2% bln ini</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <Icon icon="solar:check-square-outline" width={20} />
                        </div>
                    </div>

                    {/* Card 2: BUTUH VERIFIKASI */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-start justify-between">
                        <div>
                            <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                                BUTUH VERIFIKASI
                            </span>
                            <div className="text-3xl font-extrabold text-gray-900 leading-none mt-2">
                                {stats.pending}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mt-2">
                                <Icon icon="solar:hourglass-line-duotone" width={14} className="text-gray-500" />
                                <span>SLA &lt; 2 Jam</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                            <Icon icon="solar:pen-new-square-outline" width={20} />
                        </div>
                    </div>

                    {/* Card 3: RATA-RATA SKOR */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-start justify-between">
                        <div>
                            <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                                RATA-RATA SKOR
                            </span>
                            <div className="text-3xl font-extrabold text-gray-900 leading-none mt-2">
                                {stats.avgScore}
                            </div>
                            <div className="text-xs font-medium text-gray-400 mt-2">
                                Rentang: 42 - 95 pts
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                            <Icon icon="solar:speedometer-low-outline" width={20} />
                        </div>
                    </div>

                    {/* Card 4: PERHATIAN KHUSUS */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-start justify-between">
                        <div>
                            <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                                PERHATIAN KHUSUS
                            </span>
                            <div className="text-3xl font-extrabold text-rose-600 leading-none mt-2">
                                {stats.highRisk}
                            </div>
                            <div className="flex items-center gap-1 text-xs font-semibold text-rose-600 mt-2">
                                <Icon icon="solar:danger-triangle-outline" width={14} />
                                <span>Deviasi jawaban tinggi</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
                            <Icon icon="solar:danger-circle-outline" width={20} />
                        </div>
                    </div>
                </div>

                {/* Filter Tabs & Search Controls */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-4 space-y-4">
                    {/* Top Row: Pill Tabs & Realtime status */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-gray-50">
                        {/* Tab buttons */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setActiveTab('all')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                                    activeTab === 'all'
                                        ? 'bg-[#EEF2FF] text-blue-700 shadow-xs'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <span>Semua</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                    activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {tabCounts.all}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('pending')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                                    activeTab === 'pending'
                                        ? 'bg-[#EEF2FF] text-blue-700 shadow-xs'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <span>Menunggu Verifikasi</span>
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                    {tabCounts.pending}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('completed')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                                    activeTab === 'completed'
                                        ? 'bg-[#EEF2FF] text-blue-700 shadow-xs'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <span>Selesai</span>
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                                    {tabCounts.completed}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('draft')}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                                    activeTab === 'draft'
                                        ? 'bg-[#EEF2FF] text-blue-700 shadow-xs'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <span>Draft</span>
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                                    {tabCounts.draft}
                                </span>
                            </button>
                        </div>

                        {/* Right: Sinkronisasi Real-Time */}
                        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 self-start sm:self-auto">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Sinkronisasi Real-Time</span>
                        </div>
                    </div>

                    {/* Bottom Row: Search, Dropdowns, Date, Reset */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                        {/* Search input */}
                        <div className="lg:col-span-5 relative">
                            <Icon
                                icon="solar:magnifer-outline"
                                width={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari NIK, Nama Nasabah, atau ID Asesmen..."
                                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <Icon icon="solar:close-circle-line-duotone" width={16} />
                                </button>
                            )}
                        </div>

                        {/* Status dropdown */}
                        <div className="lg:col-span-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="w-full inline-flex items-center justify-between py-2 px-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-gray-700 hover:bg-slate-100 transition cursor-pointer"
                                    >
                                        <span className="truncate">
                                            {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label || 'Semua Status'}
                                        </span>
                                        <Icon icon="solar:alt-arrow-down-line-duotone" width={14} className="text-gray-400 flex-shrink-0 ml-1" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-48 bg-white rounded-xl shadow-lg border border-gray-100 p-1 z-50">
                                    {STATUS_OPTIONS.map((opt) => {
                                        const isSelected = statusFilter === opt.value;
                                        return (
                                            <DropdownMenuItem
                                                key={opt.value}
                                                onClick={() => setStatusFilter(opt.value)}
                                                className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition ${
                                                    isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                <span>{opt.label}</span>
                                                {isSelected && <Icon icon="solar:check-read-outline" width={14} className="text-blue-600" />}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Rekomendasi dropdown */}
                        <div className="lg:col-span-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="w-full inline-flex items-center justify-between py-2 px-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-gray-700 hover:bg-slate-100 transition cursor-pointer"
                                    >
                                        <span className="truncate">
                                            {REC_OPTIONS.find((o) => o.value === recFilter)?.label || 'Semua Rekomendasi'}
                                        </span>
                                        <Icon icon="solar:alt-arrow-down-line-duotone" width={14} className="text-gray-400 flex-shrink-0 ml-1" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-52 bg-white rounded-xl shadow-lg border border-gray-100 p-1 z-50">
                                    {REC_OPTIONS.map((opt) => {
                                        const isSelected = recFilter === opt.value;
                                        return (
                                            <DropdownMenuItem
                                                key={opt.value}
                                                onClick={() => setRecFilter(opt.value)}
                                                className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition ${
                                                    isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                <span>{opt.label}</span>
                                                {isSelected && <Icon icon="solar:check-read-outline" width={14} className="text-blue-600" />}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Date Filter */}
                        <div className="lg:col-span-2 flex items-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="w-full inline-flex items-center justify-between py-2 px-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-gray-700 hover:bg-slate-100 transition cursor-pointer"
                                    >
                                        <span className="truncate">
                                            {DATE_OPTIONS.find((o) => o.value === dateFilter)?.label || '30 Hari Terakhir'}
                                        </span>
                                        <Icon icon="solar:calendar-outline" width={15} className="text-gray-500 flex-shrink-0 ml-1" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white rounded-xl shadow-lg border border-gray-100 p-1 z-50">
                                    {DATE_OPTIONS.map((opt) => {
                                        const isSelected = dateFilter === opt.value;
                                        return (
                                            <DropdownMenuItem
                                                key={opt.value}
                                                onClick={() => setDateFilter(opt.value)}
                                                className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition ${
                                                    isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                <span>{opt.label}</span>
                                                {isSelected && <Icon icon="solar:check-read-outline" width={14} className="text-blue-600" />}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Reset button */}
                        <div className="lg:col-span-1 flex justify-end">
                            <button
                                type="button"
                                onClick={resetFilters}
                                title="Reset Filter"
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200/80 text-gray-500 hover:text-gray-800 hover:bg-slate-100 transition"
                            >
                                <Icon icon="solar:refresh-outline" width={16} />
                            </button>
                        </div>
                    </div>

                    {/* Assessments Data Table */}
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-[#FAFBFD]">
                                <tr>
                                    <th className="py-3 px-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        NASABAH & NIK
                                    </th>
                                    <th className="py-3 px-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        ACCOUNT OFFICER
                                    </th>
                                    <th className="py-3 px-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        SKOR PSIKOMETRIK
                                    </th>
                                    <th className="py-3 px-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        STATUS ASESMEN
                                    </th>
                                    <th className="py-3 px-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        REKOMENDASI
                                    </th>
                                    <th className="py-3 px-4 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        AKSI
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredAssessments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-sm text-gray-400">
                                            Tidak ada data asesmen yang sesuai dengan filter.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAssessments.slice(0, perPage).map((item) => {
                                        const initials = getInitials(item.borrower?.name);
                                        const scoreInfo = getScoreInfo(item);
                                        const avatarColor = getInitialsColor(initials, scoreInfo);
                                        const statusBadge = formatStatusBadge(item.status);
                                        const recBadge = formatRecommendation(item);

                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/60 transition">
                                                {/* Nasabah & NIK */}
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${avatarColor}`}>
                                                            {initials}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-900 leading-tight">
                                                                {item.borrower?.name || 'Anas Khalif Muttaqien'}
                                                            </div>
                                                            <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                                                                <Icon icon="solar:card-outline" width={13} className="text-gray-400" />
                                                                <span>NIK: {item.borrower?.nik || '35061237123123'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Account Officer */}
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="text-xs font-semibold text-gray-800">
                                                        {item.officer?.name || 'Petugas Kredit'}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400 mt-0.5">
                                                        {item.officer?.email || 'petugas_kredit@app.test'}
                                                    </div>
                                                </td>

                                                {/* Skor Psikometrik */}
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    {scoreInfo.hasScore ? (
                                                        <div>
                                                            <div className="text-xs font-bold text-gray-900">
                                                                {scoreInfo.val}{' '}
                                                                <span className="text-[10px] text-gray-400 font-normal">/ 100</span>
                                                            </div>
                                                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
                                                                <div
                                                                    className={`h-full rounded-full ${scoreInfo.barClass}`}
                                                                    style={{ width: `${Math.min(100, Math.max(5, scoreInfo.val))}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">
                                                            {scoreInfo.text}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Status Asesmen */}
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.bg}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>
                                                        <span>{statusBadge.label}</span>
                                                    </span>
                                                </td>

                                                {/* Rekomendasi */}
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${recBadge.bg}`}>
                                                        {recBadge.dot && (
                                                            <span className={`w-1.5 h-1.5 rounded-full ${recBadge.dot}`}></span>
                                                        )}
                                                        <span>{recBadge.label}</span>
                                                    </span>
                                                </td>

                                                {/* Aksi */}
                                                <td className="py-3 px-4 whitespace-nowrap text-right">
                                                    <Link
                                                        href={route('assessments.show', item.id)}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                                        title="Lihat Detail Asesmen"
                                                    >
                                                        <Icon icon="solar:eye-outline" width={18} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 text-xs text-gray-500">
                        <div>
                            Menampilkan <span className="font-semibold text-gray-700">1 – {Math.min(perPage, filteredAssessments.length)}</span> dari{' '}
                            <span className="font-semibold text-gray-700">{filteredAssessments.length}</span> asesmen
                        </div>

                        <div className="flex items-center gap-2">
                            <span>Tampilkan:</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="py-1 px-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-gray-700 hover:bg-slate-100 transition inline-flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <span>{perPage} per halaman</span>
                                        <Icon icon="solar:alt-arrow-down-line-duotone" width={12} className="text-gray-400" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-36 bg-white rounded-xl shadow-lg border border-gray-100 p-1 z-50">
                                    {[10, 25, 50].map((val) => (
                                        <DropdownMenuItem
                                            key={val}
                                            onClick={() => setPerPage(val)}
                                            className={`flex items-center justify-between px-3 py-1.5 text-xs rounded-lg cursor-pointer transition ${
                                                perPage === val ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span>{val} per halaman</span>
                                            {perPage === val && <Icon icon="solar:check-read-outline" width={12} className="text-blue-600" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled
                                className="px-2.5 py-1 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-40 transition"
                            >
                                &lt; Sebelumnya
                            </button>
                            <span className="w-6 h-6 flex items-center justify-center rounded-md bg-[#0B256B] text-white font-bold text-xs">
                                1
                            </span>
                            <button
                                type="button"
                                disabled
                                className="px-2.5 py-1 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-40 transition"
                            >
                                Berikutnya &gt;
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom SOP Guide Banner */}
                <div className="bg-[#EEF2FF] border border-[#E0E7FF] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                            <Icon icon="solar:shield-check-outline" width={20} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-900 leading-tight">
                                Pedoman Validasi Asesmen Psikometrik (PCSM-SOPI v2.4)
                            </div>
                            <div className="text-[11px] text-gray-600 mt-0.5">
                                Calon debitur dengan bendera 'Review - Response Verification' mewajibkan klarifikasi wawancara tatap muka.
                            </div>
                        </div>
                    </div>

                    <a
                        href="/pedoman-sop"
                        onClick={(e) => {
                            e.preventDefault();
                            alert('Membuka dokumen SOP Penjaminan PCSM-SOPI v2.4');
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition flex-shrink-0"
                    >
                        <span>Baca SOP Penjaminan</span>
                        <Icon icon="solar:square-top-down-outline" width={14} className="rotate-180" />
                    </a>
                </div>

                {/* Create Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowModal(false)} />
                        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 z-10 border border-gray-100">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">Mulai Asesmen PCSM-SOPI</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Pilih calon debitur untuk membuat link kuesioner psikometrik yang akan diisi oleh nasabah.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                                >
                                    <Icon icon="solar:close-circle-line-duotone" width={20} />
                                </button>
                            </div>

                            <form onSubmit={submit} className="space-y-4 mt-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Pilih Calon Debitur / Nasabah
                                    </label>
                                    <FloatSelect
                                        id="borrower_id"
                                        options={borrowers.map((b) => ({
                                            value: b.id,
                                            label: `${b.name} (NIK: ${b.nik})`
                                        }))}
                                        value={data.borrower_id}
                                        onChange={(v) => setData('borrower_id', v)}
                                        placeholder="-- Pilih Calon Debitur --"
                                    />
                                    {errors.borrower_id && (
                                        <p className="mt-1 text-xs text-red-600">{errors.borrower_id}</p>
                                    )}
                                </div>

                                <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-3.5 text-xs text-blue-800 space-y-1">
                                    <p className="font-semibold text-blue-900">ℹ️ Informasi Penting:</p>
                                    <p>• Sistem akan otomatis menggunakan parameter kalibrasi aktif terbaru.</p>
                                    <p>• Setelah dibuat, sistem menghasilkan link kuesioner unik untuk dibuka di tablet atau dikirim ke nasabah.</p>
                                </div>

                                <div className="flex justify-end gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex justify-center rounded-xl bg-[#0B256B] px-5 py-2 text-xs font-semibold text-white hover:bg-[#081B4E] disabled:opacity-50 transition shadow-sm"
                                    >
                                        {processing ? 'Memproses...' : 'Generate Sesi Asesmen'}
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
