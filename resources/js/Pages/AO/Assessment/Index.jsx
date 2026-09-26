import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FloatSelect } from '@/Components/ui/FloatSelect';

export default function Index({ assessments }) {
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, errors } = useForm({ borrower_id: '' });
    const { borrowers = [] } = usePage().props;

    const submit = (e) => {
        e.preventDefault();
        post(route('assessments.store'));
    };

    const getBadge = (rec) => {
        if (!rec) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Draft</span>;
        if (rec === 'SUPPORTIVE') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Supportive</span>;
        if (rec.includes('REVIEW')) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">{rec}</span>;
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">{rec}</span>;
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Daftar Asesmen</h2>}>
            <Head title="Daftar Asesmen" />
            
            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Riwayat Asesmen PCSM-SOPI</h3>
                            <p className="text-sm text-gray-500">Kelola dan pantau hasil asesmen calon debitur Anda</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
                        >
                            + Buat Asesmen Baru
                        </button>
                    </div>

                    {/* Create modal (uses native select to avoid FloatSelect visual issue) */}
                    {showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <div className="fixed inset-0 bg-black/40" onClick={() => setShowModal(false)} />
                            <div className="relative bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 z-10">
                                <h3 className="text-lg font-bold mb-2">Mulai Asesmen PCSM-SOPI</h3>
                                <p className="text-sm text-gray-500 mb-4">Pilih calon debitur untuk membuat link kuesioner psikometrik yang akan diisi oleh nasabah.</p>

                                <form onSubmit={submit} className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm font-semibold text-gray-700">Pilih Calon Debitur / Nasabah</label>
                                        </div>
                                        <div className="mt-1">
                                            <FloatSelect
                                                id="borrower_id"
                                                options={borrowers.map(b => ({ value: b.id, label: `${b.name} (NIK: ${b.nik})` }))}
                                                value={data.borrower_id}
                                                onChange={(v) => setData('borrower_id', v)}
                                                placeholder="-- Pilih Calon Debitur --"
                                            />
                                        </div>
                                        {errors.borrower_id && <p className="mt-1.5 text-xs text-red-600">{errors.borrower_id}</p>}
                                    </div>

                                    <div className="rounded-lg bg-blue-50/70 border border-blue-100 p-4 text-xs text-blue-800 space-y-1">
                                        <p className="font-semibold text-blue-900">ℹ️ Informasi Penting:</p>
                                        <p>• Sistem akan otomatis menggunakan parameter kalibrasi aktif terbaru.</p>
                                        <p>• Setelah dibuat, sistem menghasilkan link kuesioner unik untuk dibuka di tablet atau dikirim ke nasabah.</p>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
                                        >
                                            Generate Sesi Asesmen
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-xl border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/80">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">ID / Tanggal</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Nasabah</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Rekomendasi</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {assessments.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                                            Belum ada asesmen yang dibuat. Klik tombol di atas untuk membuat asesmen baru.
                                        </td>
                                    </tr>
                                ) : (
                                    assessments.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/60 transition">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                <div className="font-semibold text-gray-900">#{item.id}</div>
                                                <div className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('id-ID')}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <div className="font-medium text-gray-900">{item.borrower?.name}</div>
                                                <div className="text-xs text-gray-500">NIK: {item.borrower?.nik}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm capitalize">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                                    item.status === 'submitted' ? 'bg-blue-50 text-blue-700' :
                                                    item.status === 'reviewed' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                {getBadge(item.decision?.final_recommendation)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                <Link
                                                    href={route('assessments.show', item.id)}
                                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
                                                >
                                                    Detail &rarr;
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
