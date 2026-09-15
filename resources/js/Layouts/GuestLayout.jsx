import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div
            className="min-h-screen w-full flex"
            style={{
                backgroundImage: "url('/images/bg-auth.jpeg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Left — text overlay */}
            <div className="hidden lg:flex flex-1 flex-col justify-between p-14 bg-gradient-to-br from-blue-900/60 to-indigo-900/40">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <img
                        src="/images/logo.png"
                        alt="Kredit App"
                        className="h-12 w-auto object-contain"
                    />
                    <span className="text-2xl font-bold text-white tracking-tight">Kredit App</span>
                </Link>

                {/* Bottom text */}
                <div>
                    <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                        Kelola Kredit<br />dengan Mudah &amp; Efisien
                    </h1>
                    <p className="text-blue-100 text-lg leading-relaxed max-w-md">
                        Platform manajemen kredit terpadu untuk memudahkan proses pengajuan, monitoring, dan pelaporan kredit Anda.
                    </p>

                    <div className="flex items-center gap-8 mt-10">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">500+</div>
                            <div className="text-blue-200 text-sm mt-1">Pengguna Aktif</div>
                        </div>
                        <div className="w-px h-12 bg-white/30" />
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">99%</div>
                            <div className="text-blue-200 text-sm mt-1">Uptime</div>
                        </div>
                        <div className="w-px h-12 bg-white/30" />
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">24/7</div>
                            <div className="text-blue-200 text-sm mt-1">Support</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right — form card */}
            <div className="flex items-center justify-center w-full lg:w-auto lg:min-w-[480px] xl:min-w-[520px] bg-white min-h-screen px-10 py-14 shadow-2xl">
                <div className="w-full max-w-sm">
                    {children}
                </div>
            </div>
        </div>
    );
}
