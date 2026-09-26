import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Consent({ assessment, borrower }) {
    const [agreed, setAgreed] = useState(false);
    const { post, processing } = useForm();

    const handleNext = (e) => {
        e.preventDefault();
        if (!agreed) return;
        post(route('kuesioner.consent.submit', assessment.token));
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Persetujuan Asesmen (Informed Consent)" />

            <div className="sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="text-center mb-6">
                    <img src="/images/logo.png" alt="Logo" className="mx-auto h-12 w-auto mb-3" />
                    <h2 className="text-2xl font-bold text-gray-900">Lembar Persetujuan Asesmen</h2>
                    <p className="text-sm text-gray-500 mt-1">PCSM-SOPI — Penilaian Karakter & Perilaku Finansial</p>
                </div>

                <div className="bg-white py-8 px-6 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100">
                    <div className="mb-6 border-b pb-4">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Data Calon Debitur</div>
                        <div className="text-base font-bold text-gray-800 mt-1">{borrower?.name}</div>
                        <div className="text-xs text-gray-500">NIK: {borrower?.nik}</div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-4 leading-relaxed bg-gray-50 p-5 rounded-xl border border-gray-200/60 max-h-72 overflow-y-auto">
                        <p className="font-semibold text-gray-800">Yth. Calon Debitur,</p>
                        <p>
                            Dalam rangka melengkapi proses analisis kelayakan fasilitas pembiayaan/kredit di BPR, Anda diminta untuk mengisi 17 butir pernyataan singkat mengenai kebiasaan pengelolaan keuangan dan aktivitas usaha Anda.
                        </p>
                        <p>
                            <strong>Kerahasiaan Data:</strong> Jawaban yang Anda berikan bersifat rahasia dan hanya digunakan untuk keperluan analisis internal perbankan. Hasil asesmen ini tidak disebarluaskan kepada pihak lain di luar proses kredit yang bersangkutan.
                        </p>
                        <p>
                            <strong>Tidak Ada Jawaban Salah:</strong> Pilihlah jawaban yang paling menggambarkan kondisi dan kebiasaan diri Anda yang sebenarnya secara jujur dan objektif.
                        </p>
                    </div>

                    <form onSubmit={handleNext} className="mt-6 space-y-6">
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="consent"
                                    name="consent"
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="consent" className="font-medium text-gray-700 cursor-pointer">
                                    Saya telah membaca, memahami, dan menyetujui pengisian kuesioner ini secara sukarela dan memberikan informasi yang benar.
                                </label>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={!agreed || processing}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                {processing ? 'Memproses...' : 'Mulai Isi Kuesioner →'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
