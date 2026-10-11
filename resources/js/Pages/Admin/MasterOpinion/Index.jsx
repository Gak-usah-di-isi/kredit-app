import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Icon } from '@iconify/react';

export default function Index({ opinions = [], categories = [], filters = {} }) {
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'ALL');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [editingOpinion, setEditingOpinion] = useState(null);

    const { data, setData, put, processing, reset, errors } = useForm({
        title: '',
        narrative: '',
        description: '',
    });

    const handleEdit = (opinion) => {
        setEditingOpinion(opinion);
        setData({
            title: opinion.title,
            narrative: opinion.narrative,
            description: opinion.description || '',
        });
    };

    const handleCloseModal = () => {
        setEditingOpinion(null);
        reset();
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        if (!editingOpinion) return;

        put(route('master-opinions.update', editingOpinion.id), {
            preserveScroll: true,
            onSuccess: () => {
                handleCloseModal();
            },
        });
    };

    // Filter opinions based on tab and search query
    const filteredOpinions = useMemo(() => {
        return opinions.filter((op) => {
            const matchesCategory =
                selectedCategory === 'ALL' || op.category === selectedCategory;
            const q = searchQuery.toLowerCase();
            const matchesSearch =
                !q ||
                op.code.toLowerCase().includes(q) ||
                op.title.toLowerCase().includes(q) ||
                op.narrative.toLowerCase().includes(q) ||
                (op.description && op.description.toLowerCase().includes(q));

            return matchesCategory && matchesSearch;
        });
    }, [opinions, selectedCategory, searchQuery]);

    // Summary stats
    const stats = useMemo(() => {
        return {
            total: opinions.length,
            recommendation: opinions.filter((o) => o.category === 'Rekomendasi Utama').length,
            pfr: opinions.filter((o) => o.category === 'Dimensi PFR').length,
            ssr: opinions.filter((o) => o.category === 'Dimensi SSR').length,
            credibility: opinions.filter((o) => o.category === 'Kredibilitas Respon').length,
        };
    }, [opinions]);

    const getBadgeStyle = (code) => {
        if (code.includes('SUPPORTIVE') || code.includes('NORMAL')) {
            return 'bg-secondary-fixed text-on-secondary-fixed';
        }
        if (code.includes('CONCERN') || code.includes('HIGH') || code.includes('FLAGGED') || code.includes('VERIFICATION')) {
            return 'bg-error-container text-on-error-container';
        }
        if (code.includes('REVIEW') || code.includes('ELEVATED')) {
            return 'bg-tertiary-fixed text-on-tertiary-fixed';
        }
        return 'bg-primary-fixed text-on-primary-fixed-variant';
    };

    const statCardBase =
        'rounded-xl p-space-md flex flex-col justify-between text-left transition-all';

    return (
        <AuthenticatedLayout>
            <Head title="Master Opini & Narasi Rekomendasi" />

            <div className="w-full min-h-full bg-background font-body-md text-on-surface">
                <div className="flex flex-col w-full gap-space-lg px-space-lg py-space-md pb-12">
                    {/* Title & Description Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                        <div className="flex flex-col">
                            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
                                Master Opini &amp; Narasi Rekomendasi
                            </h1>
                            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                                Manajemen konfigurasi teks rekomendasi, interpretasi psikometrik, dan narasi keputusan kredit PCSM-SOPI di database.
                            </p>
                        </div>
                        <div className="flex items-center gap-space-sm self-start md:self-auto">
                            <button
                                type="button"
                                disabled
                                title="Segera hadir — fitur riwayat versi sedang disiapkan"
                                className="inline-flex items-center gap-2 px-space-md py-2 rounded-lg bg-surface-container-lowest text-on-surface shadow-sm font-label-md text-label-md cursor-not-allowed opacity-60"
                            >
                                <Icon icon="solar:history-outline" className="w-[18px] h-[18px] text-outline" />
                                Riwayat Versi
                            </button>
                            <button
                                type="button"
                                disabled
                                title="Segera hadir — endpoint tambah template belum tersedia"
                                className="inline-flex items-center gap-2 px-space-md py-2 rounded-lg bg-primary-container text-on-primary shadow-sm font-label-md text-label-md cursor-not-allowed opacity-60"
                            >
                                <Icon icon="solar:add-circle-outline" className="w-[18px] h-[18px]" />
                                Tambah Template
                            </button>
                        </div>
                    </div>

                    {/* Database Synchronization Notice Banner */}
                    <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-lg shadow-sm">
                        <div className="flex items-start gap-space-md">
                            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-md">
                                <Icon icon="solar:database-outline" className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1 pr-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                                        Penyimpanan Terpusat &amp; Fleksibel di Database
                                    </h2>
                                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[10px] uppercase font-bold tracking-wider">
                                        Sync Active
                                    </span>
                                </div>
                                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                                    Semua narasi pada halaman ini tersimpan di tabel database{' '}
                                    <code className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-data-mono text-data-mono font-medium">master_opinions</code>. Kalimat rekomendasi, narasi PFR/SSR, maupun catatan integritas respon yang diubah di sini akan otomatis diterapkan oleh sistem kalkulasi{' '}
                                    <code className="px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-data-mono text-data-mono font-semibold">DecisionEngine</code> pada setiap asesmen kredit yang dianalisis.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Summary Metric Cards (5 Cards) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
                        {/* Total Template (Highlighted Active) */}
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('ALL')}
                            className={`${statCardBase} bg-primary text-on-primary shadow-md relative overflow-hidden group cursor-pointer hover:-translate-y-0.5 ${selectedCategory === 'ALL' ? 'ring-2 ring-primary-fixed-dim' : ''}`}
                        >
                            <div className="absolute -right-3 -bottom-3 text-on-primary/10 select-none pointer-events-none">
                                <Icon icon="solar:book-bold-duotone" className="w-[80px] h-[80px]" />
                            </div>
                            <div className="flex items-center justify-between z-10">
                                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-primary-container">
                                    Total Template
                                </span>
                                <Icon icon="solar:layers-outline" className="w-5 h-5 text-on-primary-container" />
                            </div>
                            <div className="mt-4 z-10 text-left">
                                <span className="font-headline-xl text-headline-xl font-bold tracking-tight block leading-none">{stats.total}</span>
                                <span className="font-body-sm text-body-sm text-on-primary/80 mt-1 block">Semua Narasi</span>
                            </div>
                        </button>

                        {/* Rekomendasi Utama */}
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('Rekomendasi Utama')}
                            className={`${statCardBase} bg-surface-container-lowest shadow-sm hover:shadow-md ${selectedCategory === 'Rekomendasi Utama' ? 'ring-2 ring-primary/40' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                                    Rekomendasi Utama
                                </span>
                                <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                                    <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="font-headline-xl text-headline-xl font-bold text-on-surface block leading-none">{stats.recommendation}</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant mt-1 block truncate">Supportive / Review / Concern</span>
                            </div>
                        </button>

                        {/* Dimensi PFR */}
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('Dimensi PFR')}
                            className={`${statCardBase} bg-surface-container-lowest shadow-sm hover:shadow-md ${selectedCategory === 'Dimensi PFR' ? 'ring-2 ring-secondary/40' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                                    Dimensi PFR
                                </span>
                                <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
                                    <Icon icon="solar:wallet-money-bold-duotone" className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="font-headline-xl text-headline-xl font-bold text-on-surface block leading-none">{stats.pfr}</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant mt-1 block truncate">Tanggung Jawab Keuangan</span>
                            </div>
                        </button>

                        {/* Dimensi SSR */}
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('Dimensi SSR')}
                            className={`${statCardBase} bg-surface-container-lowest shadow-sm hover:shadow-md ${selectedCategory === 'Dimensi SSR' ? 'ring-2 ring-tertiary/40' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                                    Dimensi SSR
                                </span>
                                <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary">
                                    <Icon icon="solar:shop-outline" className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="font-headline-xl text-headline-xl font-bold text-on-surface block leading-none">{stats.ssr}</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant mt-1 block truncate">Keberlanjutan &amp; Bisnis</span>
                            </div>
                        </button>

                        {/* Kredibilitas & SD */}
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('Kredibilitas Respon')}
                            className={`${statCardBase} bg-surface-container-lowest shadow-sm hover:shadow-md col-span-2 sm:col-span-1 ${selectedCategory === 'Kredibilitas Respon' ? 'ring-2 ring-on-tertiary-fixed-variant/40' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                                    Kredibilitas &amp; SD
                                </span>
                                <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-on-tertiary-fixed-variant">
                                    <Icon icon="solar:user-speak-rounded-bold-duotone" className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="font-headline-xl text-headline-xl font-bold text-on-surface block leading-none">{stats.credibility}</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant mt-1 block truncate">Integritas &amp; Kejujuran</span>
                            </div>
                        </button>
                    </div>

                    {/* Interactive Controls: Filter Pills & Search */}
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('ALL')}
                                className={`px-4 py-2 rounded-full font-label-md text-label-md transition-colors whitespace-nowrap ${
                                    selectedCategory === 'ALL'
                                        ? 'bg-on-surface text-surface-container-lowest font-medium shadow-sm'
                                        : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high font-medium'
                                }`}
                            >
                                Semua ({opinions.length})
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-full font-label-md text-label-md transition-colors whitespace-nowrap ${
                                        selectedCategory === cat
                                            ? 'bg-on-surface text-surface-container-lowest font-medium shadow-sm'
                                            : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high font-medium'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full lg:w-80 shrink-0">
                            <Icon
                                icon="solar:magnifer-outline"
                                className="w-[18px] h-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari template narasi / kode..."
                                className="w-full pl-9 pr-9 py-2 text-body-sm bg-surface-container-lowest rounded-xl text-on-surface placeholder:text-outline shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all border-0"
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
                    </div>

                    {/* Narrative Template Cards */}
                    <div className="flex flex-col gap-space-md">
                        {filteredOpinions.length === 0 ? (
                            <div className="rounded-xl bg-surface-container-lowest p-12 text-center shadow-sm">
                                <Icon icon="solar:clipboard-remove-outline" className="w-12 h-12 text-outline-variant mx-auto mb-3" />
                                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                                    Tidak ada template opini yang sesuai
                                </h3>
                                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                                    Coba sesuaikan kata kunci pencarian atau kategori yang dipilih.
                                </p>
                            </div>
                        ) : (
                            filteredOpinions.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col gap-space-md">
                                        {/* Card Top Bar: Badges + Action */}
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-1 rounded-full font-data-mono text-[11px] font-bold tracking-wider ${getBadgeStyle(item.code)}`}>
                                                    {item.code}
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-[11px]">
                                                    <Icon icon="solar:folder-outline" className="w-[13px] h-[13px]" />
                                                    {item.category}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(item)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-primary font-label-md text-label-md font-semibold transition-colors"
                                            >
                                                <Icon icon="solar:pen-new-square-outline" className="w-4 h-4" />
                                                Edit Narasi
                                            </button>
                                        </div>

                                        {/* Title */}
                                        <div>
                                            <h3 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
                                                {item.title}
                                            </h3>
                                        </div>

                                        {/* Narrative Quote Container */}
                                        <div className="rounded-lg bg-surface-container-low p-space-md flex flex-col gap-2">
                                            <div className="flex items-center gap-1.5 text-outline">
                                                <Icon icon="solar:chat-round-outline" className="w-4 h-4" />
                                                <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">
                                                    Template Kalimat Rekomendasi
                                                </span>
                                            </div>
                                            <p className="font-body-md text-body-md text-on-surface italic pl-1 leading-relaxed whitespace-pre-wrap">
                                                &ldquo;{item.narrative}&rdquo;
                                            </p>
                                        </div>

                                        {/* Threshold Note */}
                                        {item.description && (
                                            <div className="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm pt-1">
                                                <Icon icon="solar:info-circle-linear" className="w-4 h-4 text-outline shrink-0" />
                                                <span>{item.description}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Edit Modal Dialog */}
                    {editingOpinion && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div
                                className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm"
                                onClick={handleCloseModal}
                            />
                            <div className="relative w-full max-w-xl bg-surface-container-lowest rounded-xl shadow-xl p-space-lg flex flex-col gap-space-md z-10 max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                                            <Icon icon="solar:pen-new-square-outline" className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-headline-md text-headline-md font-bold text-on-surface">
                                                Edit Template Narasi
                                            </h4>
                                            <span className="font-data-mono text-data-mono text-outline text-xs">
                                                {editingOpinion.code}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
                                    >
                                        <Icon icon="solar:close-square-outline" className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={submitUpdate} className="flex flex-col gap-space-md">
                                    <div className="flex flex-col gap-2">
                                        <label className="font-label-sm text-label-sm uppercase tracking-wider font-bold text-outline">
                                            Judul Opini
                                        </label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary border-0"
                                            required
                                        />
                                        {errors.title && (
                                            <span className="font-body-sm text-body-sm text-error">{errors.title}</span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <label className="font-label-sm text-label-sm uppercase tracking-wider font-bold text-outline">
                                                Isi Teks Rekomendasi (Bahasa Indonesia)
                                            </label>
                                            <span className="font-data-mono text-[11px] text-outline">
                                                {data.narrative.length} karakter
                                            </span>
                                        </div>
                                        <textarea
                                            rows="4"
                                            value={data.narrative}
                                            onChange={(e) => setData('narrative', e.target.value)}
                                            className="w-full p-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary resize-none border-0"
                                            placeholder="Tuliskan template narasi rekomendasi..."
                                            required
                                        />
                                        {errors.narrative && (
                                            <span className="font-body-sm text-body-sm text-error">{errors.narrative}</span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="font-label-sm text-label-sm uppercase tracking-wider font-bold text-outline">
                                            Deskripsi / Kriteria Pemicu (Catatan Internal)
                                        </label>
                                        <textarea
                                            rows="2"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="w-full p-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none border-0"
                                            placeholder="Penjelasan kapan formula memicu opini ini (opsional)..."
                                        />
                                    </div>

                                    <div className="p-space-sm rounded-lg bg-surface-container flex items-start gap-2">
                                        <Icon icon="solar:shield-check-bold-duotone" className="w-[18px] h-[18px] text-outline shrink-0 mt-0.5" />
                                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                                            Perubahan narasi akan langsung disimpan pada tabel{' '}
                                            <code className="font-data-mono text-primary">master_opinions</code> dan berlaku untuk laporan asesmen yang di-generate berikutnya.
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-medium transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-sm transition-colors disabled:opacity-50"
                                        >
                                            <Icon icon="solar:diskette-outline" className="w-4 h-4" />
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
