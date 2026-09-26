import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Detail({ assessment, questionnaire_url }) {
    const [copied, setCopied] = useState(false);
    const { data, setData, post, processing } = useForm({
        officer_note: assessment.decision?.officer_note || '',
    });

    const copyLink = () => {
        navigator.clipboard.writeText(questionnaire_url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const submitNote = (e) => {
        e.preventDefault();
        post(route('assessments.addNote', assessment.id));
    };

    const score = assessment.score;
    const flag = assessment.flag;
    const decision = assessment.decision;
    const responses = assessment.responses || [];

    const answerLabel = (value) => {
        const labels = {
            1: 'Sangat Tidak Setuju',
            2: 'Tidak Setuju',
            3: 'Agak Tidak Setuju',
            4: 'Netral',
            5: 'Agak Setuju',
            6: 'Setuju',
            7: 'Sangat Setuju',
        };

        return labels[value] || '-';
    };

    const getRecColor = (rec) => {
        if (!rec) return 'bg-gray-100 text-gray-800 border-gray-200';
        if (rec === 'SUPPORTIVE') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
        if (rec.includes('REVIEW')) return 'bg-amber-50 text-amber-800 border-amber-200';
        return 'bg-rose-50 text-rose-800 border-rose-200';
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Detail Asesmen #{assessment.id}</h2>}>
            <Head title={`Asesmen #${assessment.id}`} />
            
            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Header Card */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold text-gray-900">{assessment.borrower?.name}</h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                                    assessment.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                    assessment.status === 'reviewed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {assessment.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                NIK: {assessment.borrower?.nik} | CIF: {assessment.borrower?.cif || '-'} | Telp: {assessment.borrower?.phone || '-'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={route('assessments.index')}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                            >
                                &larr; Kembali
                            </Link>
                        </div>
                    </div>

                    {/* Status Draft: Tampilkan Link Kuesioner */}
                    {assessment.status === 'draft' ? (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                            <h4 className="text-base font-bold text-blue-950 mb-1">🔗 Link Kuesioner Belum Diisi</h4>
                            <p className="text-sm text-blue-800 mb-4">
                                Bagikan link berikut kepada nasabah atau buka di tablet kantor untuk pengisian instrumen kuesioner PCSM-SOPI.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-2 max-w-2xl">
                                <input
                                    type="text"
                                    readOnly
                                    value={questionnaire_url}
                                    className="flex-1 bg-white border border-blue-200 rounded-lg px-3.5 py-2 text-sm text-gray-700 shadow-sm font-mono select-all focus:outline-none"
                                />
                                <button
                                    onClick={copyLink}
                                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
                                >
                                    {copied ? '✓ Tersalin' : 'Salin Link'}
                                </button>
                                <a
                                    href={questionnaire_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center px-4 py-2 bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold transition"
                                >
                                    Buka Form &nearr;
                                </a>
                            </div>
                        </div>
                    ) : (
                        /* Hasil Scoring & Rekomendasi */
                        <>
                            {/* Rekomendasi Banner */}
                            <div className={`border rounded-xl p-6 ${getRecColor(decision?.final_recommendation)}`}>
                                <div className="text-xs font-bold uppercase tracking-wider opacity-75">Hasil Rekomendasi Keputusan</div>
                                <div className="text-2xl font-black mt-1">{decision?.final_recommendation || 'MEMPROSES'}</div>
                                <p className="text-sm mt-2 opacity-90 max-w-3xl">
                                    {decision?.auto_narrative}
                                </p>
                            </div>

                            {/* Grid Skor Dimensi */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Prudent Financial (PFR)</div>
                                    <div className="flex items-baseline gap-2 mt-2">
                                        <span className="text-3xl font-extrabold text-gray-900">{score?.pfr_100 ?? '-'}</span>
                                        <span className="text-xs text-gray-500">/ 100</span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-xs border-t pt-2 text-gray-600">
                                        <span>Kategori:</span>
                                        <span className="font-semibold text-gray-900">{decision?.pfr_category}</span>
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Stakeholder & Sust. (SSR)</div>
                                    <div className="flex items-baseline gap-2 mt-2">
                                        <span className="text-3xl font-extrabold text-gray-900">{score?.ssr_100 ?? '-'}</span>
                                        <span className="text-xs text-gray-500">/ 100</span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-xs border-t pt-2 text-gray-600">
                                        <span>Kategori:</span>
                                        <span className="font-semibold text-gray-900">{decision?.ssr_category}</span>
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Overall SOPI Index</div>
                                    <div className="flex items-baseline gap-2 mt-2">
                                        <span className="text-3xl font-extrabold text-blue-600">{score?.overall_sopi_100 ?? '-'}</span>
                                        <span className="text-xs text-gray-500">/ 100</span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-xs border-t pt-2 text-gray-600">
                                        <span>Bobot Dimensi:</span>
                                        <span className="font-semibold text-gray-900">50% PFR : 50% SSR</span>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Jawaban Nasabah */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Detail Jawaban Nasabah</h4>
                                        <p className="text-xs text-gray-500 mt-1">Daftar pertanyaan dan jawaban yang diisi oleh nasabah.</p>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Total {responses.length} jawaban
                                    </div>
                                </div>

                                {responses.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">No</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Pertanyaan</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Jawaban</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Dimensi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {responses.map((response, index) => (
                                                    <tr key={response.id} className="align-top">
                                                        <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                                                        <td className="px-4 py-3 text-gray-900">
                                                            {response.item_master?.text || response.item_code}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="font-semibold text-gray-900">{response.raw_value}</div>
                                                            <div className="text-xs text-gray-500">{answerLabel(response.raw_value)}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">
                                                            {response.item_master?.dimension || '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                                        Belum ada data jawaban nasabah.
                                    </div>
                                )}
                            </div>

                            {/* Flag Kredibilitas Respon */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Evaluasi Kredibilitas Respon (Social Desirability)</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-500">Social Desirability (SD)</div>
                                        <div className="font-bold text-gray-900 mt-0.5">{flag?.sd_flag ?? 'Normal'}</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-500">Pola Jawaban Seragam</div>
                                        <div className="font-bold text-gray-900 mt-0.5">{flag?.straightline_flag ? '⚠️ Terdeteksi' : 'Normal'}</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-500">Variasi Jawaban (SD)</div>
                                        <div className="font-bold text-gray-900 mt-0.5">{flag?.response_sd ?? '-'}</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-500">Waktu Pengisian</div>
                                        <div className="font-bold text-gray-900 mt-0.5">{flag?.completion_time_sec ? `${flag.completion_time_sec} detik` : '-'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Officer Note */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Catatan Petugas Kredit (Officer Note)</h4>
                                <p className="text-xs text-gray-500 mb-4">
                                    Wajib diisi bila rekomendasi memerlukan Review atau terdapat temuan khusus saat wawancara.
                                </p>
                                <form onSubmit={submitNote} className="space-y-4">
                                    <textarea
                                        rows="3"
                                        value={data.officer_note}
                                        onChange={(e) => setData('officer_note', e.target.value)}
                                        placeholder="Tuliskan catatan verifikasi lapangan atau klarifikasi respon debitur..."
                                        className="w-full rounded-lg border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                                    ></textarea>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition disabled:opacity-50"
                                    >
                                        Simpan Catatan Petugas
                                    </button>
                                </form>
                            </div>

                            {/* Wajib: Disclaimer Sistem */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 text-xs text-gray-500 leading-relaxed">
                                <span className="font-semibold text-gray-700">Disclaimer: </span>
                                Hasil PCSM-SOPI merupakan informasi pendukung untuk membantu proses asesmen kredit. Hasil ini tidak merupakan keputusan otomatis persetujuan atau penolakan kredit dan harus dibaca bersama informasi serta prosedur kredit lain yang berlaku di BPR.
                            </div>
                        </>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
