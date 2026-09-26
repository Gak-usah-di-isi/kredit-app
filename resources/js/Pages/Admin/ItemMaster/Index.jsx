import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ items = [], stats = {}, canManage = false }) {
    const [editingItem, setEditingItem] = useState(null);
    const { data, setData, put, processing, reset } = useForm({
        text: '',
    });

    const handleEdit = (item) => {
        setEditingItem(item);
        setData('text', item.text);
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        if (!editingItem) return;

        put(route('item-masters.update', editingItem.id), {
            onSuccess: () => {
                setEditingItem(null);
                reset();
            }
        });
    };

    const getDimBadge = (dim) => {
        if (dim === 'PFR') return <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">PFR (7 Item)</span>;
        if (dim === 'SSR') return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">SSR (4 Item)</span>;
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">SD (6 Item)</span>;
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Master Instrumen Kuesioner (17 Item)</h2>}>
            <Head title="Master Item Kuesioner" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Struktur Instrumen PCSM-SOPI Baku (17 Butir)</h3>
                            <p className="text-sm text-gray-500">
                                7 item Prudent Financial Responsibility (PFR), 4 item Sustainability Responsibility (SSR), dan 6 item kontrol Social Desirability (SD).
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <span className="text-xs text-gray-400 block font-semibold uppercase">Total Instrumen</span>
                            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total ?? 17} Butir</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-blue-100 bg-blue-50/20 shadow-sm">
                            <span className="text-xs text-blue-600 block font-semibold uppercase">PFR (Keuangan)</span>
                            <div className="text-2xl font-bold text-blue-800 mt-1">{stats.pfr ?? 7} Item</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
                            <span className="text-xs text-emerald-600 block font-semibold uppercase">SSR (Keberlanjutan)</span>
                            <div className="text-2xl font-bold text-emerald-800 mt-1">{stats.ssr ?? 4} Item</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-sm">
                            <span className="text-xs text-amber-600 block font-semibold uppercase">SD (Kontrol Kejujuran)</span>
                            <div className="text-2xl font-bold text-amber-800 mt-1">{stats.sd ?? 6} Item</div>
                        </div>
                    </div>

                    {/* Modal Edit */}
                    {editingItem && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <div className="fixed inset-0 bg-black/40" onClick={() => setEditingItem(null)} />
                            <div className="relative bg-white rounded-xl shadow-lg w-full max-w-lg p-6 z-10">
                                <h3 className="text-lg font-bold mb-1">Edit Teks Butir Soal #{editingItem.item_code}</h3>
                                <p className="text-xs text-gray-500 mb-4">Dimensi: <strong>{editingItem.dimension}</strong></p>

                                <form onSubmit={submitUpdate} className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Pernyataan Kuesioner</label>
                                        <textarea
                                            rows="4"
                                            value={data.text}
                                            onChange={(e) => setData('text', e.target.value)}
                                            className="w-full text-sm rounded-lg border-gray-300"
                                        ></textarea>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setEditingItem(null)}
                                            className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                                        >
                                            Simpan Perubahan
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
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">No / Kode</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Dimensi</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Pernyataan Instrumen (Skala Likert 1-7)</th>
                                    {canManage && <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Aksi</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {items.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50/60 transition">
                                        <td className="px-6 py-4 font-mono text-xs">
                                            <span className="font-bold text-gray-900">{item.item_code}</span>
                                            <span className="text-gray-400 block">Urutan: #{item.display_order ?? (index + 1)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getDimBadge(item.dimension)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-800 text-sm leading-relaxed">
                                            {item.text}
                                        </td>
                                        {canManage && (
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                                                >
                                                    Edit Teks
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
