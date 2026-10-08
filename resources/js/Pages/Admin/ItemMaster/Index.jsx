import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Icon } from '@iconify/react';

export default function Index({ items = [], stats = {}, canManage = false }) {
    const [selectedDimension, setSelectedDimension] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingItem, setEditingItem] = useState(null);

    const { data, setData, put, processing, reset, errors } = useForm({
        text: '',
    });

    const handleEdit = (item) => {
        setEditingItem(item);
        setData('text', item.text);
    };

    const handleCloseModal = () => {
        setEditingItem(null);
        reset();
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        if (!editingItem) return;

        put(route('item-masters.update', editingItem.id), {
            preserveScroll: true,
            onSuccess: () => {
                handleCloseModal();
            },
        });
    };

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesDimension =
                selectedDimension === 'ALL' || item.dimension === selectedDimension;
            const q = searchQuery.toLowerCase();
            const matchesSearch =
                !q ||
                item.item_code.toLowerCase().includes(q) ||
                item.text.toLowerCase().includes(q) ||
                item.dimension.toLowerCase().includes(q);

            return matchesDimension && matchesSearch;
        });
    }, [items, selectedDimension, searchQuery]);

    const dimensionCounts = useMemo(() => {
        const total = items.length;
        const pfr = items.filter((i) => i.dimension === 'PFR').length;
        const ssr = items.filter((i) => i.dimension === 'SSR').length;
        const sd = items.filter((i) => i.dimension === 'SD').length;
        const pct = (n) => (total ? Math.round((n / total) * 1000) / 10 : 0);
        return {
            total,
            pfr,
            ssr,
            sd,
            pfrPct: pct(pfr),
            ssrPct: pct(ssr),
            sdPct: pct(sd),
        };
    }, [items]);

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedDimension('ALL');
    };

    const getDimBadge = (dim) => {
        if (dim === 'PFR') {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-label-sm font-semibold bg-surface-variant text-primary">
                    PFR ({dimensionCounts.pfr} Item)
                </span>
            );
        }
        if (dim === 'SSR') {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-label-sm font-semibold bg-secondary-fixed text-secondary">
                    SSR ({dimensionCounts.ssr} Item)
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-label-sm font-semibold bg-tertiary-fixed text-tertiary-container">
                SD ({dimensionCounts.sd} Item)
            </span>
        );
    };

    const pillBase =
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all shadow-sm';

    return (
        <AuthenticatedLayout>
            <Head title="Master Item Kuesioner" />

            <div className="w-full min-h-full bg-background font-body-md text-on-surface">
                <div className="flex flex-col w-full gap-space-lg px-space-lg py-space-md pb-12">
                    {/* Title & Quick Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                        <div>
                            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                                Master Instrumen Kuesioner ({dimensionCounts.total} Item)
                            </h1>
                            <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-3xl">
                                Struktur Instrumen PCSM-SOPI Baku ({dimensionCounts.total} Butir). Terdiri dari{' '}
                                {dimensionCounts.pfr} item Prudent Financial Responsibility (PFR),{' '}
                                {dimensionCounts.ssr} item Sustainability Responsibility (SSR), dan{' '}
                                {dimensionCounts.sd} item kontrol Social Desirability (SD).
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                disabled
                                title="Segera hadir — fitur ekspor sedang disiapkan"
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md transition-all shadow-sm cursor-not-allowed opacity-60"
                            >
                                <Icon icon="solar:download-outline" className="w-[18px] h-[18px] text-on-surface-variant" />
                                Ekspor Kuesioner
                            </button>
                            <button
                                type="button"
                                disabled
                                title="Segera hadir — endpoint validasi parameter belum tersedia"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-sm cursor-not-allowed opacity-60"
                            >
                                <Icon icon="solar:add-circle-outline" className="w-[18px] h-[18px]" />
                                Validasi Parameter
                            </button>
                        </div>
                    </div>

                    {/* Metric Summary Cards Grid (4 Columns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {/* Card 1: Total Instrumen */}
                        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden group">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold block mb-1">
                                        Total Instrumen
                                    </span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-headline-xl text-headline-xl font-bold text-on-surface">
                                            {dimensionCounts.total}
                                        </span>
                                        <span className="font-body-lg text-body-lg font-medium text-on-surface-variant">Butir</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center shrink-0">
                                    <Icon icon="solar:document-text-bold-duotone" className="w-[22px] h-[22px]" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-1.5 font-label-sm text-label-sm text-secondary">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                                Skala Likert 1-7 Standar
                            </div>
                        </div>

                        {/* Card 2: PFR Keuangan */}
                        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden group">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold block mb-1">
                                        PFR (Keuangan)
                                    </span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-headline-xl text-headline-xl font-bold text-primary">
                                            {dimensionCounts.pfr}
                                        </span>
                                        <span className="font-body-lg text-body-lg font-medium text-on-surface-variant">Item</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-surface-variant text-primary flex items-center justify-center shrink-0">
                                    <Icon icon="solar:wallet-money-bold-duotone" className="w-[22px] h-[22px]" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-bold text-[10px]">
                                    {dimensionCounts.pfrPct}%
                                </span>
                                Prudent Financial
                            </div>
                        </div>

                        {/* Card 3: SSR Keberlanjutan */}
                        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden group">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold block mb-1">
                                        SSR (Keberlanjutan)
                                    </span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-headline-xl text-headline-xl font-bold text-secondary">
                                            {dimensionCounts.ssr}
                                        </span>
                                        <span className="font-body-lg text-body-lg font-medium text-on-surface-variant">Item</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
                                    <Icon icon="solar:leaf-outline" className="w-[22px] h-[22px]" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-bold text-[10px]">
                                    {dimensionCounts.ssrPct}%
                                </span>
                                Sustainability
                            </div>
                        </div>

                        {/* Card 4: SD Kontrol Kejujuran */}
                        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden group">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary-container font-semibold block mb-1">
                                        SD (Kontrol Kejujuran)
                                    </span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-headline-xl text-headline-xl font-bold text-tertiary-container">
                                            {dimensionCounts.sd}
                                        </span>
                                        <span className="font-body-lg text-body-lg font-medium text-on-surface-variant">Item</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0">
                                    <Icon icon="solar:shield-check-bold-duotone" className="w-[22px] h-[22px]" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary-container font-bold text-[10px]">
                                    {dimensionCounts.sdPct}%
                                </span>
                                Social Desirability
                            </div>
                        </div>
                    </div>

                    {/* Main Data Container */}
                    <div className="bg-surface-container-lowest rounded-xl shadow-sm flex flex-col overflow-hidden">
                        {/* Filter and Search Toolbar */}
                        <div className="p-space-md bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Dimension Pill Filters */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                                <button
                                    type="button"
                                    onClick={() => setSelectedDimension('ALL')}
                                    className={`${pillBase} ${
                                        selectedDimension === 'ALL'
                                            ? 'bg-primary-container text-on-primary font-semibold'
                                            : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                                    }`}
                                >
                                    <span>Semua</span>
                                    <span
                                        className={`px-1.5 py-0.5 rounded-full text-[11px] ${
                                            selectedDimension === 'ALL'
                                                ? 'bg-surface-container-lowest/20'
                                                : 'bg-surface-container-high text-primary font-semibold'
                                        }`}
                                    >
                                        {dimensionCounts.total}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedDimension('PFR')}
                                    className={`${pillBase} ${
                                        selectedDimension === 'PFR'
                                            ? 'bg-primary-container text-on-primary font-semibold'
                                            : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                                    }`}
                                >
                                    <span>PFR Keuangan</span>
                                    <span
                                        className={`px-1.5 py-0.5 rounded-full text-[11px] ${
                                            selectedDimension === 'PFR'
                                                ? 'bg-surface-container-lowest/20'
                                                : 'bg-surface-container-high text-primary font-semibold'
                                        }`}
                                    >
                                        {dimensionCounts.pfr}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedDimension('SSR')}
                                    className={`${pillBase} ${
                                        selectedDimension === 'SSR'
                                            ? 'bg-primary-container text-on-primary font-semibold'
                                            : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                                    }`}
                                >
                                    <span>SSR Keberlanjutan</span>
                                    <span
                                        className={`px-1.5 py-0.5 rounded-full text-[11px] ${
                                            selectedDimension === 'SSR'
                                                ? 'bg-surface-container-lowest/20'
                                                : 'bg-secondary-fixed text-secondary font-semibold'
                                        }`}
                                    >
                                        {dimensionCounts.ssr}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedDimension('SD')}
                                    className={`${pillBase} ${
                                        selectedDimension === 'SD'
                                            ? 'bg-primary-container text-on-primary font-semibold'
                                            : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                                    }`}
                                >
                                    <span>SD Kejujuran</span>
                                    <span
                                        className={`px-1.5 py-0.5 rounded-full text-[11px] ${
                                            selectedDimension === 'SD'
                                                ? 'bg-surface-container-lowest/20'
                                                : 'bg-tertiary-fixed text-tertiary-container font-semibold'
                                        }`}
                                    >
                                        {dimensionCounts.sd}
                                    </span>
                                </button>
                            </div>

                            {/* Search & Options Bar */}
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:w-80">
                                    <Icon
                                        icon="solar:magnifer-outline"
                                        className="w-[18px] h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                                    />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari butir pertanyaan atau kode..."
                                        className="w-full pl-9 pr-8 py-2 text-body-sm bg-surface-container-lowest rounded-lg text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary shadow-sm border-0"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                                        >
                                            <Icon icon="solar:close-circle-bold" className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="h-6 w-px bg-surface-container-high hidden md:block" />
                                <button
                                    type="button"
                                    disabled
                                    title="Segera hadir — opsi urutan kustom sedang disiapkan"
                                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm shadow-sm cursor-not-allowed opacity-60"
                                >
                                    <Icon icon="solar:tuning-2-outline" className="w-4 h-4" />
                                    <span className="hidden sm:inline">Urutan Baku</span>
                                </button>
                            </div>
                        </div>

                        {/* Table Responsive Wrap */}
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left text-body-md">
                                <thead>
                                    <tr className="bg-surface-container-low text-on-surface-variant uppercase font-label-sm text-label-sm tracking-wider">
                                        <th className="py-3 px-space-md font-semibold w-40">No / Kode</th>
                                        <th className="py-3 px-space-md font-semibold w-44">Dimensi</th>
                                        <th className="py-3 px-space-md font-semibold">
                                            Pernyataan Instrumen (Skala Likert 1-7)
                                        </th>
                                        {canManage && (
                                            <th className="py-3 px-space-md font-semibold text-right w-32">Aksi</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-container">
                                    {filteredItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={canManage ? 4 : 3} className="px-space-md">
                                                <div className="hidden py-12 px-4 flex-col items-center justify-center text-center">
                                                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-3">
                                                        <Icon icon="solar:clipboard-remove-outline" className="w-6 h-6" />
                                                    </div>
                                                    <h4 className="font-headline-md text-headline-md font-semibold text-on-surface">
                                                        Tidak ada butir ditemukan
                                                    </h4>
                                                    <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-sm mx-auto">
                                                        Coba sesuaikan kata kunci pencarian atau ganti filter dimensi untuk melihat butir kuesioner.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={resetFilters}
                                                        className="mt-4 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md"
                                                    >
                                                        Reset Filter &amp; Pencarian
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredItems.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-surface-container-low/70 transition-colors group">
                                                <td className="py-3 px-space-md align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-label-md text-label-md font-bold text-on-surface">
                                                            {item.item_code}
                                                        </span>
                                                        <span className="font-label-sm text-label-sm text-on-surface-variant font-mono bg-surface-container px-1.5 py-0.5 rounded">
                                                            Urutan: #{item.display_order ?? index + 1}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-space-md align-middle">
                                                    {getDimBadge(item.dimension)}
                                                </td>
                                                <td className="py-3 px-space-md align-middle text-on-surface font-body-md pr-6">
                                                    {item.text}
                                                </td>
                                                {canManage && (
                                                    <td className="py-3 px-space-md align-middle text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEdit(item)}
                                                            title="Edit Teks"
                                                            className="p-1.5 rounded-lg text-primary hover:bg-surface-container transition-colors inline-flex items-center justify-center"
                                                        >
                                                            <Icon icon="solar:pen-new-square-outline" className="w-[18px] h-[18px]" />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Table Footer / Pagination Metadata */}
                        <div className="p-space-md bg-surface-container-low/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm flex-wrap">
                                <span>
                                    Menampilkan <strong className="text-on-surface">{filteredItems.length}</strong> dari{' '}
                                    <strong className="text-on-surface">{dimensionCounts.total}</strong> butir instrumen baku
                                </span>
                                <span className="text-outline-variant font-mono">•</span>
                                <span className="text-secondary font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                                    Seluruh butir tervalidasi psikometrik (r &gt; 0.65)
                                </span>
                            </div>
                            <div className="flex items-center gap-1 font-label-sm text-label-sm">
                                <span className="text-outline mr-2">Halaman 1 dari 1</span>
                                <button
                                    type="button"
                                    disabled
                                    className="p-1.5 rounded bg-surface-container-lowest text-outline-variant cursor-not-allowed shadow-sm"
                                >
                                    <Icon icon="solar:arrow-left-outline" className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    className="px-2.5 py-1 rounded bg-primary-container text-on-primary font-bold shadow-sm"
                                >
                                    1
                                </button>
                                <button
                                    type="button"
                                    disabled
                                    className="p-1.5 rounded bg-surface-container-lowest text-outline-variant cursor-not-allowed shadow-sm"
                                >
                                    <Icon icon="solar:arrow-right-outline" className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Guidelines & Information Strip */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                                <Icon icon="solar:brain-outline" className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-headline-md text-label-md font-bold text-on-surface leading-tight">
                                    Kalibrasi Skala Likert 1-7
                                </h4>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                                    Rentang respons bergerak dari 1 (Sangat Tidak Setuju) hingga 7 (Sangat Setuju) untuk menangkap variansi psikologis risiko kredit secara presisi.
                                </p>
                            </div>
                        </div>
                        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center shrink-0">
                                <Icon icon="solar:shield-check-bold-duotone" className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-headline-md text-label-md font-bold text-on-surface leading-tight">
                                    Mekanisme Kontrol SD (Social Desirability)
                                </h4>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                                    {dimensionCounts.sd} butir pengontrol disisipkan acak untuk mendeteksi kecenderungan nasabah menjawab secara normatif atau memanipulasi citra diri.
                                </p>
                            </div>
                        </div>
                        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-tertiary-fixed text-tertiary-container flex items-center justify-center shrink-0">
                                <Icon icon="solar:book-bookmark-outline" className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-headline-md text-label-md font-bold text-on-surface leading-tight">
                                    Kebijakan Perubahan Teks
                                </h4>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                                    Modifikasi redaksional butir memerlukan persetujuan Komite Model dan akan mencatat revisi log audit kalibrasi sistem secara permanen.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Modal Edit Butir Kuesioner */}
                    {editingItem && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div
                                className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm"
                                onClick={handleCloseModal}
                            />
                            <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-xl relative z-10 max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center justify-between pb-3 mb-space-sm border-b border-surface-container">
                                    <div className="flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-md bg-primary-fixed text-primary flex items-center justify-center font-bold text-[12px] font-mono">
                                            {editingItem.item_code}
                                        </span>
                                        <h3 className="font-headline-md text-headline-md text-on-surface">Edit Butir Instrumen</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container-high transition-colors"
                                    >
                                        <Icon icon="solar:close-square-outline" className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={submitUpdate}>
                                    <div className="space-y-4 pt-space-sm">
                                        <div>
                                            <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold mb-1.5">
                                                Dimensi Psikometrik
                                            </label>
                                            <input
                                                type="text"
                                                value={
                                                    editingItem.dimension === 'PFR'
                                                        ? `PFR (${dimensionCounts.pfr} Item)`
                                                        : editingItem.dimension === 'SSR'
                                                        ? `SSR (${dimensionCounts.ssr} Item)`
                                                        : `SD (${dimensionCounts.sd} Item)`
                                                }
                                                disabled
                                                className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-on-surface font-label-md text-label-md cursor-not-allowed opacity-80 border-0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold mb-1.5">
                                                Teks Pernyataan (Bahasa Indonesia)
                                            </label>
                                            <textarea
                                                rows="4"
                                                value={data.text}
                                                onChange={(e) => setData('text', e.target.value)}
                                                className="w-full p-3 text-body-md bg-surface-container-low rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-outline resize-none border-0 leading-relaxed"
                                                placeholder="Tuliskan teks butir instrumen..."
                                                required
                                            />
                                            {errors.text && (
                                                <p className="text-error font-label-sm text-[11px] mt-1 block">{errors.text}</p>
                                            )}
                                            <span className="text-outline font-label-sm text-[11px] mt-1 block">
                                                Pastikan kalimat netral, tidak mengarahkan, dan mudah dipahami oleh debitur UMKM.
                                            </span>
                                        </div>
                                        <div className="p-3 rounded-lg bg-surface-container-low flex items-start gap-2 text-on-surface-variant">
                                            <Icon icon="solar:info-circle-linear" className="w-[18px] h-[18px] text-secondary shrink-0 mt-0.5" />
                                            <p className="font-label-sm text-label-sm">
                                                Perubahan butir akan langsung aktif pada formulir kuesioner asesmen baru tanpa mempengaruhi asesmen yang telah berstatus selesai.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-space-lg flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-semibold transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
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
