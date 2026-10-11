import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const [showCurrent, setShowCurrent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header className="pb-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                    Perbarui Kata Sandi
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Gunakan kombinasi kata sandi yang kuat untuk menjaga keamanan operasional akun perbankan.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-5">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Kata Sandi Saat Ini"
                    />
                    <div className="relative mt-1">
                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            type={showCurrent ? 'text' : 'password'}
                            className="block w-full pr-11"
                            autoComplete="current-password"
                            placeholder="Masukkan kata sandi saat ini"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-lg transition"
                            tabIndex={-1}
                            aria-label={showCurrent ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        >
                            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <InputError
                        message={errors.current_password}
                        className="mt-1.5"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi Baru" />
                    <div className="relative mt-1">
                        <TextInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type={showPassword ? 'text' : 'password'}
                            className="block w-full pr-11"
                            autoComplete="new-password"
                            placeholder="Minimal 8 karakter"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-lg transition"
                            tabIndex={-1}
                            aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Konfirmasi Kata Sandi Baru"
                    />
                    <div className="relative mt-1">
                        <TextInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            type={showConfirmation ? 'text' : 'password'}
                            className="block w-full pr-11"
                            autoComplete="new-password"
                            placeholder="Ulangi kata sandi baru"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmation(!showConfirmation)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-lg transition"
                            tabIndex={-1}
                            aria-label={showConfirmation ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        >
                            {showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1.5"
                    />
                </div>

                <div className="flex items-center gap-4 pt-1">
                    <PrimaryButton disabled={processing}>Perbarui Kata Sandi</PrimaryButton>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600 font-medium">Berhasil diperbarui.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}