import React, { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { useToast } from '@/Components/ui/Toast';

const DIMENSIONS = [
    { key: 'ALL', label: 'Semua' },
    { key: 'PFR', label: 'PFR Keuangan' },
    { key: 'SSR', label: 'SSR Keberlanjutan' },
    { key: 'SD', label: 'SD Kejujuran' },
];

const DIMENSION_META = {
    PFR: { badge: 'bg-surface-variant text-primary', icon: 'solar:wallet-money-bold-duotone', card: 'primary' },
    SSR: { badge: 'bg-secondary-fixed text-secondary', icon: 'solar:leaf-outline', card: 'secondary' },
    SD: { badge: 'bg-tertiary-fixed text-tertiary-container', icon: 'solar:shield-check-bold-duotone', card: 'tertiary' },
};

export default function Index({ items = [], stats = {}, dimensions = null, canManage = false }) {
    const [selectedDimension, setSelectedDimension] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingItem, setEditingItem] = useState(null);

    const toast = useToast();

    const { data, setData, put, processing, reset, errors } = useForm({
        text: '',
    });

    const openEdit = (item) => {
        setEditingItem(item);
        setData('text', item.text);
    };

    const closeEdit = () => {
        setEditingItem(null);
        reset();
        setData('text', '');
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        if (!editingItem) return;

        put(route('item-masters.update', editingItem.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast?.success(`Butir ${editingItem.item_code} berhasil diperbarui.`);
                closeEdit();
            },
            onError: () => {
                toast?.error('Gagal menyimpan perubahan butir instrumen.');
            },
        });
    };

    const counts = useMemo(() => {
        const byDim = (dim) => items.filter((item) => item.dimension === dim).length;
        const total = items.length;
        const pct = (n) => (total ? Math.round((n / total) * 1000) / 10 : 0);
        const pfr = byDim('PFR');
        const ssr = byDim('SSR');
        const sd = byDim('SD');

        return {
            total: stats.total ?? total,
            pfr: stats.pfr ?? pfr,
            ssr: stats.ssr ?? ssr,
            sd: stats.sd ?? sd,
            pfrPct: pct(pfr),
            ssrPct: pct(ssr),
            sdPct: pct(sd),
        };
    }, [items, stats]);

    const filteredItems = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return items.filter((item) => {
            const matchesDimension = selectedDimension === 'ALL' || item.dimension === selectedDimension;
            const matchesSearch =
                !query ||
                (item.item_code || '').toLowerCase().includes(query) ||
                (item.text || '').toLowerCase().includes(query) ||
                (item.dimension || '').toLowerCase().includes(query);

            return matchesDimension && matchesSearch;
        });
    }, [items, selectedDimension, searchQuery]);

    const dimensionLabel = (dim) => {
        if (dim === 'PFR') return `PFR (${counts.pfr} Item)`;
        if (dim === 'SSR') return `SSR (${counts.ssr} Item)`;
        return `SD (${counts.sd} Item)`;
    };

    const dimensionCount = (dim) => {
        if (dim === 'PFR') return counts.pfr;
        if (dim === 'SSR') return counts.ssr;
        if (dim === 'SD') return counts.sd;
        return counts.total;
    };

    const pillCountClass = (dim) => {
        if (selectedDimension === dim) return 'bg-surface-container-lowest/20';
        if (dim === 'ALL') return 'bg-surface-container-high text-primary font-semibold';
        if (dim === 'PFR') return 'bg-surface-container-high text-primary font-semibold';
        if (dim === 'SSR') return 'bg-secondary-fixed text-secondary font-semibold';
        return 'bg-tertiary-fixed text-tertiary-container font-semibold';
    };

    const pillBase =
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all shadow-sm whitespace-nowrap';

    const resetFilters = () => {
        setSelectedDimension('ALL');
        setSearchQuery('');
    };

    const handleExport = () => {
        const header = ['Kode', 'Dimensi', 'Urutan', 'Pernyataan Instrumen (Skala Likert 1-7)'];
        const rows = filteredItems.map((item, index) => [
            item.item_code,
            item.dimension,
            item.display_order ?? index + 1,
            `"${(item.text || '').replace(/"/g, '""')}"`,
        ]);
        const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `instrumen-kuesioner-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const metricCards = [
        {
            key: 'TOTAL',
            label: 'Total Instrumen',
            value: counts.total,
            unit: 'Butir',
            valueClass: 'text-on-surface',
            iconBox: 'bg-surface-container-high text-on-surface',
            icon: 'solar:document-text-bold-duotone',
            footer: (
                <div className="mt-3 flex items-center gap-1.5 font-label-sm text-label-sm text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Skala Likert 1-7 Standar
                </div>
            ),
        },
        {
            key: 'PFR',
            label: 'PFR (Keuangan)',
            value: counts.pfr,
            unit: 'Item',
            valueClass: 'text-primary',
            iconBox: 'bg-surface-variant text-primary',
            icon: 'solar:wallet-money-bold-duotone',
            footer: (
                <div className="mt-3 flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-bold text-[10px]">
                        {counts.pfrPct}%
                    </span>
                    Prudent Financial
                </div>
            ),
        },
        {
            key: 'SSR',
            label: 'SSR (Keberlanjutan)',
            value: counts.ssr,
            unit: 'Item',
            valueClass: 'text-secondary',
            iconBox: 'bg-secondary-fixed text-on-secondary-fixed',
            icon: 'solar:leaf-outline',
            footer: (
                <div className="mt-3 flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-bold text-[10px]">
                        {counts.ssrPct}%
                    </span>
                    Sustainability
                </div>
            ),
        },
        {
            key: 'SD',
            label: 'SD (Kontrol Kejujuran)',
            value: counts.sd,
            unit: 'Item',
            valueClass: 'text-tertiary-container',
            iconBox: 'bg-tertiary-fixed text-on-tertiary-fixed',
            icon: 'solar:shield-check-bold-duotone',
            footer: (
                <div className="mt-3 flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                    <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary-container font-bold text-[10px]">
                        {counts.sdPct}%
                    </span>
                    Social Desirability
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Master Instrumen Kuesioner" />

            <div className="w-full space-y-6 bg-background font-body-md text-on-surface">
                <div className="w-full px-space-lg py-space-md pb-12">
                    <div className="space-y-space-lg">
                        {/* ===== HEADER: TITLE & QUICK ACTIONS ===== */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                            <div>
                                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                                    Master Instrumen Kuesioner ({counts.total} Item)
                                </h1>
                                <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-3xl">
                                    Struktur Instrumen PCSM-SOPI Baku ({counts.total} Butir). Terdiri dari{' '}
                                    {counts.pfr} item Prudent Financial Responsibility (PFR),{' '}
                                    {counts.ssr} item Sustainability Responsibility (SSR), dan{' '}
                                    {counts.sd} item kontrol Social Desirability (SD).
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={handleExport}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-all shadow-sm"
                                >
                                    <Icon icon="solar:download-outline" className="w-[18px] h-[18px] text-on-surface-variant" />
                                    <span>Ekspor Kuesioner</span>
                                </button>
                                {canManage && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const first = filteredItems[0] ?? items[0];
                                            if (first) {
                                                openEdit(first);
                                            } else {
                                                toast?.info('Belum ada butir instrumen untuk divalidasi.');
                                            }
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md transition-all shadow-sm"
                                    >
                                        <Icon icon="solar:add-circle-outline" className="w-[18px] h-[18px]" />
                                        <span>Validasi Parameter</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* ===== GRID 4 CARD RINGKASAN METRIK ===== */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                            {metricCards.map((card) => (
                                <div key={card.key} className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden group">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold block mb-1 text-outline">
                                                {card.label}
                                            </span>
                                            <div className="flex items-baseline gap-2">
                                                <span className={`font-headline-xl text-headline-xl font-bold ${card.valueClass}`}>
                                                    {card.value}
                                                </span>
                                                <span className="font-body-lg text-body-lg font-medium text-on-surface-variant">
                                                    {card.unit}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.iconBox}`}>
                                            <Icon icon={card.icon} className="w-[22px] h-[22px]" />
                                        </div>
                                    </div>
                                    {card.footer}
                                </div>
                            ))}
                        </div>

                        {/* ===== MAIN DATA CONTAINER ===== */}
                        <div className="bg-surface-container-lowest rounded-xl shadow-sm flex flex-col overflow-hidden">
                            <div className="p-space-md bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                                    {DIMENSIONS.map((dim) => {
                                        const isActive = selectedDimension === dim.key;

                                        return (
                                            <button
                                                key={dim.key}
                                                type="button"
                                                onClick={() => setSelectedDimension(dim.key)}
                                                aria-pressed={isActive}
                                                className={`${pillBase} ${
                                                    isActive
                                                        ? 'bg-primary-container text-on-primary font-semibold'
                                                        : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                                                }`}
                                            >
                                                <span>{dim.label}</span>
                                                <span className={`px-1.5 py-0.5 rounded-full text-[11px] ${pillCountClass(dim.key)}`}>
                                                    {dimensionCount(dim.key)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

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
                                                title="Bersihkan pencarian"
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
                                        title="Opsi tampilan & urutan baku — segera hadir"
                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm shadow-sm cursor-not-allowed opacity-60"
                                    >
                                        <Icon icon="solar:tuning-2-outline" className="w-4 h-4" />
                                        <span className="hidden sm:inline">Urutan Baku</span>
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-left text-body-md">
                                    <thead>
                                        <tr className="bg-surface-container-low text-on-surface-variant uppercase font-label-sm text-label-sm tracking-wider">
                                            <th className="py-3 px-space-md font-semibold w-40">No / Kode</th>
                                            <th className="py-3 px-space-md font-semibold w-44">Dimensi</th>
                                            <th className="py-3 px-space-md font-semibold">
                                                Pernyataan Instrumen (Skala Likert 1-7)
                                            </th>
                                            <th className="py-3 px-space-md font-semibold text-right w-32">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-container">
                                        {filteredItems.map((item, index) => {
                                            const meta = DIMENSION_META[item.dimension] ?? DIMENSION_META.SD;

                                            return (
                                                <tr
                                                    key={item.id ?? item.item_code}
                                                    className="hover:bg-surface-container-low/70 transition-colors group"
                                                >
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
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-label-sm font-semibold ${meta.badge}`}>
                                                            {dimensionLabel(item.dimension)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-space-md align-middle text-on-surface font-body-md pr-6">
                                                        {item.text}
                                                    </td>
                                                    <td className="py-3 px-space-md align-middle text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(item)}
                                                            title="Edit Teks"
                                                            className={`p-1.5 rounded-lg transition-colors inline-flex items-center justify-center ${
                                                                canManage
                                                                    ? 'text-primary hover:bg-surface-container'
                                                                    : 'text-outline-variant cursor-not-allowed opacity-50'
                                                            }`}
                                                            disabled={!canManage}
                                                        >
                                                            <Icon icon="solar:pen-new-square-outline" className="w-[18px] h-[18px]" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {filteredItems.length === 0 && (
                                    <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
                                        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-3">
                                            <Icon icon="solar:clipboard-remove-outline" className="w-6 h-6" />
                                        </div>
                                        <h4 className="font-headline-md text-headline-md font-semibold text-on-surface">
                                            Tidak ada butir ditemukan
                                        </h4>
                                        <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-sm">
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
                                )}
                            </div>

                            <div className="p-space-md bg-surface-container-low/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm flex-wrap">
                                    <span>
                                        Menampilkan <strong className="text-on-surface">{filteredItems.length}</strong> dari{' '}
                                        <strong className="text-on-surface">{counts.total}</strong> butir instrumen baku
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
                                    <button type="button" className="px-2.5 py-1 rounded bg-primary-container text-on-primary font-bold shadow-sm">
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

                        {/* ===== 3 CARD PANDUAN & INFORMASI ===== */}
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
                                        Rentang respons bergerak dari 1 (Sangat Tidak Setuju) hingga 7 (Sangat Setuju) untuk
                                        menangkap variansi psikologis risiko kredit secara presisi.
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
                                        {counts.sd} butir pengontrol disisipkan acak untuk mendeteksi kecenderungan nasabah menjawab
                                        secara normatif atau memanipulasi citra diri.
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
                                        Modifikasi redaksional butir memerlukan persetujuan Komite Model dan akan mencatat revisi
                                        log audit kalibrasi sistem secara permanen.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== MODAL EDIT BUTIR KUESIONER ===== */}
                {editingItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={closeEdit} />
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
                                    onClick={closeEdit}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container-high transition-colors"
                                >
                                    <Icon icon="solar:close-square-outline" className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={submitUpdate}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold mb-1.5">
                                            Dimensi Psikometrik
                                        </label>
                                        <input
                                            type="text"
                                            value={dimensionLabel(editingItem.dimension)}
                                            readOnly
                                            tabIndex={-1}
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
                                            Perubahan butir akan langsung aktif pada formulir kuesioner asesmen baru tanpa
                                            mempengaruhi asesmen yang telah berstatus selesai.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-space-lg flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                                    <button
                                        type="button"
                                        onClick={closeEdit}
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
        </AuthenticatedLayout>
    );
}
