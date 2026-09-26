import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';

export default function Form({ assessment, items }) {
    // State jawaban: item_code => nilai 1-7
    const [answers, setAnswers] = useState({});

    const [processing, setProcessing] = useState(false);

    const handleSelect = (itemCode, value) => {
        setAnswers((prev) => ({
            ...prev,
            [itemCode]: value,
        }));
    };

    const isComplete = items.length > 0 && Object.keys(answers).length === items.length;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isComplete) return;

        setProcessing(true);
        const payload = items.map((item) => ({
            item_code: item.item_code,
            raw_value: answers[item.item_code],
        }));

        router.post(route('kuesioner.submit', assessment.token), {
            responses: payload 
        }, {
            onFinish: () => setProcessing(false)
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
            <Head title="Kuesioner PCSM-SOPI" />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between border-b pb-4 mb-4">
                        <div className="flex items-center gap-3">
                            <img src="/images/logo.png" alt="Logo" className="h-10 w-auto" />
                            <div>
                                <h1 className="text-xl font-black text-gray-900">Kuesioner Penilaian Mandiri</h1>
                                <p className="text-xs text-gray-500">PCSM-SOPI Decision Support System</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-semibold text-gray-400 uppercase">Progress</div>
                            <div className="text-sm font-bold text-blue-600">
                                {Object.keys(answers).length} / {items.length} Terisi
                            </div>
                        </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                        <strong>Petunjuk Pengisian:</strong> Bacalah setiap butir pernyataan di bawah ini dengan seksama. Berikan nilai dari <strong>1 (Sangat Tidak Setuju)</strong> sampai dengan <strong>7 (Sangat Setuju)</strong> sesuai dengan keadaan diri Anda yang sebenarnya.
                    </p>
                </div>

                {/* Question List */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {items.map((item, index) => {
                        const selectedVal = answers[item.item_code];

                        return (
                            <div
                                key={item.item_code}
                                className={`bg-white rounded-2xl p-5 sm:p-6 shadow-sm border transition ${
                                    selectedVal ? 'border-blue-200' : 'border-gray-100'
                                }`}
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 font-bold text-xs">
                                        {index + 1}
                                    </span>
                                    <p className="text-sm sm:text-base font-medium text-gray-800 leading-snug pt-0.5">
                                        {item.text}
                                    </p>
                                </div>

                                {/* Skala Likert 1-7 */}
                                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-2 border-t border-gray-50">
                                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                                        <button
                                            type="button"
                                            key={num}
                                            onClick={() => handleSelect(item.item_code, num)}
                                            className={`flex flex-col items-center justify-center py-2 sm:py-3 rounded-xl border text-xs sm:text-sm font-bold transition ${
                                                selectedVal === num
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-200'
                                                    : 'bg-gray-50/70 text-gray-600 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            <span>{num}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mt-2 px-1">
                                    <span>Sangat Tidak Setuju (1)</span>
                                    <span>Sangat Setuju (7)</span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Submit Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center space-y-3">
                        {!isComplete && (
                            <p className="text-xs text-amber-600 font-medium">
                                ⚠️ Mohon lengkapi semua {items.length} pertanyaan sebelum mengirimkan jawaban.
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={!isComplete || processing}
                            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            {processing ? 'Menyimpan & Menghitung Skor...' : 'Kirim Jawaban Asesmen →'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
