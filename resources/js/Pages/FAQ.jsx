import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';

const FAQ_ITEMS = [
    {
        id: 'faq-1',
        category: 'asesmen',
        question: 'Apa itu model psikometrik PCSM-SOPI dan bagaimana cara kerjanya?',
        answer: 'PCSM-SOPI (Psychometric Credit Scoring Model - Standard Operational Process Integration) adalah sistem penilaian karakter dan kesediaan membayar debitur (willingness to pay) berbasis kuesioner psikometrik terstandarisasi. Model ini mengukur dimensi integritas, kehati-hatian finansial (PFR), stabilitas sosio-ekonomi (SSR), dan konsistensi jawaban (SD).'
    },
    {
        id: 'faq-2',
        category: 'asesmen',
        question: 'Bagaimana interpretasi skor psikometrik (0 - 100)?',
        answer: 'Skor 70-100 menunjukkan profil karakter sangat baik (Supportive / Hijau). Skor 50-69 menunjukkan profil moderat yang memerlukan pendalaman data (Perlu Review / Biru). Skor di bawah 50 menunjukkan deviasi atau risiko karakter tinggi (Risiko Tinggi / Merah) yang mewajibkan konfirmasi mitigasi risiko sebelum persetujuan komite.'
    },
    {
        id: 'faq-3',
        category: 'asesmen',
        question: 'Apa arti rekomendasi "Review - Response Verification"?',
        answer: 'Rekomendasi ini muncul otomatis ketika sistem mendeteksi adanya inkonsistensi jawaban (Social Desirability tinggi atau waktu pengerjaan tidak lazim). Dalam kondisi ini, calon debitur wajib menjalani wawancara klarifikasi langsung oleh Petugas Kredit (AO) sebelum berkas dapat diteruskan ke Pejabat Pemutus.'
    },
    {
        id: 'faq-4',
        category: 'ao',
        question: 'Bagaimana langkah Account Officer (AO) saat menemukan status Perlu Verifikasi?',
        answer: 'AO wajib mengunduh atau meninjau lembar jawaban kuesioner pada detail asesmen, melakukan wawancara klarifikasi tatap muka atau pengecekan usaha lapangan, lalu mengisi formulir Catatan Petugas (Officer Note) di halaman detail asesmen sebelum komite mengambil keputusan.'
    },
    {
        id: 'faq-5',
        category: 'ao',
        question: 'Berapa lama batas waktu (SLA) untuk menyelesaikan verifikasi asesmen?',
        answer: 'Sesuai SOP internal kredit, SLA untuk asesmen yang memerlukan verifikasi respon adalah maksimal 2 jam kerja sejak debitur menyelesaikan kuesioner, agar proses pencairan tidak tertunda.'
    },
    {
        id: 'faq-6',
        category: 'ao',
        question: 'Bagaimana cara membagikan kuesioner kepada calon debitur?',
        answer: 'Klik tombol "+ Buat Asesmen" pada halaman Daftar Asesmen, pilih nama calon debitur yang terdaftar, lalu sistem akan membuatkan sesi asesmen unik beserta tautan kuesioner yang dapat dibuka di tablet kantor atau dikirimkan via tautan resmi.'
    },
    {
        id: 'faq-7',
        category: 'keamanan',
        question: 'Apakah hasil kuesioner dan data debitur terenkripsi?',
        answer: 'Ya. Seluruh transmisi data dilindungi enkripsi TLS 1.3 standar perbankan. Log persetujuan digital (Informed Consent) dan riwayat IP tercatat secara tamper-proof dalam database audit trail sistem.'
    },
    {
        id: 'faq-8',
        category: 'keamanan',
        question: 'Siapa saja yang memiliki wewenang menyetujui putusan kredit?',
        answer: 'Petugas Kredit (AO) hanya bertindak sebagai verifikator dan pemberi catatan rekomendasi awal. Keputusan akhir persetujuan atau penolakan pengajuan kredit sepenuhnya menjadi wewenang Pejabat Pemutus (Komite Kredit) melalui dashboard persetujuan.'
    },
];

export default function FAQ() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [openItem, setOpenItem] = useState('faq-1');

    const filteredFaqs = useMemo(() => {
        return FAQ_ITEMS.filter((item) => {
            const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch = !q || item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, activeCategory]);

    const toggleAccordion = (id) => {
        setOpenItem(prev => (prev === id ? null : id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pusat Bantuan & FAQ - PCSM-SOPI" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
                {/* Header Banner */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
                            <Icon icon="solar:question-circle-bold" width={18} />
                            <span>Pusat Informasi & Panduan</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                            Pusat Bantuan & FAQ
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500 max-w-2xl leading-relaxed">
                            Temukan jawaban cepat seputar penggunaan sistem keputusan kredit psikometrik PCSM-SOPI, penafsiran skor debitur, serta standar operasional verifikasi kredit.
                        </p>
                    </div>

                    <div className="w-full md:w-80 relative flex-shrink-0">
                        <Icon
                            icon="solar:magnifer-outline"
                            width={18}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari pertanyaan atau topik..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <Icon icon="solar:close-circle-line-duotone" width={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveCategory('all')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                            activeCategory === 'all'
                                ? 'bg-[#0B256B] text-white shadow-xs'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        Semua Topik ({FAQ_ITEMS.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveCategory('asesmen')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                            activeCategory === 'asesmen'
                                ? 'bg-[#0B256B] text-white shadow-xs'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        Asesmen & Skoring
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveCategory('ao')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                            activeCategory === 'ao'
                                ? 'bg-[#0B256B] text-white shadow-xs'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        SOP Petugas AO
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveCategory('keamanan')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                            activeCategory === 'keamanan'
                                ? 'bg-[#0B256B] text-white shadow-xs'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        Keamanan & Audit
                    </button>
                </div>

                {/* FAQ Accordion List */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] divide-y divide-gray-100 overflow-hidden">
                    {filteredFaqs.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 space-y-2">
                            <Icon icon="solar:magnifer-outline" width={32} className="mx-auto text-gray-300" />
                            <p className="text-sm font-medium text-gray-600">Tidak ada pertanyaan yang sesuai pencarian.</p>
                            <p className="text-xs text-gray-400">Coba gunakan kata kunci lain atau pilih kategori Semua Topik.</p>
                        </div>
                    ) : (
                        filteredFaqs.map((item) => {
                            const isOpen = openItem === item.id;
                            return (
                                <div key={item.id} className="transition-colors">
                                    <button
                                        type="button"
                                        onClick={() => toggleAccordion(item.id)}
                                        className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/60 transition cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                Q
                                            </span>
                                            <span className="text-sm font-bold text-gray-900 leading-snug">
                                                {item.question}
                                            </span>
                                        </div>
                                        <Icon
                                            icon={isOpen ? 'solar:alt-arrow-up-line-duotone' : 'solar:alt-arrow-down-line-duotone'}
                                            width={18}
                                            className={`text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'text-blue-600' : ''}`}
                                        />
                                    </button>

                                    {isOpen && (
                                        <div className="px-6 pb-5 pt-1 text-xs md:text-sm text-gray-600 leading-relaxed pl-15 pr-8 bg-slate-50/40 border-t border-slate-100">
                                            <div className="flex gap-2">
                                                <span className="font-semibold text-blue-700 flex-shrink-0">Jawaban:</span>
                                                <p>{item.answer}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Need More Help / Support Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#EEF2FF] border border-[#E0E7FF] rounded-2xl p-5 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon icon="solar:document-text-outline" width={22} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-gray-900">Dokumen SOP & Pedoman Skoring</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Pelajari petunjuk teknis verifikasi wawancara tatap muka dan interpretasi indikator psikometri secara lengkap.
                            </p>
                            <Link
                                href="/assessments"
                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 pt-1"
                            >
                                <span>Buka Halaman Asesmen</span>
                                <Icon icon="solar:arrow-right-line-duotone" width={14} />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 flex items-start gap-4 shadow-xs">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon icon="solar:head-phones-angular-outline" width={22} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-gray-900">Pusat Bantuan Teknis & IT</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Mengalami kendala generate link kuesioner atau token asesmen debitur? Tim IT internal siap membantu.
                            </p>
                            <a
                                href="mailto:support@pcsm-sopi.test"
                                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 pt-1"
                            >
                                <span>Hubungi Helpdesk Internal</span>
                                <Icon icon="solar:arrow-right-line-duotone" width={14} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
