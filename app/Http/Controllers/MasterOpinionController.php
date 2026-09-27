<?php

namespace App\Http\Controllers;

use App\Models\MasterOpinion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterOpinionController extends Controller
{
    public function index(Request $request)
    {
        $query = MasterOpinion::query();

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('narrative', 'like', "%{$search}%");
            });
        }

        $opinions = $query->orderBy('category')->orderBy('id')->get();
        $categories = MasterOpinion::select('category')->distinct()->pluck('category');

        return Inertia::render('Admin/MasterOpinion/Index', [
            'opinions' => $opinions,
            'categories' => $categories,
            'filters' => $request->only(['category', 'search']),
        ]);
    }

    public function update(Request $request, $id)
    {
        $opinion = MasterOpinion::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'narrative' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $opinion->update($validated);

        return redirect()->back()->with('success', "Template opini \"{$opinion->title}\" berhasil diperbarui di database.");
    }
}
