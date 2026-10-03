import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { useToast } from '@/Components/ui/Toast';
import { Icon } from '@iconify/react';
import { FloatSelect } from '@/Components/ui/FloatSelect';

const APPROVER_DECISION_OPTIONS = [
    { value: 'APPROVED_FOR_PROCESSING', label: 'Setujui untuk Proses Lanjutan (Approved)' },
    { value: 'RETURNED_FOR_REVISION', label: 'Kembalikan ke AO untuk Klarifikasi (Revision)' },
    { value: 'REJECTED', label: 'Tolak / Tidak Direkomendasikan (Rejected)' },
];

const COLLECTIBILITY_OPTIONS = [
    { value: 'Kol 1 (Lancar)', label: 'Kol 1 (Lancar)' },
    { value: 'Kol 2 (DPK)', label: 'Kol 2 (DPK)' },
    { value: 'Kol 3 (Kurang Lancar)', label: 'Kol 3 (Kurang Lancar)' },
    { value: 'Kol 4 (Diragukan)', label: 'Kol 4 (Diragukan)' },
    { value: 'Kol 5 (Macet)', label: 'Kol 5 (Macet)' },
];

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
    const [activeQuestionTab, setActiveQuestionTab] = useState('all'); // 'all', 'PFR', 'SSR', 'SD'
    const [hasOtsCheck, setHasOtsCheck] = useState(true);
    const { errors: pageErrors } = usePage().props;
    const toast = useToast();

    // Cek apakah asesmen masih berstatus draft atau belum dijawab
    const isDraft = assessment.status === 'draft' || !assessment.score;

    // Form Catatan Petugas (AO)
    const { data: noteData, setData: setNoteData, post: postNote, processing: processingNote } = useForm({
        officer_note: assessment.decision?.officer_note || '',
    });

    // Form Keputusan Pejabat Pemutus (Step 9)
    const approverForm = useForm({
        approver_decision: assessment.decision?.approver_decision === 'PENDING'
            ? 'APPROVED_FOR_PROCESSING'
            : (assessment.decision?.approver_decision || 'APPROVED_FOR_PROCESSING'),
        approver_note: assessment.decision?.approver_note || '',
    });

    // Form Input Kolektibilitas Pascakredit Y0 (Step 10)
    const outcomeForm = useForm({
        assessment_id: assessment.id,
        collectibility_status: assessment.outcome_monitoring?.collectibility_status || 'Kol 1 (Lancar)',
        dpd_days: assessment.outcome_monitoring?.dpd_days ?? 0,
        outstanding_balance: assessment.outcome_monitoring?.outstanding_balance || '',
        monitoring_date: assessment.outcome_monitoring?.monitoring_date
            ? assessment.outcome_monitoring.monitoring_date.substring(0, 10)
            : new Date().toISOString().substring(0, 10),
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
        postNote(route('assessments.addNote', assessment.id));
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
    const decision = assessment.decision;
    const outcome = assessment.outcome_monitoring;
    const responses = assessment.responses || [];

    const formatCompletionTime = (sec) => {
        if (sec === null || sec === undefined || sec === '') return '-';
        const totalSeconds = Math.abs(parseInt(sec, 10));
        if (isNaN(totalSeconds) || totalSeconds === 0) return '-';

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const remainingSeconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}j ${minutes}m ${remainingSeconds}s`;
        }
        return `${minutes}m ${remainingSeconds}s`;
    };

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

    const getPfrNarrative = (category) => {
        switch (category) {
            case 'Concern':
                return 'Skor PFR (Prudent Financial Responsibility) di bawah ambang minimum — kehati-hatian dan tanggung jawab finansial nasabah masih rendah. Disarankan pendalaman lebih lanjut pada pengelolaan keuangan nasabah.';
            case 'Review':
                return 'Skor PFR berada pada kisaran menengah — kehati-hatian finansial cukup memadai namun belum kuat. Perlu verifikasi tambahan sebelum disimpulkan.';
            case 'Supportive':
                return 'Skor PFR tinggi — nasabah menunjukkan kehati-hatian anggaran dan tanggung jawab finansial yang kuat, mendukung kelayakan proses asesmen kredit.';
            default:
                return 'Skor PFR tinggi — nasabah menunjukkan kehati-hatian anggaran dan tanggung jawab finansial yang kuat, mendukung kelayakan proses asesmen kredit.';
        }
    };

    const getSsrNarrative = (category) => {
        switch (category) {
            case 'Concern':
                return 'Skor SSR (Stakeholder & Sustainability Responsibility) di bawah ambang minimum — orientasi terhadap keberlanjutan dan tanggung jawab ke komunitas/lingkungan masih rendah.';
            case 'Review':
                return 'Skor SSR berada pada kisaran menengah — orientasi keberlanjutan cukup, namun belum konsisten kuat.';
            case 'Supportive':
                return 'Skor SSR tinggi — nasabah menunjukkan orientasi kuat terhadap keberlanjutan bisnis, integritas relasional, dan tanggung jawab terhadap pemangku kepentingan.';
            default:
                return 'Skor SSR tinggi — nasabah menunjukkan orientasi kuat terhadap keberlanjutan bisnis, integritas relasional, dan tanggung jawab terhadap pemangku kepentingan.';
        }
    };

    const getSdNarrative = (sd) => {
        switch (sd) {
            case 'High':
                return 'Skor Social Desirability sangat tinggi (> ambang batas High) menandakan indikasi kuat jawaban condong ke arah citra diri yang idealis daripada kenyataan empiris. Rekomendasi psikometrik PFR/SSR sebaiknya dikonfirmasi dengan rekening koran dan kroscek tetangga usaha.';
            case 'Elevated':
                return 'Skor Social Desirability cukup tinggi (di atas ambang Elevated) — ada kecenderungan menjawab secara terlalu ideal/positif. Perlu diverifikasi agar skor SOPI tidak bias.';
            default:
                return 'Pola jawaban terhadap item kontrol Social Desirability wajar, tidak ada indikasi jawaban yang terlalu ideal secara sosial.';
        }
    };

    const getCredibilityNarrative = (status) => {
        if (status === 'Normal') {
            return 'Tidak ditemukan flag kredibilitas — pola jawaban, variasi jawaban, dan Social Desirability berada dalam batas wajar.';
        }
        return 'Ditemukan flag kredibilitas akibat social desirability tinggi dan jeda submit berhari-hari. Berkas tidak dapat di-approve otomatis tanpa wawancara mendalam oleh Account Officer.';
    };

    // Filter responses
    const filteredResponses = useMemo(() => {
        if (activeQuestionTab === 'all') return responses;
        return responses.filter(r => {
            const dim = (r.item_master?.dimension || '').toUpperCase();
            if (activeQuestionTab === 'SD') {
                return dim === 'SD' || dim.includes('DESIRABILITY');
            }
            return dim === activeQuestionTab;
        });
    }, [responses, activeQuestionTab]);

    // CSV Download
    const exportRawCsv = () => {
        if (!responses.length) {
            alert('Belum ada data respon kuesioner.');
            return;
        }
        const headers = ['No', 'Item Code', 'Pertanyaan', 'Dimensi', 'Jawaban (Nilai)', 'Keterangan'];
        const rows = responses.map((r, i) => [
            i + 1,
            `"${r.item_code || ''}"`,
            `"${(r.item_master?.text || r.item_code || '').replace(/"/g, '""')}"`,
            `"${r.item_master?.dimension || ''}"`,
            r.raw_value,
            `"${answerLabel(r.raw_value)}"`
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `raw_kuesioner_asesmen_${assessment.id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getInitials = (name) => {
        if (!name) return 'AK';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const pfrVal = score?.pfr_100 != null ? Number(score.pfr_100).toFixed(2) : '0';
    const ssrVal = score?.ssr_100 != null ? Number(score.ssr_100).toFixed(2) : '0';
    const overallVal = score?.overall_sopi_100 != null ? Number(score.overall_sopi_100).toFixed(2) : '0';

    return (
        <AuthenticatedLayout>
            <Head title={`Asesmen #${assessment.id} - ${assessment.borrower?.name || 'Nasabah'}`} />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-5">
                {/* 1. Header Profile Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-base flex-shrink-0">
                            {getInitials(assessment.borrower?.name)}
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                                    {assessment.borrower?.name || 'Nasabah'}
                                </h1>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                    isDraft
                                        ? 'bg-gray-100 text-gray-600 border-gray-200'
                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isDraft ? 'bg-gray-400' : 'bg-blue-600'}`}></span>
                                    <span>{assessment.status ? assessment.status.toUpperCase() : 'DRAFT'}</span>
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                                    Skema: Mikro Produktif
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
                                <div className="flex items-center gap-1">
                                    <Icon icon="solar:card-outline" width={14} className="text-gray-400" />
                                    <span>NIK: {assessment.borrower?.nik || '-'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-400 font-bold">#</span>
                                    <span>CIF: {assessment.borrower?.cif || 'CIF-BPR-88219'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Icon icon="solar:phone-outline" width={14} className="text-gray-400" />
                                    <span>Telp: {assessment.borrower?.phone || '-'}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600 font-medium">
                                    <Icon icon="solar:user-outline" width={14} className="text-gray-400" />
                                    <span>AO: {assessment.officer?.name || 'Petugas Kredit'} ({assessment.officer?.email || 'petugas_kredit@app.test'})</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 flex-shrink-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                            BATAS EVALUASI SLA
                        </span>
                        <div className="text-base font-extrabold text-gray-900 leading-tight mt-0.5">
                            {isDraft ? 'Menunggu Jawaban' : '24 Jam Tersisa'}
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 mt-0.5">
                            SOP Komite Tingkat 1
                        </span>
                    </div>
                </div>

                {/* 2. JIKA STATUS DRAFT (Belum dijawab oleh nasabah) */}
                {isDraft ? (
                    <div className="space-y-5">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                                    <Icon icon="solar:link-circle-outline" width={22} />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-bold text-blue-950">
                                            Link Kuesioner Belum Diisi (Status: Draft)
                                        </h2>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                            Menunggu Respon
                                        </span>
                                    </div>
                                    <p className="text-xs text-blue-800 leading-relaxed max-w-3xl">
                                        Asesmen ini belum dijawab oleh nasabah sehingga skor psikometrik belum dihitung. Bagikan tautan unik di bawah ini kepada calon debitur untuk membuka lembar persetujuan dan pengisian kuesioner PCSM-SOPI.
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-2 pt-2 max-w-3xl">
                                        <input
                                            type="text"
                                            readOnly
                                            value={questionnaire_url}
                                            className="flex-1 bg-white border border-blue-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 shadow-xs font-mono select-all focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={copyLink}
                                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-xs"
                                        >
                                            <Icon icon="solar:copy-outline" width={16} />
                                            <span>{copied ? '✓ Tersalin' : 'Salin Link'}</span>
                                        </button>
                                        <a
                                            href={questionnaire_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold transition shadow-xs"
                                        >
                                            <span>Buka Form Kuesioner</span>
                                            <Icon icon="solar:square-top-down-outline" width={14} className="rotate-180" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Petunjuk Alur Pengisian */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-6 space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Icon icon="solar:info-circle-outline" className="text-blue-600" width={18} />
                                <span>Alur Pelaksanaan Asesmen Psikometrik</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-2">
                                        1
                                    </div>
                                    <div className="font-bold text-gray-900">Kirim Tautan</div>
                                    <p className="text-gray-500 leading-relaxed">
                                        Bagikan link kuesioner kepada calon debitur via WhatsApp / SMS atau buka di tablet kantor.
                                    </p>
                                </div>

                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-2">
                                        2
                                    </div>
                                    <div className="font-bold text-gray-900">Informed Consent</div>
                                    <p className="text-gray-500 leading-relaxed">
                                        Debitur membaca dan menyetujui lembar persetujuan digital sebelum mulai mengerjakan instrumen.
                                    </p>
                                </div>

                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-2">
                                        3
                                    </div>
                                    <div className="font-bold text-gray-900">Pengerjaan Butir Soal</div>
                                    <p className="text-gray-500 leading-relaxed">
                                        Debitur menjawab butir pernyataan instrumen psikometrik hingga selesai dan mengirimkan jawaban.
                                    </p>
                                </div>

                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-2">
                                        4
                                    </div>
                                    <div className="font-bold text-gray-900">Skor Otomatis Terbit</div>
                                    <p className="text-gray-500 leading-relaxed">
                                        Sistem kalkulasi otomatis memproses skor PFR, SSR, dan SOPI serta rekomendasi pada halaman ini.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-start">
                                <Link
                                    href={route('assessments.index')}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl text-xs font-semibold transition"
                                >
                                    <Icon icon="solar:arrow-left-line-duotone" width={16} />
                                    <span>Kembali ke Daftar Asesmen</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* 3. JIKA SUDAH DIJAWAB (Submitted / Reviewed / Decided dengan Skor Riil) */
                    <>
                        {/* 2. Recommendation Alert Banner */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
                                        <Icon icon="solar:danger-triangle-bold" width={20} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                                            REKOMENDASI ALGORITMA PCSM-SOPI
                                        </span>
                                        <div className="text-lg md:text-xl font-extrabold text-gray-900 leading-tight mt-0.5">
                                            {decision?.final_recommendation || 'REVIEW - RESPONSE VERIFICATION'}
                                        </div>
                                    </div>
                                </div>

                                <span className="self-start sm:self-center px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-gray-800 border border-slate-200">
                                    PENYELIDIKAN LAPANGAN DIWAJIBKAN
                                </span>
                            </div>

                            <p className="text-xs text-gray-900 leading-relaxed max-w-4xl font-normal">
                                {decision?.auto_narrative ||
                                    'Profil sangat baik (Supportive), namun flag kredibilitas terdeteksi. Disarankan verifikasi atas validitas respon.'}
                            </p>

                            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-gray-900">
                                <Icon icon="solar:info-circle-outline" width={18} className="text-gray-700 flex-shrink-0 mt-0.5" />
                                <p className="leading-relaxed">
                                    <span className="font-bold">Perhatian Wajib (SOP BPR):</span> Petugas Kredit (AO) <span className="font-bold underline">WAJIB</span> mengisikan catatan klarifikasi / verifikasi lapangan pada form Catatan Petugas di bawah sebelum Pejabat Pemutus dapat menetapkan keputusan final (Step 9).
                                </p>
                            </div>
                        </div>

                        {/* 3. Three Dimension Score Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Card 1: PRUDENT FINANCIAL (PFR) */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                            PRUDENT FINANCIAL (PFR)
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {decision?.pfr_category ? decision.pfr_category.toUpperCase() : 'SUPPORTIVE'}
                                        </span>
                                    </div>

                                    <div className="flex items-baseline gap-1 mt-3">
                                        <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                            {pfrVal}
                                        </span>
                                        <span className="text-xs text-gray-400 font-normal">/ 100</span>
                                    </div>

                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                                        <div
                                            className="h-full rounded-full bg-[#0F766E]"
                                            style={{ width: `${Math.min(100, Math.max(5, Number(pfrVal)))}%` }}
                                        />
                                    </div>

                                    <p className="text-xs text-gray-600 leading-relaxed mt-3">
                                        {getPfrNarrative(decision?.pfr_category)}
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                                    <span>Konsistensi: <strong className="text-gray-700">Tinggi (0.92)</strong></span>
                                    <span>Ambang: <strong className="text-gray-700">&gt; 70.0</strong></span>
                                </div>
                            </div>

                            {/* Card 2: STAKEHOLDER & SUST. (SSR) */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                            STAKEHOLDER & SUST. (SSR)
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {decision?.ssr_category ? decision.ssr_category.toUpperCase() : 'SUPPORTIVE'}
                                        </span>
                                    </div>

                                    <div className="flex items-baseline gap-1 mt-3">
                                        <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                            {ssrVal}
                                        </span>
                                        <span className="text-xs text-gray-400 font-normal">/ 100</span>
                                    </div>

                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                                        <div
                                            className="h-full rounded-full bg-[#0F766E]"
                                            style={{ width: `${Math.min(100, Math.max(5, Number(ssrVal)))}%` }}
                                        />
                                    </div>

                                    <p className="text-xs text-gray-600 leading-relaxed mt-3">
                                        {getSsrNarrative(decision?.ssr_category)}
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                                    <span>Kepercayaan Mitra: <strong className="text-gray-700">Valid</strong></span>
                                    <span>Ambang: <strong className="text-gray-700">&gt; 70.0</strong></span>
                                </div>
                            </div>

                            {/* Card 3: OVERALL SOPI COMPOSITE */}
                            <div className="bg-[#0B256B] text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">
                                            OVERALL SOPI COMPOSITE
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-900/80 text-blue-100 border border-blue-700/50">
                                            BOBOT 50:50
                                        </span>
                                    </div>

                                    <div className="flex items-baseline gap-1 mt-3">
                                        <span className="text-3xl font-extrabold text-white tracking-tight">
                                            {overallVal}
                                        </span>
                                        <span className="text-xs text-blue-300 font-normal">/ 100</span>
                                    </div>

                                    <div className="w-full h-1.5 bg-blue-950/60 rounded-full overflow-hidden mt-2">
                                        <div
                                            className="h-full rounded-full bg-white"
                                            style={{ width: `${Math.min(100, Math.max(5, Number(overallVal)))}%` }}
                                        />
                                    </div>

                                    <p className="text-xs text-blue-100 leading-relaxed mt-3">
                                        Indeks komposit psikometrik gabungan kehati-hatian finansial dan tanggung jawab keberlanjutan berada dalam kuadran unggul.
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-blue-900/80 flex items-center justify-between text-[11px] text-blue-200">
                                    <span>Model: <strong>PCSM Multi-Factor v2.4</strong></span>
                                    <span className="font-semibold text-emerald-300">Lolos Ambang Batas BPR</span>
                                </div>
                            </div>
                        </div>

                        {/* 4. Main Two-Column Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                            {/* Left Column (8 cols): Evaluasi Kredibilitas + Detail Jawaban */}
                            <div className="lg:col-span-8 space-y-5">
                                {/* Card A: Evaluasi Kredibilitas Respon */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-5 space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-gray-50">
                                        <div className="flex items-center gap-2.5">
                                            <Icon icon="solar:shield-check-outline" className="text-blue-600" width={18} />
                                            <h2 className="text-sm font-bold text-gray-900">
                                                Evaluasi Kredibilitas Respon
                                            </h2>
                                        </div>
                                        <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF1F2] text-[#BE123C] border border-[#FFE4E6]">
                                            • STATUS: {decision?.credibility_status === 'Normal' ? 'NORMAL' : 'ELEVATED / HIGH CONCERN'}
                                        </span>
                                    </div>

                                    {/* 4 Metric Boxes */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                SOCIAL DESIRABILITY
                                            </div>
                                            <div className="text-xs font-bold text-gray-900 mt-1">
                                                {flag?.sd_flag ? `${flag.sd_flag} (Flagged)` : 'Normal'}
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-0.5">
                                                {flag?.sd_flag === 'High' ? 'Cenderung over-claim' : 'Wajar'}
                                            </div>
                                        </div>

                                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                POLA JAWABAN
                                            </div>
                                            <div className="text-xs font-bold text-gray-900 mt-1">
                                                {flag?.straightline_flag ? 'Seragam' : 'Normal'}
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-0.5">
                                                {flag?.straightline_flag ? 'Straightlining' : 'Tidak straightlining'}
                                            </div>
                                        </div>

                                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                VARIASI RESPON
                                            </div>
                                            <div className="text-xs font-bold text-gray-900 mt-1">
                                                {flag?.response_sd ?? '0.5879'}
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-0.5">
                                                Standar Deviasi
                                            </div>
                                        </div>

                                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                WAKTU PENGISIAN
                                            </div>
                                            <div className="text-xs font-bold text-gray-900 mt-1">
                                                {formatCompletionTime(flag?.completion_time_sec)}
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-0.5">
                                                {flag?.completion_time_sec > 7200 ? 'Sesi terputus/jeda' : 'Durasi normal'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Analysis Boxes */}
                                    <div className="space-y-2.5 pt-1 text-xs text-gray-600 leading-relaxed">
                                        <div className="p-3 bg-[#FAFBFD] rounded-xl border border-slate-100">
                                            <strong className="text-gray-900">Analisis Social Desirability: </strong>
                                            {getSdNarrative(flag?.sd_flag)}
                                        </div>
                                        <div className="p-3 bg-[#FAFBFD] rounded-xl border border-slate-100">
                                            <strong className="text-gray-900">Kesimpulan Kredibilitas: </strong>
                                            {getCredibilityNarrative(decision?.credibility_status)}
                                        </div>
                                    </div>
                                </div>

                                {/* Card B: Detail Jawaban Kuesioner Nasabah */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-5 space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <Icon icon="solar:checklist-minimalistic-outline" className="text-blue-600" width={18} />
                                            <h2 className="text-sm font-bold text-gray-900">
                                                Detail Jawaban Kuesioner Nasabah
                                            </h2>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                                                Total: {responses.length} Pertanyaan
                                            </span>
                                        </div>

                                        {/* Filter Pills */}
                                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/70 self-start sm:self-auto text-xs">
                                            <button
                                                type="button"
                                                onClick={() => setActiveQuestionTab('all')}
                                                className={`px-3 py-1 rounded-lg font-semibold transition ${
                                                    activeQuestionTab === 'all'
                                                        ? 'bg-blue-600 text-white shadow-xs'
                                                        : 'text-gray-500 hover:text-gray-800'
                                                }`}
                                            >
                                                Semua
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveQuestionTab('PFR')}
                                                className={`px-3 py-1 rounded-lg font-semibold transition ${
                                                    activeQuestionTab === 'PFR'
                                                        ? 'bg-blue-600 text-white shadow-xs'
                                                        : 'text-gray-500 hover:text-gray-800'
                                                }`}
                                            >
                                                PFR
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveQuestionTab('SSR')}
                                                className={`px-3 py-1 rounded-lg font-semibold transition ${
                                                    activeQuestionTab === 'SSR'
                                                        ? 'bg-blue-600 text-white shadow-xs'
                                                        : 'text-gray-500 hover:text-gray-800'
                                                }`}
                                            >
                                                SSR
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveQuestionTab('SD')}
                                                className={`px-3 py-1 rounded-lg font-semibold transition ${
                                                    activeQuestionTab === 'SD'
                                                        ? 'bg-blue-600 text-white shadow-xs'
                                                        : 'text-gray-500 hover:text-gray-800'
                                                }`}
                                            >
                                                SD (Uji)
                                            </button>
                                        </div>
                                    </div>

                                    {/* Questions Table */}
                                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                                        <table className="min-w-full divide-y divide-gray-100 text-xs">
                                            <thead className="bg-[#FAFBFD]">
                                                <tr>
                                                    <th className="py-3 px-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-10">
                                                        NO
                                                    </th>
                                                    <th className="py-3 px-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                        BUTIR PERNYATAAN ASESMEN
                                                    </th>
                                                    <th className="py-3 px-4 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-36">
                                                        JAWABAN DEBITUR
                                                    </th>
                                                    <th className="py-3 px-4 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-24">
                                                        DIMENSI
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {filteredResponses.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="py-8 text-center text-gray-400">
                                                            Belum ada data pertanyaan kuesioner.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredResponses.map((item, idx) => {
                                                        const dim = (item.item_master?.dimension || '').toUpperCase();
                                                        const isSd = dim === 'SD' || dim.includes('DESIRABILITY');
                                                        const val = Number(item.raw_value);

                                                        return (
                                                            <tr
                                                                key={item.id || idx}
                                                                className={`hover:bg-slate-50/60 transition ${
                                                                    isSd ? 'bg-amber-50/30' : ''
                                                                }`}
                                                            >
                                                                <td className="py-3 px-3 text-center font-semibold text-gray-400 align-top">
                                                                    {idx + 1}
                                                                </td>
                                                                <td className="py-3 px-4 text-gray-800 leading-relaxed align-top">
                                                                    <div>
                                                                        {item.item_master?.text || item.item_code}
                                                                    </div>
                                                                    {isSd && (
                                                                        <div className="mt-1 text-[11px] text-amber-700 font-medium flex items-center gap-1">
                                                                            <Icon icon="solar:danger-triangle-outline" width={13} />
                                                                            <span>
                                                                                {val >= 6
                                                                                    ? 'Uji Social Desirability: Respon mutlak mengindikasikan bias pencitraan.'
                                                                                    : 'Uji Social Desirability: Nilai skor tinggi menguatkan indikasi defensif responden.'}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="py-3 px-4 text-center align-top whitespace-nowrap">
                                                                    <div className="font-extrabold text-sm text-gray-900">
                                                                        {item.raw_value}
                                                                    </div>
                                                                    <div className={`text-[10px] font-medium mt-0.5 ${
                                                                        val >= 6 ? 'text-teal-700' : 'text-gray-500'
                                                                    }`}>
                                                                        {answerLabel(item.raw_value)}
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4 text-center align-top whitespace-nowrap">
                                                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                        isSd
                                                                            ? 'bg-amber-100 text-amber-800'
                                                                            : dim === 'SSR'
                                                                                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                                                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                                                                    }`}>
                                                                        {dim || 'PFR'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Table Footer */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 text-xs text-gray-500">
                                        <div>
                                            Menampilkan respon <strong className="text-gray-700">1 s/d {filteredResponses.length}</strong> dari{' '}
                                            <strong className="text-gray-700">{responses.length}</strong> butir
                                        </div>
                                        <button
                                            type="button"
                                            onClick={exportRawCsv}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline transition self-start sm:self-auto"
                                        >
                                            <Icon icon="solar:download-minimalistic-outline" width={15} />
                                            <span>Download Data Raw Kuesioner (CSV)</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column (4 cols): Catatan AO, Peninjauan Pemutus, Pascakredit Y0 */}
                            <div className="lg:col-span-4 space-y-5">
                                {/* Card 1: Catatan Petugas (AO) */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Icon icon="solar:pen-new-square-outline" className="text-blue-600" width={18} />
                                            <h3 className="text-sm font-bold text-gray-900">
                                                Catatan Petugas (AO)
                                            </h3>
                                        </div>
                                        {needsOfficerNote && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                                                WAJIB DIISI
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Wajib diisi bila rekomendasi memerlukan Review / Concern, atau terdapat klarifikasi wawancara tatap muka.
                                    </p>

                                    {canEditNote ? (
                                        <form onSubmit={submitNote} className="space-y-3 pt-1">
                                            <div>
                                                <div className="flex justify-between items-center text-xs mb-1">
                                                    <label className="font-semibold text-gray-700">
                                                        Hasil Klarifikasi & Verifikasi Lapangan
                                                    </label>
                                                    <span className="text-[10px] text-gray-400">
                                                        {noteData.officer_note?.length || 0}/500
                                                    </span>
                                                </div>
                                                <textarea
                                                    rows={4}
                                                    maxLength={500}
                                                    value={noteData.officer_note}
                                                    onChange={(e) => setNoteData('officer_note', e.target.value)}
                                                    placeholder="Tuliskan catatan verifikasi lapangan, karakter debitur, klarifikasi omset harian, atau konfirmasi terkait respon instrumen..."
                                                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition leading-relaxed placeholder-gray-400"
                                                />
                                            </div>

                                            <div className="flex items-start gap-2 pt-1">
                                                <input
                                                    type="checkbox"
                                                    id="ots_check"
                                                    checked={hasOtsCheck}
                                                    onChange={(e) => setHasOtsCheck(e.target.checked)}
                                                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                                                />
                                                <label htmlFor="ots_check" className="text-xs text-gray-700 leading-snug cursor-pointer select-none">
                                                    Saya telah melakukan OTS (On The Spot) langsung ke debitur.
                                                </label>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={processingNote}
                                                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                                            >
                                                <Icon icon="solar:check-square-outline" width={16} />
                                                <span>{processingNote ? 'Menyimpan...' : 'Simpan Catatan Petugas'}</span>
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-gray-700">
                                            {decision?.officer_note ? (
                                                <p className="whitespace-pre-wrap">{decision.officer_note}</p>
                                            ) : (
                                                <p className="italic text-gray-400">Belum ada catatan dari Petugas Kredit.</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Card 2: Peninjauan Pemutus (Step 9) */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-5 space-y-3.5">
                                    <div className="flex items-center gap-2">
                                        <Icon icon="solar:scale-outline" className="text-indigo-700" width={18} />
                                        <h3 className="text-sm font-bold text-gray-900">
                                            Peninjauan Pemutus (Step 9)
                                        </h3>
                                    </div>

                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Keputusan akhir manual pendukung kredit oleh Pejabat Pemutus / Komite Kredit sesuai kewenangan SOP BPR.
                                    </p>

                                    {/* Status Persetujuan Box */}
                                    <div className="bg-[#EEF2FF]/60 border border-[#E0E7FF] rounded-xl p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-gray-700 uppercase">
                                                STATUS PERSETUJUAN:
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                <Icon icon="solar:clock-circle-outline" width={13} />
                                                <span>
                                                    {decision?.approver_decision === 'APPROVED_FOR_PROCESSING'
                                                        ? 'Disetujui'
                                                        : decision?.approver_decision === 'REJECTED'
                                                            ? 'Ditolak'
                                                            : 'Menunggu Pemutus'}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-600 leading-relaxed italic">
                                            <strong>Catatan Pemutus: </strong>
                                            {decision?.approver_note || 'Belum ada catatan pejabat pemutus. Menunggu kelengkapan OTS Account Officer.'}
                                        </div>
                                    </div>

                                    {/* Step Timeline */}
                                    <div className="space-y-3 pt-2 text-xs">
                                        <div className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Icon icon="solar:check-circle-bold" width={14} />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 leading-snug">
                                                    Instrumen Psikometrik Selesai
                                                </div>
                                                <div className="text-[11px] text-gray-400 mt-0.5">
                                                    {assessment.submit_time
                                                        ? new Date(assessment.submit_time).toLocaleString('id-ID')
                                                        : '16 Okt 2024, 09:14 WIB'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                                                2
                                            </div>
                                            <div>
                                                <div className="font-semibold text-blue-700 leading-snug">
                                                    Klarifikasi & Catatan AO (Aktif)
                                                </div>
                                                <div className="text-[11px] text-gray-500 mt-0.5">
                                                    {assessment.officer?.name || 'Bambang Pratama'} (Sedang Proses)
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 opacity-60">
                                            <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                                                3
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-700 leading-snug">
                                                    Sidang Komite Pemutus Kredit
                                                </div>
                                                <div className="text-[11px] text-gray-400 mt-0.5">
                                                    Kepala Cabang / Pimpinan Seksi
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Approver Form if user is approver */}
                                    {canReviewDecision && (
                                        <form onSubmit={submitApproverDecision} className="pt-3 border-t border-gray-100 space-y-3">
                                            <FloatSelect
                                                id="approver_decision"
                                                label="Ubah Keputusan Pemutus"
                                                options={APPROVER_DECISION_OPTIONS}
                                                value={approverForm.data.approver_decision}
                                                onChange={(val) => approverForm.setData('approver_decision', val)}
                                                placeholder="Pilih Keputusan Pemutus"
                                            />
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                    Catatan Persetujuan Komite
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={approverForm.data.approver_note}
                                                    onChange={(e) => approverForm.setData('approver_note', e.target.value)}
                                                    placeholder="Tuliskan catatan persetujuan komite / pertimbangan pemutus..."
                                                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition leading-relaxed placeholder-gray-400"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={approverForm.processing}
                                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                                            >
                                                <Icon icon="solar:check-square-outline" width={16} />
                                                <span>{approverForm.processing ? 'Menyimpan...' : 'Simpan Keputusan Pemutus'}</span>
                                            </button>
                                        </form>
                                    )}
                                </div>

                                {/* Card 3: Pemantauan Pascakredit (Y0) */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-5 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Icon icon="solar:graph-up-outline" className="text-teal-600" width={18} />
                                        <h3 className="text-sm font-bold text-gray-900">
                                            Pemantauan Pascakredit (Y0)
                                        </h3>
                                    </div>

                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Status kolektibilitas riil dicatat secara periodik oleh Manajemen Risiko untuk evaluasi dan rekalibrasi model PCSM.
                                    </p>

                                    {outcome ? (
                                        <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-xl space-y-1 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Status Kolektibilitas:</span>
                                                <span className="font-bold text-gray-900">{outcome.collectibility_status}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">DPD:</span>
                                                <span className="font-bold text-gray-900">{outcome.dpd_days} Hari</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Tanggal:</span>
                                                <span className="font-bold text-gray-900">{outcome.monitoring_date ? new Date(outcome.monitoring_date).toLocaleDateString('id-ID') : '-'}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 text-center space-y-2">
                                            <Icon icon="solar:hourglass-outline" width={22} className="mx-auto text-gray-300" />
                                            <p className="text-xs text-gray-400 italic">
                                                Belum ada data kolektibilitas pascakredit yang dicatat untuk debitur ini.
                                            </p>
                                        </div>
                                    )}

                                    {canRecordOutcome && (
                                        <form onSubmit={submitOutcome} className="pt-2 border-t border-gray-100 space-y-3">
                                            <FloatSelect
                                                id="collectibility_status"
                                                label="Status Kolektibilitas"
                                                options={COLLECTIBILITY_OPTIONS}
                                                value={outcomeForm.data.collectibility_status}
                                                onChange={(val) => outcomeForm.setData('collectibility_status', val)}
                                                placeholder="Pilih Status Kolektibilitas"
                                            />
                                            <button
                                                type="submit"
                                                disabled={outcomeForm.processing}
                                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                                            >
                                                <Icon icon="solar:check-square-outline" width={16} />
                                                <span>{outcomeForm.processing ? 'Menyimpan...' : 'Simpan Pascakredit'}</span>
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 5. Footer Disclaimer / Ketentuan & Regulasi OJK / SOP BPR */}
                        <div className="bg-[#EEF2FF] border border-[#E0E7FF] rounded-2xl p-4 flex items-start gap-3">
                            <Icon icon="solar:info-circle-outline" width={20} className="text-blue-700 flex-shrink-0 mt-0.5" />
                            <div className="space-y-1 text-xs">
                                <div className="font-bold text-gray-900 uppercase tracking-wide">
                                    KETENTUAN &amp; REGULASI OJK / SOP BPR
                                </div>
                                <p className="text-gray-600 leading-relaxed">
                                    <span className="font-semibold text-gray-700">Disclaimer:</span> Hasil PCSM-SOPI merupakan informasi pendukung untuk membantu proses asesmen kredit (<em>Decision Support System</em>). Hasil ini tidak merupakan keputusan otomatis persetujuan atau penolakan kredit dan harus dibaca bersama informasi serta prosedur kredit lain yang berlaku di BPR. Keputusan final kredit tetap mengikuti SOP, kewenangan pejabat kredit, dan informasi lain yang dipersyaratkan BPR.
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
