<?php

namespace App\Http\Controllers;

use App\Models\Borrower;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BorrowerController extends Controller
{
    public function index()
    {
        $borrowers = Borrower::with('branch')->latest()->get();
        return Inertia::render('AO/Borrower/Index', [
            'borrowers' => $borrowers
        ]);
    }

    public function create()
    {
        // Untuk sekarang ambil branch pertama (karena kita baru seed 1)
        $branch = Branch::first();
        return Inertia::render('AO/Borrower/Create', [
            'branch' => $branch
        ]);
    }

    public function store(Request $request)
    {
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
