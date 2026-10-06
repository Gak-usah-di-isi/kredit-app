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
        return {
            total: items.length,
            pfr: items.filter((i) => i.dimension === 'PFR').length,
            ssr: items.filter((i) => i.dimension === 'SSR').length,
            sd: items.filter((i) => i.dimension === 'SD').length,
        };
    }, [items]);

    const getDimBadge = (dim) => {
        if (dim === 'PFR') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <Icon icon="solar:wallet-money-bold-duotone" className="w-3.5 h-3.5" />
                    PFR (Keuangan)
                </span>
            );
        }
        if (dim === 'SSR') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Icon icon="solar:chart-2-bold-duotone" className="w-3.5 h-3.5" />
                    SSR (Keberlanjutan)
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Icon icon="solar:user-speak-rounded-bold-duotone" className="w-3.5 h-3.5" />
                SD (Kontrol Kejujuran)
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-gray-900">
                            Master Instrumen Kuesioner ({dimensionCounts.total} Butir Soal)
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                            Kelola butir pertanyaan, pengelompokan dimensi, dan urutan instrumen psikometrik PCSM-SOPI baku.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Master Item Kuesioner" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Banner Informasi */}
                    <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-blue-50/30 p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-sm flex-shrink-0">
                                <Icon icon="solar:document-text-bold-duotone" className="w-6 h-6" />
                            </div>
                            <div className="text-sm">
                                <h4 className="font-bold text-gray-900">
                                    Struktur Baku Instrumen Psikometrik PCSM-SOPI
                                </h4>
                                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                    Instrumen kuesioner terdiri dari <span className="font-semibold text-blue-700">{dimensionCounts.pfr} item Prudent Financial Responsibility (PFR)</span>, <span className="font-semibold text-emerald-700">{dimensionCounts.ssr} item Sustainability Responsibility (SSR)</span>, dan <span className="font-semibold text-amber-700">{dimensionCounts.sd} item Social Desirability (SD)</span> dengan pilihan skala Likert (1 - 7).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Filter Cards Status */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                        <div
                            onClick={() => setSelectedDimension('ALL')}
                            className={`p-4 rounded-xl border cursor-pointer transition shadow-sm ${
                                selectedDimension === 'ALL'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-800 border-gray-100 hover:border-gray-300'
                            }`}
                        >
                            <span className={`text-[11px] block font-semibold uppercase tracking-wider ${selectedDimension === 'ALL' ? 'text-blue-100' : 'text-gray-400'}`}>
                                Total Butir Soal
                            </span>
                            <div className="text-2xl font-black mt-1">{dimensionCounts.total}</div>
                            <span className={`text-[11px] block mt-0.5 ${selectedDimension === 'ALL' ? 'text-blue-100' : 'text-gray-400'}`}>Semua Dimensi</span>
                        </div>

                        <div
                            onClick={() => setSelectedDimension('PFR')}
                            className={`p-4 rounded-xl border cursor-pointer transition shadow-sm ${
                                selectedDimension === 'PFR'
                                    ? 'bg-blue-700 text-white border-blue-700'
                                    : 'bg-white text-gray-800 border-gray-100 hover:border-blue-200'
                            }`}
                        >
                            <span className={`text-[11px] block font-semibold uppercase tracking-wider ${selectedDimension === 'PFR' ? 'text-blue-100' : 'text-blue-600'}`}>
                                PFR (Keuangan)
                            </span>
                            <div className="text-2xl font-black mt-1">{dimensionCounts.pfr}</div>
                            <span className={`text-[11px] block mt-0.5 ${selectedDimension === 'PFR' ? 'text-blue-100' : 'text-gray-400'}`}>Tanggung Jawab Financial</span>
                        </div>

                        <div
                            onClick={() => setSelectedDimension('SSR')}
                            className={`p-4 rounded-xl border cursor-pointer transition shadow-sm ${
                                selectedDimension === 'SSR'
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-white text-gray-800 border-gray-100 hover:border-emerald-200'
                            }`}
                        >
                            <span className={`text-[11px] block font-semibold uppercase tracking-wider ${selectedDimension === 'SSR' ? 'text-emerald-100' : 'text-emerald-600'}`}>
                                SSR (Keberlanjutan)
                            </span>
                            <div className="text-2xl font-black mt-1">{dimensionCounts.ssr}</div>
                            <span className={`text-[11px] block mt-0.5 ${selectedDimension === 'SSR' ? 'text-emerald-100' : 'text-gray-400'}`}>Perilaku Bisnis Hijau</span>
                        </div>

                        <div
                            onClick={() => setSelectedDimension('SD')}
                            className={`p-4 rounded-xl border cursor-pointer transition shadow-sm ${
                                selectedDimension === 'SD'
                                    ? 'bg-amber-600 text-white border-amber-600'
                                    : 'bg-white text-gray-800 border-gray-100 hover:border-amber-200'
                            }`}
                        >
                            <span className={`text-[11px] block font-semibold uppercase tracking-wider ${selectedDimension === 'SD' ? 'text-amber-100' : 'text-amber-600'}`}>
                                SD (Kontrol)
                            </span>
                            <div className="text-2xl font-black mt-1">{dimensionCounts.sd}</div>
                            <span className={`text-[11px] block mt-0.5 ${selectedDimension === 'SD' ? 'text-amber-100' : 'text-gray-400'}`}>Integritas & Social Desirability</span>
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setSelectedDimension('ALL')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                    selectedDimension === 'ALL'
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Semua ({dimensionCounts.total})
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedDimension('PFR')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                    selectedDimension === 'PFR'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                PFR ({dimensionCounts.pfr})
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedDimension('SSR')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                    selectedDimension === 'SSR'
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                SSR ({dimensionCounts.ssr})
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedDimension('SD')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                    selectedDimension === 'SD'
                                        ? 'bg-amber-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                SD ({dimensionCounts.sd})
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full sm:w-72">
                            <Icon
                                icon="solar:magnifer-outline"
                                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari butir instrumen / kode..."
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

                    {/* Table / List View */}
                    <div className="overflow-hidden bg-white shadow-sm rounded-2xl border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-100 text-sm">
                            <thead className="bg-gray-50/80">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                                        No / Kode
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Dimensi
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Pernyataan Instrumen (Skala Likert 1-7)
                                    </th>
                                    {canManage && (
                                        <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Aksi
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={canManage ? 4 : 3} className="px-6 py-12 text-center">
                                            <Icon icon="solar:clipboard-remove-outline" className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                            <span className="text-sm font-semibold text-gray-600 block">Tidak ada butir instrumen yang cocok</span>
                                            <span className="text-xs text-gray-400">Coba ubah kata kunci atau filter dimensi.</span>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50/60 transition">
                                            <td className="px-6 py-4 font-mono text-xs">
                                                <span className="font-bold text-gray-900 block">{item.item_code}</span>
                                                <span className="text-gray-400 text-[11px]">Urutan: #{item.display_order ?? (index + 1)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getDimBadge(item.dimension)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-800 text-sm leading-relaxed max-w-xl">
                                                "{item.text}"
                                            </td>
                                            {canManage && (
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(item)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-100 transition shadow-xs"
                                                    >
                                                        <Icon icon="solar:pen-new-square-outline" className="w-3.5 h-3.5" />
                                                        Edit Teks
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Modal Edit Dialog */}
                    {editingItem && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div
                                className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
                                onClick={handleCloseModal}
                            />
                            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10 space-y-4">
                                <div className="flex items-start justify-between border-b pb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 font-mono">
                                                #{editingItem.item_code}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Dimensi: <strong className="text-gray-700">{editingItem.dimension}</strong>
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Edit Pernyataan Instumen
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
                                            Pernyataan Butir Soal (Bahasa Indonesia)
                                        </label>
                                        <textarea
                                            rows="4"
                                            value={data.text}
                                            onChange={(e) => setData('text', e.target.value)}
                                            className="w-full text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 leading-relaxed"
                                            placeholder="Tuliskan teks butir instrumen..."
                                            required
                                        ></textarea>
                                        {errors.text && (
                                            <span className="text-xs text-red-600 mt-1 block">{errors.text}</span>
                                        )}
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
