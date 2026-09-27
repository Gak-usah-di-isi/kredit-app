import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
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
            dimensions: opinions.filter((o) => o.category === 'Dimensi PFR' || o.category === 'Dimensi SSR').length,
            credibility: opinions.filter((o) => o.category === 'Kredibilitas Respon').length,
            disclaimer: opinions.filter((o) => o.category === 'Disclaimer').length,
        };
    }, [opinions]);

    const getBadgeStyle = (code) => {
        if (code.includes('SUPPORTIVE') || code.includes('NORMAL')) {
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        }
        if (code.includes('CONCERN') || code.includes('HIGH') || code.includes('FLAGGED')) {
            return 'bg-rose-50 text-rose-700 border-rose-200';
        }
        if (code.includes('REVIEW') || code.includes('ELEVATED')) {
            return 'bg-amber-50 text-amber-700 border-amber-200';
        }
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    };

    const getCategoryIcon = (cat) => {
        switch (cat) {
            case 'Rekomendasi Utama':
                return 'solar:shield-check-bold-duotone';
            case 'Dimensi PFR':
                return 'solar:wallet-money-bold-duotone';
            case 'Dimensi SSR':
                return 'solar:chart-2-bold-duotone';
            case 'Kredibilitas Respon':
                return 'solar:user-speak-rounded-bold-duotone';
            case 'Disclaimer':
                return 'solar:info-circle-bold-duotone';
            default:
                return 'solar:document-text-bold-duotone';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-gray-900">
                            Master Opini & Narasi Rekomendasi
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                            Manajemen konfigurasi teks rekomendasi, interpretasi psikometrik, dan narasi keputusan kredit PCSM-SOPI di database.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Master Opini & Narasi Rekomendasi" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Info Banner */}
                    <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-blue-50/30 p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-sm flex-shrink-0">
                                <Icon icon="solar:database-outline" className="w-6 h-6" />
                            </div>
                            <div className="text-sm">
                                <h4 className="font-bold text-gray-900">
                                    Penyimpanan Terpusat & Fleksibel di Database
                                </h4>
                                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                    Semua narasi pada halaman ini tersimpan di tabel database <code className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-xs">master_opinions</code>. Kalimat rekomendasi, narasi PFR/SSR, maupun catatan integritas respon yang diubah di sini akan otomatis diterapkan oleh sistem kalkulasi <code className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-xs">DecisionEngine</code> pada setiap asesmen kredit yang dianalisis.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                        <div
                            onClick={() => setSelectedCategory('ALL')}
                            className={`p-4 rounded-xl border cursor-pointer transition shadow-sm ${
                                selectedCategory === 'ALL'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-800 border-gray-100 hover:border-gray-300'
                            }`}
                        >
                            <span className={`text-[11px] block font-semibold uppercase tracking-wider ${selectedCategory === 'ALL' ? 'text-blue-100' : 'text-gray-400'}`}>
                                Total Template
                            </span>
                            <div className="text-2xl font-black mt-1">{stats.total}</div>
                            <span className={`text-[11px] block mt-0.5 ${selectedCategory === 'ALL' ? 'text-blue-100' : 'text-gray-400'}`}>Semua Narasi</span>
                        </div>

                        <div
                            onClick={() => setSelectedCategory('Rekomendasi Utama')}
                            className={`p-4 rounded-xl border cursor-pointer transition shadow-sm ${
                                selectedCategory === 'Rekomendasi Utama'
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-white text-gray-800 border-gray-100 hover:border-emerald-200'
                            }`}
                        >
                            <span className={`text-[11px] block font-semibold uppercase tracking-wider ${selectedCategory === 'Rekomendasi Utama' ? 'text-emerald-100' : 'text-emerald-600'}`}>
                                Rekomendasi Utama
                            </span>
                            <div className="text-2xl font-black mt-1">{stats.recommendation}</div>
                            <span className={`text-[11px] block mt-0.5 ${selectedCategory === 'Rekomendasi Utama' ? 'text-emerald-100' : 'text-gray-400'}`}>Supportive / Review / Concern</span>
                        </div>

                        <div
                            onClick={() => setSelectedCategory('Dimensi PFR')}
                            className={`p-4 rounded-xl border cursor-pointer transition shadow-sm ${
                                selectedCategory === 'Dimensi PFR'
                                    ? 'bg-blue-700 text-white border-blue-700'
                                    : 'bg-white text-gray-800 border-gray-100 hover:border-blue-200'
                            }`}
                        >
                            <span className={`text-[11px] block font-semibold uppercase tracking-wider ${selectedCategory === 'Dimensi PFR' ? 'text-blue-100' : 'text-blue-600'}`}>
                                Dimensi PFR
                            </span>
                            <div className="text-2xl font-black mt-1">3</div>
                            <span className={`text-[11px] block mt-0.5 ${selectedCategory === 'Dimensi PFR' ? 'text-blue-100' : 'text-gray-400'}`}>Tanggung Jawab Keuangan</span>
                        </div>

                        <div
                            onClick={() => setSelectedCategory('Dimensi SSR')}
                            className={`p-4 rounded-xl border cursor-pointer transition shadow-sm ${
                                selectedCategory === 'Dimensi SSR'
                                    ? 'bg-teal-700 text-white border-teal-700'
                                    : 'bg-white text-gray-800 border-gray-100 hover:border-teal-200'
                            }`}
                        >
                            <span className={`text-[11px] block font-semibold uppercase tracking-wider ${selectedCategory === 'Dimensi SSR' ? 'text-teal-100' : 'text-teal-600'}`}>
                                Dimensi SSR
                            </span>
                            <div className="text-2xl font-black mt-1">3</div>
                            <span className={`text-[11px] block mt-0.5 ${selectedCategory === 'Dimensi SSR' ? 'text-teal-100' : 'text-gray-400'}`}>Keberlanjutan & Bisnis</span>
                        </div>

                        <div
                            onClick={() => setSelectedCategory('Kredibilitas Respon')}
                            className={`p-4 rounded-xl border cursor-pointer transition shadow-sm col-span-2 sm:col-span-1 ${
                                selectedCategory === 'Kredibilitas Respon'
                                    ? 'bg-amber-600 text-white border-amber-600'
                                    : 'bg-white text-gray-800 border-gray-100 hover:border-amber-200'
                            }`}
                        >
                            <span className={`text-[11px] block font-semibold uppercase tracking-wider ${selectedCategory === 'Kredibilitas Respon' ? 'text-amber-100' : 'text-amber-600'}`}>
                                Kredibilitas & SD
                            </span>
                            <div className="text-2xl font-black mt-1">{stats.credibility}</div>
                            <span className={`text-[11px] block mt-0.5 ${selectedCategory === 'Kredibilitas Respon' ? 'text-amber-100' : 'text-gray-400'}`}>Integritas & Kejujuran</span>
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        {/* Tabs Kategori */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('ALL')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                    selectedCategory === 'ALL'
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Semua ({opinions.length})
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                        selectedCategory === cat
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-72">
                            <Icon
                                icon="solar:magnifer-outline"
                                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari template narasi / kode..."
                                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <Icon icon="solar:close-circle-bold" className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Opinions List Cards */}
                    <div className="space-y-4">
                        {filteredOpinions.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
                                <Icon icon="solar:clipboard-remove-outline" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-sm font-semibold text-gray-700">Tidak ada template opini yang sesuai</h3>
                                <p className="text-xs text-gray-400 mt-1">Coba sesuaikan kata kunci pencarian atau kategori yang dipilih.</p>
                            </div>
                        ) : (
                            filteredOpinions.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-gray-200 transition"
                                >
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="space-y-2.5 flex-1">
                                            {/* Badges & Meta */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border font-mono ${getBadgeStyle(item.code)}`}>
                                                    {item.code}
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                                    <Icon icon={getCategoryIcon(item.category)} className="w-3.5 h-3.5" />
                                                    {item.category}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-base font-bold text-gray-900">
                                                {item.title}
                                            </h3>

                                            {/* Narrative text display */}
                                            <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                    <Icon icon="solar:chat-line-outline" className="w-3.5 h-3.5 text-blue-500" />
                                                    Template Kalimat Rekomendasi
                                                </div>
                                                <p className="text-sm text-gray-800 leading-relaxed font-normal whitespace-pre-wrap">
                                                    "{item.narrative}"
                                                </p>
                                            </div>

                                            {/* Technical Note / Description */}
                                            {item.description && (
                                                <div className="flex items-start gap-1.5 text-xs text-gray-500 pl-1">
                                                    <Icon icon="solar:info-circle-linear" className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                                    <span>{item.description}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <div className="flex-shrink-0 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(item)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-100 transition shadow-sm"
                                            >
                                                <Icon icon="solar:pen-new-square-outline" className="w-4 h-4" />
                                                Edit Narasi
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Edit Modal Dialog */}
                    {editingOpinion && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div
                                className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
                                onClick={handleCloseModal}
                            />
                            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 z-10 space-y-4 max-h-[90vh] overflow-y-auto">
                                <div className="flex items-start justify-between border-b pb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold border font-mono ${getBadgeStyle(editingOpinion.code)}`}>
                                                {editingOpinion.code}
                                            </span>
                                            <span className="text-xs text-gray-500 font-medium">
                                                {editingOpinion.category}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mt-1">
                                            Edit Template Opini & Narasi
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                                    >
                                        <Icon icon="solar:close-square-outline" className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={submitUpdate} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Judul Opini
                                        </label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="w-full text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.title && (
                                            <span className="text-xs text-red-600 mt-1 block">{errors.title}</span>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Kalimat Narasi Rekomendasi
                                            </label>
                                            <span className="text-[11px] text-gray-400">
                                                {data.narrative.length} karakter
                                            </span>
                                        </div>
                                        <textarea
                                            rows="5"
                                            value={data.narrative}
                                            onChange={(e) => setData('narrative', e.target.value)}
                                            className="w-full text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 leading-relaxed"
                                            placeholder="Tuliskan template narasi rekomendasi..."
                                            required
                                        />
                                        {errors.narrative && (
                                            <span className="text-xs text-red-600 mt-1 block">{errors.narrative}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Deskripsi / Kriteria Pemicu (Catatan Internal)
                                        </label>
                                        <textarea
                                            rows="2"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="w-full text-xs rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Penjelasan kapan formula memicu opini ini (opsional)..."
                                        />
                                    </div>

                                    {/* Preview Callout */}
                                    <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs text-blue-900">
                                        <div className="font-semibold flex items-center gap-1 text-blue-800 mb-0.5">
                                            <Icon icon="solar:eye-outline" className="w-4 h-4" />
                                            Preview Narasi Live:
                                        </div>
                                        <p className="italic text-gray-700">"{data.narrative || 'Belum ada narasi'}"</p>
                                    </div>

                                    <div className="flex justify-end gap-2.5 pt-3 border-t">
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="px-4 py-2 border rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
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
