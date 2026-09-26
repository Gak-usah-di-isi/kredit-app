let _id = 0;
const uniqueId = () => String(++_id);

export const getSidebarItemsByRole = (roles = []) => {
    // 1. Admin Sistem
    if (roles.includes('admin_sistem')) {
        return [
            {
                id: 1,
                name: 'MAIN MENU',
                items: [
                    {
                        heading: 'DASHBOARD',
                        children: [
                            { name: 'Dashboard Admin', icon: 'solar:widget-outline', id: uniqueId(), url: '/dashboard' },
                        ],
                    },
                ],
            },
            {
                id: 2,
                name: 'PCSM-SOPI',
                items: [
                    {
                        heading: 'MANAJEMEN ASESMEN',
                        children: [
                            { name: 'Semua Asesmen', icon: 'solar:documents-outline', id: uniqueId(), url: '/assessments' },
                            { name: 'Daftar Nasabah', icon: 'solar:users-group-two-rounded-outline', id: uniqueId(), url: '/borrowers' },
                        ],
                    },
                    {
                        heading: 'MODEL & INSTRUMEN',
                        children: [
                            { name: 'Parameter Kalibrasi & Drift', icon: 'solar:tuning-outline', id: uniqueId(), url: '/calibration' },
                            { name: 'Master Item (17 Soal)', icon: 'solar:checklist-minimalistic-outline', id: uniqueId(), url: '/item-masters' },
                            { name: 'Monitoring Kolektibilitas (Y0)', icon: 'solar:chart-square-outline', id: uniqueId(), url: '/outcome-monitoring' },
                        ],
                    },
                ],
            },
        ];
    }

    // 2. Pejabat Pemutus
    if (roles.includes('pejabat_pemutus')) {
        return [
            {
                id: 1,
                name: 'MAIN MENU',
                items: [
                    {
                        heading: 'DASHBOARD',
                        children: [
                            { name: 'Dashboard Pemutus', icon: 'solar:widget-outline', id: uniqueId(), url: '/dashboard' },
                        ],
                    },
                ],
            },
            {
                id: 2,
                name: 'PENINJAUAN KREDIT',
                items: [
                    {
                        heading: 'ASESMEN KREDIT',
                        children: [
                            { name: 'Review Asesmen', icon: 'solar:shield-check-outline', id: uniqueId(), url: '/assessments' },
                            { name: 'Daftar Nasabah', icon: 'solar:users-group-two-rounded-outline', id: uniqueId(), url: '/borrowers' },
                        ],
                    },
                ],
            },
        ];
    }

    // 3. Manajemen Risiko
    if (roles.includes('manajemen_risiko')) {
        return [
            {
                id: 1,
                name: 'MAIN MENU',
                items: [
                    {
                        heading: 'DASHBOARD',
                        children: [
                            { name: 'Dashboard Risiko', icon: 'solar:widget-outline', id: uniqueId(), url: '/dashboard' },
                        ],
                    },
                ],
            },
            {
                id: 2,
                name: 'MANAJEMEN RISIKO',
                items: [
                    {
                        heading: 'MONITORING PASCACREDIT',
                        children: [
                            { name: 'Monitoring Kolektibilitas (Y0)', icon: 'solar:card-recive-outline', id: uniqueId(), url: '/outcome-monitoring' },
                            { name: 'Daftar Asesmen & Skor', icon: 'solar:chart-square-outline', id: uniqueId(), url: '/assessments' },
                        ],
                    },
                    {
                        heading: 'PARAMETER KALIBRASI',
                        children: [
                            { name: 'Drift Skor & Rekalibrasi', icon: 'solar:tuning-outline', id: uniqueId(), url: '/calibration' },
                        ],
                    },
                ],
            },
        ];
    }

    // 4. Unit Kepatuhan (Compliance)
    if (roles.includes('compliance')) {
        return [
            {
                id: 1,
                name: 'MAIN MENU',
                items: [
                    {
                        heading: 'DASHBOARD',
                        children: [
                            { name: 'Dashboard Kepatuhan', icon: 'solar:widget-outline', id: uniqueId(), url: '/dashboard' },
                        ],
                    },
                ],
            },
            {
                id: 2,
                name: 'KEPATUHAN & AUDIT',
                items: [
                    {
                        heading: 'AUDIT ASESMEN',
                        children: [
                            { name: 'Audit Asesmen & Consent', icon: 'solar:document-text-outline', id: uniqueId(), url: '/assessments' },
                            { name: 'Master Instrumen Baku', icon: 'solar:checklist-minimalistic-outline', id: uniqueId(), url: '/item-masters' },
                            { name: 'Parameter Model', icon: 'solar:tuning-outline', id: uniqueId(), url: '/calibration' },
                        ],
                    },
                ],
            },
        ];
    }

    // 5. Petugas Kredit (AO)
    if (roles.includes('petugas_kredit')) {
        return [
            {
                id: 1,
                name: 'MAIN MENU',
                items: [
                    {
                        heading: 'DASHBOARD',
                        children: [
                            { name: 'Dashboard', icon: 'solar:widget-outline', id: uniqueId(), url: '/dashboard' },
                        ],
                    },
                ],
            },
            {
                id: 2,
                name: 'PCSM-SOPI',
                items: [
                    {
                        heading: 'ASESMEN KREDIT',
                        children: [
                            { name: 'Daftar Asesmen', icon: 'solar:documents-outline', id: uniqueId(), url: '/assessments' },
                        ],
                    },
                    {
                        heading: 'NASABAH',
                        children: [
                            { name: 'Daftar Nasabah', icon: 'solar:users-group-two-rounded-outline', id: uniqueId(), url: '/borrowers' },
                        ],
                    },
                ],
            },
        ];
    }

    // 6. Nasabah / Default
    return [
        {
            id: 1,
            name: 'MENU',
            items: [
                {
                    heading: 'MENU',
                    children: [
                        { name: 'Dashboard Nasabah', icon: 'solar:widget-outline', id: uniqueId(), url: '/dashboard' },
                    ],
                },
            ],
        },
    ];
};
