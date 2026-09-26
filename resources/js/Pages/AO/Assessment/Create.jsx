import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FloatSelect } from '@/Components/ui/FloatSelect';

export default function Create({ borrowers }) {
    const { data, setData, post, processing, errors } = useForm({
        borrower_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('assessments.store'));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Buat Asesmen Baru</h2>}>
            <Head title="Buat Asesmen Baru" />
            
            <div className="py-8">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-xl border border-gray-100 p-6 md:p-8">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Mulai Asesmen PCSM-SOPI</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Pilih calon debitur untuk membuat link kuesioner psikometrik yang akan diisi oleh nasabah.
                            </p>
                        </div>

                        {borrowers.length === 0 ? (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">
                                <p className="font-semibold mb-1">Belum ada data nasabah</p>
                                <p className="mb-3">Silakan tambahkan data nasabah terlebih dahulu sebelum membuat sesi asesmen.</p>
                                <Link
                                    href={route('borrowers.create')}
                                    className="inline-flex items-center text-xs font-bold uppercase tracking-wider bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition"
                                >
                                    + Tambah Nasabah Sekarang
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-semibold text-gray-700">Pilih Calon Debitur / Nasabah</label>
                                        <Link href={route('borrowers.create')} className="text-xs text-blue-600 hover:underline font-medium">
                                            + Tambah Baru
                                        </Link>
                                    </div>
                                    <div className="mt-1">
                                        <FloatSelect
                                            id="borrower_id"
                                            label="Calon Debitur *"
                                            options={borrowers.map((b) => ({ value: b.id, label: `${b.name} (NIK: ${b.nik})` }))}
                                            value={data.borrower_id}
                                            onChange={(value) => setData('borrower_id', value)}
                                            placeholder="Pilih calon debitur"
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
                                    <Link
                                        href={route('assessments.index')}
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
                                    >
                                        Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
                                    >
                                        Generate Sesi Asesmen
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
