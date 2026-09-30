import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

function formatIndonesianDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

export default function StandbyModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const { auth } = usePage().props;
    const user = auth?.user || {};

    const [time, setTime] = useState(() => {
        const now = new Date();
        return now.toLocaleTimeString('id-ID', { hour12: false }) + ' WIB';
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setTime(now.toLocaleTimeString('id-ID', { hour12: false }) + ' WIB');
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === ' ') {
                e.preventDefault();
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const initials = (user.name || '').split(' ').map(n => n[0]).join('') || 'UK';

    return (
        <div
            className="fixed z-9999 inset-0 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: "url('/images/bg-auth.jpeg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div
                    className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
                />
            </div>

            <div className="relative text-white px-8 py-12 max-w-md w-full text-center">
                <div className="mb-6">
                    <span
                        className="text-5xl font-bold tracking-wider"
                        style={{ color: '#F8F9FA' }}
                    >
                        {time}
                    </span>
                    <p
                        className="mt-2 text-lg font-medium text-slate-300"
                    >
                        {formatIndonesianDate(new Date())}
                    </p>
                </div>

                <div className="mb-8">
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl font-bold" style={{ color: '#EDF2F7' }}>
                            {initials}
                        </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                        {user.name || 'Nama Pengguna'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        {user.role || 'Role'} - {user.cabang || 'Cabang'}
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="w-full px-8 py-3 rounded-full font-semibold transition-all duration-200 bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
                    style={{ boxShadow: '0 4px 12px rgba(1,82,234,0.3)' }}
                >
                    Buka Kunci / Melanjutkan Bekerja
                </button>
            </div>
        </div>
    );
}