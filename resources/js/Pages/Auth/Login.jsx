import { useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Icon } from '@iconify/react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

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
                <h1 className="text-2xl font-bold text-gray-900">Log in into your account</h1>
                <p className="text-sm text-gray-500 mt-1">Welcome back! please enter your details</p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                {/* Email */}
                <div>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        placeholder="Email"
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                {/* Password */}
                <div>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            placeholder="Password"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded transition"
                            aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                        >
                            <Icon
                                icon={showPassword ? 'solar:eye-bold-duotone' : 'solar:eye-closed-bold-duotone'}
                                width={20}
                            />
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                {/* Remember me + Forgot password */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="text-sm text-gray-600">Remember me</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-sm transition disabled:opacity-60"
                >
                    {processing ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </GuestLayout>
    );
}
