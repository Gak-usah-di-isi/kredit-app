import React from 'react';
import { Head } from '@inertiajs/react';

export default function Selesai({ message }) {
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Kuesioner Selesai" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-6 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                        ✓
                    </div>
                    
                    <h2 className="text-2xl font-black text-gray-900">Terima Kasih</h2>
                    
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {message || 'Jawaban kuesioner Anda telah berhasil kami terima dan sedang diproses oleh sistem.'}
                    </p>

                    <div className="pt-4 border-t border-gray-100 text-xs text-gray-400">
                        Silakan konfirmasi ke Petugas Kredit (AO) bahwa pengisian instrumen kuesioner telah selesai.
                    </div>
                </div>
            </div>
        </div>
    );
}
