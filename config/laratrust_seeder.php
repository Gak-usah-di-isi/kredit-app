<?php

return [
    /**
     * Control if the seeder should create a user per role while seeding the data.
     */
    'create_users' => true,

    /**
     * Control if all the laratrust tables should be truncated before running the seeder.
     */
    'truncate_tables' => true,

    'roles_structure' => [
        // 1. Admin Sistem (Unit IT / Peneliti)
        'admin_sistem' => [
            'users'                  => 'c,r,u,d',
            'item_master'            => 'c,r,u,d',
            'calibration_parameters' => 'c,r,u,d',
            'model_versions'         => 'c,r,u,d',
            'audit_log'              => 'r',
            'assessments'            => 'r',
        ],

        // 2. Petugas Kredit / Account Officer (AO)
        'petugas_kredit' => [
            'assessments'          => 'c,r,u',
            'borrowers'            => 'c,r,u',
            'assessment_responses' => 'c,r',
            'assessment_scores'    => 'r',
            'assessment_decisions' => 'r,u', // u untuk input officer_note
            'consent_log'          => 'c,r',
        ],

        // 3. Pejabat Pemutus Kredit / Kepala Bagian Kredit
        'pejabat_pemutus' => [
            'assessments'          => 'r',
            'borrowers'            => 'r',
            'assessment_scores'    => 'r',
            'assessment_decisions' => 'r,u', // u untuk peninjauan/review
            'dashboard_reports'    => 'r',
        ],

        // 4. Unit Manajemen Risiko / Monitoring
        'manajemen_risiko' => [
            'outcome_monitoring'    => 'c,r,u',
            'assessments'           => 'r',
            'assessment_scores'     => 'r',
            'calibration_parameters' => 'c,r', // mengusulkan parameter baru
            'dashboard_reports'     => 'r',
        ],

        // 5. Unit Kepatuhan (Compliance)
        'compliance' => [
            'consent_log'       => 'r',
            'audit_log'         => 'r',
            'assessments'       => 'r',
            'dashboard_reports' => 'r',
        ],

        // 6. Nasabah / Calon Debitur (Pengisian Kuesioner Saja)
        'nasabah' => [
            'consent_log'          => 'c',
            'assessment_responses' => 'c',
        ],
    ],

    'permissions_map' => [
        'c' => 'create',
        'r' => 'read',
        'u' => 'update',
        'd' => 'delete',
    ],
];
