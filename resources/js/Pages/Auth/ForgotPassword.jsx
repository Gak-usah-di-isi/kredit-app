import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            {/* Logo */}
            <div className="flex justify-center mb-6">
                <div className="flex items-center gap-2">
                    <img
                        src="/images/logo.png"
                        alt="Kredit App"
                        className="h-10 w-auto object-contain"
                    />
                    <span className="text-xl font-bold text-gray-800">Kredit App</span>
                </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Lupa Password?</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Masukkan email kamu dan kami akan kirimkan link reset password.
                </p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 rounded-lg px-4 py-3">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        placeholder="Masukkan email kamu"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-sm transition disabled:opacity-60"
                >
                    {processing ? 'Mengirim...' : 'Kirim Link Reset Password'}
                </button>
            </form>

            {/* Back to login */}
            <div className="mt-6 text-center">
                <Link
                    href={route('login')}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Kembali ke halaman login
                </Link>
            </div>
        </GuestLayout>
    );
}
