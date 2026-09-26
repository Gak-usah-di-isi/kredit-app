<?php

namespace App\Http\Controllers;

use App\Models\ItemMaster;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ItemMasterController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->hasRole(['admin_sistem', 'compliance'])) {
            abort(403, 'Hanya Admin Sistem atau Unit Kepatuhan yang dapat mengakses Master Item.');
        }

        $items = ItemMaster::orderBy('display_order')->get();

        $stats = [
            'total' => $items->count(),
            'pfr' => $items->where('dimension', 'PFR')->count(),
            'ssr' => $items->where('dimension', 'SSR')->count(),
            'sd' => $items->where('dimension', 'SD')->count(),
        ];

        return Inertia::render('Admin/ItemMaster/Index', [
            'items' => $items,
            'stats' => $stats,
            'canManage' => $user->hasRole('admin_sistem'),
        ]);
    }

    public function update(Request $request, $id)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->hasRole('admin_sistem')) {
            abort(403, 'Hanya Admin Sistem yang berwenang memperbarui butir instrumen.');
        }

        $validated = $request->validate([
            'text' => 'required|string|max:500',
        ]);

        $item = ItemMaster::findOrFail($id);
        $item->update(['text' => $validated['text']]);

        return redirect()->back()->with('success', "Butir soal {$item->item_code} berhasil diperbarui.");
    }
}
