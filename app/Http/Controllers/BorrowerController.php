<?php

namespace App\Http\Controllers;

use App\Models\Borrower;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class BorrowerController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->hasRole(['petugas_kredit', 'pejabat_pemutus', 'admin_sistem', 'manajemen_risiko'])) {
            abort(403, 'Anda tidak memiliki hak akses untuk melihat data nasabah.');
        }

        $borrowers = Borrower::with('branch')->latest()->get();
        $canCreateBorrower = $user->hasRole(['petugas_kredit', 'admin_sistem']);

        return Inertia::render('AO/Borrower/Index', [
            'borrowers' => $borrowers,
            'canCreateBorrower' => $canCreateBorrower,
        ]);
    }

    public function create()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->hasRole(['petugas_kredit', 'admin_sistem'])) {
            abort(403, 'Hanya Petugas Kredit (AO) atau Admin yang dapat mendaftarkan nasabah baru.');
        }

        $branch = Branch::first();
        return Inertia::render('AO/Borrower/Create', [
            'branch' => $branch
        ]);
    }

    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->hasRole(['petugas_kredit', 'admin_sistem'])) {
            abort(403, 'Hanya Petugas Kredit (AO) atau Admin yang dapat mendaftarkan nasabah baru.');
        }

        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'name' => 'required|string|max:255',
            'nik' => 'required|string|max:20|unique:borrowers',
            'cif' => 'nullable|string|max:50|unique:borrowers',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string'
        ]);

        Borrower::create($validated);

        return redirect()->route('borrowers.index')->with('success', 'Nasabah berhasil ditambahkan.');
    }
}
