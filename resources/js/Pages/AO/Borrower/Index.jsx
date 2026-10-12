import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Download, Users, FileClock, CircleCheck, BadgeAlert, Search, ArrowUpDown, MapPin, RefreshCw, ChevronLeft, ChevronRight, BadgeCheck, Building2, ChevronDown } from 'lucide-react';

export default function Index({ borrowers }) {
    return (
        <AuthenticatedLayout>
            <Head title="Daftar Nasabah" />

            <div className="min-h-screen bg-[#f8f8fc] py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                   {/* Header */}
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                                Daftar Nasabah
                            </h1>

                            <p className="mt-1 text-sm text-gray-600">
                                Kelola data calon debitur dan nasabah peminjam BPR Jwalita Trenggalek
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                            >
                                <Download className="h-4 w-4" />
                                Ekspor Data
                            </button>

                            <Link
                                href={route('borrowers.create')}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#123b92] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f327c]"
                            >
                                <span className="text-lg leading-none">+</span>
                                Tambah Nasabah
                            </Link>
                        </div>
                    </div>

                    {/* Statistic Cards */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {/* Total Nasabah */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Total Nasabah
                                    </p>

                                    <p className="mt-3 text-3xl font-bold text-gray-900">
                                        {borrowers.length}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Terdaftar di sistem
                                    </p>
                                </div>

                                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                                    <Users className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        {/* Sedang Diajukan */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Sedang Diajukan
                                    </p>

                                    <p className="mt-3 text-3xl font-bold text-indigo-700">
                                        0
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Proses analisa kredit
                                    </p>
                                </div>

                                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                                    <FileClock className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                    {/* Asesmen Selesai */}
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Asesmen Selesai
                                </p>

                                <p className="mt-3 text-3xl font-bold text-teal-700">
                                    0
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    Keputusan diterbitkan
                                </p>
                            </div>

                            <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
                                <CircleCheck className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    {/* Perlu Verifikasi */}
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Perlu Verifikasi
                                </p>

                                <p className="mt-3 text-3xl font-bold text-red-600">
                                    0
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    Dokumen perlu diperiksa
                                </p>
                            </div>

                            <div className="rounded-xl bg-red-50 p-3 text-red-600">
                                <BadgeAlert className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </div>

                    {/* Main Data Container */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                        {/* Search & Filters */}
                        <div className="border-b border-gray-100 p-4">
                            <div className="flex flex-col gap-3 lg:flex-row">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                                    <input
                                        type="text"
                                        placeholder="Cari nama nasabah, NIK, atau no. telepon..."
                                        className="h-11 w-full rounded-xl border border-gray-200 bg-[#f7f7fc] pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>

                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                                    <select
                                        className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-[#f7f7fc] pl-9 pr-9 text-sm text-gray-600 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 lg:w-40"
                                    >
                                        <option>Semua Cabang</option>
                                    </select>

                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                </div>

                                <div className="relative">
                                    <BadgeCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                                    <select
                                        className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-[#f7f7fc] pl-9 pr-9 text-sm text-gray-600 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 lg:w-40"
                                    >
                                        <option>Semua Status</option>
                                    </select>

                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                </div>

                                <div className="relative">
                                    <ArrowUpDown className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                                    <select
                                        className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-[#f7f7fc] pl-9 pr-9 text-sm text-gray-600 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 lg:w-48"
                                    >
                                        <option>Terbaru Ditambahkan</option>
                                    </select>

                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-[#f7f7fc]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Nama Nasabah
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            NIK
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            No. Telepon
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Cabang
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Status Nasabah
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {borrowers.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-6 py-12 text-center text-sm text-gray-500"
                                            >
                                                Belum ada data nasabah.
                                            </td>
                                        </tr>
                                    ) : (
                                        borrowers.map((borrower) => (
                                            <tr
                                                key={borrower.id}
                                                className="transition hover:bg-gray-50"
                                            >
                                                {/* Nama */}
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                                                            {borrower.name
                                                                ?.charAt(0)
                                                                ?.toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {borrower.name}
                                                            </p>

                                                            <p className="text-xs text-gray-500">
                                                                Calon Debitur
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* NIK */}
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                    {borrower.nik}
                                                </td>

                                                {/* Telepon */}
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                    {borrower.phone || '-'}
                                                </td>

                                                {/* Cabang */}
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                        <Building2 className="h-4 w-4 text-green-500" />

                                                        {borrower.branch?.branch_name || '-'}
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                                                        -
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
                            <p className="text-sm text-gray-600">
                                Menampilkan{' '}
                                <span className="font-medium text-gray-800">
                                    {borrowers.length}
                                </span>{' '}
                                nasabah terdaftar
                            </p>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    disabled
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                               <button
                                    type="button"
                                    className="flex h-9 w-9 items-center justify-center rounded-md bg-[#123b92] text-sm font-semibold text-white"
                                >
                                    1
                                </button>

                                <button
                                    type="button"
                                    className="flex h-9 w-9 items-center justify-center rounded-md text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    2
                                </button>

                                <button
                                    type="button"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    3
                                </button>

                                <span className="flex h-9 w-9 items-center justify-center text-sm text-gray-500">
                                    ...
                                </span>

                                <button
                                    type="button"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    30
                                </button>

                                <button
                                    type="button"
                                    disabled
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Synchronization */}
                    <div className="mt-6 rounded-xl bg-[#f1f2ff] px-5 py-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-700 shadow-sm">
                                <RefreshCw className="h-5 w-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    Sinkronisasi Data Kependudukan Otomatis
                                </h3>

                                <p className="mt-0.5 text-sm text-gray-600">
                                    Sistem terhubung langsung dengan gateway verifikasi NIK
                                    Dukcapil dan SLIK OJK secara realtime.
                                </p>
                            </div>

                            <div className="hidden min-w-[190px] lg:block">
                                <p className="text-sm font-medium text-gray-700">
                                    Terakhir diperbarui:
                                </p>

                                <p className="text-sm text-gray-600">
                                    Belum tersedia
                                </p>
                            </div>

                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Perbarui
                            </button>
                        </div>
                    </div>   
</div>
            </div>
        </AuthenticatedLayout>
    );
}