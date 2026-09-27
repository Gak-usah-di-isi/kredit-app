import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { useToast } from '@/Components/ui/Toast';

export default function Detail({
    assessment,
    questionnaire_url,
    canEditNote = true,
    canReviewDecision = false,
    canRecordOutcome = false,
    needsOfficerNote = false,
    isReadOnly = false
}) {
    const [copied, setCopied] = useState(false);
    const { errors: pageErrors } = usePage().props;
    const toast = useToast();

    // Form Catatan Petugas (AO)
    const { data, setData, post, processing } = useForm({
        officer_note: assessment.decision?.officer_note || '',
    });

    // Form Keputusan Pejabat Pemutus (Step 9)
    const approverForm = useForm({
        approver_decision: assessment.decision?.approver_decision === 'PENDING' ? 'APPROVED_FOR_PROCESSING' : (assessment.decision?.approver_decision || 'APPROVED_FOR_PROCESSING'),
        approver_note: assessment.decision?.approver_note || '',
    });

    // Form Input Kolektibilitas Pascakredit Y0 (Step 10)
    const outcomeForm = useForm({
        assessment_id: assessment.id,
        collectibility_status: assessment.outcome_monitoring?.collectibility_status || 'Kol 1 (Lancar)',
        dpd_days: assessment.outcome_monitoring?.dpd_days ?? 0,
        outstanding_balance: assessment.outcome_monitoring?.outstanding_balance || '',
        monitoring_date: assessment.outcome_monitoring?.monitoring_date ? assessment.outcome_monitoring.monitoring_date.substring(0, 10) : new Date().toISOString().substring(0, 10),
        notes: assessment.outcome_monitoring?.notes || '',
    });

    const copyLink = () => {
        navigator.clipboard.writeText(questionnaire_url);
        setCopied(true);
        toast?.success('Link kuesioner berhasil disalin ke clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const submitNote = (e) => {
        e.preventDefault();
        post(route('assessments.addNote', assessment.id));
    };

    const submitApproverDecision = (e) => {
        e.preventDefault();
        approverForm.post(route('assessments.approverDecision', assessment.id));
    };

    const submitOutcome = (e) => {
        e.preventDefault();
        outcomeForm.post(route('outcome.store'));
    };

    const score = assessment.score;
    const flag = assessment.flag;

    const formatCompletionTime = (sec) => {
        if (sec === null || sec === undefined || sec === '') return '-';
        const totalSeconds = Math.abs(parseInt(sec, 10));
        if (isNaN(totalSeconds)) return '-';

        if (totalSeconds < 60) {
            return `${totalSeconds} detik`;
        }

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const remainingSeconds = totalSeconds % 60;

        if (hours > 0) {
            return remainingSeconds > 0
                ? `${hours} jam ${minutes} mnt ${remainingSeconds} dtk`
                : `${hours} jam ${minutes} menit`;
        }

        return remainingSeconds > 0
            ? `${minutes} menit ${remainingSeconds} detik`
            : `${minutes} menit`;
    };

    const getPfrNarrative = (category) => {
        switch (category) {
            case 'Concern':
                return 'Skor PFR (Prudent Financial Responsibility) di bawah ambang minimum - kehati-hatian dan tanggung jawab finansial nasabah masih rendah. Disarankan pendalaman lebih lanjut pada pengelolaan keuangan nasabah.';
            case 'Review':
                return 'Skor PFR berada pada kisaran menengah - kehati-hatian finansial cukup memadai namun belum kuat. Perlu verifikasi tambahan sebelum disimpulkan.';
            case 'Supportive':
                return 'Skor PFR tinggi - nasabah menunjukkan kehati-hatian dan tanggung jawab finansial yang kuat, mendukung proses asesmen kredit.';
            default:
                return '-';
        }
    };

    const getSsrNarrative = (category) => {
        switch (category) {
            case 'Concern':
                return 'Skor SSR (Stakeholder & Sustainability Responsibility) di bawah ambang minimum - orientasi terhadap keberlanjutan dan tanggung jawab ke komunitas/lingkungan masih rendah.';
            case 'Review':
                return 'Skor SSR berada pada kisaran menengah - orientasi keberlanjutan cukup, namun belum konsisten kuat.';
            case 'Supportive':
                return 'Skor SSR tinggi - nasabah menunjukkan orientasi kuat terhadap keberlanjutan dan tanggung jawab ke pemangku kepentingan.';
            default:
                return '-';
        }
    };

    const getSdNarrative = (sd) => {
        switch (sd) {
            case 'High':
                return 'Skor Social Desirability sangat tinggi (>= ambang High) - indikasi kuat jawaban bias ke arah citra diri yang ideal. Skor PFR/SSR sebaiknya tidak diandalkan sepenuhnya tanpa klarifikasi langsung ke nasabah.';
            case 'Elevated':
                return 'Skor Social Desirability cukup tinggi (di atas ambang Elevated) - ada kecenderungan menjawab secara terlalu ideal/positif. Perlu diverifikasi agar skor SOPI tidak bias.';
            default:
                return 'Pola jawaban terhadap item kontrol Social Desirability wajar, tidak ada indikasi jawaban yang terlalu ideal secara sosial.';
        }
    };

    const getCredibilityNarrative = (status) => {
        if (status === 'Normal') {
            return 'Tidak ditemukan flag kredibilitas - pola jawaban, variasi jawaban, dan Social Desirability berada dalam batas wajar.';
        }
        return 'Ditemukan satu atau lebih flag kredibilitas (Social Desirability tinggi, pola jawaban seragam/straightlining, dan/atau variasi jawaban terlalu rendah). Skor PFR/SSR perlu dibaca hati-hati dan disertai klarifikasi langsung ke nasabah.';
    };

    const decision = assessment.decision;
    const outcome = assessment.outcome_monitoring;
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

    const getApproverBadge = (status) => {
        if (status === 'APPROVED_FOR_PROCESSING') return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">✓ Disetujui untuk Proses Lanjutan</span>;
        if (status === 'RETURNED_FOR_REVISION') return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">⚠️ Dikembalikan untuk Revisi</span>;
        if (status === 'REJECTED') return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">✕ Tidak Direkomendasikan</span>;
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">⏳ Menunggu Keputusan Pemutus</span>;
    };

    const hasMissingOfficerNote = needsOfficerNote && !decision?.officer_note;

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
                                    assessment.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                                    assessment.status === 'decided' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {assessment.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                NIK: {assessment.borrower?.nik} | CIF: {assessment.borrower?.cif || '-'} | Telp: {assessment.borrower?.phone || '-'}
                            </p>
                            <p className="text-xs text-blue-700 mt-1 font-medium">
                                Petugas AO: {assessment.officer?.name || '-'} ({assessment.officer?.email || ''})
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

                            {/* Peringatan Wajib Officer Note */}
                            {hasMissingOfficerNote && (
                                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                                    <div className="flex items-center gap-2">
                                        <span className="text-amber-700 font-bold text-sm">⚠️ Perhatian Wajib (SOP BPR):</span>
                                    </div>
                                    <p className="text-xs text-amber-800 mt-1">
                                        Asesmen ini menghasilkan status <strong>{decision?.final_recommendation}</strong>. Petugas Kredit (AO) <strong>WAJIB</strong> mengisikan catatan klarifikasi / verifikasi lapangan pada form Catatan Petugas di bawah sebelum Pejabat Pemutus dapat menetapkan keputusan final.
                                    </p>
                                </div>
                            )}

                            {/* Grid Skor Dimensi */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Prudent Financial (PFR)</div>
                                        <div className="flex items-baseline gap-2 mt-2">
                                            <span className="text-3xl font-extrabold text-gray-900">{score?.pfr_100 ?? '-'}</span>
                                            <span className="text-xs text-gray-500">/ 100</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 border-t pt-2 text-xs">
                                        <div className="flex items-center justify-between text-gray-600 mb-1.5">
                                            <span>Kategori:</span>
                                            <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                                                decision?.pfr_category === 'Supportive' ? 'bg-emerald-100 text-emerald-800' :
                                                (decision?.pfr_category === 'Review' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800')
                                            }`}>{decision?.pfr_category || '-'}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 leading-relaxed italic bg-gray-50 p-2 rounded border border-gray-100">
                                            {getPfrNarrative(decision?.pfr_category)}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Stakeholder & Sust. (SSR)</div>
                                        <div className="flex items-baseline gap-2 mt-2">
                                            <span className="text-3xl font-extrabold text-gray-900">{score?.ssr_100 ?? '-'}</span>
                                            <span className="text-xs text-gray-500">/ 100</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 border-t pt-2 text-xs">
                                        <div className="flex items-center justify-between text-gray-600 mb-1.5">
                                            <span>Kategori:</span>
                                            <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                                                decision?.ssr_category === 'Supportive' ? 'bg-emerald-100 text-emerald-800' :
                                                (decision?.ssr_category === 'Review' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800')
                                            }`}>{decision?.ssr_category || '-'}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 leading-relaxed italic bg-gray-50 p-2 rounded border border-gray-100">
                                            {getSsrNarrative(decision?.ssr_category)}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Overall SOPI Index</div>
                                        <div className="flex items-baseline gap-2 mt-2">
                                            <span className="text-3xl font-extrabold text-blue-600">{score?.overall_sopi_100 ?? '-'}</span>
                                            <span className="text-xs text-gray-500">/ 100</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 border-t pt-2 text-xs">
                                        <div className="flex items-center justify-between text-gray-600 mb-1.5">
                                            <span>Bobot Dimensi:</span>
                                            <span className="font-semibold text-gray-900">50% PFR : 50% SSR</span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 leading-relaxed bg-blue-50/50 p-2 rounded border border-blue-100">
                                            Indeks komposit psikometrik gabungan kehati-hatian finansial dan tanggung jawab keberlanjutan.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 8: Catatan Petugas Kredit (Officer Note) */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                            Catatan Petugas Kredit (Officer Note)
                                        </h4>
                                        {needsOfficerNote && (
                                            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">
                                                Wajib
                                            </span>
                                        )}
                                    </div>
                                    {decision?.officer_note_at && (
                                        <span className="text-xs text-gray-400">
                                            Oleh {decision.noted_by?.name || 'Petugas'} ({new Date(decision.officer_note_at).toLocaleString('id-ID')})
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mb-4">
                                    Wajib diisi bila rekomendasi memerlukan Review / Concern atau terdapat klarifikasi wawancara lapangan.
                                </p>

                                {canEditNote ? (
                                    <form onSubmit={submitNote} className="space-y-4">
                                        <textarea
                                            rows="3"
                                            value={data.officer_note}
                                            onChange={(e) => setData('officer_note', e.target.value)}
                                            placeholder="Tuliskan catatan verifikasi lapangan, karakter debitur, atau klarifikasi respon instrumen..."
                                            className="w-full rounded-lg border-gray-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                                        ></textarea>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className={`inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-xs rounded-lg transition disabled:opacity-50 text-white ${
                                                decision?.officer_note
                                                    ? 'bg-amber-600 hover:bg-amber-700'
                                                    : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                        >
                                            {decision?.officer_note ? (
                                                <>
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit Catatan Review
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Simpan Catatan Petugas
                                                </>
                                            )}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700">
                                        {decision?.officer_note ? (
                                            <p className="whitespace-pre-wrap">{decision.officer_note}</p>
                                        ) : (
                                            <p className="italic text-gray-400">Belum ada catatan dari Petugas Kredit.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Step 9: Peninjauan Keputusan Pejabat Pemutus */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                        Peninjauan Pejabat Pemutus Kredit (Step 9)
                                    </h4>
                                    <div>{getApproverBadge(decision?.approver_decision)}</div>
                                </div>
                                <p className="text-xs text-gray-500 mb-4">
                                    Keputusan akhir manual pendukung kredit oleh Pejabat Pemutus / Komite Kredit sesuai SOP BPR.
                                </p>

                                {pageErrors?.approver_decision && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                                        {pageErrors.approver_decision}
                                    </div>
                                )}

                                {canReviewDecision ? (
                                    <form onSubmit={submitApproverDecision} className="space-y-4 bg-gray-50/70 p-4 rounded-xl border border-gray-200">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                                Status Keputusan Pejabat Pemutus
                                            </label>
                                            <select
                                                value={approverForm.data.approver_decision}
                                                onChange={(e) => approverForm.setData('approver_decision', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                                            >
                                                <option value="APPROVED_FOR_PROCESSING">Setujui untuk Proses Lanjutan Kredit (Approved)</option>
                                                <option value="RETURNED_FOR_REVISION">Kembalikan ke AO untuk Klarifikasi / Revisi (Revision)</option>
                                                <option value="REJECTED">Tidak Direkomendasikan / Ditolak (Rejected)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                                Catatan Pertimbangan Pejabat Pemutus
                                            </label>
                                            <textarea
                                                rows="3"
                                                value={approverForm.data.approver_note}
                                                onChange={(e) => approverForm.setData('approver_note', e.target.value)}
                                                placeholder="Tuliskan pertimbangan keputusan komite kredit manual..."
                                                className="w-full rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={approverForm.processing}
                                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition disabled:opacity-50"
                                        >
                                            {decision?.approver_decision && decision.approver_decision !== 'PENDING'
                                                ? 'Perbarui Keputusan Pejabat Pemutus'
                                                : 'Simpan Keputusan Pejabat Pemutus'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 font-semibold">Status:</span>
                                            {getApproverBadge(decision?.approver_decision)}
                                        </div>
                                        {decision?.approver && (
                                            <div className="text-xs text-gray-500">
                                                Ditinjau oleh: <strong>{decision.approver.name}</strong> ({decision.approved_at ? new Date(decision.approved_at).toLocaleString('id-ID') : '-'})
                                            </div>
                                        )}
                                        <div className="pt-2 text-gray-700">
                                            <span className="text-xs text-gray-500 block font-semibold mb-1">Catatan Pemutus:</span>
                                            <p className="italic">{decision?.approver_note || 'Belum ada catatan pejabat pemutus.'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Step 10: Pemantauan Kolektibilitas Riil Pascakredit (Y0) */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                        Pemantauan Hasil Pascakredit (Outcome Monitoring Y0)
                                    </h4>
                                    {outcome && (
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${outcome.is_npl ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                            {outcome.collectibility_status} {outcome.is_npl && '(NPL)'}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mb-4">
                                    Status kolektibilitas riil ($Y_0$) dicatat secara non-runtime oleh Manajemen Risiko untuk evaluasi dan rekalibrasi model.
                                </p>

                                {outcome ? (
                                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
                                        <div>
                                            <div className="text-xs text-gray-500">Kolektibilitas</div>
                                            <div className="font-bold text-gray-900 mt-0.5">{outcome.collectibility_status}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Days Past Due (DPD)</div>
                                            <div className="font-bold text-gray-900 mt-0.5">{outcome.dpd_days} Hari</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Tanggal Monitoring</div>
                                            <div className="font-bold text-gray-900 mt-0.5">{outcome.monitoring_date ? new Date(outcome.monitoring_date).toLocaleDateString('id-ID') : '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Dicatat Oleh</div>
                                            <div className="font-bold text-gray-900 mt-0.5">{outcome.recorder?.name || '-'}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-400 italic bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        Belum ada data kolektibilitas pascakredit yang dicatat untuk debitur ini.
                                    </div>
                                )}

                                {canRecordOutcome && (
                                    <form onSubmit={submitOutcome} className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                                        <div className="text-xs font-bold text-gray-700 uppercase">Input / Update Kolektibilitas Pascakredit ($Y_0$)</div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Status Kolektibilitas</label>
                                                <select
                                                    value={outcomeForm.data.collectibility_status}
                                                    onChange={(e) => outcomeForm.setData('collectibility_status', e.target.value)}
                                                    className="w-full text-xs rounded-lg border-gray-300"
                                                >
                                                    <option value="Kol 1 (Lancar)">Kol 1 (Lancar)</option>
                                                    <option value="Kol 2 (DPK)">Kol 2 (DPK)</option>
                                                    <option value="Kol 3 (Kurang Lancar)">Kol 3 (Kurang Lancar)</option>
                                                    <option value="Kol 4 (Diragukan)">Kol 4 (Diragukan)</option>
                                                    <option value="Kol 5 (Macet)">Kol 5 (Macet)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">DPD (Hari Tunggakan)</label>
                                                <input
                                                    type="number"
                                                    value={outcomeForm.data.dpd_days}
                                                    onChange={(e) => outcomeForm.setData('dpd_days', e.target.value)}
                                                    className="w-full text-xs rounded-lg border-gray-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Tanggal Monitoring</label>
                                                <input
                                                    type="date"
                                                    value={outcomeForm.data.monitoring_date}
                                                    onChange={(e) => outcomeForm.setData('monitoring_date', e.target.value)}
                                                    className="w-full text-xs rounded-lg border-gray-300"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={outcomeForm.processing}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition disabled:opacity-50"
                                        >
                                            {outcome ? 'Perbarui Data Kolektibilitas (Y0)' : 'Simpan Data Kolektibilitas (Y0)'}
                                        </button>
                                    </form>
                                )}
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

                            {/* Evaluasi Kredibilitas Respon */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                        Evaluasi Kredibilitas Respon (Response Credibility)
                                    </h4>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                        (decision?.credibility_status === 'Normal') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                        Status: {decision?.credibility_status || (flag?.sd_flag === 'Normal' && !flag?.straightline_flag && !flag?.low_variability_flag ? 'Normal' : 'Elevated/High')}
                                    </span>
                                </div>

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
                                        <div className="font-bold text-gray-900 mt-0.5">{flag?.response_sd ?? '-'} {flag?.low_variability_flag && <span className="text-xs text-red-500 font-normal">(Rendah)</span>}</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-500">Waktu Pengisian</div>
                                        <div className="font-bold text-gray-900 mt-0.5">{formatCompletionTime(flag?.completion_time_sec)}</div>
                                    </div>
                                </div>

                                {/* Narasi Analisis Kredibilitas Baku Excel F50 & F51 */}
                                <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100/80 leading-relaxed">
                                        <span className="font-semibold text-slate-800">Analisis Social Desirability: </span>
                                        <span className="text-slate-600">{getSdNarrative(flag?.sd_flag)}</span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100/80 leading-relaxed">
                                        <span className="font-semibold text-slate-800">Kesimpulan Kredibilitas: </span>
                                        <span className="text-slate-600">{getCredibilityNarrative(decision?.credibility_status || (flag?.sd_flag === 'Normal' && !flag?.straightline_flag && !flag?.low_variability_flag ? 'Normal' : 'Elevated/High'))}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Wajib: Disclaimer Sistem Persis Sesuai Excel B68 */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 text-xs text-gray-600 leading-relaxed">
                                <span className="font-semibold text-gray-800">Disclaimer: </span>
                                Hasil PCSM-SOPI merupakan informasi pendukung untuk membantu proses asesmen kredit (Decision Support System). Hasil ini tidak merupakan keputusan otomatis persetujuan atau penolakan kredit dan harus dibaca bersama informasi serta prosedur kredit lain yang berlaku di BPR. Keputusan final kredit tetap mengikuti SOP, kewenangan pejabat kredit, dan informasi lain yang dipersyaratkan BPR.
                            </div>
                        </>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
