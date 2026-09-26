import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ borrowers }) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Daftar Nasabah</h2>}>
            <Head title="Daftar Nasabah" />
            
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-4 flex justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Data Nasabah</h3>
                        <Link
                            href={route('borrowers.create')}
                            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            + Tambah Nasabah
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">NIK</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">No. Telepon</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cabang</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {borrowers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                            Belum ada data nasabah.
                                        </td>
                                    </tr>
                                ) : (
                                    borrowers.map((borrower) => (
                                        <tr key={borrower.id}>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{borrower.name}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{borrower.nik}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{borrower.phone || '-'}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{borrower.branch?.branch_name || '-'}</td>
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
