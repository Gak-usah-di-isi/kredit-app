import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';

const SCALE_LABELS = {
    1: 'Sangat Tidak Setuju',
    2: 'Tidak Setuju',
    3: 'Agak Tidak Setuju',
    4: 'Netral',
    5: 'Agak Setuju',
    6: 'Setuju',
    7: 'Sangat Setuju',
};

const SCALE_COLORS = {
    1: 'text-rose-600 bg-rose-50 border-rose-200',
    2: 'text-orange-600 bg-orange-50 border-orange-200',
    3: 'text-amber-600 bg-amber-50 border-amber-200',
    4: 'text-slate-600 bg-slate-50 border-slate-200',
    5: 'text-teal-600 bg-teal-50 border-teal-200',
    6: 'text-blue-600 bg-blue-50 border-blue-200',
    7: 'text-emerald-600 bg-emerald-50 border-emerald-200',
};

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

                    <div className="bg-blue-50/60 p-4 sm:p-5 rounded-xl border border-blue-100 space-y-3.5">
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                            <strong>Petunjuk Pengisian:</strong> Bacalah setiap butir pernyataan di bawah ini dengan seksama. Berikan nilai dari <strong>1</strong> sampai dengan <strong>7</strong> sesuai dengan keadaan diri Anda yang sebenarnya. Tidak ada jawaban yang salah, mohon menjawab dengan jujur dan spontan.
                        </p>

                        {/* Keterangan Arti Angka 1 s.d. 7 */}
                        <div className="pt-3 border-t border-blue-200/60">
                            <div className="text-[11px] font-bold text-blue-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <span>📋 Keterangan Skala Penilaian:</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-7 gap-1.5 text-center">
                                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                                    <div
                                        key={num}
                                        className="bg-white/90 p-2 rounded-lg border border-blue-100/80 shadow-2xs flex flex-col items-center justify-between"
                                    >
                                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-black mb-1 ${SCALE_COLORS[num]}`}>
                                            {num}
                                        </span>
                                        <span className="text-[10px] text-gray-700 font-medium leading-tight">
                                            {SCALE_LABELS[num]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
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
                                            title={`${num}: ${SCALE_LABELS[num]}`}
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
                                <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-500 mt-2.5 px-1">
                                    <span className="text-gray-500">1 = Sangat Tidak Setuju</span>
                                    {selectedVal ? (
                                        <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 text-[11px]">
                                            Pilihan: <strong>{selectedVal} - {SCALE_LABELS[selectedVal]}</strong>
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 italic text-[10px]">Klik angka 1 s.d. 7</span>
                                    )}
                                    <span className="text-gray-500">7 = Sangat Setuju</span>
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
