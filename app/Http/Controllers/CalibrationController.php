<?php

namespace App\Http\Controllers;

use App\Models\AssessmentScore;
use App\Models\CalibrationParameter;
use App\Models\ModelVersion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CalibrationController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->hasRole(['admin_sistem', 'manajemen_risiko', 'compliance'])) {
            abort(403, 'Anda tidak memiliki hak akses ke modul Rekalibrasi & Parameter.');
        }

        $activeModel = ModelVersion::where('status', 'active')->first();
        $activeParams = $activeModel 
            ? CalibrationParameter::where('model_version_id', $activeModel->id)->where('is_active', true)->first()
            : null;

        $allVersions = ModelVersion::with('calibrationParameters')->latest()->get();

        // Hitung Drift Skor Riil dari seluruh skor asesmen yang ada
        $scores = AssessmentScore::all();
        $count = $scores->count();

        $pfrValues = $scores->pluck('pfr_100')->toArray();
        $ssrValues = $scores->pluck('ssr_100')->toArray();
        $sdValues = $scores->pluck('sd_100')->toArray();

        $pfrP25 = $this->calculatePercentile($pfrValues, 25);
        $pfrP75 = $this->calculatePercentile($pfrValues, 75);
        $ssrP25 = $this->calculatePercentile($ssrValues, 25);
        $ssrP75 = $this->calculatePercentile($ssrValues, 75);
        $sdP75 = $this->calculatePercentile($sdValues, 75);
        $sdP90 = $this->calculatePercentile($sdValues, 90);

        $driftStats = [
            'total_scored' => $count,
            'pfr_avg' => $count > 0 ? round($scores->avg('pfr_100'), 2) : 0,
            'ssr_avg' => $count > 0 ? round($scores->avg('ssr_100'), 2) : 0,
            'sd_avg' => $count > 0 ? round($scores->avg('sd_100'), 2) : 0,
            'overall_avg' => $count > 0 ? round($scores->avg('overall_sopi_100'), 2) : 0,
            // Perhitungan persentil riil populasi
            'real_pfr_p25' => $pfrP25,
            'real_pfr_p75' => $pfrP75,
            'real_ssr_p25' => $ssrP25,
            'real_ssr_p75' => $ssrP75,
            'real_sd_p75'  => $sdP75,
            'real_sd_p90'  => $sdP90,
            // Variance (sampel) per dimensi
            'pfr_variance' => $this->calculateVariance($pfrValues),
            'ssr_variance' => $this->calculateVariance($ssrValues),
            'sd_variance'  => $this->calculateVariance($sdValues),
            // Population Stability Index (PSI) model vs distribusi riil
            'pfr_psi' => $this->calculatePsi($pfrValues, $activeParams?->pfr_p25, $activeParams?->pfr_p75),
            'ssr_psi' => $this->calculatePsi($ssrValues, $activeParams?->ssr_p25, $activeParams?->ssr_p75),
            'sd_psi'  => $this->calculatePsi($sdValues, $activeParams?->sd_p75, $activeParams?->sd_p90, [0.75, 0.90]),
        ];

        return Inertia::render('Admin/Calibration/Index', [
            'activeModel' => $activeModel,
            'activeParams' => $activeParams,
            'allVersions' => $allVersions,
            'driftStats' => $driftStats,
            'canManage' => $user->hasRole(['admin_sistem']),
        ]);
    }

    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->hasRole('admin_sistem')) {
            abort(403, 'Hanya Admin Sistem yang berwenang menetapkan parameter kalibrasi baru.');
        }

        $validated = $request->validate([
            'version_name' => 'required|string|max:50',
            'description' => 'nullable|string',
            'pfr_p25' => 'required|numeric|min:0|max:100',
            'pfr_p75' => 'required|numeric|min:0|max:100',
            'ssr_p25' => 'required|numeric|min:0|max:100',
            'ssr_p75' => 'required|numeric|min:0|max:100',
            'sd_p75' => 'required|numeric|min:0|max:100',
            'sd_p90' => 'required|numeric|min:0|max:100',
            'straightline_threshold' => 'required|numeric|min:0.5|max:1',
            'low_variability_threshold' => 'required|numeric|min:0.1|max:2',
        ]);

        DB::beginTransaction();
        try {
            // Nonaktifkan versi sebelumnya
            ModelVersion::where('status', 'active')->update(['status' => 'inactive']);
            CalibrationParameter::where('is_active', true)->update(['is_active' => false]);

            $modelVersion = ModelVersion::create([
                'version' => $validated['version_name'],
                'description' => $validated['description'] ?? 'Kalibrasi Model Baru',
                'status' => 'active',
            ]);

            CalibrationParameter::create([
                'model_version_id' => $modelVersion->id,
                'pfr_p25' => $validated['pfr_p25'],
                'pfr_p75' => $validated['pfr_p75'],
                'ssr_p25' => $validated['ssr_p25'],
                'ssr_p75' => $validated['ssr_p75'],
                'sd_p75' => $validated['sd_p75'],
                'sd_p90' => $validated['sd_p90'],
                'straightline_threshold' => $validated['straightline_threshold'],
                'low_variability_threshold' => $validated['low_variability_threshold'],
                'is_active' => true,
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Model versi baru dan parameter kalibrasi berhasil diaktifkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Gagal memperbarui model: ' . $e->getMessage()]);
        }
    }

    private function calculatePercentile(array $data, float $percentile)
    {
        if (empty($data)) return 0;
        sort($data);
        $index = ($percentile / 100) * (count($data) - 1);
        $low = floor($index);
        $high = ceil($index);
        $weight = $index - $low;
        return round($data[$low] + $weight * ($data[$high] - $data[$low]), 2);
    }

    private function calculateVariance(array $data): float
    {
        $count = count($data);
        if ($count < 2) return 0;
        $mean = array_sum($data) / $count;
        $sum = 0;
        foreach ($data as $value) {
            $sum += pow($value - $mean, 2);
        }
        return round($sum / ($count - 1), 2);
    }

    /**
     * PSI dua bin di sekitar dua ambang model (expected share mengikuti
     * definisi persentil: mis. P25/P75 -> 25% / 50% / 25%).
     * default $cuts = [25, 75] dan $shares = [0.25, 0.50, 0.25].
     */
    private function calculatePsi(array $data, ?float $cutLow, ?float $cutHigh, ?array $shares = null): float
    {
        if (empty($data) || $cutLow === null || $cutHigh === null) return 0;

        $shares = $shares ?? [0.25, 0.50, 0.25];
        $actual = [0, 0, 0];
        foreach ($data as $value) {
            if ($value < $cutLow) {
                $actual[0]++;
            } elseif ($value < $cutHigh) {
                $actual[1]++;
            } else {
                $actual[2]++;
            }
        }

        $total = count($data);
        $psi = 0;
        foreach ($shares as $index => $expectedShare) {
            $expected = $expectedShare * $total;
            $observed = $actual[$index];
            if ($expected <= 0 || $observed <= 0) {
                // Laplace smoothing agar PSI tetap terdefinisi pada bin kosong.
                $expected = max($expected, 0.5);
                $observed = max($observed, 0.5);
            }
            $psi += ($observed / $total - $expectedShare) * log(($observed / $total) / $expectedShare);
        }

        return round($psi, 4);
    }
}
