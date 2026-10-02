import { router, useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/ui/card';
import { FloatInput } from '@/Components/ui/FloatInput';
import BackButton from '@/Components/ui/BackButton';
import FormActions from '@/Components/ui/FormActions';

export default function Create({ branch }) {
    const { data, setData, post, processing, errors } = useForm({
        branch_id: branch?.id || '',
        name: '',
        nik: '',
        cif: '',
        phone: '',
        address: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('borrowers.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Nasabah" />
            <div className="py-8">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 mb-5">
                        <BackButton onClick={() => router.get('/borrowers')} />
                        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1F2A3D', fontFamily: 'Manrope, sans-serif' }}>
                            Tambah Nasabah
                        </h1>
                    </div>

                    <form onSubmit={submit} className="flex flex-col gap-6 w-full">
                        <Card>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Informasi Nasabah</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FloatInput
                                    id="borrower-name"
                                    label="Nama Lengkap *"
                                    placeholder="Masukkan nama lengkap"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />

                                <FloatInput
                                    id="borrower-branch"
                                    label="Cabang *"
                                    value={branch?.branch_name || ''}
                                    disabled
                                />

                                <FloatInput
                                    id="borrower-nik"
                                    label="NIK *"
                                    placeholder="Masukkan NIK"
                                    value={data.nik}
                                    onChange={(e) => setData('nik', e.target.value)}
                                    inputMode="numeric"
                                />

                                <FloatInput
                                    id="borrower-cif"
                                    label="CIF"
                                    placeholder="Masukkan CIF (opsional)"
                                    value={data.cif}
                                    onChange={(e) => setData('cif', e.target.value)}
                                />

                                <FloatInput
                                    id="borrower-phone"
                                    label="No. Telepon / WhatsApp"
                                    placeholder="Masukkan nomor telepon"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    inputMode="numeric"
                                />
                            </div>
                        </Card>

                        <Card>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Alamat</h2>
                            <FloatInput
                                id="borrower-address"
                                label="Alamat Lengkap"
                                placeholder="Masukkan alamat lengkap"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                multiline
                                rows={5}
                            />
                        </Card>

                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                        {errors.nik && <p className="text-sm text-red-600">{errors.nik}</p>}
                        {errors.cif && <p className="text-sm text-red-600">{errors.cif}</p>}
                        {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                        {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}

                        <FormActions
                            id="borrower-form-actions"
                            onCancel={() => router.get('/borrowers')}
                            onSubmit={submit}
                            cancelText="Batal"
                            submitText="Simpan Nasabah"
                        />
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
